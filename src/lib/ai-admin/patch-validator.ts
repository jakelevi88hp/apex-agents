export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PatchData {
  files?: Array<{
    path: string;
    action: string;
    content?: string;
    explanation?: string;
  }>;
  summary?: string;
  testingSteps?: string[];
  risks?: string[];
  filesCount?: number;
}

export class PatchValidator {
  /**
   * Validate patch data before applying
   */
  validate(patch: PatchData, requestText?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check 1: Has files array
    if (!patch.files || !Array.isArray(patch.files)) {
      errors.push('Patch must contain a "files" array');
      return { valid: false, errors, warnings };
    }

    // Check 2: Files array is not empty
    if (patch.files.length === 0) {
      errors.push('Patch contains no files to modify (empty files array)');
      errors.push('This usually means the AI could not find relevant files for your request');
      
      if (requestText) {
        errors.push(`Request was: "${requestText}"`);
        errors.push('Try being more specific about which files to modify');
      }
      
      return { valid: false, errors, warnings };
    }

    // Check 3: Each file has required fields
    for (let i = 0; i < patch.files.length; i++) {
      const file = patch.files[i];
      
      if (!file.path) {
        errors.push(`File at index ${i} is missing "path" field`);
      }
      
      if (!file.action) {
        errors.push(`File "${file.path}" is missing "action" field`);
      }
      
      if (file.action !== 'delete' && (!file.content || file.content.trim().length === 0)) {
        errors.push(`File "${file.path}" has no content (action: ${file.action})`);
      }
    }

    // Check 4: Valid file paths
    for (const file of patch.files) {
      if (!this.isValidPath(file.path)) {
        errors.push(`Invalid file path: "${file.path}"`);
      }
      
      // Warn about suspicious paths
      if (file.path.includes('..')) {
        warnings.push(`File path contains "..": "${file.path}" - potential security risk`);
      }
      
      if (file.path.includes('node_modules')) {
        warnings.push(`Modifying node_modules: "${file.path}" - this is unusual`);
      }
      
      if (file.path.startsWith('/')) {
        warnings.push(`Absolute path detected: "${file.path}" - should be relative to project root`);
      }
    }

    // Check 5: Valid actions
    const validActions = ['create', 'modify', 'delete'];
    for (const file of patch.files) {
      if (!validActions.includes(file.action)) {
        errors.push(`Invalid action "${file.action}" for file "${file.path}". Must be one of: ${validActions.join(', ')}`);
      }
    }

    // Check 6: File content size limits
    const MAX_FILE_SIZE = 500000; // 500KB
    for (const file of patch.files) {
      if (file.content && file.content.length > MAX_FILE_SIZE) {
        errors.push(`File "${file.path}" is too large (${file.content.length} bytes, max ${MAX_FILE_SIZE})`);
      }
    }

    // Check 7: Duplicate file paths
    const pathCounts = new Map<string, number>();
    for (const file of patch.files) {
      pathCounts.set(file.path, (pathCounts.get(file.path) || 0) + 1);
    }
    
    for (const [path, count] of pathCounts.entries()) {
      if (count > 1) {
        errors.push(`Duplicate file path: "${path}" appears ${count} times`);
      }
    }

    // Check 8: Conflicting actions
    for (const file of patch.files) {
      if (file.action === 'create' && file.path.includes('/')) {
        const dir = file.path.substring(0, file.path.lastIndexOf('/'));
        const deletedDirs = patch.files.filter(f => 
          f.action === 'delete' && file.path.startsWith(f.path + '/')
        );
        
        if (deletedDirs.length > 0) {
          warnings.push(`Creating file "${file.path}" in a directory that's being deleted`);
        }
      }
    }

    // Check 9: Summary exists
    if (!patch.summary || patch.summary.trim().length === 0) {
      warnings.push('Patch has no summary - consider adding one for clarity');
    }

    // Check 10: Testing steps exist
    if (!patch.testingSteps || patch.testingSteps.length === 0) {
      warnings.push('No testing steps provided - consider adding them');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Check if a file path is valid
   */
  private isValidPath(path: string): boolean {
    if (!path || path.trim().length === 0) {
      return false;
    }

    // Must not be absolute path
    if (path.startsWith('/')) {
      return false;
    }

    // Must not contain null bytes
    if (path.includes('\0')) {
      return false;
    }

    // Must have a valid extension or be a directory
    const validExtensions = [
      'ts', 'tsx', 'js', 'jsx', 'json', 'css', 'scss', 'sass',
      'html', 'md', 'txt', 'yml', 'yaml', 'toml', 'env',
      'sh', 'py', 'sql', 'graphql', 'prisma',
    ];

    const ext = path.split('.').pop()?.toLowerCase();
    if (ext && !validExtensions.includes(ext)) {
      // Allow paths without extensions (directories)
      if (path.includes('.')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate user-friendly error message
   */
  formatErrorMessage(result: ValidationResult, requestText?: string): string {
    if (result.valid) {
      return 'Patch validation passed';
    }

    let message = '❌ Patch Validation Failed\n\n';

    if (result.errors.length > 0) {
      message += 'Errors:\n';
      result.errors.forEach((error, i) => {
        message += `${i + 1}. ${error}\n`;
      });
    }

    if (result.warnings.length > 0) {
      message += '\nWarnings:\n';
      result.warnings.forEach((warning, i) => {
        message += `${i + 1}. ${warning}\n`;
      });
    }

    // Add suggestions based on error types
    if (result.errors.some(e => e.includes('empty files array'))) {
      message += '\n💡 Suggestions:\n';
      message += '1. Be more specific about which files to modify\n';
      message += '2. Use the Search mode (🔍) to find relevant files first\n';
      message += '3. Provide file paths in your request\n';
      message += '4. Ask: "What files handle [feature] in this project?"\n';
    }

    return message;
  }

  /**
   * Check if patch is likely to succeed
   */
  assessPatchQuality(patch: PatchData): {
    score: number; // 0-100
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Deduct points for missing metadata
    if (!patch.summary) {
      score -= 10;
      recommendations.push('Add a summary to explain what the patch does');
    }

    if (!patch.testingSteps || patch.testingSteps.length === 0) {
      score -= 10;
      recommendations.push('Add testing steps to verify the changes');
    }

    if (!patch.risks || patch.risks.length === 0) {
      score -= 5;
      recommendations.push('Document potential risks');
    }

    // Deduct points for too many files
    if (patch.files && patch.files.length > 20) {
      score -= 15;
      issues.push(`Modifying ${patch.files.length} files in one patch is risky`);
      recommendations.push('Consider breaking this into smaller patches');
    }

    // Deduct points for large files
    if (patch.files) {
      const largeFiles = patch.files.filter(f => f.content && f.content.length > 100000);
      if (largeFiles.length > 0) {
        score -= 10 * largeFiles.length;
        issues.push(`${largeFiles.length} file(s) are very large`);
      }
    }

    // Deduct points for missing explanations
    if (patch.files) {
      const missingExplanations = patch.files.filter(f => !f.explanation);
      if (missingExplanations.length > 0) {
        score -= Math.min(20, missingExplanations.length * 2);
        recommendations.push('Add explanations for each file change');
      }
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations,
    };
  }
}
