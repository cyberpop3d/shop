import { Download, Library, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";

export default function LibraryPage() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="glass rounded-[2.8rem] p-8">
          <div className="flex items-center gap-3 text-sky-700"><Library /><span className="text-xs font-black uppercase tracking-[.24em]">User library placeholder</span></div>
          <h1 className="mt-4 font-display text-5xl font-black tracking-[-.05em] text-slate-950">Your owned prints and files will live here.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">In production, purchased STL/3MF/ZIP files should be protected behind account authentication and signed download links.</p>
        </section>
        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          {[
            [Download, "Secure downloads", "Time-limited authenticated links for purchased digital files."],
            [ShieldCheck, "License notes", "Clear terms, update policy, and commercial-use limits per product."],
            [Library, "Version updates", "Future product updates can appear inside the customer library."]
          ].map(([Icon, title, text]) => <div key={String(title)} className="glass rounded-[2rem] p-5"><Icon className="text-sky-600" /><h2 className="mt-4 font-display text-2xl font-black">{String(title)}</h2><p className="mt-2 text-slate-600">{String(text)}</p></div>)}
        </section>
      </main>
    </SiteShell>
  );
}
