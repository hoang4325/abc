import React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css"
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/Themeprovider";
import { OfflineBanner } from "@/app/components/shared/offline-banner";


import { ToastProvider } from "@/components/ui/toast-simple";
import { AuthProvider } from "@/app/context/auth-context";

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "ShadcnDashboard - Tailwind + Shadcn Nextjs",
  description: "Modern admin dashboard built with Next.js, Tailwind, and Shadcn.",
  icons: {
    icon: "/favicons.ico",
  },
  openGraph: {
    title: "ShadcnDashboard - Tailwind + Shadcn Nextjs",
    description: "Modern admin dashboard built with Next.js, Tailwind, and Shadcn.",
    images: [
      {
        url: "/OG-Image.png",
        width: 1200,
        height: 630,
        alt: "ShadcnDashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/OG-Image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning
      data-color-theme="CUSTOM_THEME"
      data-layout="vertical"
      data-boxed-layout="boxed"
      data-sidebar-type="true"
      data-card-shadow="false"
      className="style-lyra"
    >
      <body className={`${geist.className} `} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(typeof window!=='undefined'){window.addEventListener('error',function(e){var s=(e.filename||'')+' '+(e.error&&e.error.stack||'');if(s.indexOf('chrome-extension:')!==-1||s.indexOf('moz-extension:')!==-1||s.indexOf('safari-extension:')!==-1){e.stopImmediatePropagation();e.preventDefault();return true;}},true);window.addEventListener('unhandledrejection',function(e){var s=(e.reason&&e.reason.stack||'')+''+(e.reason||'');if(s.indexOf('chrome-extension:')!==-1||s.indexOf('moz-extension:')!==-1||s.indexOf('safari-extension:')!==-1){e.stopImmediatePropagation();e.preventDefault();}},true);}var cleanBis=function(el){if(el&&el.removeAttribute){el.removeAttribute('bis_skin_checked');}};if(typeof MutationObserver!=='undefined'){var observer=new MutationObserver(function(mutations){for(var i=0;i<mutations.length;i++){var m=mutations[i];if(m.type==='attributes'&&m.attributeName==='bis_skin_checked'){cleanBis(m.target);}}});observer.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['bis_skin_checked']});}if(typeof Element!=='undefined'&&Element.prototype){var origSetAttr=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){if(name==='bis_skin_checked')return;return origSetAttr.apply(this,arguments);};}}catch(e){}})();`,
          }}
        />
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
            <OfflineBanner />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
