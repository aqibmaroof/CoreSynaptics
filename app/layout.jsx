import "./globals.css";
import "./dashboard-animations.css";

export const metadata = {
  title: "CoreSynaptics ",
  description: "ERP - Mission Control Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[url('/images/mainBackground.png')] ">
        {children}
      </body>
    </html>
  );
}
