import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.jpg.asset.json";
import { SITE, whatsappLink } from "@/lib/site";

const nav = [
  { to: "/estoque", label: "Estoque" },
  { to: "/sobre", label: "Sobre" },
  { to: "/financie", label: "Financie" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-3" aria-label={`${SITE.name} — página inicial`}>
          <img src={logo.url} alt={`Logo ${SITE.name}`} className="h-11 w-11 rounded-md object-cover" />
          <span className="hidden font-display text-xl font-bold uppercase tracking-[0.18em] sm:block">
            <span className="text-primary">Ouroville</span>{" "}
            <span className="text-foreground">Motors</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <a
          href={whatsappLink(`Olá! Vim pelo site da ${SITE.name}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 md:ml-4"
        >
          <Phone className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">{SITE.phoneDisplay}</span>
          <span className="sm:hidden">WhatsApp</span>
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-foreground md:hidden"
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background px-4 py-2 md:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-3 text-sm font-medium text-foreground/90"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="bg-white py-1.5 text-center text-xs font-semibold tracking-wide text-zinc-800">
        {SITE.hours} — {SITE.address}
      </div>
    </header>
  );
}
