import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScamShield AI | Instant Scam Detection',
  description: 'Detect scam messages, phishing triggers, and suspicious links with ScamShield AI.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
