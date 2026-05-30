import { FileArchive, Gift, Image, Package, ShieldCheck, Trophy, Users } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

const modules = [
  [Package, "Products", "Create products, variants, physical/STL distinction, pricing, tags, and collections."],
  [FileArchive, "File assets", "Manage STL, 3MF, ZIP, GLB previews, thumbnails, renders, and signed delivery rules."],
  [Gift, "Rewards", "Manage PopBits, coupons, shards, badges, daily rewards, and reward conditions."],
  [Trophy, "Games", "Configure Piñata Boss, Crystal Forge, leaderboards, and seasonal events."],
  [Image, "Makes gallery", "Moderate user print photos, seed profiles, product proof, and contest submissions."],
  [Users, "Profiles", "Manage user collections, libraries, credits, gallery posts, and Patreon code claims."],
  [ShieldCheck, "Security", "Audit ledger rules, protected downloads, anti-cheat, and content moderation."],
];

export default function AdminPlanningPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="glass rounded-[2.8rem] p-8">
          <div className="text-xs font-black uppercase tracking-[.24em] text-sky-700">Admin/CMS planning</div>
          <h1 className="mt-3 font-display text-5xl font-black tracking-[-.05em] text-slate-950">The admin layer should manage products, rewards, assets, contests, and trust.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">This page is only a planning placeholder. Production admin must require authentication and role-based permissions.</p>
        </section>
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(([Icon, title, text]) => <div key={String(title)} className="glass rounded-[2rem] p-5"><Icon className="text-sky-600" /><h2 className="mt-4 font-display text-2xl font-black">{String(title)}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{String(text)}</p></div>)}
        </section>
      </main>
    </SiteShell>
  );
}
