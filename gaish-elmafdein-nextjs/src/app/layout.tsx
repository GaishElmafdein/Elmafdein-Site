import type { Metadata } from "next";
import { Cairo, Lemonada, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const lemonada = Lemonada({
  subsets: ['arabic', 'latin'],
  variable: '--font-lemonada',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "جيش المفديين | الكاتدرائية الرقمية الأرثوذكسية",
  description: "الذراع الرقمي للدفاع عن الإيمان القويم - كاتدرائية رقمية تجمع بين الإيمان والذكاء الصناعي",
  keywords: "أرثوذكسي، مسيحي، دفاع، إيمان، ذكاء صناعي، لاهوت",
  authors: [{ name: "جيش المفديين" }],
  openGraph: {
    title: "جيش المفديين | الكاتدرائية الرقمية الأرثوذكسية",
    description: "الذراع الرقمي للدفاع عن الإيمان القويم",
    type: "website",
    locale: "ar_EG",
    siteName: "جيش المفديين",
  },
  twitter: {
    card: "summary_large_image",
    title: "جيش المفديين | الكاتدرائية الرقمية الأرثوذكسية",
    description: "الذراع الرقمي للدفاع عن الإيمان القويم",
  },
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1c40f" },
    { media: "(prefers-color-scheme: dark)", color: "#243b53" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`
          ${cairo.variable} ${lemonada.variable} ${playfair.variable}
          font-arabic antialiased
          bg-gradient-to-br from-midnight-900 via-midnight-800 to-midnight-900
          text-gold-100 min-h-screen
        `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
