import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FlowBoard",
  description: "Project management minimal per team e roadmap."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
