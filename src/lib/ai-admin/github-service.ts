import 'server-only';

/**
 * GitHub Service for AI Admin
 * 
 * Handles all GitHub API operations for applying patches in production
 */

import { Octokit } from '@octokit/rest';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  defaultBranch?: string;
}

export interface CommitFileChange {
  path: string;
  content: string;
  action: 'create' | 'modify' | 'delete';
}

export class GitHubService {
  private octokit: Octokit;
  private owner: string;
  private repo: string;
  private defaultBranch: string;

  constructor(config: GitHubConfig) {
    this.octokit = new Octokit({
      auth: config.token,
    });
    this.owner = config.owner;
    this.repo = config.repo;
    this.defaultBranch = config.defaultBranch || 'main';
  }

  /**
   * Create a new branch from the default branch
   */
  async createBranch(branchName: string): Promise<string> {
    try {
      // Get the SHA of the default branch
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${this.defaultBranch}`,
      });

      const sha = ref.object.sha;

      // Create new branch
      await this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${branchName}`,
        sha,
      });

      return branchName;
    } catch (error) {
      throw new Error(`Failed to create branch: ${error}`);
    }
  }

  /**
   * Commit multiple file changes to a branch
   */
  async commitFiles(
    branchName: string,
    files: CommitFileChange[],
    commitMessage: string
  ): Promise<string> {
    try {
      // Get the current commit SHA
      const { data: ref } = await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`,
      });

      const currentCommitSha = ref.object.sha;

      // Get the tree SHA of the current commit
      const { data: commit } = await this.octokit.git.getCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: currentCommitSha,
      });

      const baseTreeSha = commit.tree.sha;

      // Create blobs for each file
      const tree = await Promise.all(
        files.map(async (file) => {
          if (file.action === 'delete') {
            return {
              path: file.path,
              mode: '100644' as const,
              type: 'blob' as const,
              sha: null,
            };
          }

          const { data: blob } = await this.octokit.git.createBlob({
            owner: this.owner,
            repo: this.repo,
            content: Buffer.from(file.content).toString('base64'),
            encoding: 'base64',
          });

          return {
            path: file.path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: blob.sha,
          };
        })
      );

      // Create a new tree
      const { data: newTree } = await this.octokit.git.createTree({
        owner: this.owner,
        repo: this.repo,
        base_tree: baseTreeSha,
        tree,
      });

      // Create a new commit
      const { data: newCommit } = await this.octokit.git.createCommit({
        owner: this.owner,
        repo: this.repo,
        message: commitMessage,
        tree: newTree.sha,
        parents: [currentCommitSha],
      });

      // Update the branch reference
      await this.octokit.git.updateRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`,
        sha: newCommit.sha,
      });

      return newCommit.sha;
    } catch (error) {
      throw new Error(`Failed to commit files: ${error}`);
    }
  }

  /**
   * Create a pull request
   */
  async createPullRequest(
    branchName: string,
    title: string,
    body: string
  ): Promise<{ number: number; url: string }> {
    try {
      const { data: pr } = await this.octokit.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title,
        head: branchName,
        base: this.defaultBranch,
        body,
      });

      return {
        number: pr.number,
        url: pr.html_url,
      };
    } catch (error) {
      throw new Error(`Failed to create pull request: ${error}`);
    }
  }

  /**
   * Merge a pull request
   */
  async mergePullRequest(prNumber: number): Promise<void> {
    try {
      await this.octokit.pulls.merge({
        owner: this.owner,
        repo: this.repo,
        pull_number: prNumber,
        merge_method: 'squash',
      });
    } catch (error) {
      throw new Error(`Failed to merge pull request: ${error}`);
    }
  }

  /**
   * Get file content from repository
   */
  async getFileContent(path: string, branch?: string): Promise<string> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: branch || this.defaultBranch,
      });

      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      throw new Error('Path is a directory, not a file');
    } catch (error) {
      throw new Error(`Failed to get file content: ${error}`);
    }
  }

  /**
   * Check if branch exists
   */
  async branchExists(branchName: string): Promise<boolean> {
    try {
      await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete a branch
   */
  async deleteBranch(branchName: string): Promise<void> {
    try {
      await this.octokit.git.deleteRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${branchName}`,
      });
    } catch (error) {
      throw new Error(`Failed to delete branch: ${error}`);
    }
  }

  /**
   * Search code in repository
   */
  async searchCode(query: string, repository?: string): Promise<any[]> {
    try {
      const repo = repository || `${this.owner}/${this.repo}`;
      const { data } = await this.octokit.search.code({
        q: `${query} repo:${repo}`,
      });

      return data.items.map((item: any) => ({
        path: item.path,
        content: item.text_matches?.[0]?.fragment || '',
        lineNumber: 1,
        repository: item.repository.full_name,
      }));
    } catch (error) {
      throw new Error(`Code search failed: ${error}`);
    }
  }
}

