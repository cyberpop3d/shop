import type { Product } from "@/data/products";

export function PreviewFigure({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br ${product.accent} ${large ? "min-h-[520px]" : "min-h-72"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.7),transparent_35%),linear-gradient(180deg,rgba(255,255,255,.24),rgba(255,255,255,.04))]" />
      <div className="absolute left-5 top-5 rounded-full border border-white/50 bg-white/45 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-slate-800 backdrop-blur">
        GLB Preview Slot
      </div>
      <div className="relative flex flex-col items-center">
        <div className="text-[8rem] leading-none drop-shadow-2xl sm:text-[10rem]">{product.preview}</div>
        <div className="mt-6 rounded-full border border-white/50 bg-white/45 px-6 py-3 text-sm font-black text-slate-800 backdrop-blur">
          Drag / rotate viewer placeholder
        </div>
      </div>
      <div className="absolute bottom-16 h-10 w-72 rounded-full bg-slate-900/20 blur-2xl" />
    </div>
  );
}
