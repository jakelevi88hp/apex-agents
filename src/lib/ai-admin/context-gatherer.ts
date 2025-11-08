import { GitHubService } from './github-service';
import { FileTreeCache } from './file-tree-cache';

export interface GatheredContext {
  files: Array<{
    path: string;
    content: string;
    size: number;
  }>;
  relevantPaths: string[];
  keywords: string[];
  strategy: 'pattern' | 'search' | 'recent' | 'hybrid';
}

interface FilePattern {
  keywords: string[];
  patterns: string[];
  directories: string[];
  extensions: string[];
}

/**
 * Keyword-to-file pattern mappings
 * Maps common user intents to likely file locations
 */
const FILE_PATTERNS: Record<string, FilePattern> = {
  theme: {
    keywords: ['theme', 'dark mode', 'light mode', 'color', 'styling'],
    patterns: ['**/theme*.{ts,tsx,js,jsx}', '**/tailwind.config.*', '**/index.css', '**/globals.css'],
    directories: ['src/styles', 'src/theme', 'styles'],
    extensions: ['css', 'scss', 'sass'],
  },
  auth: {
    keywords: ['auth', 'login', 'logout', 'signin', 'signup', 'user', 'session'],
    patterns: ['**/auth*.{ts,tsx}', '**/login*.{ts,tsx}', '**/middleware.ts', '**/session*.ts'],
    directories: ['src/auth', 'src/lib/auth', 'lib/auth'],
    extensions: ['ts', 'tsx'],
  },
  database: {
    keywords: ['database', 'db', 'schema', 'migration', 'query', 'sql'],
    patterns: ['**/schema.ts', '**/db.ts', '**/database.ts', 'drizzle.config.ts'],
    directories: ['src/lib/db', 'src/db', 'drizzle', 'prisma'],
    extensions: ['ts'],
  },
  components: {
    keywords: ['component', 'ui', 'button', 'input', 'form', 'modal', 'dialog'],
    patterns: ['**/components/**/*.{ts,tsx}', '**/ui/**/*.{ts,tsx}'],
    directories: ['src/components', 'components', 'src/ui', 'ui'],
    extensions: ['tsx', 'jsx'],
  },
  api: {
    keywords: ['api', 'endpoint', 'route', 'handler', 'trpc', 'router'],
    patterns: ['**/api/**/*.ts', '**/routers/**/*.ts', '**/routes/**/*.ts'],
    directories: ['src/api', 'src/server', 'src/routers', 'api', 'server'],
    extensions: ['ts'],
  },
  layout: {
    keywords: ['layout', 'page', 'template', 'wrapper'],
    patterns: ['**/layout.{ts,tsx}', '**/page.{ts,tsx}', '**/template.{ts,tsx}'],
    directories: ['src/app', 'src/pages', 'app', 'pages'],
    extensions: ['tsx', 'jsx'],
  },
  config: {
    keywords: ['config', 'configuration', 'settings', 'env'],
    patterns: ['**/*.config.{ts,js}', '**/env.ts', '**/constants.ts'],
    directories: ['src/config', 'config'],
    extensions: ['ts', 'js', 'json'],
  },
};

export class ContextGatherer {
  private githubService: GitHubService;
  private fileTreeCache: FileTreeCache;
  private owner: string;
  private repo: string;

  constructor(githubService: GitHubService, owner: string, repo: string) {
    this.githubService = githubService;
    this.fileTreeCache = new FileTreeCache(githubService);
    this.owner = owner;
    this.repo = repo;
  }

