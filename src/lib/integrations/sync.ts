/**
 * Data Sync Service
 * 
 * Syncs documents from various data sources to knowledge base
 */

import { db } from '@/lib/db';
import { dataConnectors, knowledgeBase } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { OAuthService } from './oauth';
import { OpenAI } from 'openai';

interface SyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsAdded: number;
  errors: string[];
}

export class DataSyncService {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required for embeddings');
    }
    this.openai = new OpenAI({ apiKey: key });
  }

  /**
   * Sync documents from a data connector
   */
  async syncConnector(connectorId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      itemsProcessed: 0,
      itemsAdded: 0,
      errors: [],
    };

    try {
      // Get connector details
      const [connector] = await db
        .select()
        .from(dataConnectors)
        .where(eq(dataConnectors.id, connectorId))
        .limit(1);

      if (!connector) {
        throw new Error('Connector not found');
      }

      // Get credentials
      const credentials = await OAuthService.getConnectorCredentials(connectorId);
      if (!credentials) {
        throw new Error('Invalid credentials');
      }

      // Sync based on connector type
      switch (connector.type) {
        case 'google_drive':
          return await this.syncGoogleDrive(connector, credentials.accessToken);

        case 'notion':
          return await this.syncNotion(connector, credentials.accessToken);

        case 'github':
          return await this.syncGitHub(connector, credentials.accessToken);

        case 'slack':
          return await this.syncSlack(connector, credentials.accessToken);

        default:
          throw new Error(`Unsupported connector type: ${connector.type}`);
      }
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Sync Google Drive documents
   */
  private async syncGoogleDrive(connector: any, accessToken: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      itemsProcessed: 0,
      itemsAdded: 0,
      errors: [],
    };

    try {
      // List files from Google Drive
      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,modifiedTime)',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Drive API error: ${response.statusText}`);
      }

      const data = await response.json();
      const files = data.files || [];

      for (const file of files) {
        try {
          // Skip folders
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            continue;
          }

          result.itemsProcessed++;

          // Get file content
          const contentResponse = await fetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!contentResponse.ok) {
            result.errors.push(`Failed to fetch ${file.name}: ${contentResponse.statusText}`);
            continue;
          }

          const content = await contentResponse.text();

          // Generate embedding
          const embedding = await this.generateEmbedding(content);

          // Store in knowledge base
          await db.insert(knowledgeBase).values({
            userId: connector.userId,
            sourceType: 'google_drive',
            sourceId: file.id,
            sourceName: file.name,
            content,
            metadata: {
              mimeType: file.mimeType,
              modifiedTime: file.modifiedTime,
            },
            embeddingId: `gdrive_${file.id}`,
            vectorNamespace: connector.userId,
          });

          result.itemsAdded++;
        } catch (error: any) {
          result.errors.push(`Error processing ${file.name}: ${error.message}`);
        }
      }

      // Update connector stats
      await db
        .update(dataConnectors)
        .set({
          lastSync: new Date(),
          itemsCount: result.itemsAdded,
        })
        .where(eq(dataConnectors.id, connector.id));

      result.success = true;
      return result;
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Sync Notion pages
   */
  private async syncNotion(connector: any, accessToken: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      itemsProcessed: 0,
      itemsAdded: 0,
      errors: [],
    };

    try {
      // Search for pages
      const response = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filter: {
            property: 'object',
            value: 'page',
          },
          page_size: 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`Notion API error: ${response.statusText}`);
      }

      const data = await response.json();
      const pages = data.results || [];

      for (const page of pages) {
        try {
          result.itemsProcessed++;

          // Get page content
          const blocksResponse = await fetch(
            `https://api.notion.com/v1/blocks/${page.id}/children`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Notion-Version': '2022-06-28',
              },
            }
          );

          if (!blocksResponse.ok) {
            result.errors.push(`Failed to fetch page ${page.id}: ${blocksResponse.statusText}`);
            continue;
          }

          const blocksData = await blocksResponse.json();
          const content = this.extractNotionContent(blocksData.results);

          // Generate embedding
          const embedding = await this.generateEmbedding(content);

          // Store in knowledge base
          await db.insert(knowledgeBase).values({
            userId: connector.userId,
            sourceType: 'notion',
            sourceId: page.id,
            sourceName: page.properties?.title?.title?.[0]?.plain_text || 'Untitled',
            content,
            metadata: {
              url: page.url,
              lastEditedTime: page.last_edited_time,
            },
            embeddingId: `notion_${page.id}`,
            vectorNamespace: connector.userId,
          });

          result.itemsAdded++;
        } catch (error: any) {
          result.errors.push(`Error processing page ${page.id}: ${error.message}`);
        }
      }

      // Update connector stats
      await db
        .update(dataConnectors)
        .set({
          lastSync: new Date(),
          itemsCount: result.itemsAdded,
        })
        .where(eq(dataConnectors.id, connector.id));

      result.success = true;
      return result;
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Sync GitHub repositories
   */
  private async syncGitHub(connector: any, accessToken: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      itemsProcessed: 0,
      itemsAdded: 0,
      errors: [],
    };

    try {
      // List repositories
      const response = await fetch('https://api.github.com/user/repos?per_page=100', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`);
      }

      const repos = await response.json();

      for (const repo of repos) {
        try {
          result.itemsProcessed++;

          // Get README content
          const readmeResponse = await fetch(
            `https://api.github.com/repos/${repo.full_name}/readme`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3.raw',
              },
            }
          );

          let content = `Repository: ${repo.name}\nDescription: ${repo.description || 'No description'}\n`;

          if (readmeResponse.ok) {
            const readme = await readmeResponse.text();
            content += `\n${readme}`;
          }

          // Generate embedding
          const embedding = await this.generateEmbedding(content);

          // Store in knowledge base
          await db.insert(knowledgeBase).values({
            userId: connector.userId,
            sourceType: 'github',
            sourceId: repo.id.toString(),
            sourceName: repo.full_name,
            content,
            metadata: {
              url: repo.html_url,
              stars: repo.stargazers_count,
              language: repo.language,
              updatedAt: repo.updated_at,
            },
            embeddingId: `github_${repo.id}`,
            vectorNamespace: connector.userId,
          });

          result.itemsAdded++;
        } catch (error: any) {
          result.errors.push(`Error processing ${repo.full_name}: ${error.message}`);
        }
      }

      // Update connector stats
      await db
        .update(dataConnectors)
        .set({
          lastSync: new Date(),
          itemsCount: result.itemsAdded,
        })
        .where(eq(dataConnectors.id, connector.id));

      result.success = true;
      return result;
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Sync Slack messages
   */
  private async syncSlack(connector: any, accessToken: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      itemsProcessed: 0,
      itemsAdded: 0,
      errors: [],
    };

    try {
      // List channels
      const response = await fetch('https://slack.com/api/conversations.list', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }

      const data = await response.json();
      const channels = data.channels || [];

      for (const channel of channels.slice(0, 10)) {
        // Limit to 10 channels
        try {
          result.itemsProcessed++;

          // Get channel history
          const historyResponse = await fetch(
            `https://slack.com/api/conversations.history?channel=${channel.id}&limit=100`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (!historyResponse.ok) {
            result.errors.push(`Failed to fetch ${channel.name}: ${historyResponse.statusText}`);
            continue;
          }

          const historyData = await historyResponse.json();
          const messages = historyData.messages || [];

          const content = `Channel: ${channel.name}\n\n${messages
            .map((m: any) => m.text)
            .join('\n')}`;

          // Generate embedding
          const embedding = await this.generateEmbedding(content);

          // Store in knowledge base
          await db.insert(knowledgeBase).values({
            userId: connector.userId,
            sourceType: 'slack',
            sourceId: channel.id,
            sourceName: channel.name,
            content,
            metadata: {
              messageCount: messages.length,
            },
            embeddingId: `slack_${channel.id}`,
            vectorNamespace: connector.userId,
          });

          result.itemsAdded++;
        } catch (error: any) {
          result.errors.push(`Error processing ${channel.name}: ${error.message}`);
        }
      }

      // Update connector stats
      await db
        .update(dataConnectors)
        .set({
          lastSync: new Date(),
          itemsCount: result.itemsAdded,
        })
        .where(eq(dataConnectors.id, connector.id));

      result.success = true;
      return result;
    } catch (error: any) {
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Generate embedding for content
   */
  private async generateEmbedding(content: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content.substring(0, 8000), // Limit to 8k chars
    });

    return response.data[0].embedding;
  }

  /**
   * Extract text content from Notion blocks
   */
  private extractNotionContent(blocks: any[]): string {
    return blocks
      .map((block) => {
        if (block.type === 'paragraph') {
          return block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
        } else if (block.type === 'heading_1') {
          return block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
        } else if (block.type === 'heading_2') {
          return block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
        } else if (block.type === 'heading_3') {
          return block.heading_3.rich_text.map((t: any) => t.plain_text).join('');
        } else if (block.type === 'bulleted_list_item') {
          return '• ' + block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join('');
        }
        return '';
      })
      .filter((text) => text.length > 0)
      .join('\n');
  }
}

// Export singleton instance
let syncServiceInstance: DataSyncService | null = null;

export function getDataSyncService(apiKey?: string): DataSyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new DataSyncService(apiKey);
  }
  return syncServiceInstance;
}

