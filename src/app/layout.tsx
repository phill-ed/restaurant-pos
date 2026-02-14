import type { Metadata } from "next";
import "./globals.css";
import { POSProvider } from "@/context/POSContext";

export const metadata: Metadata = {
  title: "Restaurant POS - Management System",
  description: "Complete restaurant point of sale and management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <POSProvider>
          {children}
        </POSProvider>
      </body>
    </html>
  );
}
