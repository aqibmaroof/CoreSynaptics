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
        <body className="bg-[url('/images/mainBackground.png')] ">
          {children}
        </body>
      </html>
    </ThemeProvider>
  );
}
