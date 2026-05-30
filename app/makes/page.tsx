import { Heart, Image, Upload } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export default function MakesPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="glass rounded-[2.8rem] p-8">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.24em] text-sky-700"><Image size={16} /> Makes gallery placeholder</div>
          <h1 className="mt-3 font-display text-5xl font-black tracking-[-.05em] text-slate-950">Real printed makes should make the shop feel alive.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Seed profiles and real print photos can prevent the platform from feeling empty at launch.</p>
        </section>
        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {[1,2,3,4,5,6].map((item) => <div key={item} className="glass rounded-[2rem] p-4"><div className="flex h-56 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-sky-100 to-white text-6xl">🖨️</div><div className="mt-4 flex items-center justify-between"><div><h2 className="font-black">Seed make #{item}</h2><p className="text-sm text-slate-500">Founder profile placeholder</p></div><div className="flex items-center gap-1 text-sm font-bold text-slate-500"><Heart size={15} /> {12+item}</div></div></div>)}
        </section>
        <div className="mt-8 glass rounded-[2rem] p-5"><Upload className="text-sky-600" /><h2 className="mt-3 font-display text-2xl font-black">Future upload flow</h2><p className="mt-2 text-slate-600">Users can upload print photos for credit, badges, contests, and product page proof after moderation.</p></div>
      </main>
    </SiteShell>
  );
}
