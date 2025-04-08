import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anura Playground",
  description: "Lilypad API Interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/lp-logo.svg" type="image/svg+xml" />
      </head>
      <body className={`font-mono antialiased`}>{children}</body>
    </html>
  );
}
