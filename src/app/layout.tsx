import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { Cairo, Inter } from 'next/font/google';

const cairo = Cairo({ 
  subsets: ['latin', 'arabic'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo'
});

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "SmoothFlow - حلول تقنية متطورة",
  description: "خدمات كمبيوتر احترافية في الرس - تركيب، صيانة، وإصلاح جميع أنواع أجهزة الكمبيوتر مع ضمان شامل وخدمة عملاء متميزة",
  keywords: "خدمات كمبيوتر, تركيب حاسوب, صيانة حاسوب, إصلاح حاسوب, الرس, السعودية, SmoothFlow",
  authors: [{ name: "SmoothFlow" }],
  creator: "SmoothFlow",
  publisher: "SmoothFlow",
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: "SmoothFlow - حلول تقنية متطورة",
    description: "خدمات كمبيوتر احترافية في الرس ",
    url: "https://smoothflow-store-web.vercel.app",
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
    title: "SmoothFlow - حلول تقنية متطورة",
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
    // other: {
    //   "msvalidate.01": "your-bing-verification-code",
    // },
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#00BFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "SmoothFlow",
              "description": "خدمات كمبيوتر احترافية في الرس",
              "url": "https://smoothflow.sa",
              "telephone": "+966543156466",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "الرس",
                "addressLocality": "الرس",
                "addressRegion": "القصيم",
                "addressCountry": "SA"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 25.8697,
                "longitude": 43.4951
              },
              "openingHours": "Mo-Su 09:00-22:00",
              "priceRange": "$$",
              "image": "/images/logo/store-logo.png"
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
        
        {/* Performance monitoring script (optional) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Basic performance monitoring
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart + 'ms');
                  }, 0);
                });
              }
            `
          }}
        />
      </body>
    </html>
  );
}