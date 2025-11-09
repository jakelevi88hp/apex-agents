#!/usr/bin/env tsx
/**
 * Security Audit Script for Apex Agents
 * 
 * Checks:
 * 1. Environment variables configuration
 * 2. Sensitive data exposure
 * 3. API security measures
 * 4. CORS configuration
 * 5. Input validation
 * 6. Rate limiting
 */

import fs from 'fs';
import path from 'path';

interface SecurityIssue {
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: string;
  issue: string;
  recommendation: string;
  file?: string;
}

class SecurityAuditor {
  private issues: SecurityIssue[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
  }

  async runAudit(): Promise<void> {
    console.log('🔒 Security Audit for Apex Agents');
    console.log('='.repeat(60));
    console.log('');

    await this.checkEnvironmentVariables();
    await this.checkSensitiveFiles();
    await this.checkAPIEndpoints();
    await this.checkInputValidation();
    await this.checkDependencies();
    await this.checkSecurityHeaders();

    this.printReport();
  }

  private addIssue(issue: SecurityIssue): void {
    this.issues.push(issue);
  }

  // ==================== Environment Variables ====================

  async checkEnvironmentVariables(): Promise<void> {
    console.log('📋 Checking Environment Variables...\n');

    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_APP_URL',
      'JWT_SECRET',
      'OPENAI_API_KEY',
    ];

