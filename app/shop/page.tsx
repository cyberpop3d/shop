import { ProductCard } from "@/components/ProductCard";
import { SiteShell } from "@/components/SiteShell";
import { collections, products } from "@/data/products";

export default function ShopPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="glass rounded-[2.8rem] p-8">
          <div className="text-xs font-black uppercase tracking-[.24em] text-sky-700">Catalog foundation</div>
          <h1 className="mt-3 font-display text-5xl font-black tracking-[-.05em] text-slate-950">CyberPop Shop</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            The first catalog layer supports STL products, physical prints, stand market items, bundles, PopBits rewards, and future authenticated file delivery.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {collections.map((collection) => (
              <span key={collection} className="rounded-full border border-slate-200 bg-white/65 px-4 py-2 text-sm font-bold text-slate-700">{collection}</span>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => <ProductCard key={product.slug} product={product} />)}
        </section>
      </main>
    </SiteShell>
  );
}
