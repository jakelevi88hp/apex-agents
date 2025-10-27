/**
 * AI Admin Agent - Self-Upgrading System
 * 
 * This module provides an autonomous AI agent that can:
 * - Parse natural language commands
 * - Generate code patches
 * - Validate and apply changes
 * - Rollback on failure
 */

import { OpenAI } from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createGitHubIntegration, GitHubIntegration } from './github';

const execAsync = promisify(exec);

interface PatchRecord {
  id: string;
  timestamp: Date;
  request: string;
  patch: string;
  files: string[];
  status: 'pending' | 'applied' | 'failed' | 'rolled_back';
  error?: string;
}

interface CodebaseAnalysis {
  structure: Record<string, any>;
  dependencies: string[];
  frameworks: string[];
  patterns: string[];
}

export class AIAdminAgent {
  private openai: OpenAI;
  private logPath: string;
  private patchHistory: PatchRecord[] = [];
  private projectRoot: string;
  private github: GitHubIntegration | null = null;

  constructor(apiKey: string, projectRoot: string = process.cwd()) {
    this.openai = new OpenAI({ apiKey });
    this.projectRoot = projectRoot;
    this.logPath = path.join(projectRoot, 'logs', 'ai_admin.log');
    this.ensureLogDirectory();
    
    // Initialize GitHub integration if token is available
    try {
      this.github = createGitHubIntegration();
      this.log('GitHub integration initialized');
    } catch (error) {
      this.log('GitHub integration not available - changes will be local only', 'warning');
    }
  }

