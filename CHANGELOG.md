# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD pipeline with Node 18/20 matrix testing
- Redis service container in CI/CD
- Automated linting, testing, security audits, and Docker builds
- ESLint configuration for code quality enforcement
- Prettier configuration for consistent code formatting
- Multi-stage Docker build with Chromium installation
- Docker Compose setup with Redis service and health checks
- Environment validation on startup with errors and warnings
- Sentry error tracking and performance monitoring integration
- OpenAPI 3.0 specification (openapi.yaml) with complete API documentation
- Swagger UI at /api/docs for interactive API exploration
- Scanner service unit tests (tests/unit/scanner.test.js)
- Analytics service unit tests (tests/unit/analytics.test.js)
- CONTRIBUTING.md with detailed contribution guidelines
- CODE_OF_CONDUCT.md based on Contributor Covenant 2.1
- SECURITY.md with vulnerability reporting process
- GitHub issue templates (bug report, feature request, question)
- GitHub pull request template with comprehensive checklist
- Sentry DSN configuration in environment variables
- API endpoint for serving interactive documentation

### Changed
- Updated src/server.js to initialize Sentry and validate environment
- Updated src/app.js to integrate Sentry middleware (request, tracing, error handlers)
- Updated config/index.js to include Sentry configuration
- Updated .env.example with Sentry configuration options
- Updated root endpoint (/) to include /api/docs link

### Removed
- axios dependency (unused)

### Fixed
- Nothing yet

## [4.0.0] - 2025-11-09

### Added
- Complete WCAG 2.0/2.1/2.2 scanner using Axe-core
- Puppeteer headless browser automation
- SerpAPI integration for site discovery
- Fallback data system for 4 verticals (Healthcare, Fintech, E-commerce, Education)
- Redis caching layer with 24-hour TTL
- Express.js REST API with 7 endpoints
- Interactive Tailwind CSS dashboard with Chart.js visualizations
- Joi input validation on all endpoints
- Helmet.js security headers
- Express rate limiting (100 req/15min)
- Winston structured logging
- Graceful shutdown handling
- Health check endpoint for monitoring
- Railway deployment configuration
- Comprehensive error handling throughout
- Vertical intelligence with industry benchmarks
- Compliance scoring algorithm (0-100%)
- Revenue impact calculator
- Analytics engine for compliance metrics
- Jest test framework with integration tests
- Supertest for API testing
- 50%+ test coverage target

### Documentation
- Comprehensive README.md with full API documentation
- AUDIT_REPORT.md - Engineering audit (900 lines)
- EXECUTIVE_SUMMARY.md - Business overview (600 lines)
- IMPLEMENTATION_GUIDE.md - Step-by-step guide (1,100 lines)
- RAILWAY_DEPLOYMENT.md - Deployment instructions (600 lines)
- IMPLEMENTATION_SUMMARY.md - Implementation stats (533 lines)
- E2E_WORKFLOW_AUDIT.md - Complete workflow audit (1,027 lines)
- GAP_ANALYSIS.md - Missing components analysis (694 lines)

### Technical Details
- Node.js 18+ required
- Express.js v4.18 for API
- Redis v4.6 for caching
- Axe-core v4.8 for WCAG scanning
- Puppeteer v21 for browser automation
- SerpAPI v2.0 for discovery
- Winston v3.11 for logging
- Jest v29 for testing
- 22 source files (~2,800 LOC)
- 4 test files (~500 LOC)
- 15 integration tests
- 0 circular dependencies
- 84% production readiness score

### Deployment
- Railway-ready with railway.json
- Health check at /health
- Environment variable management
- Graceful degradation for Redis/SerpAPI failures
- PORT binding to 0.0.0.0
- Automatic process cleanup on shutdown

### Security
- Helmet.js HTTP security headers
- CORS enabled
- Rate limiting on /api/* routes
- Input validation with Joi
- Error sanitization in production
- No sensitive data in logs
- Environment variable validation

### Known Issues
- Puppeteer Chrome download fails in sandboxed environments (works on Railway)
- 5 npm security vulnerabilities in dependencies (need npm audit fix on Railway)
- Scanner tests blocked by Puppeteer (40% coverage until Chrome available)

## [Pre-Release] - Before 2025-11-09

### Status
- Project was in concept/documentation phase
- No executable code existed
- README claimed "Production-Ready" but was vaporware
- Only package.json and documentation files present

---

**Versioning Note**: We use [Semantic Versioning](https://semver.org/):
- MAJOR version for incompatible API changes
- MINOR version for backwards-compatible functionality
- PATCH version for backwards-compatible bug fixes

**Links**:
- [Unreleased](https://github.com/aaj441/wcagai-v4-reality-check/compare/v4.0.0...HEAD)
- [4.0.0](https://github.com/aaj441/wcagai-v4-reality-check/releases/tag/v4.0.0)
