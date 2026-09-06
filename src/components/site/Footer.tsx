import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, MapPin, Calendar, Phone } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">{SITE.name}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{SITE.address}</p>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.hours}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Contato</h3>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block text-sm text-muted-foreground hover:text-primary"
          >
            {SITE.phoneDisplay}
          </a>
          <p className="mt-1 text-sm text-muted-foreground">Atendimento também por WhatsApp</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Navegação</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/estoque" className="hover:text-primary">Estoque</Link></li>
            <li><Link to="/sobre" className="hover:text-primary">Sobre</Link></li>
            <li><Link to="/financie" className="hover:text-primary">Financie</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Redes sociais</h3>
          <div className="mt-3 flex gap-3">
            <a href="#" aria-label="Instagram" className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
