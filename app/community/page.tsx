import { CommunityPaddock } from "@/components/community-paddock";
import { NavBar } from "@/components/nav-bar";

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <section className="grid items-end gap-6 border-b border-black/10 pb-9 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet/25 bg-violet/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#7449b8]">
              <span className="size-2 rounded-full bg-violet" />
              Community prototype
            </div>
            <h1 className="max-w-4xl font-heading text-5xl font-black leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Talk racing. <span className="text-electric">Pick a side.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Team colours, sharp opinions, and race conversations—without
              presenting fan takes as verified news.
            </p>
          </div>
          <div className="rounded-2xl border border-electric/20 bg-[#eef9ff] p-4 text-sm leading-relaxed text-black/60">
            <strong className="mb-1 block font-heading text-base text-[#24242d]">
              Prototype boundary
            </strong>
            Reactions and new comments work in this browser session but are not
            saved yet.
          </div>
        </section>
        <CommunityPaddock />
      </main>
    </div>
  );
}
