import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from 'next-auth/react';
import ProfileRedirect from '@/components/ProfileRedirect';
import Head from 'next/head';

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Finding Health - Holistic Healthcare Directory",
  description: "Find holistic healthcare providers in your area. Search our directory of acupuncture, naturopathy, chiropractic, and other wellness practitioners.",
  openGraph: {
    title: "Finding Health",
    description: "Finding holistic healthcare in your area.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <SessionProvider>
          <ProfileRedirect />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
