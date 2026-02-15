import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { MiniPlayer } from "@/components/mixer/MiniPlayer";
import { ImmersionWrapper } from "@/components/animations/ImmersionWrapper";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter-loaded",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-loaded",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces-loaded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ASMER - Your mind, perfectly tuned.",
  description: "Personalized ambient soundscapes that adapt to your focus, relaxation, and sleep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} antialiased`}
      >
        {children}
        <MiniPlayer />
        <MobileTabBar />
        <ImmersionWrapper />
        <ToastProvider />
        <GoogleAnalytics />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
