import 'server-only';

/**
 * GitHub Integration for AI Admin Agent
 * 
 * Handles committing and pushing code changes to GitHub
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitHubConfig {
  token?: string;
  owner: string;
  repo: string;
  branch?: string;
}

export class GitHubIntegration {
  private config: GitHubConfig;
  private projectRoot: string;

  constructor(config: GitHubConfig, projectRoot: string = process.cwd()) {
    this.config = {
      ...config,
      branch: config.branch || 'main',
    };
    this.projectRoot = projectRoot;
  }

  /**
   * Configure Git user for commits
   */
  private async configureGit() {
    try {
      await execAsync('git config user.name "AI Admin Agent"', { cwd: this.projectRoot });
      await execAsync('git config user.email "ai-admin@apex-agents.app"', { cwd: this.projectRoot });
    } catch (error) {
      console.error('Failed to configure git:', error);
    }
  }

  /**
   * Check if there are uncommitted changes
   */
  async hasUncommittedChanges(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('git status --porcelain', { cwd: this.projectRoot });
      return stdout.trim().length > 0;
    } catch (error) {
      console.error('Failed to check git status:', error);
      return false;
    }
  }

  /**
   * Stage specific files for commit
   */
  async stageFiles(files: string[]): Promise<void> {
    try {
      for (const file of files) {
        await execAsync(`git add "${file}"`, { cwd: this.projectRoot });
      }
    } catch (error) {
      throw new Error(`Failed to stage files: ${error}`);
    }
  }

  /**
   * Commit staged changes
   */
  async commit(message: string): Promise<string> {
    try {
      await this.configureGit();
      
      const { stdout } = await execAsync(
        `git commit -m "${message.replace(/"/g, '\\"')}"`,
        { cwd: this.projectRoot }
      );
      
      // Get the commit hash
      const { stdout: hash } = await execAsync('git rev-parse HEAD', { cwd: this.projectRoot });
      
      return hash.trim();
    } catch (error) {
      throw new Error(`Failed to commit changes: ${error}`);
    }
  }

  /**
   * Push commits to GitHub
   */
  async push(): Promise<void> {
    try {
      const remote = `https://${this.config.token}@github.com/${this.config.owner}/${this.config.repo}.git`;
      
      // Set the remote URL with token
      await execAsync(`git remote set-url origin "${remote}"`, { cwd: this.projectRoot });
      
      // Push to the branch
      await execAsync(`git push origin ${this.config.branch}`, { cwd: this.projectRoot });
    } catch (error) {
      throw new Error(`Failed to push to GitHub: ${error}`);
    }
  }

  /**
   * Create a commit and push changes in one operation
   */
  async commitAndPush(files: string[], message: string): Promise<string> {
    try {
      // Stage files
      await this.stageFiles(files);
      
      // Commit
      const commitHash = await this.commit(message);
      
      // Push
      await this.push();
      
      return commitHash;
    } catch (error) {
      throw new Error(`Failed to commit and push: ${error}`);
    }
  }

  /**
   * Create a new branch
   */
  async createBranch(branchName: string): Promise<void> {
    try {
      await execAsync(`git checkout -b ${branchName}`, { cwd: this.projectRoot });
    } catch (error) {
      throw new Error(`Failed to create branch: ${error}`);
    }
  }

  /**
   * Switch to a branch
   */
  async checkoutBranch(branchName: string): Promise<void> {
    try {
      await execAsync(`git checkout ${branchName}`, { cwd: this.projectRoot });
    } catch (error) {
      throw new Error(`Failed to checkout branch: ${error}`);
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const { stdout } = await execAsync('git branch --show-current', { cwd: this.projectRoot });
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get current branch: ${error}`);
    }
  }

  /**
   * Get commit history
   */
  async getCommitHistory(limit: number = 10): Promise<Array<{ hash: string; message: string; date: string }>> {
    try {
      const { stdout } = await execAsync(
        `git log -${limit} --pretty=format:"%H|%s|%ai"`,
        { cwd: this.projectRoot }
      );
      
      return stdout.split('\n').map(line => {
        const [hash, message, date] = line.split('|');
        return { hash, message, date };
      });
    } catch (error) {
      throw new Error(`Failed to get commit history: ${error}`);
    }
  }
}

/**
 * Create a GitHub integration instance from environment variables
 */
export function createGitHubIntegration(): GitHubIntegration {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'jakelevi88hp';
  const repo = process.env.GITHUB_REPO || 'apex-agents';
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token) {
    throw new Error('GitHub token not configured. Set GITHUB_TOKEN or GH_TOKEN environment variable.');
  }

  return new GitHubIntegration({ token, owner, repo, branch });
}

