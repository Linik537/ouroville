import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Award, Search, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import heroCar from "@/assets/hero-car.jpg";
import { CarCard, CarCardSkeleton } from "@/components/site/CarCard";
import { HeroHeadlights } from "@/components/site/HeroHeadlights";
import { SITE, getAutoDealerSchema } from "@/lib/site";
import { fetchCarros } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} : Concessionária de Carros Seminovos e Novos em Uberlândia MG` },
      {
        name: "description",
        content:
          "Concessionária Ouroville Motors em Uberlândia (MG). Veículos revisados, procedência garantida e financiamento facilitado. Confira o estoque completo.",
      },
      { name: "keywords", content: "carros uberlandia, seminovos uberlandia, concessionaria uberlandia, comprar carro uberlandia, ouroville motors" },
      { property: "og:title", content: `${SITE.name} : Veículos Seminovos e Novos em Uberlândia MG` },
      {
        property: "og:description",
        content: "Estoque selecionado de carros seminovos e novos com garantia de procedência e financiamento em Uberlândia.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/` },
      { property: "og:image", content: SITE.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${SITE.name} : Veículos em Uberlândia` },
      { name: "twitter:description", content: SITE.description },
    ],
    links: [
      { rel: "canonical", href: `${SITE.url}/` },
    ],
  }),
  component: Home,
});

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE.name,
  "url": SITE.url,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${SITE.url}/estoque?termo={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

function Home() {
  const navigate = useNavigate();
  const [termo, setTermo] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["carros", "home"],
    queryFn: () => fetchCarros({ novidades: true, limit: 6 }),
  });

  const marcas = Array.from(new Set((data ?? []).map((c) => c.marca))).slice(0, 12);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getAutoDealerSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <section className="relative overflow-hidden border-y border-border/60">
        <img
          src={heroCar}
          alt="Carro premium em showroom escuro com iluminação dourada"
          width={1920}
          height={1088}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95" />
        <HeroHeadlights />
        <div className="relative mx-auto max-w-5xl px-4 pb-36 pt-28 text-center sm:pb-40 sm:pt-32">
          <div className="relative -top-1">
            <h1 className="mt-0 font-oswald text-[60px] font-bold leading-[0.95] tracking-wide text-foreground">
              Encontre o seu próximo carro, no padrão <span className="text-gold">Ouro</span><span className="text-foreground">ville</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-foreground/80">
              Segunda-Feira ao Sábado - 8h às 18h · Avenida João Pinheiro, 3488
            </p>
          </div>

          <div className="relative top-3">
            <form
              className="mx-auto mt-10 flex max-w-2xl overflow-visible rounded-full border border-primary/50 bg-card/90"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/estoque", search: { q: termo || undefined } });
              }}
            >
              <input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Digite marca, modelo ou ano"
                aria-label="Buscar veículo"
                className="min-w-0 flex-1 rounded-l-full bg-transparent px-6 py-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="gold-glow inline-flex items-center gap-2 rounded-r-full bg-gold px-6 text-base font-semibold text-primary-foreground transition hover:brightness-110"
              >
                <Search className="h-5 w-5" /> Buscar
              </button>
            </form>
            {marcas.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {marcas.map((m) => (
                  <Link
                    key={m}
                    to="/estoque"
                    search={{ marca: m }}
                    className="rounded-full border border-border px-5 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    {m}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="relative z-30 bg-background">
      <section className="mx-auto max-w-7xl px-4 pb-3 pt-12 sm:pt-16">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card px-5 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)] sm:px-8 sm:py-7">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-gold/10 blur-3xl" aria-hidden />
          <div className="relative flex items-center gap-4 sm:gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 sm:h-14 sm:w-14">
              <ShieldCheck className="h-6 w-6 text-primary sm:h-7 sm:w-7" aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Seu próximo carro, com tranquilidade</p>
              <p className="mt-1 text-base font-medium leading-snug text-foreground sm:text-xl">Veículos revisados, laudo cautelar aprovado e financiamento em minutos.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Últimas novidades</h2>
          <Link to="/estoque" className="shrink-0 rounded-full border border-primary/60 px-4 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10">
            Ver todo estoque
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <CarCardSkeleton key={i} />)
            : (data ?? []).map((c) => <CarCard key={c.id} carro={c} />)}
        </div>
        {!isLoading && (data ?? []).length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/estoque"
              className="gold-glow inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-base font-semibold text-black shadow-lg transition hover:brightness-110"
            >
              Ver o estoque completo
            </Link>
          </div>
        )}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Estoque sendo atualizado. Fale com a gente pelo WhatsApp para conhecer os veículos disponíveis.
          </p>
        )}
      </section>

      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:grid-cols-3">
          {[
            { icon: Award, titulo: "Estoque Selecionado", texto: "Carros escolhidos com cuidado para você." },
            { icon: Users, titulo: "Atendimento personalizado", texto: "Acompanhamento próximo em cada etapa." },
            { icon: ShieldCheck, titulo: "Parceiros de financiamento", texto: "Principais bancos, aprovação rápida." },
          ].map((s) => (
            <div key={s.titulo} className="text-center">
              <s.icon className="mx-auto h-8 w-8 text-primary" aria-hidden />
              <h3 className="mt-3 text-lg font-semibold text-foreground">{s.titulo}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">Onde estamos</h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {SITE.address} · {SITE.hours}
          </p>
          <div className="mt-8 overflow-hidden rounded-xl border border-border/70">
            <iframe
              title={`Mapa de localização da ${SITE.name}`}
              src={SITE.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-96 w-full border-0"
            />
          </div>
        </div>
      </section>
      </div>
    </div>
  );
}
