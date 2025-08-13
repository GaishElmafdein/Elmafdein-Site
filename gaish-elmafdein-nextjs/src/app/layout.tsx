import "./globals.css";
import type { Metadata } from "next";
import CrossSky from "@/components/visuals/CrossSky";
import { Amiri, Lateef } from "next/font/google";

const amiri = Amiri({ subsets:["arabic"], weight:["400","700"], variable:"--font-amiri", display:"swap" });
const lateef = Lateef({ subsets:["arabic"], weight:["400","700"], variable:"--font-lateef", display:"swap" });

export const metadata: Metadata = {
  title: "جيش المفديين | الكاتدرائية الرقمية الأرثوذكسية",
  description: "الذراع الرقمي للدفاع عن الإيمان القويم",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${amiri.variable} ${lateef.variable} font-arabic antialiased`}>
        {/* خلفية الصلبان - z-0 */}
        <CrossSky density={0.26} baseSpeed={26} glow={1.3} baseSize={9} opacity={0.95} seed={20250812} blendScreen />
        {children}
      </body>
    </html>
  );
}
