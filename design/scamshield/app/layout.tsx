import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScamShield AI — Detect Scams Instantly with AI-Powered Analysis",
  description:
    "Paste suspicious SMS, emails, or links to instantly evaluate scam threats, extract risk vectors, and protect your digital footprint.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
