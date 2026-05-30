import Link from "next/link";
import { ArrowRight, Box, Gamepad2, Image, Sparkles, Trophy } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { RewardPanel } from "@/components/RewardPanel";
import { SiteShell } from "@/components/SiteShell";
import { products } from "@/data/products";

export default function HomePage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="grid gap-6 lg:grid-cols-[1.08fr_.92fr]">
          <div className="glass rounded-[2.8rem] p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-sky-700">
              <Sparkles size={15} /> CyberPop Shop Alpha
            </div>
            <h1 className="mt-7 max-w-4xl font-display text-5xl font-black leading-[.94] tracking-[-.06em] text-slate-950 sm:text-7xl">
              A playable shop for 3D printable toy collectors.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Buy STL files and physical 3D prints, grow your digital collection, share makes, earn PopBits, and unlock rewards inside the CyberPop universe.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-card transition hover:-translate-y-0.5 hover:bg-sky-600">
                Enter the shop <ArrowRight size={16} />
              </Link>
              <Link href="/games" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-6 py-4 text-sm font-black text-slate-800 shadow-card transition hover:-translate-y-0.5 hover:border-sky-300">
                Preview game layer <Gamepad2 size={16} />
              </Link>
            </div>
          </div>
          <div className="dark-glass relative overflow-hidden rounded-[2.8rem] p-6 text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(93,213,255,.34),transparent_38%)]" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.24em] text-sky-200">Featured drop</div>
                  <h2 className="mt-2 font-display text-4xl font-black tracking-tight">Storm Hat Warrior</h2>
                </div>
                <div className="text-6xl">⚡</div>
              </div>
              <div className="mt-8 flex min-h-80 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.06]">
                <div className="text-[10rem] drop-shadow-2xl">⚡</div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/10 p-4"><Box /><div className="mt-3 font-bold">Multipart</div></div>
                <div className="rounded-3xl bg-white/10 p-4"><Trophy /><div className="mt-3 font-bold">120 PopBits</div></div>
                <div className="rounded-3xl bg-white/10 p-4"><Image /><div className="mt-3 font-bold">Makes ready</div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[.24em] text-sky-700">Shop core</div>
              <h2 className="font-display text-4xl font-black tracking-tight text-slate-950">First product cards</h2>
            </div>
            <Link href="/shop" className="rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-black text-slate-700 shadow-card transition hover:border-sky-300">
              View catalog
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.slug} product={product} />)}
          </div>
        </section>

        <section className="mt-8">
          <RewardPanel />
        </section>
      </main>
    </SiteShell>
  );
}
