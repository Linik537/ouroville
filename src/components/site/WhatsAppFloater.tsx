import { MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export function WhatsAppFloater() {
  return (
    <a
      href={whatsappLink("Olá! Qual carro a Ouroville recomenda em 2026?")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="gold-glow fixed bottom-4 right-4 z-50 flex h-[5.25rem] w-[5.25rem] cursor-pointer items-center justify-center rounded-full bg-gold shadow-[0_0_22px_rgba(218,165,32,0.55)] transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background sm:bottom-6 sm:right-6 sm:h-24 sm:w-24"
    >
      <span className="absolute inset-0 rounded-full bg-gold" aria-hidden />
      <MessageCircle className="relative z-10 h-10 w-10 text-primary-foreground sm:h-12 sm:w-12" strokeWidth={1.8} aria-hidden />
    </a>
  );
}
