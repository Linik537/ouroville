import { MessageCircle, Phone } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export function WhatsAppFloater() {
  return (
    <a
      href={whatsappLink(`Olá! Vim pelo site da ${SITE.name}.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white text-green-600 shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-background"
    >
      <span className="relative flex items-center justify-center">
        <MessageCircle className="h-7 w-7" aria-hidden />
        <Phone className="absolute h-3.5 w-3.5" aria-hidden />
      </span>
    </a>
  );
}
