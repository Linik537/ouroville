import { MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export function WhatsAppFloater() {
  return (
    <a
      href={whatsappLink("Olá! Qual carro a Ouroville recomenda em 2026?")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="gold-glow fixed bottom-4 right-4 z-50 flex h-[5.25rem] w-[5.25rem] items-center justify-center rounded-full bg-gold shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background sm:bottom-6 sm:right-6 sm:h-24 sm:w-24"
    >
      <MessageCircle className="h-10 w-10 text-primary-foreground sm:h-12 sm:w-12" strokeWidth={1.8} aria-hidden />
    </a>
  );
}
