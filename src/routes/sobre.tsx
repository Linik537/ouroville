import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";
import autoMotorsLogo from "@/assets/auto-motors.png";
import { SITE, getAutoDealerSchema, whatsappLink } from "@/lib/site";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: `Sobre a ${SITE.name} : Concessionária em Uberlândia MG` },
      {
        name: "description",
        content: `Conheça a história da Ouroville Motors, nossa parceria com a Auto Motors, localização na ${SITE.address}, horários e formas de contato.`,
      },
      {
        name: "keywords",
        content:
          "sobre ouroville motors, auto motors, parceria auto motors, concessionaria avenida joao pinheiro, contato ouroville motors, endereco ouroville motors uberlandia",
      },
      { property: "og:title", content: `Sobre a ${SITE.name} : Uberlândia MG` },
      {
        property: "og:description",
        content:
          "História, valores, parceria com a Auto Motors, endereço e contato da Ouroville Motors em Uberlândia MG.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/sobre` },
      { property: "og:image", content: SITE.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `Sobre a ${SITE.name}` },
      { name: "twitter:description", content: SITE.description },
    ],
    links: [{ rel: "canonical", href: `${SITE.url}/sobre` }],
  }),
  component: Sobre,
});

function Sobre() {
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
        revisão antes de ser anunciado. Valorizamos a honestidade na negociação, o pós-venda próximo
        e o respeito pelo dinheiro do cliente.
      </p>

      <section className="relative mt-10 overflow-hidden rounded-2xl border border-primary/30 bg-card p-6 shadow-[0_18px_45px_rgba(0,0,0,0.2)] sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex w-full shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/35 px-6 py-5 sm:w-60">
            <img
              src={autoMotorsLogo}
              alt="Auto Motors, concessionária multimarcas parceira da Ouroville Motors"
              width={182}
              height={87}
              className="h-auto w-44 drop-shadow-[0_3px_8px_rgba(0,0,0,0.75)] sm:w-48"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Parceria estratégica
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Ouroville Motors + Auto Motors
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A Ouroville Motors é parceira da concessionária multimarcas Auto Motors. Essa união
              aproxima experiência e conhecimento do mercado automotivo para fortalecer uma jornada
              de compra transparente, segura e bem acompanhada.
            </p>
          </div>
        </div>
      </section>

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

      <div className="mt-10 overflow-hidden rounded-xl border border-border/70">
        <iframe
          title="Mapa da localização da Ouroville Motors"
          src={SITE.mapEmbed}
          className="h-80 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
