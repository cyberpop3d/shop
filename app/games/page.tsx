"use client";

import { useState } from "react";
import { Flame, Gamepad2, Hammer, Star, Trophy } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

const monsters = ["Support Goblin", "Layer Ghost", "Warp Beast", "Stringing Slime"];

export default function GamesPage() {
  const [xp, setXp] = useState(0);
  const [hits, setHits] = useState(0);
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="glass rounded-[2.8rem] p-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.24em] text-sky-700"><Gamepad2 size={16} /> Mini game hub placeholder</div>
          <h1 className="mt-3 font-display text-5xl font-black tracking-[-.05em] text-slate-950">Games should support collecting, not distract from shopping.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">First playable loops can include Piñata Boss, Crystal Forge, Print Lab Tycoon, and a simple Map Runner.</p>
        </section>
        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_.8fr]">
          <div className="dark-glass rounded-[2.4rem] p-6 text-white">
            <div className="flex items-center justify-between">
              <div><div className="text-xs font-black uppercase tracking-[.24em] text-sky-200">Piñata Boss demo</div><h2 className="mt-2 font-display text-3xl font-black">Clear print monsters</h2></div>
              <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-black"><Star className="inline" size={15} /> {xp} XP</div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {monsters.map((monster, i) => <button key={monster} onClick={() => { setXp(xp + 15 + i * 5); setHits(hits + 1); }} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-6 text-left transition hover:-translate-y-1 hover:bg-white/[0.11]"><Flame className="text-orange-300" /><h3 className="mt-4 font-black">{monster}</h3><p className="mt-2 text-sm text-zinc-400">Tap to deal damage and earn placeholder XP.</p></button>)}
            </div>
          </div>
          <div className="grid gap-5">
            <GameCard icon={<Hammer />} title="Print Lab Tycoon" text="Upgrade a digital print workshop using owned products and PopBits." />
            <GameCard icon={<Trophy />} title="Crystal Forge" text="Turn earned shards into badges, coupons, and collection cosmetics." />
            <GameCard icon={<Star />} title="Session stats" text={`${hits} hits this session. Backend ledger required before production.`} />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}

function GameCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="glass rounded-[2rem] p-5"><div className="text-sky-600">{icon}</div><h3 className="mt-4 font-display text-2xl font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>;
}
