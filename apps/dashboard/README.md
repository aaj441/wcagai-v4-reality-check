# Dashboard

Next.js 15 dashboard for the WCAG AI Compliance Consultant Platform.

## Features

- Next.js 15 with App Router
- React 19 Server Components
- TypeScript 5.3
- Tailwind CSS 3.4
- Responsive design
- WCAG AA compliant UI

## Pages

- `/` - Landing page with scan form
- `/scan/[id]` - Scan results display

## Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
DATABASE_URL=postgresql://...
```

## Project Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Landing page
├── globals.css         # Global styles
└── scan/
    └── [id]/
        └── page.tsx    # Scan results
```

## Components (to be added)

```
components/
├── Header.tsx
├── Footer.tsx
├── ScanForm.tsx
└── ui/
    ├── Button.tsx
    ├── Input.tsx
    └── Card.tsx
```

## Styling

- Tailwind CSS for utility classes
- CSS Modules for component-specific styles
- shadcn/ui for reusable components (optional)

## Accessibility

The dashboard itself is built to meet WCAG AA standards:

- Semantic HTML
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast compliance
- Focus indicators
- Screen reader compatibility
