/**
 * OAuth Integration Service
 * 
 * Handles OAuth flows for various data sources
 */

import { db } from '@/lib/db';
import { dataConnectors } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthProvider {
  name: string;
  authUrl: string;
  tokenUrl: string;
  config: OAuthConfig;
}

// OAuth provider configurations
export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  google_drive: {
    name: 'Google Drive',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
      ],
    },
  },
  notion: {
    name: 'Notion',
    authUrl: 'https://api.notion.com/v1/oauth/authorize',
    tokenUrl: 'https://api.notion.com/v1/oauth/token',
    config: {
      clientId: process.env.NOTION_CLIENT_ID || '',
      clientSecret: process.env.NOTION_CLIENT_SECRET || '',
      redirectUri: process.env.NOTION_REDIRECT_URI || '',
      scopes: ['read_content'],
    },
  },
  github: {
    name: 'GitHub',
    authUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    config: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      redirectUri: process.env.GITHUB_REDIRECT_URI || '',
      scopes: ['repo', 'read:org'],
    },
  },
  slack: {
    name: 'Slack',
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    config: {
      clientId: process.env.SLACK_CLIENT_ID || '',
      clientSecret: process.env.SLACK_CLIENT_SECRET || '',
      redirectUri: process.env.SLACK_REDIRECT_URI || '',
      scopes: ['channels:read', 'files:read', 'search:read'],
    },
  },
};

export class OAuthService {
  /**
   * Generate OAuth authorization URL
   */
  static getAuthorizationUrl(provider: string, state: string): string {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) {
      throw new Error(`Unknown OAuth provider: ${provider}`);
    }

    const params = new URLSearchParams({
      client_id: config.config.clientId,
      redirect_uri: config.config.redirectUri,
      response_type: 'code',
      scope: config.config.scopes.join(' '),
      state,
      access_type: 'offline', // For refresh tokens
      prompt: 'consent',
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    provider: string,
    code: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }> {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) {
      throw new Error(`Unknown OAuth provider: ${provider}`);
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: config.config.clientId,
        client_secret: config.config.clientSecret,
        code,
        redirect_uri: config.config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token exchange failed: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(
    provider: string,
    refreshToken: string
  ): Promise<{
    accessToken: string;
    expiresIn?: number;
  }> {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) {
      throw new Error(`Unknown OAuth provider: ${provider}`);
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: config.config.clientId,
        client_secret: config.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OAuth token refresh failed: ${error}`);
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Store connector credentials
   */
  static async storeConnector(
    userId: string,
    provider: string,
    credentials: {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: number;
    }
  ): Promise<string> {
    const config = OAUTH_PROVIDERS[provider];
    if (!config) {
      throw new Error(`Unknown OAuth provider: ${provider}`);
    }

    // Encrypt credentials before storing (in production, use proper encryption)
    const encryptedCredentials = {
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      expiresAt: credentials.expiresIn
        ? new Date(Date.now() + credentials.expiresIn * 1000)
        : null,
    };

    const [connector] = await db
      .insert(dataConnectors)
      .values({
        userId,
        name: config.name,
        type: provider,
        credentials: encryptedCredentials,
        status: 'active',
        config: {},
      })
      .returning();

    return connector.id;
  }

  /**
   * Get connector credentials
   */
  static async getConnectorCredentials(
    connectorId: string
  ): Promise<{
    accessToken: string;
    refreshToken?: string;
  } | null> {
    const [connector] = await db
      .select()
      .from(dataConnectors)
      .where(eq(dataConnectors.id, connectorId))
      .limit(1);

    if (!connector) {
      return null;
    }

    const credentials = connector.credentials as any;

    // Check if token is expired and refresh if needed
    if (credentials.expiresAt && new Date(credentials.expiresAt) < new Date()) {
      if (credentials.refreshToken) {
        const refreshed = await this.refreshAccessToken(
          connector.type,
          credentials.refreshToken
        );

        // Update stored credentials
        await db
          .update(dataConnectors)
          .set({
            credentials: {
              ...credentials,
              accessToken: refreshed.accessToken,
              expiresAt: refreshed.expiresIn
                ? new Date(Date.now() + refreshed.expiresIn * 1000)
                : null,
            },
          })
          .where(eq(dataConnectors.id, connectorId));

        return {
          accessToken: refreshed.accessToken,
          refreshToken: credentials.refreshToken,
        };
      }
    }

    return {
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
    };
  }

  /**
   * Revoke connector
   */
  static async revokeConnector(connectorId: string): Promise<void> {
    await db
      .update(dataConnectors)
      .set({
        status: 'inactive',
        credentials: {},
      })
      .where(eq(dataConnectors.id, connectorId));
  }
}

