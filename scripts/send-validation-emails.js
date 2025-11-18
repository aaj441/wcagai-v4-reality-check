#!/usr/bin/env node
/**
 * Automated Email Sending Script
 *
 * IMPORTANT: Use with caution!
 * - Test with yourself first
 * - Respect anti-spam laws (CAN-SPAM, GDPR)
 * - Only send to prospects who might be interested
 * - Consider using email warm-up services
 *
 * Setup:
 * 1. npm install nodemailer
 * 2. Enable 2FA on Gmail
 * 3. Create App Password: https://myaccount.google.com/apppasswords
 * 4. Set environment variables:
 *    export GMAIL_USER="your-email@gmail.com"
 *    export GMAIL_APP_PASSWORD="your-app-password"
 *
 * Usage:
 *   node scripts/send-validation-emails.js
 *   node scripts/send-validation-emails.js --dry-run  # Test without sending
 */

const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

// Configuration
const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 2; // Send 2 at a time to avoid spam filters
const DELAY_BETWEEN_BATCHES = 60000; // 1 minute between batches

// Email configuration
const CONFIG = {
  from: process.env.GMAIL_USER || 'your-email@gmail.com',
  gmail: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  },
  // Prospect email addresses (customize these)
  prospects: {
    'HealthTech_Solutions.txt': 'cto@example-health.com',
    'FinancePro_Digital.txt': 'engineering@example-fintech.com',
    'EduLearn_Platform.txt': 'product@example-edu.com',
    'GameHub_Network.txt': 'dev@example-gaming.com',
    'ShopEasy_Commerce.txt': 'tech@example-ecommerce.com'
  }
};

/**
 * Create email transporter
 */
function createTransporter() {
  if (!CONFIG.gmail.user || !CONFIG.gmail.pass) {
    throw new Error('Gmail credentials not set. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: CONFIG.gmail.user,
      pass: CONFIG.gmail.pass
    }
  });
}

/**
 * Parse email file
 */
async function parseEmailFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');

  // Extract subject (first line starting with "Subject:")
  const subjectMatch = content.match(/^Subject: (.+)$/m);
  const subject = subjectMatch ? subjectMatch[1] : 'WCAG Compliance Alert';

  // Extract body (everything after the subject line)
  const bodyMatch = content.match(/Subject: .+\n\n([\s\S]+)/);
  const body = bodyMatch ? bodyMatch[1].trim() : content;

  return { subject, body };
}

/**
 * Send single email
 */
async function sendEmail(transporter, to, subject, body) {
  const mailOptions = {
    from: CONFIG.from,
    to: to,
    subject: subject,
    text: body,
    // Optional: Add HTML version
    // html: `<pre>${body}</pre>`
  };

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would send to: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Preview: ${body.substring(0, 100)}...`);
    return { success: true, dryRun: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Send emails in batches
 */
async function sendBatch(transporter, emails) {
  const results = [];

  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    const batch = emails.slice(i, i + BATCH_SIZE);

    console.log(`\nSending batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(emails.length / BATCH_SIZE)}...`);

    for (const email of batch) {
      console.log(`  → ${email.to}`);
      const result = await sendEmail(transporter, email.to, email.subject, email.body);

      results.push({
        to: email.to,
        ...result
      });

      if (result.success && !result.dryRun) {
        console.log(`  ✓ Sent (Message ID: ${result.messageId})`);
      } else if (result.dryRun) {
        console.log(`  ✓ Dry run complete`);
      } else {
        console.log(`  ✗ Failed: ${result.error}`);
      }

      // Small delay between individual emails
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Delay between batches (except for last batch)
    if (i + BATCH_SIZE < emails.length) {
      console.log(`\nWaiting ${DELAY_BETWEEN_BATCHES / 1000} seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
    }
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('📧 WCAG AI Validation - Automated Email Sender\n');
  console.log('=' .repeat(60));

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No emails will be sent');
    console.log('   Remove --dry-run flag to send for real\n');
  }

  // Load emails
  console.log('📂 Loading emails from validation-results/emails/...\n');
  const emailsDir = 'validation-results/emails';
  const emailFiles = await fs.readdir(emailsDir);
  const txtFiles = emailFiles.filter(f => f.endsWith('.txt') && !f.startsWith('SAMPLE'));

  const emails = [];

  for (const file of txtFiles) {
    const filePath = path.join(emailsDir, file);
    const { subject, body } = await parseEmailFile(filePath);
    const to = CONFIG.prospects[file];

    if (!to) {
      console.log(`⚠️  Skipping ${file} - no email address configured`);
      continue;
    }

    emails.push({ file, to, subject, body });
    console.log(`✓ Loaded: ${file} → ${to}`);
  }

  console.log(`\n📊 Total emails to send: ${emails.length}`);

  if (emails.length === 0) {
    console.log('❌ No emails to send. Check validation-results/emails/ folder.');
    return;
  }

  // Confirm before sending
  if (!DRY_RUN) {
    console.log('\n⚠️  WARNING: This will send real emails!');
    console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Create transporter
  console.log('\n🔧 Setting up email transporter...');
  const transporter = createTransporter();

  // Send emails
  console.log('\n📤 Sending emails...');
  const results = await sendBatch(transporter, emails);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ SENDING COMPLETE\n');

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`📊 Summary:`);
  console.log(`   ✓ Successful: ${successful}/${results.length}`);
  if (failed > 0) {
    console.log(`   ✗ Failed: ${failed}/${results.length}`);
  }

  if (DRY_RUN) {
    console.log('\n💡 This was a DRY RUN. To send for real:');
    console.log('   node scripts/send-validation-emails.js');
  } else {
    console.log('\n📋 Next Steps:');
    console.log('   1. Track replies in a spreadsheet');
    console.log('   2. Follow up after 3 days (if no reply)');
    console.log('   3. Analyze results after 7 days');
    console.log('\n🎯 Success Metric:');
    console.log('   2+ replies (40%+) = Strong product-market fit');
  }

  // Save results
  const resultsPath = 'validation-results/email-send-results.json';
  await fs.writeFile(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    dryRun: DRY_RUN,
    results: results
  }, null, 2));

  console.log(`\n💾 Results saved to: ${resultsPath}`);
}

// Run
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Install nodemailer: npm install nodemailer');
    console.error('  2. Set GMAIL_USER environment variable');
    console.error('  3. Set GMAIL_APP_PASSWORD (not your regular password!)');
    console.error('  4. Create app password: https://myaccount.google.com/apppasswords');
    process.exit(1);
  });
}

module.exports = { sendEmail, parseEmailFile };
