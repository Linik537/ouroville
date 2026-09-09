import { Link } from "@tanstack/react-router";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/ouroville-logo-ville.png";
import { SITE, whatsappLink } from "@/lib/site";
import { scrollToPageTop } from "@/lib/scroll";
import { trackAnalyticsEvent } from "@/lib/supabase";
import { useWhatsAppContext } from "@/components/site/WhatsAppFloater";

const nav = [
  { to: "/estoque", label: "ESTOQUE" },
  { to: "/sobre", label: "SOBRE" },
  { to: "/financie", label: "FINANCIE" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { message, carId } = useWhatsAppContext();
  const activeMessage = message || "Olá! Qual carro a Ouroville recomenda em 2026?";

  return (
    <div className="sticky top-0 z-50">
      <header className="border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            to="/"
            onClick={scrollToPageTop}
            className="flex items-center gap-3"
            aria-label={`${SITE.name} : página inicial`}
          >
            <img
              src={logo}
              alt={`Logo ${SITE.name}`}
              className="h-14 w-14 object-contain sm:h-16 sm:w-16"
            />
            <span className="hidden items-baseline gap-1 sm:flex">
              <span className="font-brand-primary text-2xl text-gold sm:text-3xl">Ouroville</span>
              <span className="font-brand-secondary text-2xl text-foreground sm:text-3xl">
                Motors
              </span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={n.to === "/estoque" ? scrollToPageTop : undefined}
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
            href={whatsappLink(activeMessage)}
            onClick={() => {
              if (carId) void trackAnalyticsEvent("whatsapp_click", carId);
            }}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-glow ml-auto inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-base font-semibold text-black transition hover:brightness-110 md:ml-0"
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
          <nav className="border-t border-border/60 bg-background/85 px-4 py-2 backdrop-blur-xl md:hidden">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => {
                  setOpen(false);
                  if (n.to === "/estoque") scrollToPageTop();
                }}
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
