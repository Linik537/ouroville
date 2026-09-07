import { MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export function WhatsAppFloater() {
  return (
    <a
      href={whatsappLink("Olá! Qual carro a Ouroville recomenda em 2026?")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex h-[5.25rem] w-[5.25rem] cursor-pointer items-center justify-center rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background sm:bottom-6 sm:right-6 sm:h-24 sm:w-24"
    >
      <span className="gold-glow relative flex h-full w-full items-center justify-center rounded-full bg-gold" aria-hidden="true">
        <MessageCircle className="relative z-10 h-10 w-10 text-primary-foreground sm:h-12 sm:w-12" strokeWidth={1.8} aria-hidden />
      </span>
    </a>
  );
}
