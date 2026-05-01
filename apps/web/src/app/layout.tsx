import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Par-Kids — Intelligent Family Growth Planner",
  description:
    "Par-Kids helps families have intentional, guided weekly check-ins that strengthen parent-child bonds and track developmental growth.",
  keywords: [
    "parenting",
    "family",
    "child development",
    "family bonding",
    "check-in",
  ],
  openGraph: {
    title: "Par-Kids — Grow Together. Stay Connected.",
    description:
      "A guided check-in platform that helps parents and children connect intentionally every week.",
    url: "https://parkids.com",
    siteName: "Par-Kids",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeBootScript = `
    (function() {
      try {
        var key = 'parkids-theme';
        var stored = localStorage.getItem(key);
        var theme = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
        var resolved = theme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : theme;
        document.documentElement.classList.toggle('dark', resolved === 'dark');
        document.documentElement.style.colorScheme = resolved;
      } catch (_) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-sand-50 dark:bg-charcoal-900`}
      >
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#1E2D2F",
                color: "#FDF6EC",
                fontFamily: "var(--font-inter)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
