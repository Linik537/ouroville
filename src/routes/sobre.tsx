import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SITE, getAutoDealerSchema, whatsappLink } from "@/lib/site";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: `Sobre a ${SITE.name} : Concessionária em Uberlândia MG` },
      {
        name: "description",
        content: `Conheça a história da Ouroville Motors, nossa localização na ${SITE.address}, horários de atendimento e formas de contato direto.`,
      },
      { name: "keywords", content: "sobre ouroville motors, concessionaria avenida joao pinheiro, contato ouroville motors, endereco ouroville motors uberlandia" },
      { property: "og:title", content: `Sobre a ${SITE.name} : Uberlândia MG` },
      { property: "og:description", content: "História, valores, endereço e contato da Ouroville Motors em Uberlândia MG." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/sobre` },
      { property: "og:image", content: SITE.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `Sobre a ${SITE.name}` },
      { name: "twitter:description", content: SITE.description },
    ],
    links: [
      { rel: "canonical", href: `${SITE.url}/sobre` },
    ],
  }),
  component: Sobre,
});

function Sobre() {
  const [enviando, setEnviando] = useState(false);
  const [consent, setConsent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!consent) {
      toast.error("É necessário aceitar o uso dos dados.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.from("leads").insert({
      nome: String(fd.get("nome") ?? ""),
      telefone: String(fd.get("telefone") ?? ""),
      mensagem: String(fd.get("mensagem") ?? ""),
      consentimento: true,
    });
    setEnviando(false);
    if (error) {
      toast.error("Não foi possível enviar. Tente pelo WhatsApp.");
      return;
    }
    toast.success("Mensagem enviada! Entraremos em contato em breve.");
    form.reset();
    setConsent(false);
  }

  const inputCls =
    "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getAutoDealerSchema()) }}
      />
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Sobre a {SITE.name}</h1>
      <p className="mt-4 max-w-3xl text-muted-foreground">
        Nascemos em Uberlândia com um propósito simples: tornar a compra de um carro uma experiência
        transparente e tranquila. Cada veículo do nosso estoque passa por checagem de procedência e
        revisão antes de ser anunciado. Valorizamos a honestidade na negociação, o pós-venda próximo e
        o respeito pelo dinheiro do cliente.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card p-6">
          <MapPin className="h-6 w-6 text-primary" aria-hidden />
          <h2 className="mt-3 font-semibold text-foreground">Endereço</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.address}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card p-6">
          <Clock className="h-6 w-6 text-primary" aria-hidden />
          <h2 className="mt-3 font-semibold text-foreground">Horário</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.hours}</p>
        </div>
        <a
          href={whatsappLink("Olá! Gostaria de falar com a Ouroville Motors.")}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-border/70 bg-card p-6 transition hover:border-primary"
        >
          <Phone className="h-6 w-6 text-primary" aria-hidden />
          <h2 className="mt-3 font-semibold text-foreground">Contato</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.phoneDisplay}</p>
        </a>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border/70">
          <iframe
            title="Mapa da localização da Ouroville Motors"
            src={SITE.mapEmbed}
            className="h-80 w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <form onSubmit={onSubmit} className="rounded-xl border border-border/70 bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">Fale conosco</h2>
          <div className="mt-4 space-y-4">
            <label className="block text-xs text-muted-foreground">
              Nome
              <input name="nome" required className={inputCls} />
            </label>
            <label className="block text-xs text-muted-foreground">
              Telefone
              <input name="telefone" required className={inputCls} placeholder="(34) 9 0000-0000" />
            </label>
            <label className="block text-xs text-muted-foreground">
              Mensagem
              <textarea name="mensagem" rows={4} className={inputCls} />
            </label>
            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              Autorizo o uso dos meus dados para contato, conforme a LGPD.
            </label>
            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {enviando ? "Enviando..." : "Enviar mensagem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
