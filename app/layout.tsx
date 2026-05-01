import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ivory">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="text-center text-xs text-slate-400 py-6 border-t border-ivory-border space-y-1">
          <p>Built for researchers, by Sheikah</p>
          <p>
            <a href="https://t.me/sheikah_x" target="_blank" rel="noopener noreferrer"
              className="hover:text-charcoal transition-colors">@sheikah_x</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