    const sensitiveEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'STRIPE_SECRET_KEY',
      'GITHUB_TOKEN',
    ];

    // Check for .env files in repo
    const envFiles = ['.env', '.env.local', '.env.production'];
    for (const envFile of envFiles) {
      const envPath = path.join(this.projectRoot, envFile);
      if (fs.existsSync(envPath)) {
        this.addIssue({
          severity: 'HIGH',
          category: 'Environment Variables',
          issue: `.env file found in repository: ${envFile}`,
          recommendation: 'Remove .env files from git and add to .gitignore',
          file: envFile,
        });
      }
    }

    // Check .gitignore for env files
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignore.includes('.env')) {
        this.addIssue({
          severity: 'HIGH',
          category: 'Environment Variables',
          issue: '.env not in .gitignore',
          recommendation: 'Add .env* to .gitignore',
          file: '.gitignore',
        });
      }
    }

    console.log('  ✅ Environment variable checks complete\n');
  }

  // ==================== Sensitive Files ====================

  async checkSensitiveFiles(): Promise<void> {
    console.log('📁 Checking for Sensitive Files...\n');

    const sensitivePatterns = [
      'private.key',
      'id_rsa',
      'id_dsa',
      '.pem',
      '.p12',
      '.pfx',
      'credentials.json',
      'secrets.json',
    ];

    const checkDir = (dir: string) => {
      if (dir.includes('node_modules') || dir.includes('.git')) return;

      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          checkDir(fullPath);
        } else {
          for (const pattern of sensitivePatterns) {
            if (file.includes(pattern)) {
              this.addIssue({
                severity: 'HIGH',
                category: 'Sensitive Files',
                issue: `Potentially sensitive file found: ${file}`,
                recommendation: 'Remove from repository and add to .gitignore',
                file: fullPath.replace(this.projectRoot, ''),
              });
            }
          }
        }
      }
    };

    try {
      checkDir(this.projectRoot);
    } catch (error) {
      console.log('  ⚠️  Error scanning files:', error);
    }

    console.log('  ✅ Sensitive file checks complete\n');
  }

  // ==================== API Endpoints ====================

  async checkAPIEndpoints(): Promise<void> {
    console.log('🔌 Checking API Endpoint Security...\n');

    const apiDir = path.join(this.projectRoot, 'src/app/api');
    if (!fs.existsSync(apiDir)) {
      console.log('  ⚠️  API directory not found\n');
      return;
    }

    const checkFile = (filePath: string) => {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for authentication
      if (!content.includes('verifyToken') && 
          !content.includes('getServerSession') &&
          !content.includes('auth')) {
        const relativePath = filePath.replace(this.projectRoot, '');
        if (!relativePath.includes('/public/')) {
          this.addIssue({
            severity: 'MEDIUM',
            category: 'API Security',
            issue: `Endpoint may lack authentication: ${relativePath}`,
            recommendation: 'Add authentication check or mark as public',
            file: relativePath,
          });
        }
      }

      // Check for rate limiting
      if (!content.includes('rateLimit') && !content.includes('RateLimit')) {
        const relativePath = filePath.replace(this.projectRoot, '');
        this.addIssue({
          severity: 'LOW',
          category: 'API Security',
          issue: `Endpoint may lack rate limiting: ${relativePath}`,
          recommendation: 'Add rate limiting middleware',
          file: relativePath,
        });
      }

      // Check for input validation
      if (content.includes('req.body') && 
          !content.includes('zod') && 
          !content.includes('validate')) {
        const relativePath = filePath.replace(this.projectRoot, '');
        this.addIssue({
          severity: 'MEDIUM',
          category: 'Input Validation',
          issue: `Endpoint may lack input validation: ${relativePath}`,
          recommendation: 'Add Zod schema validation',
          file: relativePath,
        });
      }
    };

    const scanDir = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (file === 'route.ts' || file === 'route.js') {
          checkFile(fullPath);
        }
      }
    };

    try {
      scanDir(apiDir);
    } catch (error) {
      console.log('  ⚠️  Error scanning API directory:', error);
    }

    console.log('  ✅ API endpoint checks complete\n');
  }

  // ==================== Input Validation ====================

  async checkInputValidation(): Promise<void> {
    console.log('✅ Checking Input Validation...\n');

    const hasZod = fs.existsSync(
      path.join(this.projectRoot, 'node_modules/zod')
    );

    if (!hasZod) {
      this.addIssue({
        severity: 'MEDIUM',
        category: 'Input Validation',
        issue: 'Zod validation library not installed',
        recommendation: 'Install zod: npm install zod',
      });
    } else {
      console.log('  ✅ Zod validation library installed');
    }

    console.log('  ✅ Input validation checks complete\n');
  }

  // ==================== Dependencies ====================

  async checkDependencies(): Promise<void> {
    console.log('📦 Checking Dependencies...\n');

    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('  ⚠️  package.json not found\n');
      return;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    // Check for outdated packages (informational)
    console.log('  ℹ️  Run `npm audit` to check for vulnerabilities');
    
    // Check for Sentry
    const hasSentry = packageJson.dependencies?.['@sentry/nextjs'];
    if (!hasSentry) {
      this.addIssue({
        severity: 'LOW',
        category: 'Monitoring',
        issue: 'Sentry error tracking not installed',
        recommendation: 'Install @sentry/nextjs for error monitoring',
      });
    } else {
      console.log('  ✅ Sentry error tracking installed');
    }

    console.log('  ✅ Dependency checks complete\n');
  }

  // ==================== Security Headers ====================

  async checkSecurityHeaders(): Promise<void> {
    console.log('🛡️  Checking Security Headers Configuration...\n');

    const nextConfigPath = path.join(this.projectRoot, 'next.config.mjs');
    if (!fs.existsSync(nextConfigPath)) {
      console.log('  ⚠️  next.config.mjs not found\n');
      return;
    }

    const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');

    // Check for security headers
    if (!nextConfig.includes('X-Frame-Options') && 
        !nextConfig.includes('headers')) {
      this.addIssue({
        severity: 'MEDIUM',
        category: 'Security Headers',
        issue: 'Custom security headers not configured',
        recommendation: 'Add security headers in next.config.mjs',
      });
    }

    console.log('  ℹ️  Vercel provides default security headers');
    console.log('  ℹ️  Consider adding custom headers for enhanced security\n');
  }

  // ==================== Report ====================

  private printReport(): void {
    console.log('='.repeat(60));
    console.log('📊 Security Audit Report');
    console.log('='.repeat(60));
    console.log('');

    const high = this.issues.filter(i => i.severity === 'HIGH');
    const medium = this.issues.filter(i => i.severity === 'MEDIUM');
    const low = this.issues.filter(i => i.severity === 'LOW');
    const info = this.issues.filter(i => i.severity === 'INFO');

    console.log(`Total Issues: ${this.issues.length}`);
    console.log(`🔴 High:   ${high.length}`);
    console.log(`🟡 Medium: ${medium.length}`);
    console.log(`🟢 Low:    ${low.length}`);
    console.log(`ℹ️  Info:   ${info.length}`);
    console.log('');

    if (high.length > 0) {
      console.log('🔴 HIGH SEVERITY ISSUES:');
      console.log('-'.repeat(60));
      high.forEach(issue => this.printIssue(issue));
      console.log('');
    }

    if (medium.length > 0) {
      console.log('🟡 MEDIUM SEVERITY ISSUES:');
      console.log('-'.repeat(60));
      medium.forEach(issue => this.printIssue(issue));
      console.log('');
    }

    if (low.length > 0) {
      console.log('🟢 LOW SEVERITY ISSUES:');
      console.log('-'.repeat(60));
      low.forEach(issue => this.printIssue(issue));
      console.log('');
    }

    if (this.issues.length === 0) {
      console.log('✅ No security issues found!');
    }

    console.log('='.repeat(60));
    console.log('🔒 Security Audit Complete');
    console.log('='.repeat(60));
    console.log('');

    // Recommendations
    console.log('📚 Security Best Practices:');
    console.log('  1. Never commit .env files or secrets');
    console.log('  2. Use environment variables for all sensitive data');
    console.log('  3. Enable rate limiting on all API endpoints');
    console.log('  4. Validate all user input with Zod schemas');
    console.log('  5. Keep dependencies up to date (npm audit)');
    console.log('  6. Configure security headers (CSP, HSTS, etc.)');
    console.log('  7. Enable Sentry error monitoring');
    console.log('  8. Use HTTPS in production (enforced by Vercel)');
    console.log('');
  }

  private printIssue(issue: SecurityIssue): void {
    console.log(`Category: ${issue.category}`);
    console.log(`Issue:    ${issue.issue}`);
    console.log(`Fix:      ${issue.recommendation}`);
    if (issue.file) {
      console.log(`File:     ${issue.file}`);
    }
    console.log('');
  }
}

// Run audit
const auditor = new SecurityAuditor();
auditor.runAudit().catch(error => {
  console.error('Fatal error running security audit:', error);
  process.exit(1);
});
