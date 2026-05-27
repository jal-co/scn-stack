import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "scn-stack — Scaffold shadcn registries in minutes",
    template: "%s | scn-stack",
  },
  description:
    "Interactive CLI for scaffolding complete shadcn component registries with docs, framework choice, and starter components.",
  openGraph: {
    title: "scn-stack",
    description:
      "Scaffold a complete shadcn component registry with documentation in minutes.",
    url: "https://scn-stack.vercel.app",
    siteName: "scn-stack",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "scn-stack",
    description:
      "Scaffold a complete shadcn component registry with documentation in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
