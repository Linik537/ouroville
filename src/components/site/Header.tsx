import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/ouroville-logo.jpg";
import { SITE, whatsappLink } from "@/lib/site";

const nav = [
  { to: "/estoque", label: "ESTOQUE" },
  { to: "/sobre", label: "SOBRE" },
  { to: "/financie", label: "FINANCIE" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [barHeight, setBarHeight] = useState(56);
  const [offset, setOffset] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const showHours = !pathname.startsWith("/carros/");

  useEffect(() => {
    const measure = () => {
      if (barRef.current) setBarHeight(barRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      setOffset(Math.min(Math.max(y - 20, 0), barHeight));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [barHeight]);

  return (
    <div className="sticky top-0 z-50">
      {showHours && (
        <div
          ref={barRef}
          className="overflow-hidden bg-primary text-center font-sans font-medium text-primary-foreground"
          style={{
            height: Math.max(barHeight - offset, 0),
            opacity: barHeight > 0 ? 1 - offset / barHeight : 1,
          }}
        >
          <p className="px-4 py-2.5 text-sm sm:text-base">
            Horário de Funcionamento: Segunda-Feira ao Sábado - 8h às 18h · Avenida João Pinheiro, 3488
          </p>
        </div>
      )}

      <header className="border-b border-border/60 bg-background/95 backdrop-blur">
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
                className="rounded-md px-3 py-2 text-lg font-display font-semibold uppercase tracking-widest text-white transition hover:text-primary"
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
            className="hidden h-10 w-10 shrink-0 items-center justify-center text-white transition hover:text-primary md:inline-flex"
          >
            <Phone className="h-5 w-5" aria-hidden />
          </a>

          <a
            href={whatsappLink(`Olá! Vim pelo site da ${SITE.name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/90 md:ml-0"
          >
            <MessageCircle className="h-4 w-4 text-black" aria-hidden />
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
                className="block rounded-md px-2 py-3 text-base font-display font-medium uppercase tracking-wide text-white"
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
