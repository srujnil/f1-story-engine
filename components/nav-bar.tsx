import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Storyline Hub", shortLabel: "Hub" },
  { href: "/seasons/2026", label: "Season Timeline", shortLabel: "Season" },
  { href: "/community", label: "Community", shortLabel: "Talk" },
  { href: "/car-explorer", label: "Car Explorer", shortLabel: "Car" },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 border-t-2 border-t-electric bg-white/95 text-foreground shadow-sm backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center gap-0.5 px-3 py-3 sm:gap-2 sm:px-6 lg:px-8"
      >
        <span className="mr-auto flex shrink-0 items-center gap-2 whitespace-nowrap font-heading text-lg font-black tracking-tight text-[#24242d] sm:text-xl">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-xs italic text-white shadow-sm">
            F1
          </span>
          Story Engine
        </span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-[#51515d] hover:bg-electric/10 hover:text-[#1479ad]",
            )}
          >
            <span className="sm:hidden">{link.shortLabel}</span>
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        ))}
      </nav>
    </header>
  );
}