  /**
   * Gather context for a user prompt
   */
  async gatherContext(
    userPrompt: string,
    maxFiles: number = 10,
    maxFileSize: number = 50000 // 50KB
  ): Promise<GatheredContext> {
    console.log(`[ContextGatherer] Gathering context for: "${userPrompt}"`);

    // Step 1: Extract keywords from prompt
    const keywords = this.extractKeywords(userPrompt);
    console.log(`[ContextGatherer] Extracted keywords:`, keywords);

    // Step 2: Find relevant file paths using multiple strategies
    const candidatePaths = await this.findRelevantFiles(keywords, userPrompt);
    console.log(`[ContextGatherer] Found ${candidatePaths.length} candidate files`);

    // Step 3: Prioritize and limit files
    const selectedPaths = this.prioritizeFiles(candidatePaths, maxFiles);
    console.log(`[ContextGatherer] Selected ${selectedPaths.length} files to load`);

    // Step 4: Load file contents
    const files = await this.loadFileContents(selectedPaths, maxFileSize);
    console.log(`[ContextGatherer] Loaded ${files.length} files successfully`);

    return {
      files,
      relevantPaths: selectedPaths,
      keywords,
      strategy: 'hybrid',
    };
  }

  /**
   * Extract keywords from user prompt
   */
  private extractKeywords(prompt: string): string[] {
    const keywords: string[] = [];

    // Convert to lowercase for matching
    const lowerPrompt = prompt.toLowerCase();

    // Extract file paths mentioned in prompt
    const pathMatches = prompt.match(/[a-z0-9_/-]+\.(ts|tsx|js|jsx|css|json)/gi);
    if (pathMatches) {
      keywords.push(...pathMatches);
    }

    // Extract component names (PascalCase words)
    const componentMatches = prompt.match(/\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g);
    if (componentMatches) {
      keywords.push(...componentMatches.map(c => c.toLowerCase()));
    }

    // Extract quoted strings (likely file or component names)
    const quotedMatches = prompt.match(/"([^"]+)"|'([^']+)'/g);
    if (quotedMatches) {
      keywords.push(...quotedMatches.map(q => q.replace(/["']/g, '').toLowerCase()));
    }

    // Add words from prompt (filter common words)
    const words = lowerPrompt.split(/\s+/);
    const meaningfulWords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'should', 'would', 'could'].includes(word)
    );
    keywords.push(...meaningfulWords);

    // Remove duplicates
    return [...new Set(keywords)];
  }

  /**
   * Find relevant files using multiple strategies
   */
  private async findRelevantFiles(keywords: string[], prompt: string): Promise<string[]> {
    const allPaths = new Set<string>();

    // Strategy 1: Pattern-based matching
    const patternPaths = await this.findFilesByPatterns(keywords);
    patternPaths.forEach(p => allPaths.add(p));

    // Strategy 2: Direct file path mentions
    const directPaths = this.extractDirectPaths(prompt);
    directPaths.forEach(p => allPaths.add(p));

    // Strategy 3: Search in common directories
    const commonDirPaths = await this.searchCommonDirectories(keywords);
    commonDirPaths.forEach(p => allPaths.add(p));

    return Array.from(allPaths);
  }

  /**
   * Find files using pattern matching
   */
  private async findFilesByPatterns(keywords: string[]): Promise<string[]> {
    const paths = new Set<string>();

    // Match keywords to file patterns
    for (const [category, config] of Object.entries(FILE_PATTERNS)) {
      const hasMatchingKeyword = config.keywords.some(kw =>
        keywords.some(userKw => userKw.includes(kw) || kw.includes(userKw))
      );

      if (hasMatchingKeyword) {
        console.log(`[ContextGatherer] Matched category: ${category}`);

        // Search by patterns
        for (const pattern of config.patterns) {
          try {
            const matches = await this.fileTreeCache.findFiles(
              this.owner,
              this.repo,
              pattern
            );
            matches.forEach(m => paths.add(m));
          } catch (error) {
            console.warn(`[ContextGatherer] Pattern search failed for ${pattern}:`, error);
          }
        }

        // Search by directories
        if (config.directories.length > 0) {
          try {
            const matches = await this.fileTreeCache.findFilesInDirectories(
              this.owner,
              this.repo,
              config.directories
            );
            matches.forEach(m => paths.add(m));
          } catch (error) {
            console.warn(`[ContextGatherer] Directory search failed:`, error);
          }
        }

        // Search by extensions
        if (config.extensions.length > 0) {
          try {
            const matches = await this.fileTreeCache.findFilesByExtension(
              this.owner,
              this.repo,
              config.extensions
            );
            // Filter to only files in relevant directories
            const filtered = matches.filter(m =>
              config.directories.some(dir => m.includes(dir))
            );
            filtered.forEach(m => paths.add(m));
          } catch (error) {
            console.warn(`[ContextGatherer] Extension search failed:`, error);
          }
        }
      }
    }

    return Array.from(paths);
  }

  /**
   * Extract direct file paths from prompt
   */
  private extractDirectPaths(prompt: string): string[] {
    const paths: string[] = [];

    // Match file paths (e.g., src/components/Button.tsx)
    const pathRegex = /(?:src\/|app\/|lib\/)?[\w/-]+\.(?:ts|tsx|js|jsx|css|json)/gi;
    const matches = prompt.match(pathRegex);

    if (matches) {
      paths.push(...matches);
    }

    return paths;
  }

  /**
   * Search in common project directories
   */
  private async searchCommonDirectories(keywords: string[]): Promise<string[]> {
    const commonDirs = ['src/components', 'src/lib', 'src/app', 'src/pages', 'components', 'lib'];
    const paths = new Set<string>();

    try {
      const allFiles = await this.fileTreeCache.findFilesInDirectories(
        this.owner,
        this.repo,
        commonDirs
      );

      // Filter files that match keywords in their path
      const matchingFiles = allFiles.filter(file => {
        const lowerFile = file.toLowerCase();
        return keywords.some(kw => lowerFile.includes(kw.toLowerCase()));
      });

      matchingFiles.forEach(f => paths.add(f));
    } catch (error) {
      console.warn('[ContextGatherer] Common directory search failed:', error);
    }

    return Array.from(paths);
  }

  /**
   * Prioritize files based on relevance
   */
  private prioritizeFiles(paths: string[], maxFiles: number): string[] {
    // Score each file
    const scored = paths.map(path => ({
      path,
      score: this.scoreFile(path),
    }));

    // Sort by score (descending)
    scored.sort((a, b) => b.score - a.score);

    // Take top N
    return scored.slice(0, maxFiles).map(s => s.path);
  }

  /**
   * Score a file based on relevance heuristics
   */
  private scoreFile(path: string): number {
    let score = 0;

    // Prefer TypeScript/TSX files
    if (path.endsWith('.ts') || path.endsWith('.tsx')) score += 10;

    // Prefer files in src/
    if (path.startsWith('src/')) score += 5;

    // Prefer shorter paths (likely more important files)
    score += Math.max(0, 20 - path.split('/').length * 2);

    // Penalize test files
    if (path.includes('.test.') || path.includes('.spec.')) score -= 20;

    // Penalize node_modules
    if (path.includes('node_modules')) score -= 100;

    // Prefer component files
    if (path.includes('/components/')) score += 8;

    // Prefer API/router files
    if (path.includes('/api/') || path.includes('/routers/')) score += 8;

    return score;
  }

  /**
   * Load file contents from GitHub
   */
  private async loadFileContents(
    paths: string[],
    maxSize: number
  ): Promise<Array<{ path: string; content: string; size: number }>> {
    const files: Array<{ path: string; content: string; size: number }> = [];

    for (const path of paths) {
      try {
        const content = await this.githubService.getFileContent(this.owner, this.repo, path);
        
        if (content.length <= maxSize) {
          files.push({
            path,
            content,
            size: content.length,
          });
        } else {
          console.warn(`[ContextGatherer] Skipping ${path}: too large (${content.length} bytes)`);
        }
      } catch (error) {
        console.warn(`[ContextGatherer] Failed to load ${path}:`, error);
      }
    }

    return files;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.fileTreeCache.getStats();
  }

  /**
   * Invalidate cache
   */
  invalidateCache() {
    this.fileTreeCache.invalidate(this.owner, this.repo);
  }
}
