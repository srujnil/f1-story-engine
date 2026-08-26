import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Outfit is wider and more open than the v0 condensed face, which makes dense
// dashboard headlines feel friendlier without sacrificing a sporting character.
const outfit = Outfit({
  variable: "--font-outfit",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
