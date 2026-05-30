import Link from "next/link";
import { Gamepad2, ShoppingBag, UserRound, Trophy, Image, Library, Sparkles } from "lucide-react";

const nav = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/library", label: "My Library", icon: Library },
  { href: "/makes", label: "Makes", icon: Image },
  { href: "/rewards", label: "Rewards", icon: Trophy },
  { href: "/games", label: "Games", icon: Gamepad2 }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/55 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-skyglass-400 text-white shadow-card">
            <Sparkles size={21} />
          </div>
          <div>
            <div className="font-display text-lg font-black uppercase tracking-[.28em] text-slate-950">CyberPop</div>
            <div className="text-[11px] font-semibold uppercase tracking-[.28em] text-slate-500">3D Printable Toy Platform</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/55 p-1 shadow-card lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-950 hover:text-white">
              <item.icon size={15} /> {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/library" className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-card transition hover:-translate-y-0.5">
          <UserRound size={16} /> Account
        </Link>
      </div>
    </header>
  );
}

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen soft-grid">
      <SiteHeader />
      {children}
    </div>
  );
}
