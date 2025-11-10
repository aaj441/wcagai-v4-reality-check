import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@wcagai.com' },
    update: {},
    create: {
      email: 'admin@wcagai.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create test users
  const testPassword = await bcrypt.hash('test123', 10);
  const auditor = await prisma.user.upsert({
    where: { email: 'auditor@wcagai.com' },
    update: {},
    create: {
      email: 'auditor@wcagai.com',
      name: 'Test Auditor',
      password: testPassword,
      role: 'AUDITOR',
      emailVerified: new Date(),
    },
  });
  console.log('✅ Created auditor user:', auditor.email);

  // Create FDCPA templates
  const templates = [
    {
      name: 'Initial Notice Letter',
      description: 'FDCPA-compliant initial debt collection notice',
      content: `Dear {{debtor_name}},

This is to notify you that you owe {{creditor_name}} the sum of {{amount}} as of {{date}}.

This is an attempt to collect a debt. Any information obtained will be used for that purpose.

Unless you notify this office within 30 days after receiving this notice that you dispute the validity of this debt or any portion thereof, this office will assume this debt is valid.

Sincerely,
{{collector_name}}
{{company_name}}`,
      variables: {
        debtor_name: 'string',
        creditor_name: 'string',
        amount: 'currency',
        date: 'date',
        collector_name: 'string',
        company_name: 'string',
      },
      category: 'debt_collection',
      isFDCPA: true,
      isActive: true,
    },
    {
      name: 'Validation Notice',
      description: 'Debt validation request response',
      content: `Dear {{debtor_name}},

In response to your debt validation request dated {{request_date}}, we are providing the following information:

Original Creditor: {{creditor_name}}
Account Number: {{account_number}}
Amount Due: {{amount}}
Date of Last Payment: {{last_payment_date}}

Attached you will find copies of the original agreement and account statements.

Sincerely,
{{collector_name}}`,
      variables: {
        debtor_name: 'string',
        request_date: 'date',
        creditor_name: 'string',
        account_number: 'string',
        amount: 'currency',
        last_payment_date: 'date',
        collector_name: 'string',
      },
      category: 'debt_collection',
      isFDCPA: true,
      isActive: true,
    },
  ];

  for (const template of templates) {
    const existing = await prisma.template.findFirst({
      where: { name: template.name },
    });

    if (!existing) {
      const created = await prisma.template.create({
        data: template as any,
      });
      console.log('✅ Created template:', created.name);
    } else {
      console.log('ℹ️  Template already exists:', template.name);
    }
  }

  // Create sample audit
  const sampleAudit = await prisma.audit.create({
    data: {
      url: 'https://example.com',
      status: 'COMPLETED',
      complianceScore: 78.5,
      violationCount: 12,
      wcagLevel: 'AA',
      userId: auditor.id,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });
  console.log('✅ Created sample audit:', sampleAudit.id);

  // Create sample violations
  const violations = [
    {
      auditId: sampleAudit.id,
      wcagCriterion: '1.1.1',
      severity: 'SERIOUS',
      impact: 'Images without alt text',
      description: 'Images must have alternative text',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/quickref/#non-text-content',
      fixSuggestion: 'Add descriptive alt attributes to all images',
    },
    {
      auditId: sampleAudit.id,
      wcagCriterion: '1.4.3',
      severity: 'SERIOUS',
      impact: 'Insufficient color contrast',
      description: 'Text contrast ratio is below 4.5:1',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/quickref/#contrast-minimum',
      fixSuggestion: 'Increase contrast between text and background',
    },
  ];

  for (const violation of violations) {
    await prisma.auditViolation.create({
      data: violation as any,
    });
  }
  console.log('✅ Created sample violations');

  // Create sample report
  await prisma.report.create({
    data: {
      auditId: sampleAudit.id,
      executiveSummary: 'Overall compliance score: 78.5/100. Good progress but improvements needed.',
      technicalDetails: 'Detailed technical analysis of WCAG compliance.',
      remediationSteps: [
        {
          priority: 'high',
          issue: 'Missing alt text on images',
          impact: 'Screen readers cannot describe images',
          solution: 'Add descriptive alt attributes',
          estimatedEffort: '2-4 hours',
          wcagCriteria: ['1.1.1'],
        },
      ],
      complianceScore: 78.5,
      criticalCount: 0,
      seriousCount: 2,
      moderateCount: 5,
      minorCount: 5,
    },
  });
  console.log('✅ Created sample report');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
