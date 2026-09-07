import { MessageCircle, Phone } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export function WhatsAppFloater() {
  return (
    <a
      href={whatsappLink(`Olá! Vim pelo site da ${SITE.name}.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background"
    >
      <span className="relative flex h-28 w-28 items-center justify-center">
        <MessageCircle className="relative h-28 w-28 text-white" strokeWidth={1.5} aria-hidden />
        <Phone className="absolute h-10 w-10 text-white" strokeWidth={2.25} aria-hidden />
      </span>
    </a>
  );
}
