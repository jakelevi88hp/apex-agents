/**
 * Git Utilities for AI Admin Patches
 * 
 * Handles branch creation, management, and pushing for AI-generated patches
 */

import { execSync } from 'child_process';
import path from 'path';

const REPO_PATH = process.env.REPO_PATH || process.cwd();

/**
 * Generate a safe branch name from a patch description
 * Format: ai-patch-{timestamp}-{slug}
 */
export function generateBranchName(description: string): string {
  const timestamp = Date.now();
  
  // Create a slug from the description (first 30 chars, lowercase, alphanumeric + hyphens)
  const slug = description
    .toLowerCase()
    .substring(0, 30)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  return `ai-patch-${timestamp}-${slug || 'patch'}`;
}

/**
 * Create a new git branch for a patch
 */
export async function createPatchBranch(branchName: string): Promise<void> {
  try {
    console.log(`[GitUtils] Creating branch: ${branchName}`);
    
    // Ensure we're on main/master
    try {
      execSync('git checkout main', { cwd: REPO_PATH, stdio: 'pipe' });
    } catch {
      // Try master if main doesn't exist
      execSync('git checkout master', { cwd: REPO_PATH, stdio: 'pipe' });
    }
    
    // Pull latest changes
    execSync('git pull origin', { cwd: REPO_PATH, stdio: 'pipe' });
    
    // Create and checkout new branch
    execSync(`git checkout -b ${branchName}`, { cwd: REPO_PATH, stdio: 'pipe' });
    
    console.log(`[GitUtils] Successfully created branch: ${branchName}`);
  } catch (error) {
    console.error(`[GitUtils] Failed to create branch:`, error);
    throw new Error(`Failed to create git branch: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Commit changes to the current branch
 */
export async function commitChanges(message: string, files?: string[]): Promise<void> {
  try {
    console.log(`[GitUtils] Committing changes: ${message}`);
    
    if (files && files.length > 0) {
      // Stage specific files
      for (const file of files) {
        execSync(`git add "${file}"`, { cwd: REPO_PATH, stdio: 'pipe' });
      }
    } else {
      // Stage all changes
      execSync('git add -A', { cwd: REPO_PATH, stdio: 'pipe' });
    }
    
    // Commit
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: REPO_PATH, stdio: 'pipe' });
    
    console.log(`[GitUtils] Successfully committed changes`);
  } catch (error) {
    console.error(`[GitUtils] Failed to commit changes:`, error);
    throw new Error(`Failed to commit changes: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Push branch to remote
 */
export async function pushBranch(branchName: string): Promise<string> {
  try {
    console.log(`[GitUtils] Pushing branch: ${branchName}`);
    
    execSync(`git push origin ${branchName}`, { cwd: REPO_PATH, stdio: 'pipe' });
    
    // Get the repository URL to construct the PR link
    const remoteUrl = execSync('git config --get remote.origin.url', { cwd: REPO_PATH, encoding: 'utf-8' }).trim();
    const repoUrl = remoteUrl.replace(/\.git$/, '').replace(/^git@github\.com:/, 'https://github.com/');
    const prUrl = `${repoUrl}/compare/main...${branchName}`;
    
    console.log(`[GitUtils] Successfully pushed branch: ${branchName}`);
    console.log(`[GitUtils] PR URL: ${prUrl}`);
    
    return prUrl;
  } catch (error) {
    console.error(`[GitUtils] Failed to push branch:`, error);
    throw new Error(`Failed to push branch: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get current branch name
 */
export function getCurrentBranch(): string {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: REPO_PATH, encoding: 'utf-8' }).trim();
    return branch;
  } catch (error) {
    console.error(`[GitUtils] Failed to get current branch:`, error);
    throw new Error(`Failed to get current branch: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Check if a branch exists
 */
export function branchExists(branchName: string): boolean {
  try {
    execSync(`git rev-parse --verify ${branchName}`, { cwd: REPO_PATH, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete a branch (local and remote)
 */
export async function deleteBranch(branchName: string, remote: boolean = true): Promise<void> {
  try {
    console.log(`[GitUtils] Deleting branch: ${branchName}`);
    
    // Delete local branch
    execSync(`git branch -D ${branchName}`, { cwd: REPO_PATH, stdio: 'pipe' });
    
    // Delete remote branch if requested
    if (remote) {
      try {
        execSync(`git push origin --delete ${branchName}`, { cwd: REPO_PATH, stdio: 'pipe' });
      } catch {
        // Remote branch might not exist, that's okay
      }
    }
    
    console.log(`[GitUtils] Successfully deleted branch: ${branchName}`);
  } catch (error) {
    console.error(`[GitUtils] Failed to delete branch:`, error);
    throw new Error(`Failed to delete branch: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create a pull request URL
 */
export function createPRUrl(branchName: string): string {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { cwd: REPO_PATH, encoding: 'utf-8' }).trim();
    const repoUrl = remoteUrl.replace(/\.git$/, '').replace(/^git@github\.com:/, 'https://github.com/');
    return `${repoUrl}/compare/main...${branchName}`;
  } catch (error) {
    console.error(`[GitUtils] Failed to create PR URL:`, error);
    return '';
  }
}
