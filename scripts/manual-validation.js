#!/usr/bin/env node

/**
 * Manual Validation Script for WCAG AI Platform
 * 
 * This script helps developers manually validate accessibility scan results
 * by opening problematic pages in a browser and providing validation checklists.
 * 
 * Usage:
 *   node scripts/manual-validation.js <scan-id>
 *   node scripts/manual-validation.js --url <url>
 */

const readline = require('readline');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Mock violations for demonstration (in real app, fetch from database)
const mockViolations = [
  {
    id: 'color-contrast',
    impact: 'serious',
    description: 'Elements must have sufficient color contrast',
    help: 'Ensure text has a contrast ratio of at least 4.5:1',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/color-contrast',
    nodes: [
      {
        html: '<button class="btn-primary">Submit</button>',
        target: ['button.btn-primary'],
        failureSummary: 'Element has insufficient color contrast of 3.2:1',
      },
    ],
  },
  {
    id: 'image-alt',
    impact: 'critical',
    description: 'Images must have alternate text',
    help: 'Ensure images have alt text or role="presentation"',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/image-alt',
    nodes: [
      {
        html: '<img src="logo.png">',
        target: ['img[src="logo.png"]'],
        failureSummary: 'Element does not have an alt attribute',
      },
    ],
  },
  {
    id: 'label',
    impact: 'critical',
    description: 'Form elements must have labels',
    help: 'Ensure every form input has an associated label',
    helpUrl: 'https://dequeuniversity.com/rules/axe/4.8/label',
    nodes: [
      {
        html: '<input type="text" name="email">',
        target: ['input[name="email"]'],
        failureSummary: 'Form element does not have an associated label',
      },
    ],
  },
];

