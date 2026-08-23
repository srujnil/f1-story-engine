import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Storyline Hub" },
  { href: "/seasons/2026", label: "Season Timeline" },
];

export function NavBar() {
  return (
    <header className="border-b border-border/50 shadow-[0_1px_0_0] shadow-primary/40">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-4 sm:px-6"
      >
        <span className="mr-2 font-heading text-xl font-bold tracking-tight text-primary">
          F1 Story Engine
        </span>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
