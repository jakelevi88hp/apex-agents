/**
 * Context Builder for AI Admin
 * 
 * Intelligently gathers relevant file context based on the user's request
 */

import fs from 'fs/promises';
import path from 'path';

interface FileContext {
  path: string;
  content: string;
  reason: string; // Why this file was included
}

interface ComponentInventory {
  components: string[];
  layouts: string[];
  contexts: string[];
  utilities: string[];
}

export class ContextBuilder {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Gather relevant file context based on the request
   */
  async gatherContext(request: string): Promise<{
    files: FileContext[];
    componentInventory: ComponentInventory;
    summary: string;
  }> {
    const files: FileContext[] = [];
    const keywords = this.extractKeywords(request);
    
    // 1. Read files that are likely to be modified based on keywords
    const targetFiles = this.identifyTargetFiles(keywords);
    for (const filePath of targetFiles) {
      const content = await this.readFile(filePath);
      if (content) {
        files.push({
          path: filePath,
          content,
          reason: 'Target file for modification',
        });
      }
    }

    // 2. Read related files (imports, dependencies)
    for (const file of [...files]) {
      const relatedFiles = await this.findRelatedFiles(file.path, file.content);
      for (const relatedPath of relatedFiles) {
        // Avoid duplicates
        if (!files.some(f => f.path === relatedPath)) {
          const content = await this.readFile(relatedPath);
          if (content) {
            files.push({
              path: relatedPath,
              content,
              reason: `Related to ${file.path}`,
            });
          }
        }
      }
    }

    // 3. Build component inventory
    const componentInventory = await this.buildComponentInventory();

    // 4. Create summary
    const summary = this.createSummary(files, componentInventory, keywords);

    return {
      files,
      componentInventory,
      summary,
    };
  }

  /**
   * Extract keywords from the request
   */
  private extractKeywords(request: string): string[] {
    const keywords: string[] = [];
    const lower = request.toLowerCase();

     // Feature keywords
    if (lower.includes('dashboard')) keywords.push('dashboard');
    if (lower.includes('admin')) keywords.push('admin');
    if (lower.includes('agi')) keywords.push('agi');
    if (lower.includes('agent')) keywords.push('agents');
    if (lower.includes('workflow')) keywords.push('workflows');
    if (lower.includes('analytics')) keywords.push('analytics');
    if (lower.includes('settings')) keywords.push('settings');
    if (lower.includes('knowledge')) keywords.push('knowledge');
    if (lower.includes('layout')) keywords.push('layout');
    if (lower.includes('component')) keywords.push('component');
    if (lower.includes('api')) keywords.push('api');
    if (lower.includes('database') || lower.includes('schema')) keywords.push('database');
    if (lower.includes('auth')) keywords.push('auth');
    
    // Configuration and dependencies
    if (lower.includes('package') || lower.includes('dependencies') || lower.includes('dependency')) keywords.push('dependencies');
    if (lower.includes('config') || lower.includes('configuration')) keywords.push('config');
    if (lower.includes('env') || lower.includes('environment')) keywords.push('environment');
    if (lower.includes('typescript') || lower.includes('tsconfig')) keywords.push('typescript');
    if (lower.includes('tailwind') || lower.includes('css')) keywords.push('styling');
    
    // Documentation and project structure
    if (lower.includes('readme') || lower.includes('documentation') || lower.includes('docs')) keywords.push('documentation');
    if (lower.includes('structure') || lower.includes('architecture') || lower.includes('overview')) keywords.push('structure');
    
    // Specific features
    if (lower.includes('trpc') || lower.includes('router')) keywords.push('trpc');
    if (lower.includes('drizzle') || lower.includes('orm')) keywords.push('orm');
    if (lower.includes('upgrade') || lower.includes('outdated') || lower.includes('update')) keywords.push('upgrades');

    // Action keywords
    if (lower.includes('create') || lower.includes('add')) keywords.push('create');
    if (lower.includes('modify') || lower.includes('update') || lower.includes('change')) keywords.push('modify');
    if (lower.includes('delete') || lower.includes('remove')) keywords.push('delete');

    return keywords;
  }

