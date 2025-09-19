import type { Metadata, Viewport } from "next";
import "./globals-optimized.css";
import Providers from "@/components/Providers";
import { Cairo, Inter } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next'

const cairo = Cairo({ 
  subsets: ['latin', 'arabic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap', // OPTIMIZED: Better font loading
  preload: true
});

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap', // OPTIMIZED: Better font loading
  preload: true
});

// OPTIMIZED: Fixed metadata for Next.js 15
export const metadata: Metadata = {
  metadataBase: new URL('https://smoothflow-sa.vercel.app'), // OPTIMIZED: Fixed metadataBase
  title: "SmoothFlow - حلول تقنية",
  description: "خدمات كمبيوتر احترافية في الرس - تركيب، صيانة، وإصلاح جميع أنواع أجهزة الكمبيوتر مع ضمان شامل وخدمة عملاء متميزة",
  keywords: "خدمات كمبيوتر, تركيب حاسوب, صيانة حاسوب, إصلاح حاسوب, الرس, السعودية, SmoothFlow",
  authors: [{ name: "SmoothFlow" }],
  creator: "SmoothFlow",
  publisher: "SmoothFlow",
  
  // PWA metadata
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SmoothFlow"
  },
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: "SmoothFlow - حلول تقنية",
    description: "خدمات كمبيوتر احترافية في الرس",
    url: "https://smoothflow-sa.vercel.app",
    siteName: "SmoothFlow",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SmoothFlow - خدمات كمبيوتر احترافية",
      },
    ],
    locale: "ar_SA",
    type: "website",
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "SmoothFlow - حلول تقنية",
    description: "خدمات كمبيوتر احترافية في الرس",
    images: ["/images/twitter-image.jpg"],
    creator: "@MDK7_",
  },
  
  // Additional metadata
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    google: "your-google-verification-code",
  },
  
  // App metadata
  applicationName: "SmoothFlow",
  category: "Technology",
  
  // Geo location
  other: {
    "geo.region": "SA-11",
    "geo.placename": "الرس",
    "geo.position": "25.8697;43.4951",
    "ICBM": "25.8697, 43.4951",
  },
};

// OPTIMIZED: Fixed viewport export for Next.js 15
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0ea5e9", // OPTIMIZED: Moved themeColor to viewport
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${inter.variable}`}>
      <head>
        {/* OPTIMIZED: Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/cairo-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* OPTIMIZED: Simplified structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "SmoothFlow",
              "description": "خدمات كمبيوتر احترافية في الرس",
              "url": "https://smoothflow-sa.vercel.app",
              "telephone": "+966543156466",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "الرس",
                "addressLocality": "الرس",
                "addressRegion": "القصيم",
                "addressCountry": "SA"
              },
              "openingHours": "Mo-Su 09:00-22:00",
              "priceRange": "$$"
            })
          }}
        />
      </head>
      <body 
        className={`${cairo.variable} ${inter.variable} font-['Cairo',sans-serif] antialiased bg-black text-white overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        
        {/* OPTIMIZED: Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Basic performance monitoring
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    if (perfData) {
                      console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart + 'ms');
                    }
                  }, 0);
                });
              }
            `
          }}
        />
        
        <SpeedInsights />
      </body>
    </html>
  );
}