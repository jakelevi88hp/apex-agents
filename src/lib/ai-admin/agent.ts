import 'server-only';

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
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createGitHubIntegration, GitHubIntegration } from './github';
import { GitHubService, CommitFileChange } from './github-service';
import { getSystemPrompt } from './system-prompt';
import { patchStorage } from './patch-storage';
import { ContextBuilder } from './context-builder';
import { ContextGatherer } from './context-gatherer';
import { PatchValidator, PatchData } from './patch-validator';

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
  private patchHistory: PatchRecord[] = [];
  private projectRoot: string;
  private github: GitHubIntegration | null = null;
  private githubService: GitHubService | null = null;
  private isProduction: boolean;
  private model: string;
  private contextBuilder: ContextBuilder;
  private contextGatherer: ContextGatherer | null = null;
  private patchValidator: PatchValidator;

  constructor(apiKey: string, projectRoot: string = process.cwd(), model?: string) {
    this.openai = new OpenAI({ apiKey });
    this.projectRoot = projectRoot;
    this.isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    // Use provided model, environment variable, or default
    this.model = model || process.env.AI_ADMIN_MODEL || 'gpt-4o';
    this.log(`AI Admin initialized with model: ${this.model}`);
    
    // Initialize context builder
    this.contextBuilder = new ContextBuilder(projectRoot);
    
    // Initialize patch validator
    this.patchValidator = new PatchValidator();
    this.log('PatchValidator initialized');
    
    // Initialize GitHub integration if token is available
    try {
      this.github = createGitHubIntegration();
      this.log('GitHub integration initialized');
    } catch (error) {
      this.log('GitHub integration not available - changes will be local only', 'warning');
    }

    // Initialize GitHub Service for production patch application
    if (this.isProduction && process.env.GITHUB_TOKEN) {
      this.githubService = new GitHubService({
        token: process.env.GITHUB_TOKEN,
        owner: process.env.GITHUB_OWNER || 'jakelevi88hp',
        repo: process.env.GITHUB_REPO || 'apex-agents',
        defaultBranch: 'main',
      });
      this.log('GitHub Service initialized for production patch application');
      
      // Initialize ContextGatherer for intelligent file discovery
      this.contextGatherer = new ContextGatherer(
        this.githubService,
        process.env.GITHUB_OWNER || 'jakelevi88hp',
        process.env.GITHUB_REPO || 'apex-agents'
      );
      this.log('ContextGatherer initialized for intelligent context gathering');
    }
  }

  private async log(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[AI Admin] [${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    // Only use console.log - no file operations
    // This prevents ENOENT errors in Vercel's read-only filesystem
    console.log(logMessage);
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
   * Read content of a specific file
   */
  private async readFileContent(filePath: string): Promise<string | null> {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return content;
    } catch (error) {
      await this.log(`Failed to read file ${filePath}: ${error}`, 'warning');
      return null;
    }
  }

  /**
   * Get context for a message (used by streaming API)
   */
  async getContext(message: string): Promise<string> {
    try {
      const analysis = await this.analyzeCodebase();
      const context = await this.contextBuilder.gatherContext(message);

      const contextStr = `# PROJECT CONTEXT

${context.summary}

**Frameworks:** ${analysis.frameworks.join(', ')}
**Patterns:** ${analysis.patterns.join(', ')}

# AVAILABLE COMPONENTS
- Components: ${context.componentInventory.components.join(', ')}
- Layouts: ${context.componentInventory.layouts.join(', ')}
- Contexts: ${context.componentInventory.contexts.join(', ')}

# RELEVANT FILES

${context.files.length > 0 ? context.files.map(f => `## ${f.path}

\`\`\`${f.language || ''}
${f.content}
\`\`\``).join('\n\n') : 'No specific files loaded for this query.'}`;

      return contextStr;
    } catch (error) {
      this.log(`Error gathering context: ${error}`, 'error');
      return 'Unable to gather context.';
    }
  }

  /**
   * Chat with AI Admin (no patch generation)
   */
  async chat(
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
  ): Promise<string> {
    await this.log(`Chat message received: "${message}"`);

    try {
      // Analyze codebase for context
      const analysis = await this.analyzeCodebase();

      // Gather context based on the message
      await this.log('Gathering context for chat...');
      const context = await this.contextBuilder.gatherContext(message);
      await this.log(`Context gathered: ${context.files.length} files`);

      // Build conversation messages
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        {
          role: 'system',
          content: `You are an expert AI software engineer helping with the Apex Agents platform.

# PROJECT CONTEXT

${context.summary}

**Frameworks:** ${analysis.frameworks.join(', ')}
**Patterns:** ${analysis.patterns.join(', ')}

# AVAILABLE COMPONENTS
- Components: ${context.componentInventory.components.join(', ')}
- Layouts: ${context.componentInventory.layouts.join(', ')}
- Contexts: ${context.componentInventory.contexts.join(', ')}

# RELEVANT FILES

${context.files.length > 0 ? context.files.map(f => `## ${f.path}

\`\`\`${f.language || ''}
${f.content}
\`\`\``).join('\n\n') : 'No specific files loaded for this query.'}

# YOUR ROLE

You are in CHAT MODE. Your job is to:
- Answer questions about the codebase
- Explain how things work
- Provide recommendations and best practices
- Discuss potential changes and their implications
- Help understand the architecture and patterns

You should NOT generate code patches in this mode. If the user wants to make changes, suggest they switch to Patch Mode.

Be helpful, concise, and technical. Provide code examples when relevant.`,
        },
      ];

      // Add conversation history
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: message,
      });

      // Get response from OpenAI
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      const reply = response.choices[0].message.content || 'I apologize, but I could not generate a response.';
      await this.log('Chat response generated');

      return reply;
    } catch (error) {
      await this.log(`Chat error: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Generate a code patch based on natural language request
   */
  async generatePatch(requestText: string): Promise<PatchRecord> {
    await this.log(`Generating patch for request: "${requestText}"`);

    try {
      // Analyze codebase first
      const analysis = await this.analyzeCodebase();

      // Gather intelligent context based on the request
      await this.log('Gathering intelligent context for request...');
      
      // Use ContextGatherer in production for better file discovery
      let gatheredContext = null;
      if (this.contextGatherer) {
        try {
          await this.log('Using ContextGatherer for intelligent file discovery...');
          gatheredContext = await this.contextGatherer.gatherContext(requestText, 15, 100000);
          await this.log(`ContextGatherer found ${gatheredContext.files.length} relevant files using ${gatheredContext.strategy} strategy`);
          await this.log(`Keywords extracted: ${gatheredContext.keywords.join(', ')}`);
        } catch (error) {
          await this.log(`ContextGatherer failed, falling back to ContextBuilder: ${error}`, 'warning');
        }
      }
      
      const context = await this.contextBuilder.gatherContext(requestText);
      await this.log(`Context gathered: ${context.files.length} files, ${context.componentInventory.components.length} components available`);
      
      // Merge contexts if we have both
      if (gatheredContext) {
        // Add files from ContextGatherer that aren't already in context
        const existingPaths = new Set(context.files.map(f => f.path));
        for (const file of gatheredContext.files) {
          if (!existingPaths.has(file.path)) {
            context.files.push(file);
          }
        }
        await this.log(`Enhanced context: ${context.files.length} total files after merging`);
      }
      
      // Convert to the format expected by the prompt
      const relevantFiles: Record<string, string> = {};
      for (const file of context.files) {
        relevantFiles[file.path] = file.content;
      }

      // Generate patch using LLM with comprehensive knowledge base
      const systemPrompt = getSystemPrompt(analysis);

      // Try up to 3 times to get a valid patch
      let patchData: any = null;
      let lastError: string = '';
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await this.log(`Generating patch (attempt ${attempt}/3)...`);
          
          const response = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Request: ${requestText}\n\n${context.summary}\n\nCodebase structure: ${JSON.stringify(analysis.structure, null, 2)}\n\n# AVAILABLE COMPONENTS\nYou can ONLY use these components that exist in the project:\n- Components: ${context.componentInventory.components.join(', ')}\n- Layouts: ${context.componentInventory.layouts.join(', ')}\n- Contexts: ${context.componentInventory.contexts.join(', ')}\n\n⚠️ DO NOT reference components that are not in this list! They don't exist.\n\nRelevant file contents:\n${Object.entries(relevantFiles).map(([path, content]) => `\n=== ${path} ===\n${content}`).join('\n')}${attempt > 1 ? `\n\nPREVIOUS ATTEMPT FAILED: ${lastError}\n\nPlease ensure your response follows the exact JSON format with a 'files' array.` : ''}\n\nIMPORTANT: Your response MUST be a valid JSON object with this exact structure:\n{\n  "files": [{"path": "...", "action": "...", "content": "...", "explanation": "..."}],\n  "summary": "...",\n  "testingSteps": [...],\n  "risks": [...],\n  "databaseChanges": {...}\n}`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
          });

          const rawContent = response.choices[0].message.content || '{}';
          await this.log(`Raw OpenAI response (attempt ${attempt}): ${rawContent.substring(0, 500)}...`);
          
          patchData = JSON.parse(rawContent);
          await this.log(`Parsed patch data keys: ${Object.keys(patchData).join(', ')}`);
          
          // Validate immediately using PatchValidator
          const validationResult = this.patchValidator.validate(patchData as PatchData, requestText);
          
          if (validationResult.valid) {
            // Log warnings if any
            if (validationResult.warnings.length > 0) {
              await this.log(`Patch validation warnings: ${validationResult.warnings.join('; ')}`, 'warning');
            }
            await this.log(`Patch generated successfully on attempt ${attempt}`);
            break; // Success!
          }
          
          lastError = this.patchValidator.formatErrorMessage(validationResult, requestText);
          await this.log(`Attempt ${attempt} validation failed: ${validationResult.errors.join('; ')}`, 'warning');
          
          if (attempt === 3) {
            throw new Error(lastError);
          }
        } catch (error) {
          if (attempt === 3) {
            throw error;
          }
          lastError = String(error);
          await this.log(`Attempt ${attempt} failed: ${error}`, 'warning');
        }
      }

      // Patch is already validated in the retry loop above
      if (!patchData) {
        throw new Error('Failed to generate valid patch after 3 attempts');
      }

      const patchRecord: PatchRecord = {
        id: `patch_${Date.now()}`,
        timestamp: new Date(),
        request: requestText,
        patch: JSON.stringify(patchData, null, 2),
        files: patchData.files.map((f: any) => f.path),
        status: 'pending',
      };

      this.patchHistory.push(patchRecord);
      await this.log(`Patch generated and validated: ${patchRecord.id} affecting ${patchRecord.files.length} files`);

      return patchRecord;
    } catch (error) {
      await this.log(`Patch generation failed: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Validate patch data for common issues before creating patch record
   */
  private async validatePatchData(patchData: any, requestText: string): Promise<string[]> {
    const errors: string[] = [];

    if (!patchData.files || !Array.isArray(patchData.files)) {
      errors.push('Patch data must contain a files array');
      return errors;
    }

    // Define known existing pages to prevent duplicates
    const existingPages: Record<string, string> = {
      'admin': 'src/app/admin/ai/page.tsx',
      'ai admin': 'src/app/admin/ai/page.tsx',
      'ai-admin': 'src/app/admin/ai/page.tsx',
      'dashboard': 'src/app/dashboard/page.tsx',
      'agi': 'src/app/dashboard/agi/page.tsx',
      'login': 'src/app/login/page.tsx',
      'signup': 'src/app/signup/page.tsx',
    };

    for (const file of patchData.files) {
      // Check for Pages Router paths (should never be used)
      if (file.path.includes('src/pages/') || file.path.startsWith('pages/')) {
        errors.push(`Invalid path (Pages Router): ${file.path}. Use App Router paths (src/app/*) instead.`);
      }

      // Check for wrong imports in file content
      if (file.content && file.content.includes("from 'next/router'")) {
        errors.push(`Invalid import in ${file.path}: Use 'next/navigation' instead of 'next/router' for App Router.`);
      }

      // Check for duplicate pages
      if (file.action === 'create' && file.path.endsWith('/page.tsx')) {
        const pagePath = file.path.toLowerCase();
        
        // Check if creating a duplicate of an existing page
        for (const [keyword, existingPath] of Object.entries(existingPages)) {
          if (requestText.toLowerCase().includes(keyword) && 
              file.path !== existingPath && 
              pagePath.includes(keyword.replace(' ', '-'))) {
            errors.push(
              `Duplicate page detected: Trying to create ${file.path} but ${existingPath} already exists. ` +
              `Use action: "modify" on ${existingPath} instead.`
            );
          }
        }

        // Check for similar paths that might be duplicates
        if (pagePath.includes('ai-admin') && existingPages['ai admin']) {
          errors.push(
            `Duplicate page detected: ${file.path} conflicts with existing ${existingPages['ai admin']}. ` +
            `Modify the existing file instead.`
          );
        }
      }

      // Check for singular vs plural context folder
      if (file.path.includes('/context/') && !file.path.includes('/contexts/')) {
        errors.push(`Invalid path: ${file.path}. Use 'src/contexts/' (plural) not 'src/context/' (singular).`);
      }

      // Validate file actions
      if (!['create', 'modify', 'delete'].includes(file.action)) {
        errors.push(`Invalid action "${file.action}" for file ${file.path}. Must be create, modify, or delete.`);
      }

      // Ensure content exists for create/modify actions
      if ((file.action === 'create' || file.action === 'modify') && !file.content) {
        errors.push(`Missing content for ${file.action} action on ${file.path}`);
      }
    }

    return errors;
  }

  /**
   * Validate patch in sandbox before applying
   * 
   * Note: In production (Vercel), filesystem is read-only, so we skip
   * filesystem checks and only validate patch structure.
   */
  private async validatePatch(patchRecord: PatchRecord): Promise<boolean> {
    await this.log(`Validating patch: ${patchRecord.id}`);
    await this.log(`Production mode: ${this.isProduction}`);

    try {
      const patchData = JSON.parse(patchRecord.patch);

      // Validate patch structure
      if (!patchData.files || !Array.isArray(patchData.files)) {
        throw new Error('Invalid patch: missing files array');
      }

      if (patchData.files.length === 0) {
        throw new Error('Invalid patch: no files to modify');
      }

      // Validate each file
      for (const file of patchData.files) {
        if (!file.path) {
          throw new Error('Invalid file: missing path');
        }
        if (!file.action || !['create', 'modify', 'delete'].includes(file.action)) {
          throw new Error(`Invalid file action: ${file.action}`);
        }
        if ((file.action === 'create' || file.action === 'modify') && !file.content) {
          throw new Error(`Missing content for ${file.action} action on ${file.path}`);
        }
      }

      // In production, skip filesystem checks (read-only environment)
      if (this.isProduction) {
        await this.log('Skipping filesystem checks in production (read-only environment)');
        await this.log(`Patch validation successful: ${patchRecord.id}`);
        return true;
      }

      // In development, check if files exist and are writable
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

      // Run TypeScript type checking (only in development)
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
   * 
   * Note: This method now always uses local filesystem and commits directly to main branch.
   * Previously, it would create separate branches and PRs in production, but this caused
   * GitHub API issues and orphaned branches. Direct commits are simpler and more reliable.
   */
  async applyPatch(patchRecord: PatchRecord): Promise<boolean> {
    await this.log(`Applying patch: ${patchRecord.id}`);
    await this.log(`Environment: ${this.isProduction ? 'production' : 'development'}`);
    await this.log(`GitHub Service available: ${!!this.githubService}`);

    try {
      const patchData = JSON.parse(patchRecord.patch);
      await this.log(`Patch data parsed successfully`);
      await this.log(`Files to modify: ${JSON.stringify(patchData.files?.map((f: any) => f.path) || [])}`);

      // In production (Vercel), use GitHub API to commit directly to main
      // In development, use local filesystem + git commands
      if (this.isProduction && this.githubService) {
        await this.log('Production environment: Using GitHub API to commit directly to main');
        return await this.applyPatchViaGitHubDirectCommit(patchRecord, patchData);
      }

      await this.log('Development environment: Using local filesystem');
      return await this.applyPatchLocally(patchRecord, patchData);
    } catch (error) {
      patchRecord.status = 'failed';
      patchRecord.error = String(error);
      await this.log(`Patch application failed with error: ${error}`, 'error');
      await this.log(`Error stack: ${(error as Error).stack}`, 'error');
      return false;
    }
  }

  /**
   * Apply patch via GitHub API with direct commit to main (for production)
   */
  private async applyPatchViaGitHubDirectCommit(patchRecord: PatchRecord, patchData: any): Promise<boolean> {
    if (!this.githubService) {
      await this.log('GitHub Service not initialized!', 'error');
      throw new Error('GitHub Service not initialized');
    }

    await this.log('Applying patch via GitHub API (direct commit to main)...');
    await this.log(`Patch data: ${JSON.stringify({ summary: patchData.summary, filesCount: patchData.files?.length })}`);

    try {
      // Prepare file changes
      const fileChanges: CommitFileChange[] = patchData.files.map((file: any) => ({
        path: file.path,
        content: file.content || '',
        action: file.action,
      }));

      // Commit files directly to main branch
      const commitMessage = `AI Admin: ${patchRecord.request}\n\nPatch ID: ${patchRecord.id}\nFiles modified: ${patchRecord.files.length}`;
      const commitSha = await this.githubService.commitFiles('main', fileChanges, commitMessage);
      await this.log(`Committed changes to main: ${commitSha}`);

      patchRecord.status = 'applied';
      return true;
    } catch (error) {
      await this.log(`Failed to apply patch via GitHub: ${error}`, 'error');
      await this.log(`Error details: ${JSON.stringify(error)}`, 'error');
      await this.log(`Error stack: ${(error as Error).stack}`, 'error');
      throw error;
    }
  }

  /**
   * Apply patch via GitHub API (for production) - DEPRECATED: Creates separate branch
   */
  private async applyPatchViaGitHub(patchRecord: PatchRecord, patchData: any): Promise<boolean> {
    if (!this.githubService) {
      await this.log('GitHub Service not initialized!', 'error');
      throw new Error('GitHub Service not initialized');
    }

    await this.log('Applying patch via GitHub API...');
    await this.log(`Patch data: ${JSON.stringify({ summary: patchData.summary, filesCount: patchData.files?.length })}`);

    try {
      // Create a unique branch name
      const branchName = `ai-admin/${patchRecord.id}`;
      await this.log(`Branch name: ${branchName}`);

      // Check if branch already exists
      await this.log('Checking if branch exists...');
      const branchExists = await this.githubService.branchExists(branchName);
      await this.log(`Branch exists: ${branchExists}`);
      if (branchExists) {
        await this.githubService.deleteBranch(branchName);
        await this.log(`Deleted existing branch: ${branchName}`);
      }

      // Create new branch
      await this.githubService.createBranch(branchName);
      await this.log(`Created branch: ${branchName}`);

      // Prepare file changes
      const fileChanges: CommitFileChange[] = patchData.files.map((file: any) => ({
        path: file.path,
        content: file.content || '',
        action: file.action,
      }));

      // Commit files to the branch
      const commitMessage = `AI Admin: ${patchRecord.request}\n\nPatch ID: ${patchRecord.id}\nFiles modified: ${patchRecord.files.length}`;
      const commitSha = await this.githubService.commitFiles(branchName, fileChanges, commitMessage);
      await this.log(`Committed changes: ${commitSha}`);

      // Create pull request
      const prBody = `## AI Admin Patch Application\n\n**Request:** ${patchRecord.request}\n\n**Patch ID:** ${patchRecord.id}\n\n**Files Modified:**\n${patchRecord.files.map(f => `- ${f}`).join('\n')}\n\n**Summary:**\n${patchData.summary}\n\n**Testing Steps:**\n${patchData.testingSteps?.map((step: string, i: number) => `${i + 1}. ${step}`).join('\n') || 'No testing steps provided'}\n\n**Potential Risks:**\n${patchData.risks?.map((risk: string) => `- ${risk}`).join('\n') || 'No risks identified'}`;
      
      const pr = await this.githubService.createPullRequest(
        branchName,
        `AI Admin: ${patchRecord.request}`,
        prBody
      );

      await this.log(`Pull request created: ${pr.url}`);

      // Store PR info in patch record
      patchRecord.status = 'applied';
      (patchRecord as any).prUrl = pr.url;
      (patchRecord as any).prNumber = pr.number;

      return true;
    } catch (error) {
      await this.log(`Failed to apply patch via GitHub: ${error}`, 'error');
      await this.log(`Error details: ${JSON.stringify(error)}`, 'error');
      await this.log(`Error stack: ${(error as Error).stack}`, 'error');
      throw error;
    }
  }

  /**
   * Apply patch locally (for development)
   */
  private async applyPatchLocally(patchRecord: PatchRecord, patchData: any): Promise<boolean> {
    await this.log('Applying patch locally...');

    try {
      // Validate first
      const isValid = await this.validatePatch(patchRecord);
      if (!isValid) {
        patchRecord.status = 'failed';
        patchRecord.error = 'Validation failed';
        return false;
      }

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
      await this.log(`Local patch application failed: ${error}`, 'error');
      // Attempt rollback
      await this.rollbackPatch(patchRecord.id);
      throw error;
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
   * Get patch history from database
   */
  async getPatchHistory(): Promise<PatchRecord[]> {
    try {
      const patches = await patchStorage.getAllPatches();
      return patches;
    } catch (error) {
      await this.log(`Failed to get patch history: ${error}`, 'error');
      return [];
    }
  }

  /**
   * Get specific patch by ID
   */
  getPatch(patchId: string): PatchRecord | undefined {
    return this.patchHistory.find(p => p.id === patchId);
  }

  /**
   * Search repository for code/text
   */
  async searchRepository(query: string, repository?: string): Promise<any[]> {
    try {
      if (!this.githubService) {
        throw new Error('GitHub service not initialized');
      }

      // Use GitHub code search API
      const results = await this.githubService.searchCode(query, repository);
      return results;
    } catch (error) {
      await this.log(`Repository search failed: ${error}`, 'error');
      return [];
    }
  }

  /**
   * List GitHub issues
   */
  async listGitHubIssues(repository?: string, state: 'open' | 'closed' | 'all' = 'open'): Promise<any[]> {
    try {
      if (!this.githubService) {
        throw new Error('GitHub service not initialized');
      }

      const issues = await this.githubService.listIssues(state);
      return issues;
    } catch (error) {
      await this.log(`Failed to list issues: ${error}`, 'error');
      return [];
    }
  }

  /**
   * Create GitHub issue
   */
  async createGitHubIssue(
    title: string,
    body?: string,
    repository?: string,
    labels?: string[]
  ): Promise<any> {
    try {
      if (!this.githubService) {
        throw new Error('GitHub service not initialized');
      }

      const issue = await this.githubService.createIssue(title, body, labels);
      await this.log(`Created issue: ${title}`);
      return issue;
    } catch (error) {
      await this.log(`Failed to create issue: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Create Pull Request
   */
  async createPullRequest(
    title: string,
    head: string,
    base: string = 'main',
    body?: string,
    repository?: string
  ): Promise<any> {
    try {
      if (!this.githubService) {
        throw new Error('GitHub service not initialized');
      }

      const pr = await this.githubService.createPullRequest(title, head, base, body);
      await this.log(`Created PR: ${title}`);
      return pr;
    } catch (error) {
      await this.log(`Failed to create PR: ${error}`, 'error');
      throw error;
    }
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

