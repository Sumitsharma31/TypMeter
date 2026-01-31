import type { Metadata } from "next";
import Script from "next/script";
import Providers from "@/components/Providers";
import ClientOnly from "@/components/ClientOnly";
import "./globals.css";

import SplashScreen from "@/components/SplashScreen";
import { ThemeProvider } from "@/hooks/useTheme";

export const metadata: Metadata = {
  title: "TypMeter - Modern Typing Speed Test",
  description: "Test your typing speed with a beautiful, modern interface. Track your WPM, accuracy, and compete on the leaderboard.",
  keywords: ["typing test", "wpm", "typing speed", "keyboard"],
  icons: {
    icon: '/versel.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
        <ClientOnly>
          <Providers>
            <ThemeProvider>
              <SplashScreen />
              {children}
            </ThemeProvider>
          </Providers>
        </ClientOnly>
      </body>
    </html>
  );
}
