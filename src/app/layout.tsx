import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

import SplashScreen from "@/components/SplashScreen";
import { ThemeProvider } from "@/hooks/useTheme";

export const metadata: Metadata = {
  title: "TypMeter - Modern Typing Speed Test",
  description: "Test your typing speed with a beautiful, modern interface. Track your WPM, accuracy, and compete on the leaderboard.",
  keywords: ["typing test", "wpm", "typing speed", "keyboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#22d3ee",
          colorBackground: "#0f172a",
          colorText: "#e2e8f0",
          colorInputBackground: "#1e293b",
          colorInputText: "#e2e8f0",
          colorTextSecondary: "#94a3b8",
        },
        elements: {
          card: "bg-slate-900 border border-white/10",
          formButtonPrimary: "bg-gradient-to-r from-cyan-500 to-violet-500",
          userButtonPopoverCard: "bg-slate-900 border border-white/10",
          userButtonPopoverActionButton: "hover:bg-white/5",
          userButtonPopoverActionButtonText: "!text-slate-200",
          userButtonPopoverActionButtonIcon: "!text-slate-400",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600&display=swap"
            rel="stylesheet"
          />
          <Script
            src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"
            strategy="beforeInteractive"
          />
        </head>
        <body className="min-h-screen flex flex-col antialiased">
          <ThemeProvider>
            <SplashScreen />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

