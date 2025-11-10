import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WCAGAuditorAgent } from '@/agents/auditor';
import { ContentAnalyzerAgent } from '@/agents/analyzer';
import { ReportSynthesizerAgent } from '@/agents/synthesizer';

/**
 * GET /api/audits - List all audits
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const where = status ? { status: status as any } : {};
    const skip = (page - 1) * limit;

    const [audits, total] = await Promise.all([
      prisma.audit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              violations: true,
            },
          },
        },
      }),
      prisma.audit.count({ where }),
    ]);

    return NextResponse.json({
      audits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/audits - Create new audit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, htmlContent, wcagLevel = 'AA', userId } = body;

    // Validate input
    if (!url && !htmlContent) {
      return NextResponse.json(
        { error: 'Either url or htmlContent is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Create audit record
    const audit = await prisma.audit.create({
      data: {
        url: url || 'inline-html',
        htmlContent,
        wcagLevel,
        status: 'PENDING',
        userId,
      },
    });

    // Start audit process asynchronously
    // In production, this would be queued with BullMQ
    processAudit(audit.id).catch((error) => {
      console.error('Audit processing failed:', error);
    });

    return NextResponse.json({ audit }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create audit' },
      { status: 500 }
    );
  }
}

/**
 * Process audit asynchronously
 */
async function processAudit(auditId: string) {
  try {
    // Update status to IN_PROGRESS
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    // Fetch audit
    const audit = await prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw new Error('Audit not found');
    }

    // Run WCAG audit
    const auditor = new WCAGAuditorAgent();
    const auditResult = await auditor.audit({
      url: audit.url !== 'inline-html' ? audit.url : undefined,
      html: audit.htmlContent || undefined,
      wcagLevel: audit.wcagLevel,
    });

    // Run content analysis
    const analyzer = new ContentAnalyzerAgent();
    const analysisResult = await analyzer.analyze({
      html: audit.htmlContent || '',
      url: audit.url !== 'inline-html' ? audit.url : undefined,
    });

    // Generate report
    const synthesizer = new ReportSynthesizerAgent();
    const report = await synthesizer.synthesize({
      auditResult,
      analysisResult,
      auditId,
    });

    // Save violations
    if (auditResult.violations.length > 0) {
      await prisma.auditViolation.createMany({
        data: auditResult.violations.map((v) => ({
          auditId,
          wcagCriterion: v.wcagCriterion,
          severity: v.severity,
          impact: v.impact,
          description: v.description,
          helpUrl: v.helpUrl,
          elementHtml: v.elementHtml,
          selector: v.selector,
          xpath: v.xpath,
          evidence: v.evidence as any,
          fixSuggestion: v.fixSuggestion,
        })),
      });
    }

    // Save report
    await prisma.report.create({
      data: {
        auditId,
        executiveSummary: report.executiveSummary,
        technicalDetails: report.technicalDetails,
        remediationSteps: report.remediationSteps as any,
        complianceScore: report.complianceScore,
        criticalCount: report.remediationSteps.filter((s) => s.priority === 'critical').length,
        seriousCount: report.remediationSteps.filter((s) => s.priority === 'high').length,
        moderateCount: report.remediationSteps.filter((s) => s.priority === 'medium').length,
        minorCount: report.remediationSteps.filter((s) => s.priority === 'low').length,
      },
    });

    // Update audit status
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'COMPLETED',
        complianceScore: report.complianceScore,
        violationCount: auditResult.violations.length,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Audit processing error:', error);

    // Update audit status to FAILED
    await prisma.audit.update({
      where: { id: auditId },
      data: {
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date(),
      },
    });
  }
}