  /**
   * Identify target files based on keywords
   */
  private identifyTargetFiles(keywords: string[]): string[] {
    const files: string[] = [];

    for (const keyword of keywords) {
      switch (keyword) {
        case 'dashboard':
          files.push('src/app/dashboard/layout.tsx');
          files.push('src/app/dashboard/page.tsx');
          break;
        case 'admin':
          files.push('src/app/admin/ai/page.tsx');
          break;
        case 'agi':
          files.push('src/app/dashboard/agi/page.tsx');
          break;
        case 'agents':
          files.push('src/app/dashboard/agents/page.tsx');
          files.push('src/server/routers/agents.ts');
          break;
        case 'workflows':
          files.push('src/app/dashboard/workflows/page.tsx');
          files.push('src/server/routers/workflows.ts');
          break;
        case 'analytics':
          files.push('src/app/dashboard/analytics/page.tsx');
          files.push('src/server/routers/analytics.ts');
          break;
        case 'settings':
          files.push('src/app/dashboard/settings/page.tsx');
          files.push('src/server/routers/settings.ts');
          break;
        case 'knowledge':
          files.push('src/app/dashboard/knowledge/page.tsx');
          break;
        case 'layout':
          files.push('src/app/layout.tsx');
          files.push('src/app/dashboard/layout.tsx');
          break;
        case 'api':
          files.push('src/server/routers/_app.ts');
          break;
        case 'database':
          files.push('src/lib/db/schema.ts');
          break;
        case 'auth':
          files.push('src/server/routers/auth.ts');
          files.push('src/lib/auth.ts');
          break;
        case 'dependencies':
          files.push('package.json');
          break;
        case 'config':
          files.push('next.config.js');
          files.push('tailwind.config.ts');
          files.push('tsconfig.json');
          break;
        case 'environment':
          files.push('.env.example');
          break;
        case 'typescript':
          files.push('tsconfig.json');
          break;
        case 'styling':
          files.push('tailwind.config.ts');
          files.push('src/app/globals.css');
          break;
        case 'documentation':
          files.push('README.md');
          break;
        case 'structure':
          files.push('README.md');
          files.push('package.json');
          break;
        case 'trpc':
          files.push('src/server/routers/_app.ts');
          files.push('src/lib/trpc.ts');
          break;
        case 'orm':
          files.push('src/lib/db/schema.ts');
          files.push('drizzle.config.ts');
          break;
        case 'upgrades':
          files.push('package.json');
          files.push('README.md');
          break;
      }
    }

    return [...new Set(files)]; // Remove duplicates
  }

  /**
   * Find related files (imports, dependencies)
   */
  private async findRelatedFiles(filePath: string, content: string): Promise<string[]> {
    const related: string[] = [];

    // Extract import statements
    const importRegex = /import\s+.*\s+from\s+['"](.+)['"]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Skip node_modules
      if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
        continue;
      }

      // Resolve relative path
      let resolvedPath = importPath;
      if (importPath.startsWith('@/')) {
        resolvedPath = importPath.replace('@/', 'src/');
      } else if (importPath.startsWith('.')) {
        const dir = path.dirname(filePath);
        resolvedPath = path.join(dir, importPath);
      }

      // Add common extensions if not present
      if (!resolvedPath.endsWith('.ts') && !resolvedPath.endsWith('.tsx')) {
        // Try .tsx first (for React components), then .ts
        const tsxPath = resolvedPath + '.tsx';
        const tsPath = resolvedPath + '.ts';
        
        const tsxExists = await this.fileExists(tsxPath);
        if (tsxExists) {
          related.push(tsxPath);
        } else {
          const tsExists = await this.fileExists(tsPath);
          if (tsExists) {
            related.push(tsPath);
          }
        }
      } else {
        related.push(resolvedPath);
      }
    }

