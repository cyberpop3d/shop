import { Coins, Flame, Gift, Trophy } from "lucide-react";

export function RewardPanel() {
  return (
    <section className="glass rounded-[2rem] p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-skyglass-300 text-white shadow-card">
          <Coins size={22} />
        </div>
        <div>
          <div className="text-xs font-black uppercase tracking-[.22em] text-sky-700">PopBits foundation</div>
          <h2 className="font-display text-2xl font-black tracking-tight text-slate-950">Rewards should connect shopping to the CyberPop universe.</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Gift, label: "Daily rewards", text: "Streaks, small credits, badges, and coupons." },
          { icon: Flame, label: "Boss damage", text: "Owned products can power monthly Piñata events." },
          { icon: Trophy, label: "Collection progress", text: "Complete sets for badges, credits, or special stands." }
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white/60 p-4">
            <item.icon className="text-sky-600" />
            <h3 className="mt-3 font-black text-slate-950">{item.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
