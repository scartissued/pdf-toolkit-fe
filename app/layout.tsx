import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Toolkit",
  description: "Upload PDFs and chat with their contents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
