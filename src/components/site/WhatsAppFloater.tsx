import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

const DEFAULT_MESSAGE = "Olá! Qual carro a Ouroville recomenda em 2026?";

type WhatsAppContextType = {
  message: string | null;
  carId: number | null;
  setMessage: (msg: string | null, carId?: number | null) => void;
};

const WhatsAppContext = createContext<WhatsAppContextType>({
  message: null,
  carId: null,
  setMessage: () => {},
});

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [carId, setCarId] = useState<number | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("ouroville-site-visit")) return;
    sessionStorage.setItem("ouroville-site-visit", "1");
    void trackAnalyticsEvent("site_visit");
  }, []);

  return (
    <WhatsAppContext.Provider value={{ message, carId, setMessage: (msg, id = null) => { setMessage(msg); setCarId(id); } }}>
      {children}
    </WhatsAppContext.Provider>
  );
}

export function useWhatsAppMessage(message: string | null | undefined, carId?: number) {
  const { setMessage } = useContext(WhatsAppContext);

  useEffect(() => {
    if (message) {
      setMessage(message, carId);
      return () => setMessage(null, null);
    }
  }, [message, carId, setMessage]);
}

export function useWhatsAppContext() {
  return useContext(WhatsAppContext);
}

export function WhatsAppFloater() {
  const { message, carId } = useContext(WhatsAppContext);
  const activeMessage = message || DEFAULT_MESSAGE;

  return (
    <a
      href={carId ? `/interesse/${carId}` : whatsappLink(activeMessage)}
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

