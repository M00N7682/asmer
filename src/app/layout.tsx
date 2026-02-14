import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { MiniPlayer } from "@/components/mixer/MiniPlayer";
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

export const metadata: Metadata = {
  title: "ASMER - Your Space to Focus",
  description: "Ambient sound mixer with Pomodoro timer for deep focus and relaxation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <MiniPlayer />
        <MobileTabBar />
        <ToastProvider />
      </body>
    </html>
  );
}
