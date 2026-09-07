import { MessageCircle } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export function WhatsAppFloater() {
  return (
    <a
      href={whatsappLink(`Olá! Vim pelo site da ${SITE.name}.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <MessageCircle className="h-7 w-7 text-primary-foreground sm:h-8 sm:w-8" strokeWidth={1.8} aria-hidden />
    </a>
  );
}
