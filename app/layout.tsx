import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VulnScan — Vulnerability Analysis Platform",
  description: "AI-powered vulnerability detection and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Restore saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen grid-bg antialiased">
        {children}
      </body>
    </html>
  );
}
