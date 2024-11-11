import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { Analytics } from "@vercel/analytics/react"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SPR's AI Calculator",
  description: "AI Powered Drawing Calculator",
  openGraph: {
    title: "SPR's AI Calculator",
    description: "AI-powered calculator built with Next.js 15  and Clerk authentication",
    url: "https://spr-ai-calculator.vercel.app", // Update with your website URL
    siteName: "SPR's AI Calculator",
    images: [
      {
        url: "/favicon.png", // Replace with your SEO image path
        width: 1200,
        height: 630,
        alt: "SPR's AI Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SPR's AI Calculator",
    description: "AI-powered calculator built with Next.js 15 and Clerk authentication",
    images: "/favicon.png", 
    // Replace with your SEO image path
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <ClerkProvider
       appearance={{
        baseTheme: dark,
      }}>
        <Analytics/>
        {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
