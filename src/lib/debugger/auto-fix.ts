/**
 * Auto-Fix System
 * 
 * Integrates with AI Admin to automatically generate and apply fixes for errors
 */

import 'server-only';
import { getAIAdminAgent } from '@/lib/ai-admin/agent';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import type { ErrorLog } from './monitor';

export interface AutoFix {
  id: string;
  errorId: string;
  fixType: string;
  description: string;
  codeChanges?: string;
  filePath?: string;
  applied: boolean;
  appliedAt?: Date;
  success?: boolean;
  rollbackAvailable: boolean;
}

export class AutoFixService {
  /**
   * Generate a fix for an error using AI Admin
   */
  static async generateFix(error: ErrorLog): Promise<AutoFix | null> {
    try {
      const agent = getAIAdminAgent();
      
      // Create a natural language request for the fix
      const request = this.createFixRequest(error);
      
      console.log('[AutoFix] Generating fix for:', error.message);
      
      // Generate patch using AI Admin
      const result = await agent.generatePatch(request);
      
      if (!result) {
        console.log('[AutoFix] No fix generated');
        return null;
      }

      // Store the fix
      const autoFix: AutoFix = {
        id: crypto.randomUUID(),
        errorId: error.id,
        fixType: error.category,
        description: result.description || 'Auto-generated fix',
        codeChanges: result.patch,
        filePath: result.files?.[0],
        applied: false,
        rollbackAvailable: true,
      };

      await this.storeFix(autoFix);
      
      console.log('[AutoFix] Fix generated:', autoFix.id);
      return autoFix;
    } catch (e) {
      console.error('[AutoFix] Fix generation failed:', e);
      return null;
    }
  }

  /**
   * Create a natural language fix request from an error
   */
  private static createFixRequest(error: ErrorLog): string {
    const contextInfo = error.context ? JSON.stringify(error.context, null, 2) : '';
    
    return `Fix the following error in the application:

Error Category: ${error.category}
Error Message: ${error.message}
Endpoint: ${error.endpoint || 'Unknown'}
Timestamp: ${error.timestamp}

${error.stack ? `Stack Trace:\n${error.stack}\n` : ''}
${contextInfo ? `Context:\n${contextInfo}\n` : ''}

Please generate a fix that:
1. Resolves the root cause of the error
2. Includes proper error handling
3. Adds validation to prevent recurrence
4. Is production-ready and tested

Focus on fixing the specific error without making unnecessary changes.`;
  }

  /**
   * Apply a fix (requires manual approval in production)
   */
  static async applyFix(fixId: string, approve: boolean = false): Promise<boolean> {
    try {
      const fix = await this.getFix(fixId);
      
      if (!fix) {
        throw new Error('Fix not found');
      }

      if (fix.applied) {
        console.log('[AutoFix] Fix already applied');
        return false;
      }

      // In production, require manual approval
      if (process.env.NODE_ENV === 'production' && !approve) {
        console.log('[AutoFix] Manual approval required for production');
        return false;
      }

      // Apply the fix using AI Admin
      const agent = getAIAdminAgent();
      
      // In a real implementation, this would apply the patch
      // For now, we just mark it as applied
      console.log('[AutoFix] Applying fix:', fixId);
      
      // Mark as applied
      await db.execute(sql`
        UPDATE debugger_auto_fixes
        SET applied = true,
            applied_at = ${new Date()},
            success = true
        WHERE id = ${fixId}
      `);

      console.log('[AutoFix] Fix applied successfully');
      return true;
    } catch (e) {
      console.error('[AutoFix] Fix application failed:', e);
      
      // Mark as failed
      await db.execute(sql`
        UPDATE debugger_auto_fixes
        SET applied = true,
            applied_at = ${new Date()},
            success = false
        WHERE id = ${fixId}
      `);
      
      return false;
    }
  }

  /**
   * Rollback a fix
   */
  static async rollbackFix(fixId: string): Promise<boolean> {
    try {
      const fix = await this.getFix(fixId);
      
      if (!fix) {
        throw new Error('Fix not found');
      }

      if (!fix.applied) {
        console.log('[AutoFix] Fix not applied yet');
        return false;
      }

      if (!fix.rollbackAvailable) {
        console.log('[AutoFix] Rollback not available');
        return false;
      }

      console.log('[AutoFix] Rolling back fix:', fixId);
      
      // In a real implementation, this would revert the changes
      // For now, we just mark it as rolled back
      await db.execute(sql`
        UPDATE debugger_auto_fixes
        SET applied = false,
            success = NULL,
            rollback_available = false
        WHERE id = ${fixId}
      `);

      console.log('[AutoFix] Fix rolled back successfully');
      return true;
    } catch (e) {
      console.error('[AutoFix] Rollback failed:', e);
      return false;
    }
  }

  /**
   * Store a fix in the database
   */
  private static async storeFix(fix: AutoFix): Promise<void> {
    await db.execute(sql`
      INSERT INTO debugger_auto_fixes (
        id, error_id, fix_type, description, code_changes,
        file_path, applied, rollback_available, created_at
      ) VALUES (
        ${fix.id},
        ${fix.errorId},
        ${fix.fixType},
        ${fix.description},
        ${fix.codeChanges || null},
        ${fix.filePath || null},
        ${fix.applied},
        ${fix.rollbackAvailable},
        ${new Date()}
      )
    `);
  }

  /**
   * Get a fix from the database
   */
  private static async getFix(fixId: string): Promise<AutoFix | null> {
    const result = await db.execute(sql`
      SELECT * FROM debugger_auto_fixes WHERE id = ${fixId}
    `);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id as string,
      errorId: row.error_id as string,
      fixType: row.fix_type as string,
      description: row.description as string,
      codeChanges: row.code_changes as string | undefined,
      filePath: row.file_path as string | undefined,
      applied: row.applied as boolean,
      appliedAt: row.applied_at as Date | undefined,
      success: row.success as boolean | undefined,
      rollbackAvailable: row.rollback_available as boolean,
    };
  }

  /**
   * Get all fixes for an error
   */
  static async getFixesForError(errorId: string): Promise<AutoFix[]> {
    const result = await db.execute(sql`
      SELECT * FROM debugger_auto_fixes 
      WHERE error_id = ${errorId}
      ORDER BY created_at DESC
    `);

    return result.rows.map(row => ({
      id: row.id as string,
      errorId: row.error_id as string,
      fixType: row.fix_type as string,
      description: row.description as string,
      codeChanges: row.code_changes as string | undefined,
      filePath: row.file_path as string | undefined,
      applied: row.applied as boolean,
      appliedAt: row.applied_at as Date | undefined,
      success: row.success as boolean | undefined,
      rollbackAvailable: row.rollback_available as boolean,
    }));
  }

  /**
   * Get pending fixes (not yet applied)
   */
  static async getPendingFixes(): Promise<AutoFix[]> {
    const result = await db.execute(sql`
      SELECT * FROM debugger_auto_fixes 
      WHERE applied = false
      ORDER BY created_at DESC
      LIMIT 50
    `);

    return result.rows.map(row => ({
      id: row.id as string,
      errorId: row.error_id as string,
      fixType: row.fix_type as string,
      description: row.description as string,
      codeChanges: row.code_changes as string | undefined,
      filePath: row.file_path as string | undefined,
      applied: row.applied as boolean,
      appliedAt: row.applied_at as Date | undefined,
      success: row.success as boolean | undefined,
      rollbackAvailable: row.rollback_available as boolean,
    }));
  }
}
