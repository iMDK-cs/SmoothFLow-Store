import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        {/* Fonts are now loaded via next/font in layout.tsx */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}