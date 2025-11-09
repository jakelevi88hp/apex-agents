#!/usr/bin/env tsx

/**
 * PDF Scanner Script
 * 
 * This script scans a PDF file and extracts:
 * - Full text content
 * - Page count
 * - Word count
 * - Metadata (title, author, creation date, etc.)
 * - Summary statistics
 * 
 * Usage: tsx scripts/scan-pdf.ts <path-to-pdf>
 * Example: tsx scripts/scan-pdf.ts CURSOR-GUIDE.md.pdf
 */

import { DocumentProcessor } from '../src/lib/document-processor';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// Main function to scan PDF
async function scanPDF(filePath: string) {
  try {
    // Check if file exists
    if (!existsSync(filePath)) {
      console.error(`❌ Error: File not found: ${filePath}`);
      console.log('\n💡 Tip: Make sure the file path is correct.');
      console.log('   You can use a relative path from the workspace root or an absolute path.');
      process.exit(1);
    }

    console.log('📄 Scanning PDF file...\n');
    console.log(`📁 File: ${filePath}\n`);

    // Process the PDF using DocumentProcessor
    const result = await DocumentProcessor.processDocument(filePath, 'application/pdf');

    // Display results
    console.log('═'.repeat(80));
    console.log('📊 SCAN RESULTS');
    console.log('═'.repeat(80));
    console.log();

    // Basic Statistics
    console.log('📈 STATISTICS:');
    console.log(`   • Pages: ${result.pageCount || 'N/A'}`);
    console.log(`   • Word Count: ${result.wordCount.toLocaleString()}`);
    console.log(`   • Character Count: ${result.text.length.toLocaleString()}`);
    console.log();

    // Metadata
    if (result.metadata && (result.metadata.info || result.metadata.metadata)) {
      console.log('📋 METADATA:');
      const info = result.metadata.info || {};
      const meta = result.metadata.metadata || {};
      
      if (info.Title) console.log(`   • Title: ${info.Title}`);
      if (info.Author) console.log(`   • Author: ${info.Author}`);
      if (info.Subject) console.log(`   • Subject: ${info.Subject}`);
      if (info.Creator) console.log(`   • Creator: ${info.Creator}`);
      if (info.Producer) console.log(`   • Producer: ${info.Producer}`);
      if (info.CreationDate) console.log(`   • Creation Date: ${info.CreationDate}`);
      if (info.ModDate) console.log(`   • Modification Date: ${info.ModDate}`);
      
      // Additional metadata
      if (Object.keys(meta).length > 0) {
        console.log('   • Additional Metadata:');
        for (const [key, value] of Object.entries(meta)) {
          if (key !== 'info' && value) {
            console.log(`     - ${key}: ${value}`);
          }
        }
      }
      console.log();
    }

    // Text Preview (first 500 words)
    console.log('📝 TEXT PREVIEW (first 500 words):');
    console.log('─'.repeat(80));
    const preview = result.text.split(/\s+/).slice(0, 500).join(' ');
    console.log(preview);
    if (result.wordCount > 500) {
      console.log('\n... (truncated)');
    }
    console.log('─'.repeat(80));
    console.log();

    // Full Text (save to file)
    const outputPath = filePath.replace(/\.pdf$/i, '_scanned.txt');
    await readFile(filePath).then(() => {
      // File exists, proceed to write
    }).catch(() => {
      // Ignore
    });
    
    // Write full text to output file
    const fullTextOutput = `PDF SCAN REPORT
Generated: ${new Date().toISOString()}
Source File: ${filePath}

${'='.repeat(80)}
STATISTICS
${'='.repeat(80)}
Pages: ${result.pageCount || 'N/A'}
Word Count: ${result.wordCount.toLocaleString()}
Character Count: ${result.text.length.toLocaleString()}

${'='.repeat(80)}
METADATA
${'='.repeat(80)}
${JSON.stringify(result.metadata, null, 2)}

${'='.repeat(80)}
FULL TEXT CONTENT
${'='.repeat(80)}

${result.text}
`;

    const { writeFile } = require('fs/promises');
    await writeFile(outputPath, fullTextOutput, 'utf-8');
    console.log(`💾 Full text saved to: ${outputPath}`);
    console.log();

    // Summary
    console.log('✅ Scan completed successfully!');
    console.log();

  } catch (error) {
    console.error('❌ Error scanning PDF:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    process.exit(1);
    }
  }
}

// Get file path from command line arguments
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ Error: No file path provided');
  console.log('\n📖 Usage:');
  console.log('   tsx scripts/scan-pdf.ts <path-to-pdf>');
  console.log('\n📝 Examples:');
  console.log('   tsx scripts/scan-pdf.ts CURSOR-GUIDE.md.pdf');
  console.log('   tsx scripts/scan-pdf.ts ./CURSOR-GUIDE.md.pdf');
  console.log('   tsx scripts/scan-pdf.ts /path/to/CURSOR-GUIDE.md.pdf');
  process.exit(1);
}

// Run the scanner
scanPDF(filePath).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
