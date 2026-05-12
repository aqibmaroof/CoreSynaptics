import "./globals.css";
import "./dashboard-animations.css";

export const metadata = {
  title: "CoreSynaptics",
  description: "Commissioning ERP / Mission Control Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Default theme is now "light" — the app uses the CxControl
          Cobalt + Citrine palette (cxcontrol_v2.html) as the global skin.
          A user toggle can still flip data-theme to "dark" in the future,
          but the persisted default has been switched.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(!t||t==='dark'){t='light';try{localStorage.setItem('theme','light')}catch(e){}}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}",
          }}
        />
      </head>
      {/* Body background comes from globals.css (var(--cx-bg-app)). The
          previous mainBackground.png was a navy artwork incompatible with
          the light Cobalt+Citrine theme. */}
      <body>{children}</body>
    </html>
  );
}
