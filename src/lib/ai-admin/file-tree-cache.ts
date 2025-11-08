import { GitHubService } from './github-service';

export interface FileTreeNode {
  path: string;
  type: 'file' | 'dir' | 'blob' | 'tree';
  sha: string;
  size?: number;
  url?: string;
  children?: FileTreeNode[];
}

interface CacheEntry {
  tree: FileTreeNode;
  timestamp: number;
  branch: string;
}

export class FileTreeCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private githubService: GitHubService;

  constructor(githubService: GitHubService) {
    this.githubService = githubService;
  }

  /**
   * Get the file tree for a repository, using cache if available
   */
  async getFileTree(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<FileTreeNode> {
    const cacheKey = `${owner}/${repo}/${branch}`;
    const cached = this.cache.get(cacheKey);

    // Check if cache is valid
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      console.log(`[FileTreeCache] Cache hit for ${cacheKey}`);
      return cached.tree;
    }

    console.log(`[FileTreeCache] Cache miss for ${cacheKey}, fetching from GitHub...`);

    try {
      // Fetch tree from GitHub
      const tree = await this.fetchTreeFromGitHub(owner, repo, branch);

      // Store in cache
      this.cache.set(cacheKey, {
        tree,
        timestamp: Date.now(),
        branch,
      });

      return tree;
    } catch (error) {
      console.error('[FileTreeCache] Failed to fetch tree:', error);
      
      // Return cached data even if expired, better than nothing
      if (cached) {
        console.log('[FileTreeCache] Returning stale cache due to error');
        return cached.tree;
      }

      throw error;
    }
  }

  /**
   * Find files matching a glob pattern
   */
  async findFiles(
    owner: string,
    repo: string,
    pattern: string,
    branch: string = 'main'
  ): Promise<string[]> {
    const tree = await this.getFileTree(owner, repo, branch);
    const matches: string[] = [];

    const searchTree = (node: FileTreeNode, currentPath: string = '') => {
      const fullPath = currentPath ? `${currentPath}/${node.path}` : node.path;

      if (node.type === 'file' || node.type === 'blob') {
        if (this.matchesPattern(fullPath, pattern)) {
          matches.push(fullPath);
        }
      }

      if (node.children) {
        for (const child of node.children) {
          searchTree(child, fullPath);
        }
      }
    };

    searchTree(tree);
    return matches;
  }

  /**
   * Find files by extension
   */
  async findFilesByExtension(
    owner: string,
    repo: string,
    extensions: string[],
    branch: string = 'main'
  ): Promise<string[]> {
    const tree = await this.getFileTree(owner, repo, branch);
    const matches: string[] = [];

    const searchTree = (node: FileTreeNode, currentPath: string = '') => {
      const fullPath = currentPath ? `${currentPath}/${node.path}` : node.path;

      if (node.type === 'file' || node.type === 'blob') {
        const ext = fullPath.split('.').pop()?.toLowerCase();
        if (ext && extensions.includes(ext)) {
          matches.push(fullPath);
        }
      }

      if (node.children) {
        for (const child of node.children) {
          searchTree(child, fullPath);
        }
      }
    };

    searchTree(tree);
    return matches;
  }

  /**
   * Find files in specific directories
   */
  async findFilesInDirectories(
    owner: string,
    repo: string,
    directories: string[],
    branch: string = 'main'
  ): Promise<string[]> {
    const tree = await this.getFileTree(owner, repo, branch);
    const matches: string[] = [];

    const searchTree = (node: FileTreeNode, currentPath: string = '') => {
      const fullPath = currentPath ? `${currentPath}/${node.path}` : node.path;

      // Check if current path is in one of the target directories
      const inTargetDir = directories.some(dir => 
        fullPath.startsWith(dir) || fullPath.includes(`/${dir}/`)
      );

      if ((node.type === 'file' || node.type === 'blob') && inTargetDir) {
        matches.push(fullPath);
      }

      if (node.children) {
        for (const child of node.children) {
          searchTree(child, fullPath);
        }
      }
    };

    searchTree(tree);
    return matches;
  }

  /**
   * Invalidate cache for a specific repository
   */
  invalidate(owner: string, repo: string, branch?: string): void {
    if (branch) {
      const cacheKey = `${owner}/${repo}/${branch}`;
      this.cache.delete(cacheKey);
      console.log(`[FileTreeCache] Invalidated cache for ${cacheKey}`);
    } else {
      // Invalidate all branches for this repo
      const prefix = `${owner}/${repo}/`;
      for (const key of this.cache.keys()) {
        if (key.startsWith(prefix)) {
          this.cache.delete(key);
        }
      }
      console.log(`[FileTreeCache] Invalidated all caches for ${owner}/${repo}`);
    }
  }

  /**
   * Clear all cache
   */
  clearAll(): void {
    this.cache.clear();
    console.log('[FileTreeCache] Cleared all cache');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, value]) => ({
        key,
        age: Date.now() - value.timestamp,
        expired: Date.now() - value.timestamp > this.TTL,
      })),
    };
  }

  /**
   * Fetch tree from GitHub API
   */
  private async fetchTreeFromGitHub(
    owner: string,
    repo: string,
    branch: string
  ): Promise<FileTreeNode> {
    try {
      // Get the tree recursively from GitHub
      const octokit = this.githubService.getOctokit();
      
      // First, get the branch to get the tree SHA
      const branchData = await octokit.repos.getBranch({
        owner,
        repo,
        branch,
      });

      const treeSha = branchData.data.commit.commit.tree.sha;

      // Get the tree recursively
      const treeData = await octokit.git.getTree({
        owner,
        repo,
        tree_sha: treeSha,
        recursive: 'true', // Get all files recursively
      });

      // Build hierarchical tree structure
      const root: FileTreeNode = {
        path: '',
        type: 'dir',
        sha: treeSha,
        children: [],
      };

      // Group items by path
      const pathMap = new Map<string, FileTreeNode>();
      pathMap.set('', root);

      for (const item of treeData.data.tree) {
        if (!item.path) continue;

        const node: FileTreeNode = {
          path: item.path.split('/').pop() || item.path,
          type: item.type as 'file' | 'dir' | 'blob' | 'tree',
          sha: item.sha || '',
          size: item.size,
          url: item.url,
        };

        // Find parent path
        const pathParts = item.path.split('/');
        const parentPath = pathParts.slice(0, -1).join('/');
        
        let parent = pathMap.get(parentPath);
        if (!parent) {
          // Create parent directories if they don't exist
          parent = {
            path: pathParts[pathParts.length - 2] || '',
            type: 'dir',
            sha: '',
            children: [],
          };
          pathMap.set(parentPath, parent);
          
          // Add to root if top-level
          if (pathParts.length === 2) {
            root.children!.push(parent);
          }
        }

        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
        pathMap.set(item.path, node);
      }

      return root;
    } catch (error) {
      console.error('[FileTreeCache] Error fetching tree from GitHub:', error);
      throw new Error(`Failed to fetch file tree: ${error}`);
    }
  }

  /**
   * Match a file path against a glob pattern
   */
  private matchesPattern(path: string, pattern: string): boolean {
    // Convert glob pattern to regex
    // Support: *, **, ?, [abc], {a,b,c}
    
    // Escape special regex characters except glob wildcards
    let regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    // Handle ** for directory recursion
    regexPattern = regexPattern.replace(/\.\*\.\*/g, '.*');

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(path);
  }
}
