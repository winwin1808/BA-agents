import type { Metadata } from "next";

import { getAppMeta } from "@/lib/app-meta";

import "./globals.css";

const meta = getAppMeta();

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
