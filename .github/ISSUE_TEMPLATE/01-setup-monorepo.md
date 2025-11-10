---
name: Setup Monorepo with Turborepo
about: Configure monorepo structure with pnpm workspaces and Turborepo
title: '[Sprint 1] Setup Monorepo with Turborepo'
labels: ['sprint-1', 'infrastructure', 'priority-high']
assignees: ''
---

## Description
Set up the monorepo structure for the WCAG AI Compliance Consultant Platform using pnpm workspaces and Turborepo for build orchestration.

## Acceptance Criteria
- [ ] pnpm-workspace.yaml configured with apps and packages
- [ ] turbo.json configured with build pipeline
- [ ] Root package.json set up with workspace scripts
- [ ] TypeScript configuration for monorepo (tsconfig.json)
- [ ] All workspace packages can be built successfully
- [ ] Turborepo can build all packages in correct order
- [ ] Development mode works for all apps

## Tasks
- [ ] Create workspace structure
  - [ ] /apps/scanner
  - [ ] /apps/dashboard
  - [ ] /packages/core
  - [ ] /packages/db
  - [ ] /packages/utils
- [ ] Configure pnpm workspaces
- [ ] Set up Turborepo pipeline
- [ ] Create package.json for each workspace
- [ ] Configure TypeScript for each package
- [ ] Test build pipeline
- [ ] Document setup in README.md

## Dependencies
None (this is the foundation)

## Technical Details

**Tech Stack:**
- pnpm 8.15.0+ for workspace management
- Turborepo 1.12.0+ for build orchestration
- TypeScript 5.3+ for all packages
- Node.js 20 LTS

**Workspace Structure:**
```
/
├── apps/
│   ├── scanner/        # Puppeteer scanner service
│   └── dashboard/      # Next.js dashboard
├── packages/
│   ├── core/          # Business logic
│   ├── db/            # Prisma schema
│   └── utils/         # Shared utilities
└── turbo.json         # Turborepo config
```

## Testing
- [ ] `pnpm install` runs successfully
- [ ] `pnpm build` builds all packages
- [ ] `pnpm dev` starts all dev servers
- [ ] `pnpm type-check` passes for all packages

## Documentation
- [ ] Update main README.md with setup instructions
- [ ] Document workspace commands
- [ ] Add development guide

## Estimated Effort
8 hours

## Sprint
Sprint 1 - Foundation
