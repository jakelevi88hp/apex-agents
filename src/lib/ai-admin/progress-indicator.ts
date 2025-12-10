/**
 * Progress Indicator Utility
 * 
 * Provides real-time progress indicators for long-running tasks
 * Enables streaming output without pause messages
 */

'use server';

// This module is server-only and should not be imported in client components

export type ProgressStatus = 'complete' | 'in-progress' | 'queued' | 'error';

export interface ProgressSection {
  name: string;
  status: ProgressStatus;
  items?: string[];
  error?: string;
}

export class ProgressIndicator {
  private sections: Map<string, ProgressSection> = new Map();
  private logs: string[] = [];

  /**
   * Add a new section to track
   */
  addSection(name: string, status: ProgressStatus = 'queued'): void {
    this.sections.set(name, {
      name,
      status,
      items: [],
    });
  }

  /**
   * Update section status
   */
  updateSection(name: string, status: ProgressStatus, items?: string[], error?: string): void {
    const section = this.sections.get(name);
    if (section) {
      section.status = status;
      if (items) section.items = items;
      if (error) section.error = error;
    }
  }

  /**
   * Add item to section
   */
  addItem(sectionName: string, item: string): void {
    const section = this.sections.get(sectionName);
    if (section && section.items) {
      section.items.push(item);
    }
  }

  /**
   * Get status emoji based on progress status
   */
  private getStatusEmoji(status: ProgressStatus): string {
    switch (status) {
      case 'complete':
        return '✅';
      case 'in-progress':
        return '🔄';
      case 'queued':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '📋';
    }
  }

  /**
   * Get status text
   */
  private getStatusText(status: ProgressStatus): string {
    switch (status) {
      case 'complete':
        return 'COMPLETE';
      case 'in-progress':
        return 'IN PROGRESS';
      case 'queued':
        return 'QUEUED';
      case 'error':
        return 'ERROR';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Format progress output
   */
  formatProgress(): string {
    let output = '';

    for (const [, section] of this.sections) {
      const emoji = this.getStatusEmoji(section.status);
      const statusText = this.getStatusText(section.status);

      output += `${emoji} ${section.name}: ${statusText}\n`;

      if (section.items && section.items.length > 0) {
        for (const item of section.items) {
          output += `   - ${item}\n`;
        }
      }

      if (section.error) {
        output += `   ⚠️ Error: ${section.error}\n`;
      }

      output += '\n';
    }

    return output;
  }

  /**
   * Log a message
   */
  log(message: string): void {
    this.logs.push(message);
  }

  /**
   * Get all logs
   */
  getLogs(): string[] {
    return this.logs;
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Reset all sections
   */
  reset(): void {
    this.sections.clear();
    this.logs = [];
  }

  /**
   * Get complete formatted output with logs and progress
   */
  getFormattedOutput(): string {
    let output = '';

    // Add logs
    if (this.logs.length > 0) {
      output += this.logs.join('\n') + '\n\n';
    }

    // Add progress
    output += this.formatProgress();

    return output;
  }
}

/**
 * Create a progress indicator for a task
 */
export function createProgressIndicator(taskName: string): ProgressIndicator {
  const indicator = new ProgressIndicator();
  indicator.log(`Starting: ${taskName}`);
  return indicator;
}

/**
 * Format a list of findings with progress
 */
export function formatFindings(
  sectionName: string,
  findings: Array<{ path: string; line?: number; message: string }>,
  status: ProgressStatus = 'complete'
): string {
  let output = '';
  const emoji = status === 'complete' ? '✅' : status === 'in-progress' ? '🔄' : '⏳';

  output += `${emoji} ${sectionName}: ${findings.length} found\n`;

  for (const finding of findings) {
    const location = finding.line ? `${finding.path}:${finding.line}` : finding.path;
    output += `   - ${location}: ${finding.message}\n`;
  }

  return output;
}
