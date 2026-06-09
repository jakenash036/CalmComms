import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalmComms",
  description: "School-safe communication rewriting assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
