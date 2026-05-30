import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Coins, Download, Gamepad2, Package, Palette, ShieldCheck } from "lucide-react";
import { PreviewFigure } from "@/components/PreviewFigure";
import { SiteShell } from "@/components/SiteShell";
import { products } from "@/data/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((item) => item.slug === params.slug);
  if (!product) notFound();

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link href="/shop" className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-4 py-2 text-sm font-black text-slate-700 shadow-card transition hover:border-sky-300">
          <ArrowLeft size={15} /> Back to catalog
        </Link>
        <section className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
          <PreviewFigure product={product} large />
          <div className="glass rounded-[2.4rem] p-7">
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => <span key={tag} className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-slate-600">{tag}</span>)}
            </div>
            <h1 className="mt-5 font-display text-5xl font-black tracking-[-.05em] text-slate-950">{product.name}</h1>
            <p className="mt-3 text-lg leading-8 text-slate-600">{product.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Info icon={<Package size={18} />} label="Format" value={product.kind} />
              <Info icon={<Coins size={18} />} label="Reward" value={`${product.popBits} PopBits`} />
              <Info icon={<Palette size={18} />} label="Difficulty" value={product.difficulty} />
              <Info icon={<Gamepad2 size={18} />} label="Universe" value={product.series} />
            </div>
            <div className="mt-6 rounded-[1.7rem] border border-slate-200 bg-white/60 p-5">
              <div className="text-xs font-black uppercase tracking-[.22em] text-sky-700">Parts included</div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {product.parts.map((part) => (
                  <div key={part} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 p-3 text-sm font-bold text-slate-700">
                    <Check size={15} className="text-sky-600" /> {part}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.7rem] bg-slate-950 p-5 text-white">
              <div>
                <div className="text-xs font-black uppercase tracking-[.22em] text-sky-200">Starting at</div>
                <div className="text-4xl font-black">${product.price}</div>
              </div>
              <button className="rounded-full bg-white px-6 py-4 text-sm font-black text-slate-950 transition hover:bg-sky-200">
                Add to cart
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <Panel icon={<Download />} title="Secure delivery placeholder" text="Production version should use authenticated or signed file downloads after purchase." />
          <Panel icon={<ShieldCheck />} title="License clarity" text="Digital product license, update policy, and commercial limits should be visible before checkout." />
          <Panel icon={<Palette />} title="Customizer ready" text="Future GLB preview can support part visibility, accessory switch, and filament-style color previews." />
        </section>
      </main>
    </SiteShell>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-3xl border border-slate-200 bg-white/60 p-4"><div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-sky-700">{icon}{label}</div><div className="mt-2 font-black text-slate-950">{value}</div></div>;
}

function Panel({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="glass rounded-[2rem] p-5"><div className="text-sky-600">{icon}</div><h3 className="mt-4 font-display text-xl font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>;
}
