import Link from "next/link";
import { ArrowRight, Box, Coins, Sparkles } from "lucide-react";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-card backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/shop/${product.slug}`}>
        <div className={`relative flex h-56 items-center justify-center overflow-hidden rounded-[1.55rem] bg-gradient-to-br ${product.accent}`}>
          <div className="absolute inset-0 bg-white/20" />
          <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/45 px-3 py-1 text-[10px] font-black uppercase tracking-[.22em] text-slate-800 backdrop-blur">
            {product.kind}
          </div>
          <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full border border-white/50 bg-white/45 px-3 py-1 text-xs font-black text-slate-800 backdrop-blur">
            <Coins size={13} /> {product.popBits}
          </div>
          <div className="relative text-7xl drop-shadow-xl transition duration-500 group-hover:scale-110 group-hover:-rotate-3">{product.preview}</div>
          <div className="absolute inset-x-8 bottom-5 h-8 rounded-full bg-slate-900/25 blur-xl" />
        </div>
      </Link>
      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-black uppercase tracking-[.22em] text-sky-700">{product.series}</div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500"><Box size={13} /> {product.parts.length} parts</div>
        </div>
        <Link href={`/shop/${product.slug}`} className="mt-1 block font-display text-2xl font-black tracking-tight text-slate-950">
          {product.name}
        </Link>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{product.short}</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.18em] text-slate-400">Starting at</div>
            <div className="text-2xl font-black text-slate-950">${product.price}</div>
          </div>
          <Link href={`/shop/${product.slug}`} className="flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-sky-600">
            Inspect <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
