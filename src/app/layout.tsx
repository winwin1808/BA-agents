import type { Metadata } from "next";

import { getAppMeta } from "@/lib/app-meta";

import "bpmn-js/dist/assets/diagram-js.css";
import "bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css";
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
