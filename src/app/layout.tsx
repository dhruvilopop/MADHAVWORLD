import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madhav World Bags Industry - Premium Quality Handbags",
  description: "Madhav World Bags Industry - Crafting premium quality handbags, shoulder bags, totes, and clutches since 1995. Explore our exquisite collection of handcrafted bags.",
  keywords: ["handbags", "bags", "shoulder bags", "tote bags", "clutches", "leather bags", "Madhav World Bags", "premium bags", "handcrafted bags"],
  authors: [{ name: "Madhav World Bags Industry" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Madhav World Bags Industry",
    description: "Premium quality handbags crafted with excellence",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
