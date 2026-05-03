import type { Metadata } from "next";
import { Geist, Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: "600",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "n=1 — Fill forms, boost your research",
  description: "Be someone's n=1. Fill others' surveys to rank yours higher — a research participation exchange for med students and beyond.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${fredoka.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="text-center text-xs text-slate-400 py-8 border-t border-slate-100 space-y-1 mt-8">
          <p className="font-medium text-slate-500">n=1</p>
          <p>Built for researchers, by Sheikah ·{' '}
            <a href="https://t.me/sheikah_x" target="_blank" rel="noopener noreferrer"
              className="hover:text-charcoal transition-colors">@sheikah_x</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
