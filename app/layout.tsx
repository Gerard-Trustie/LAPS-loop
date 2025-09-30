import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LAPSloop',
  description: 'AI-powered pain signal detection for product research',
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