import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/financie")({
  head: () => ({
    meta: [
      { title: `Financiamento de Veículos em Uberlândia — ${SITE.name}` },
      {
        name: "description",
        content: "Financie seu carro na Ouroville Motors em Uberlândia: aprovação rápida, taxas competitivas, entrada facilitada e simulação pelo WhatsApp.",
      },
      { name: "keywords", content: "financiamento de carros uberlandia, simular financiamento automotivo, aprovação de credito carro, financiar seminovo uberlandia" },
      { property: "og:title", content: `Financiamento de Veículos — ${SITE.name}` },
      { property: "og:description", content: "Simule seu financiamento pelo WhatsApp com a equipe Ouroville Motors em Uberlândia." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/financie` },
      { property: "og:image", content: SITE.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `Financiamento de Carros — ${SITE.name}` },
      { name: "twitter:description", content: "Financiamento facilitado para carros novos e seminovos em Uberlândia." },
    ],
    links: [
      { rel: "canonical", href: `${SITE.url}/financie` },
    ],
  }),
  component: Financie,
});

const passos = [
  { icon: MessageCircle, t: "1. Fale com a gente", d: "Chame no WhatsApp e diga qual veículo te interessa." },
  { icon: FileCheck2, t: "2. Envie os documentos", d: "RG/CNH, CPF, comprovante de renda e de residência." },
  { icon: ShieldCheck, t: "3. Aprovação", d: "Consultamos os principais bancos e buscamos a melhor taxa." },
  { icon: Phone, t: "4. Retirada", d: "Assinatura digital e entrega do carro revisado na loja." },
];

function Financie() {
  const financialSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Financiamento de Veículos Ouroville Motors",
    "description": "Financiamento veicular facilitado com os principais bancos em Uberlândia MG.",
    "provider": {
      "@type": "AutoDealer",
      "name": SITE.name,
      "telephone": `+${SITE.phoneDigits}`,
    },
    "feesAndCommissionsSpecification": "Simulação gratuita e personalizada via WhatsApp.",
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialSchema) }}
      />
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Financiamento sem complicação</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Trabalhamos com os principais bancos do país para encontrar a melhor condição para o seu perfil.
        Entrada a partir de 10%, parcelas em até 60 meses e resposta no mesmo dia.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {passos.map((p) => (
          <div key={p.t} className="rounded-xl border border-border/70 bg-card p-6">
            <p.icon className="h-7 w-7 text-primary" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold text-foreground">{p.t}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{p.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-primary/40 bg-card p-8 text-center">
        <h2 className="text-xl font-semibold text-foreground">Quer simular agora?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ligue ou mande mensagem para {SITE.phoneDisplay}. Atendemos {SITE.hours.toLowerCase()}.
        </p>
        <a
          href={whatsappLink("Olá! Gostaria de simular um financiamento na Ouroville Motors.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
        >
          <MessageCircle className="h-4 w-4" /> Simular pelo WhatsApp
        </a>
      </div>
    </div>
  );
}
