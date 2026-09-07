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
      <span className="relative flex h-14 w-14 items-center justify-center">
        {/* Fundo preto que preenche o interior do ícone de chat sem ultrapassar as bordas */}
        <span className="absolute h-9 w-9 rounded-full bg-background" aria-hidden />
        <MessageCircle className="relative h-14 w-14 text-white" strokeWidth={1.75} aria-hidden />
        <Phone className="absolute h-5 w-5 text-white" strokeWidth={2.25} aria-hidden />
      </span>
    </a>
  );
}
