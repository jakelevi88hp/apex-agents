/**
 * File Context Gatherer
 * 
 * Retrieves uploaded files and their Vision API analysis results
 * to provide context for AI chat and patch generation
 */

// Import necessary libraries
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

// Function to search for placeholder data
export async function searchPlaceholderData(directory: string): Promise<{ path: string; content: string; }[]> {
  const files = await getFiles(directory);
  const placeholderPatterns = [/TODO/, /FIXME/, /lorem ipsum/, /dummy data/, /placeholder/];
  const results: { path: string; content: string; }[] = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    if (placeholderPatterns.some(pattern => pattern.test(content))) {
      results.push({ path: file, content });
    }
  }

  return results;
}

// Helper function to get all files in a directory
async function getFiles(dir: string): Promise<string[]> {
  const subdirs = await fs.promises.readdir(dir);
  const files = await Promise.all(subdirs.map(async (subdir) => {
    const res = path.resolve(dir, subdir);
    return (await fs.promises.stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}