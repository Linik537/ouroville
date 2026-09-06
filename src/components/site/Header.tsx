import { Link } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/ouroville-logo.jpg";
import { SITE, whatsappLink } from "@/lib/site";

const nav = [
  { to: "/estoque", label: "ESTOQUE" },
  { to: "/sobre", label: "SOBRE" },
  { to: "/financie", label: "FINANCIE" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-3" aria-label={`${SITE.name} — página inicial`}>
          <img src={logo} alt={`Logo ${SITE.name}`} className="h-11 w-11 rounded-md object-cover" />
          <span className="hidden items-baseline gap-1 sm:flex">
            <span className="font-brand-primary text-xl text-primary">Ouroville</span>
            <span className="font-brand-secondary text-xl text-foreground">Motors</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-base font-semibold text-foreground/80 transition hover:text-primary"
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
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/90 md:ml-4"
        >
          <Phone className="h-4 w-4 text-black" aria-hidden />
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

      <div className="bg-primary px-4 py-2.5 text-center font-sans text-sm font-medium text-primary-foreground sm:text-base">
        Horário de Funcionamento: Segunda-Feira ao Sábado - 8h às 18h · Avenida João Pinheiro, 3488
      </div>
    </header>
  );
}
