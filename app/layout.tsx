import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "CoreSynaptics ",
  description: "ERP - Mission Control Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ThemeProvider>
  );
}
