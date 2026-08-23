import type { Metadata } from "next";
import { Geist, Geist_Mono, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Condensed, bold headline font — broadcast-graphics feel for race names,
// round numbers, and card titles. Body text stays on Geist for readability;
// see the --font-heading override in globals.css for how this gets wired in.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Story Engine",
  description:
    "News, decisions, performance, results — the storylines behind an F1 season.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Single dark theme for v0 — no toggle yet, see CLAUDE.md "Decisions so far".
  // shadcn's globals.css already ships light/dark CSS variables; forcing the
  // `dark` class here is the whole implementation, no extra theme code needed.
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${barlowCondensed.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
