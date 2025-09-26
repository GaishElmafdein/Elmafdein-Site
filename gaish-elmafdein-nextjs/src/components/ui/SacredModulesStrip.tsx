import Link from "next/link";
import {
  Radio as RadioIcon,
  BookOpen,
  Newspaper,
  BookText,
  ShieldCheck,
  Users,
  Info,
} from "lucide-react";

interface Props {
  locale: "ar" | "en";
  className?: string;
}

// Sleek glassy ribbon of sacred modules with a highlighted LIVE Radio pill
export default function SacredModulesStrip({ locale, className = "" }: Props) {
  const isAr = locale === "ar";

  const items = [
    { href: `/${locale}/library`, labelAr: "المكتبة الرقمية", labelEn: "Digital Library", badge: null, icon: BookOpen },
    { href: `/${locale}/news`, labelAr: "أخبار", labelEn: "News", badge: "HOT", icon: Newspaper },
    { href: `/${locale}/bible`, labelAr: "الكتاب المقدس بتفسير الآباء", labelEn: "Bible with Fathers", badge: "NEW", icon: BookText },
    { href: `/${locale}/ai-defense`, labelAr: "الذكاء الدفاعي AI", labelEn: "AI Defense", badge: "AI", icon: ShieldCheck },
    { href: `/${locale}/arena`, labelAr: "ميـدان المفديين", labelEn: "Redeemed Arena", badge: null, icon: Users },
    { href: `/${locale}/about`, labelAr: "من نحن", labelEn: "About", badge: null, icon: Info },
  ];

  // pill UI builder
  const Pill = ({
    href,
    title,
    icon: Icon,
    badge,
  }: { href: string; title: string; icon: any; badge?: string | null }) => (
    <Link
      href={href}
      prefetch={false}
  className="group relative rounded-full border border-amber-400/25 bg-white/5 backdrop-blur-md hover:bg-[rgba(155,70,0,0.18)] hover:border-amber-500/70 text-amber-100 shadow-[0_3px_10px_rgba(0,0,0,0.45)] hover:shadow-[0_8px_22px_rgba(120,60,0,0.5)] w-full px-3 md:px-4 py-3 md:py-4 flex items-center justify-center gap-2 md:gap-3 transition-all duration-300"
    >
      {badge && (
        <span className="absolute -top-2 -start-2 text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-black font-extrabold shadow-md animate-sacred-pulse">
          {badge}
        </span>
      )}
  <span className="grid place-items-center rounded-full bg-black/30 border border-amber-400/30 group-hover:border-amber-500/70 text-amber-300 group-hover:text-amber-200 w-9 h-9 md:w-10 md:h-10 transition-all duration-300 group-hover:rotate-3 group-hover:scale-110">
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </span>
      <span
  className={`relative text-base md:text-lg font-extrabold whitespace-normal break-words text-center text-amber-200 drop-shadow-[0_2px_3px_rgba(0,0,0,0.95)] ${isAr ? "font-cairo-play" : "font-display"}`}
      >
        {title}
        <span className="pointer-events-none absolute left-1/2 -bottom-1 h-[2px] w-8 -translate-x-1/2 origin-center scale-x-0 rounded bg-amber-300/85 transition-transform duration-300 group-hover:scale-x-100" />
      </span>
  {/* removed golden halo per request (black shadow only) */}
    </Link>
  );

  // Radio pill emphasized
  const RadioPill = () => (
    <Link
      href={`/${locale}/radio`}
      aria-label={isAr ? "الإذاعة الأرثوذكسية" : "Orthodox Radio"}
      prefetch={false}
  className="group relative rounded-full border border-red-600/45 bg-[rgba(60,0,10,0.18)] backdrop-blur-md hover:bg-[rgba(85,0,14,0.28)] hover:border-red-500/70 text-amber-50 shadow-[0_4px_12px_rgba(0,0,0,0.55)] hover:shadow-[0_8px_22px_rgba(90,0,10,0.5)] w-full px-3 md:px-4 py-3 md:py-4 flex items-center justify-center gap-2 md:gap-3 transition-all duration-300"
    >
      <span className="absolute -top-2 -start-2 text-[10px] px-2 py-0.5 rounded-full bg-red-500/90 text-black font-extrabold shadow-md animate-sacred-pulse-red border border-red-300/60">
        {isAr ? "مباشر" : "LIVE"}
      </span>
      {/* subtle pulsing dot indicator instead of whole pill pulsing */}
      <span
        className={`absolute top-2 ${isAr ? 'left-2' : 'right-2'} w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.9)] animate-sacred-pulse-red`}
        aria-hidden="true"
      />
  <span className="grid place-items-center rounded-full bg-black/35 border border-red-400/30 group-hover:border-red-400/60 text-red-200 group-hover:text-red-100 w-9 h-9 md:w-10 md:h-10 transition-all duration-300 group-hover:-rotate-3 group-hover:scale-110">
        <RadioIcon className="w-5 h-5 md:w-6 md:h-6" />
      </span>
      <span
  className={`relative text-base md:text-lg font-extrabold whitespace-normal break-words text-center text-red-100/90 drop-shadow-[0_2px_3px_rgba(0,0,0,1)] ${isAr ? "font-cairo-play" : "font-display"}`}
      >
        {isAr ? "الإذاعة الأرثوذكسية" : "Orthodox Radio"}
        <span className="pointer-events-none absolute left-1/2 -bottom-1 h-[2px] w-10 -translate-x-1/2 origin-center scale-x-0 rounded bg-red-400/75 transition-transform duration-300 group-hover:scale-x-100" />
      </span>
      {/* no directional shimmer by request */}
    </Link>
  );

  // Order: Radio first for Arabic, last for English
  const ordered: React.ReactNode[] = [];
  if (isAr) ordered.push(<RadioPill key="radio" />);
  items.forEach((it, i) =>
    ordered.push(
      <Pill
        key={i}
        href={it.href}
        title={isAr ? it.labelAr : it.labelEn}
        icon={it.icon}
        badge={it.badge}
      />
    )
  );
  if (!isAr) ordered.push(<RadioPill key="radio" />);

  return (
    <div className={`w-full ${className}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="relative mx-auto mt-4 md:mt-6 max-w-7xl px-2 md:px-0">
        {/* grid container: no horizontal scroll, wraps on small, all visible on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4">
          {ordered}
        </div>
      </div>
    </div>
  );
}