    return related;
  }

  /**
   * Build inventory of available components
   */
  private async buildComponentInventory(): Promise<ComponentInventory> {
    const inventory: ComponentInventory = {
      components: [],
      layouts: [],
      contexts: [],
      utilities: [],
    };

    try {
      // Scan components directory
      const componentsDir = path.join(this.projectRoot, 'src/components');
      const componentFiles = await this.scanDirectory(componentsDir, '.tsx');
      inventory.components = componentFiles.map(f => path.basename(f, '.tsx'));

      // Scan layouts
      const appDir = path.join(this.projectRoot, 'src/app');
      const layoutFiles = await this.findFiles(appDir, 'layout.tsx');
      inventory.layouts = layoutFiles.map(f => f.replace(appDir + '/', ''));

      // Scan contexts
      const contextsDir = path.join(this.projectRoot, 'src/contexts');
      const contextFiles = await this.scanDirectory(contextsDir, '.tsx');
      inventory.contexts = contextFiles.map(f => path.basename(f, '.tsx'));

      // Scan utilities
      const libDir = path.join(this.projectRoot, 'src/lib');
      const utilFiles = await this.scanDirectory(libDir, '.ts');
      inventory.utilities = utilFiles.map(f => path.basename(f, '.ts'));
    } catch (error) {
      console.error('[ContextBuilder] Error building component inventory:', error);
    }

    return inventory;
  }

  /**
   * Scan directory for files with specific extension
   */
  private async scanDirectory(dir: string, extension: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = await this.scanDirectory(fullPath, extension);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return files;
  }

  /**
   * Find all files with a specific name in a directory tree
   */
  private async findFiles(dir: string, filename: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.findFiles(fullPath, filename);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name === filename) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }

    return files;
  }

  /**
   * Read file content
   * In production (Vercel), reads from GitHub API
   * In development, reads from local filesystem
   */
  private async readFile(filePath: string): Promise<string | null> {
    try {
      // Check if we're in production (Vercel)
      const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
      
      if (isProduction && process.env.GITHUB_TOKEN) {
        // Read from GitHub API
        const owner = process.env.GITHUB_OWNER || 'jakelevi88hp';
        const repo = process.env.GITHUB_REPO || 'apex-agents';
        const branch = 'main';
        
        try {
          const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3.raw',
              },
            }
          );
          
          if (response.ok) {
            return await response.text();
          }
          return null;
        } catch (error) {
          console.error(`[ContextBuilder] Failed to read ${filePath} from GitHub:`, error);
          return null;
        }
      } else {
        // Read from local filesystem (development)
        const fullPath = path.join(this.projectRoot, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        return content;
      }
    } catch (error) {
      console.error(`[ContextBuilder] Failed to read ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.projectRoot, filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create a summary of the gathered context
   */
  private createSummary(
    files: FileContext[],
    inventory: ComponentInventory,
    keywords: string[]
  ): string {
    let summary = `# Context Summary\n\n`;
    summary += `**Keywords detected:** ${keywords.join(', ')}\n\n`;
    summary += `**Files gathered:** ${files.length}\n`;
    
    for (const file of files) {
      summary += `- ${file.path} (${file.reason})\n`;
    }

    summary += `\n**Available Components:** ${inventory.components.length}\n`;
    summary += `${inventory.components.slice(0, 20).join(', ')}${inventory.components.length > 20 ? '...' : ''}\n\n`;

    summary += `**Available Layouts:** ${inventory.layouts.length}\n`;
    summary += `${inventory.layouts.join(', ')}\n\n`;

    summary += `**Available Contexts:** ${inventory.contexts.length}\n`;
    summary += `${inventory.contexts.join(', ')}\n\n`;

    return summary;
  }
}
