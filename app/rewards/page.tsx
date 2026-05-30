import { Coins, Gift, Star, Trophy } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

const rewardCards = [
  { icon: Coins, title: "PopBits", text: "Site currency for credits, badges, coupons, and cosmetic unlocks." },
  { icon: Star, title: "Daily streaks", text: "Small daily rewards that encourage returning without blocking the shop." },
  { icon: Gift, title: "Crystal Forge", text: "Earned shards, small coupons, badges, and preview unlocks. Not random cash gambling." },
  { icon: Trophy, title: "Collection progress", text: "Complete drops to earn certificates, profile items, or stand discounts." }
];

export default function RewardsPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="glass rounded-[2.8rem] p-8">
          <div className="text-xs font-black uppercase tracking-[.24em] text-sky-700">Loyalty system foundation</div>
          <h1 className="mt-3 font-display text-5xl font-black tracking-[-.05em] text-slate-950">Rewards should make the physical collection feel alive.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">PopBits and rewards should connect purchases, makes, contests, daily returns, and mini-games into one transparent ledger.</p>
        </section>
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {rewardCards.map((card) => <div key={card.title} className="glass rounded-[2rem] p-5"><card.icon className="text-sky-600" /><h2 className="mt-4 font-display text-2xl font-black">{card.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{card.text}</p></div>)}
        </section>
      </main>
    </SiteShell>
  );
}
