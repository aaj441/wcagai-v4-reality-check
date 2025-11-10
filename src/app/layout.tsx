import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WCAGAI v5 - Enterprise Accessibility Platform',
  description: 'AI-powered web accessibility compliance platform with multi-agent system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
