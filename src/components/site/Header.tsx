import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
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
    <div className="sticky top-0 z-50">
      <header className="border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3" aria-label={`${SITE.name} — página inicial`}>
            <img src={logo} alt={`Logo ${SITE.name}`} className="h-14 w-14 rounded-md object-cover sm:h-16 sm:w-16" />
            <span className="hidden items-baseline gap-1 sm:flex">
              <span className="font-brand-primary text-2xl text-gold sm:text-3xl">Ouroville</span>
              <span className="font-brand-secondary text-2xl text-foreground sm:text-3xl">Motors</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-2 text-xl font-display font-semibold uppercase tracking-widest text-white transition hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <a
            href={`tel:${SITE.phoneDigits.slice(2)}`}
            aria-label={`Ligar para ${SITE.phoneDisplay}`}
            title={`Ligar para ${SITE.phoneDisplay}`}
            className="hidden h-12 w-12 shrink-0 items-center justify-center text-white transition hover:text-primary md:inline-flex"
          >
            <Phone className="h-6 w-6" aria-hidden />
          </a>

          <a
            href={whatsappLink("Olá! Qual carro a Ouroville recomenda em 2026?")}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-base font-semibold text-black transition hover:bg-white/90 md:ml-0"
          >
            <MessageCircle className="h-5 w-5 text-black" aria-hidden />
            <span className="hidden sm:inline">{SITE.phoneDisplay}</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-foreground md:hidden"
            aria-label="Abrir menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <nav className="border-t border-border/60 bg-background px-4 py-2 md:hidden">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-2 py-3 text-lg font-display font-medium uppercase tracking-wide text-white"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </div>
  );
}