class ManualValidationTool {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.validationResults = [];
  }

  /**
   * Print colored output
   */
  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * Print header
   */
  printHeader() {
    console.clear();
    this.log('═══════════════════════════════════════════════════', 'cyan');
    this.log('  WCAG AI Platform - Manual Validation Tool', 'bright');
    this.log('═══════════════════════════════════════════════════', 'cyan');
    console.log();
  }

  /**
   * Ask a question and return the answer
   */
  question(query) {
    return new Promise((resolve) => {
      this.rl.question(`${colors.blue}${query}${colors.reset}`, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Open URL in default browser
   */
  async openUrl(url) {
    const platform = process.platform;
    let command;

    if (platform === 'darwin') {
      command = `open "${url}"`;
    } else if (platform === 'win32') {
      command = `start "${url}"`;
    } else {
      command = `xdg-open "${url}"`;
    }

    try {
      await execPromise(command);
      this.log(`✓ Opened ${url} in browser`, 'green');
      return true;
    } catch (error) {
      this.log(`✗ Failed to open browser: ${error.message}`, 'red');
      return false;
    }
  }

  /**
   * Display violation details
   */
  displayViolation(violation, index, total) {
    console.log();
    this.log(`─────────────────────────────────────────────────────`, 'yellow');
    this.log(`Violation ${index + 1} of ${total}`, 'bright');
    this.log(`─────────────────────────────────────────────────────`, 'yellow');
    console.log();
    
    this.log(`Rule ID: ${violation.id}`, 'cyan');
    this.log(`Impact: ${violation.impact.toUpperCase()}`, 'red');
    console.log();
    
    this.log('Description:', 'bright');
    console.log(`  ${violation.description}`);
    console.log();
    
    this.log('How to fix:', 'bright');
    console.log(`  ${violation.help}`);
    console.log();
    
    this.log('More info:', 'bright');
    console.log(`  ${violation.helpUrl}`);
    console.log();
    
    this.log('Affected Elements:', 'bright');
    violation.nodes.forEach((node, i) => {
      console.log(`  ${i + 1}. Target: ${node.target.join(', ')}`);
      console.log(`     HTML: ${node.html}`);
      if (node.failureSummary) {
        console.log(`     Issue: ${node.failureSummary}`);
      }
      console.log();
    });
  }

  /**
   * Validate a single violation
   */
  async validateViolation(violation, index, total) {
    this.displayViolation(violation, index, total);

    this.log('Validation Checklist:', 'bright');
    console.log('  1. Can you locate the element on the page?');
    console.log('  2. Does the violation accurately describe the issue?');
    console.log('  3. Is this a genuine accessibility problem?');
    console.log('  4. Could this be a false positive?');
    console.log();

    const isValid = await this.question('Is this a valid violation? (y/n/skip): ');
    
    let result = {
      violationId: violation.id,
      isValid: null,
      notes: '',
    };

    if (isValid.toLowerCase() === 'y') {
      result.isValid = true;
      this.log('✓ Marked as VALID', 'green');
    } else if (isValid.toLowerCase() === 'n') {
      result.isValid = false;
      this.log('✗ Marked as FALSE POSITIVE', 'red');
    } else {
      this.log('⊘ Skipped', 'yellow');
      return null;
    }

    const notes = await this.question('Add notes (optional, press Enter to skip): ');
    if (notes) {
      result.notes = notes;
    }

    return result;
  }

  /**
   * Run validation workflow
   */
  async run(url) {
    this.printHeader();

    this.log(`Target URL: ${url}`, 'cyan');
    console.log();

    // Open URL in browser
    const shouldOpen = await this.question('Open URL in browser? (y/n): ');
    if (shouldOpen.toLowerCase() === 'y') {
      await this.openUrl(url);
      console.log();
      this.log('Please review the page, then press Enter to continue...', 'yellow');
      await this.question('');
    }

    // Validate each violation
    this.log(`Found ${mockViolations.length} violations to validate`, 'cyan');
    console.log();

    for (let i = 0; i < mockViolations.length; i++) {
      const violation = mockViolations[i];
      const result = await this.validateViolation(violation, i, mockViolations.length);
      
      if (result) {
        this.validationResults.push(result);
      }

      if (i < mockViolations.length - 1) {
        const shouldContinue = await this.question('Continue to next violation? (y/n): ');
        if (shouldContinue.toLowerCase() !== 'y') {
          break;
        }
      }
    }

    // Display summary
    this.displaySummary();
    
    this.rl.close();
  }

  /**
   * Display validation summary
   */
  displaySummary() {
    console.log();
    this.log('═══════════════════════════════════════════════════', 'cyan');
    this.log('  Validation Summary', 'bright');
    this.log('═══════════════════════════════════════════════════', 'cyan');
    console.log();

    const total = this.validationResults.length;
    const valid = this.validationResults.filter(r => r.isValid === true).length;
    const invalid = this.validationResults.filter(r => r.isValid === false).length;

    this.log(`Total Validated: ${total}`, 'cyan');
    this.log(`✓ Valid Issues: ${valid}`, 'green');
    this.log(`✗ False Positives: ${invalid}`, 'red');
    console.log();

    if (total > 0) {
      const accuracy = ((valid / total) * 100).toFixed(1);
      this.log(`Detection Accuracy: ${accuracy}%`, 'bright');
      console.log();
    }

    if (this.validationResults.some(r => r.notes)) {
      this.log('Notes:', 'bright');
      this.validationResults.forEach(r => {
        if (r.notes) {
          console.log(`  • ${r.violationId}: ${r.notes}`);
        }
      });
      console.log();
    }

    this.log('Results saved to: validation-results.json', 'green');
    
    // Save results
    const fs = require('fs');
    fs.writeFileSync(
      'validation-results.json',
      JSON.stringify(this.validationResults, null, 2)
    );
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  let url = 'https://example.com'; // Default URL

  // Parse arguments
  if (args.includes('--url')) {
    const urlIndex = args.indexOf('--url');
    url = args[urlIndex + 1] || url;
  } else if (args.length > 0) {
    // Treat first argument as scan ID
    console.log(`Note: Scan ID support not yet implemented. Using default URL.`);
  }

  const tool = new ManualValidationTool();
  
  try {
    await tool.run(url);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = ManualValidationTool;
