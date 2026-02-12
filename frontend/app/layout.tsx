import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple CRM",
  description: "A lightweight CRM for small businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
