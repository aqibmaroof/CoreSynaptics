import "./globals.css";
import "./dashboard-animations.css";

export const metadata = {
  title: "CoreSynaptics ",
  description: "ERP - Mission Control Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-[url('/images/mainBackground.png')] ">
        {children}
      </body>
    </html>
  );
}
