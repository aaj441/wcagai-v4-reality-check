import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WCAG AI Compliance Consultant',
  description: 'AI-powered web accessibility compliance platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