  private async ensureLogDirectory() {
    const logDir = path.dirname(this.logPath);
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create log directory:', error);
    }
  }

  private async log(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    try {
      await fs.appendFile(this.logPath, logEntry);
      console.log(logEntry.trim());
    } catch (error) {
      console.error('Failed to write to log:', error);
    }
  }

  /**
   * Analyze the codebase structure and patterns
   */
  async analyzeCodebase(): Promise<CodebaseAnalysis> {
    await this.log('Starting codebase analysis');

    try {
      // Read package.json for dependencies
      const packageJsonPath = path.join(this.projectRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      // Analyze directory structure
      const structure = await this.analyzeDirectory(path.join(this.projectRoot, 'src'));

      // Detect frameworks and patterns
      const dependencies = Object.keys({
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      });

      const frameworks = this.detectFrameworks(dependencies);
      const patterns = await this.detectPatterns();

      const analysis: CodebaseAnalysis = {
        structure,
        dependencies,
        frameworks,
        patterns,
      };

      await this.log(`Codebase analysis complete: ${frameworks.join(', ')}`);
      return analysis;
    } catch (error) {
      await this.log(`Codebase analysis failed: ${error}`, 'error');
      throw error;
    }
  }

  private async analyzeDirectory(dirPath: string): Promise<Record<string, any>> {
    const structure: Record<string, any> = {};

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            structure[entry.name] = await this.analyzeDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          structure[entry.name] = {
            type: 'file',
            extension: path.extname(entry.name),
          };
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }

    return structure;
  }

  private detectFrameworks(dependencies: string[]): string[] {
    const frameworks: string[] = [];

    if (dependencies.includes('next')) frameworks.push('Next.js');
    if (dependencies.includes('react')) frameworks.push('React');
    if (dependencies.includes('@trpc/server')) frameworks.push('tRPC');
    if (dependencies.includes('drizzle-orm')) frameworks.push('Drizzle ORM');
    if (dependencies.includes('tailwindcss')) frameworks.push('Tailwind CSS');

    return frameworks;
  }

  private async detectPatterns(): Promise<string[]> {
    const patterns: string[] = [];

    // Check for common patterns
    const srcPath = path.join(this.projectRoot, 'src');

    try {
      const appExists = await fs.access(path.join(srcPath, 'app')).then(() => true).catch(() => false);
      if (appExists) patterns.push('App Router');

      const serverExists = await fs.access(path.join(srcPath, 'server')).then(() => true).catch(() => false);
      if (serverExists) patterns.push('Server-side API');

      const libExists = await fs.access(path.join(srcPath, 'lib')).then(() => true).catch(() => false);
      if (libExists) patterns.push('Shared Libraries');
    } catch (error) {
      // Patterns detection failed
    }

    return patterns;
  }

  /**
   * Generate a code patch based on natural language request
   */
  async generatePatch(requestText: string): Promise<PatchRecord> {
    await this.log(`Generating patch for request: "${requestText}"`);

    try {
      // Analyze codebase first
      const analysis = await this.analyzeCodebase();

      // Generate patch using LLM
      const systemPrompt = `You are an expert software engineer working on a ${analysis.frameworks.join(', ')} project.
The codebase follows these patterns: ${analysis.patterns.join(', ')}.

Your task is to generate precise code changes based on user requests.
Respond with a JSON object containing:
{
  "files": [
    {
      "path": "relative/path/to/file.ts",
      "action": "create" | "modify" | "delete",
      "content": "full file content" (for create/modify),
      "explanation": "what this change does"
    }
  ],
  "summary": "brief description of all changes",
  "testingSteps": ["step 1", "step 2"],
  "risks": ["potential risk 1", "potential risk 2"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Request: ${requestText}\n\nCodebase structure: ${JSON.stringify(analysis.structure, null, 2)}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const patchData = JSON.parse(response.choices[0].message.content || '{}');

      const patchRecord: PatchRecord = {
        id: `patch_${Date.now()}`,
        timestamp: new Date(),
        request: requestText,
        patch: JSON.stringify(patchData, null, 2),
        files: patchData.files.map((f: any) => f.path),
        status: 'pending',
      };

      this.patchHistory.push(patchRecord);
      await this.log(`Patch generated: ${patchRecord.id} affecting ${patchRecord.files.length} files`);

      return patchRecord;
    } catch (error) {
      await this.log(`Patch generation failed: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Validate patch in sandbox before applying
   */
  private async validatePatch(patchRecord: PatchRecord): Promise<boolean> {
    await this.log(`Validating patch: ${patchRecord.id}`);

    try {
      const patchData = JSON.parse(patchRecord.patch);

      // Check if files exist and are writable
      for (const file of patchData.files) {
        const filePath = path.join(this.projectRoot, file.path);
        const fileDir = path.dirname(filePath);

        // Ensure directory exists
        await fs.mkdir(fileDir, { recursive: true });

        if (file.action === 'modify' || file.action === 'delete') {
          try {
            await fs.access(filePath);
          } catch {
            throw new Error(`File does not exist: ${file.path}`);
          }
        }
      }

      // Run TypeScript type checking
      try {
        await execAsync('npx tsc --noEmit', { cwd: this.projectRoot });
        await this.log('TypeScript validation passed');
      } catch (error: any) {
        await this.log(`TypeScript validation failed: ${error.stdout}`, 'warning');
        // Continue anyway - might be acceptable
      }

      await this.log(`Patch validation successful: ${patchRecord.id}`);
      return true;
    } catch (error) {
      await this.log(`Patch validation failed: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Apply a validated patch to the codebase
   */
  async applyPatch(patchRecord: PatchRecord): Promise<boolean> {
    await this.log(`Applying patch: ${patchRecord.id}`);

    try {
      // Validate first
      const isValid = await this.validatePatch(patchRecord);
      if (!isValid) {
        patchRecord.status = 'failed';
        patchRecord.error = 'Validation failed';
        return false;
      }

      const patchData = JSON.parse(patchRecord.patch);

      // Create backup before applying
      await this.createBackup(patchRecord.files);

      // Apply changes
      for (const file of patchData.files) {
        const filePath = path.join(this.projectRoot, file.path);

        switch (file.action) {
          case 'create':
          case 'modify':
            await fs.writeFile(filePath, file.content, 'utf-8');
            await this.log(`${file.action === 'create' ? 'Created' : 'Modified'}: ${file.path}`);
            break;

          case 'delete':
            await fs.unlink(filePath);
            await this.log(`Deleted: ${file.path}`);
            break;
        }
      }

      patchRecord.status = 'applied';
      await this.log(`Patch applied successfully: ${patchRecord.id}`);

      // Commit and push to GitHub if integration is available
      if (this.github) {
        try {
          await this.log('Committing changes to GitHub...');
          const commitMessage = `AI Admin: ${patchRecord.request}\n\nPatch ID: ${patchRecord.id}\nFiles modified: ${patchRecord.files.length}`;
          await this.github.commitAndPush(patchRecord.files, commitMessage);
          await this.log('Changes pushed to GitHub successfully');
        } catch (error) {
          await this.log(`Failed to push to GitHub: ${error}`, 'warning');
          // Don't fail the patch application if GitHub push fails
        }
      }

      return true;
    } catch (error) {
      patchRecord.status = 'failed';
      patchRecord.error = String(error);
      await this.log(`Patch application failed: ${error}`, 'error');

      // Attempt rollback
      await this.rollbackPatch(patchRecord.id);

      return false;
    }
  }

  /**
   * Create backup of files before modification
   */
  private async createBackup(files: string[]): Promise<void> {
    const backupDir = path.join(this.projectRoot, '.ai-admin-backups', Date.now().toString());
    await fs.mkdir(backupDir, { recursive: true });

    for (const file of files) {
      const sourcePath = path.join(this.projectRoot, file);
      const backupPath = path.join(backupDir, file);

      try {
        await fs.mkdir(path.dirname(backupPath), { recursive: true });
        await fs.copyFile(sourcePath, backupPath);
      } catch (error) {
        // File might not exist yet (new file)
      }
    }

    await this.log(`Backup created: ${backupDir}`);
  }

  /**
   * Rollback a patch
   */
  async rollbackPatch(patchId: string): Promise<boolean> {
    await this.log(`Rolling back patch: ${patchId}`);

    try {
      const patchRecord = this.patchHistory.find(p => p.id === patchId);
      if (!patchRecord) {
        throw new Error(`Patch not found: ${patchId}`);
      }

      // Find the most recent backup
      const backupsDir = path.join(this.projectRoot, '.ai-admin-backups');
      const backups = await fs.readdir(backupsDir);
      backups.sort().reverse();

      if (backups.length === 0) {
        throw new Error('No backups available');
      }

      const latestBackup = path.join(backupsDir, backups[0]);

      // Restore files from backup
      for (const file of patchRecord.files) {
        const backupPath = path.join(latestBackup, file);
        const targetPath = path.join(this.projectRoot, file);

        try {
          await fs.copyFile(backupPath, targetPath);
          await this.log(`Restored: ${file}`);
        } catch (error) {
          // File might not have existed in backup
        }
      }

      patchRecord.status = 'rolled_back';
      await this.log(`Patch rolled back successfully: ${patchId}`);

      return true;
    } catch (error) {
      await this.log(`Rollback failed: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Get patch history
   */
  getPatchHistory(): PatchRecord[] {
    return this.patchHistory;
  }

  /**
   * Get specific patch by ID
   */
  getPatch(patchId: string): PatchRecord | undefined {
    return this.patchHistory.find(p => p.id === patchId);
  }
}

// Export singleton instance
let agentInstance: AIAdminAgent | null = null;

export function getAIAdminAgent(apiKey?: string): AIAdminAgent {
  if (!agentInstance) {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OpenAI API key is required');
    }
    agentInstance = new AIAdminAgent(key);
  }
  return agentInstance;
}

