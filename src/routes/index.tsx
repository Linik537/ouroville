import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Award, Search, ShieldCheck, Users } from "lucide-react";
import { useState } from "react";
import heroCar from "@/assets/hero-car.jpg";
import { CarCard, CarCardSkeleton } from "@/components/site/CarCard";
import { HeroHeadlights } from "@/components/site/HeroHeadlights";
import { HoursBar } from "@/components/site/HoursBar";
import { SITE } from "@/lib/site";
import { fetchCarros } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ouroville Motors" },
      {
        name: "description",
        content:
          "Concessionária Ouroville Motors em Uberlândia (MG). Veículos revisados, procedência garantida e financiamento facilitado. Confira o estoque.",
      },
      { property: "og:title", content: "Ouroville Motors — Veículos em Uberlândia MG" },
      {
        property: "og:description",
        content: "Estoque selecionado de carros seminovos e novos com garantia e financiamento em Uberlândia.",
      },
    ],
  }),
  component: Home,
});

const depoimentos = [
  { nome: "Rafael M.", texto: "Atendimento impecável, carro entregue revisado e no prazo combinado." },
  { nome: "Juliana S.", texto: "Consegui financiamento aprovado no mesmo dia. Equipe muito transparente." },
  { nome: "Carlos E.", texto: "Melhor negociação da cidade. Já é o segundo carro que compro com eles." },
];

function Home() {
  const navigate = useNavigate();
  const [termo, setTermo] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["carros", "home"],
    queryFn: () => fetchCarros({ limit: 6 }),
  });

  const marcas = Array.from(new Set((data ?? []).map((c) => c.marca))).slice(0, 12);

  return (
    <div>
      <HoursBar />
      <section className="relative overflow-hidden border-b border-border/60">
        <img
          src={heroCar}
          alt="Carro premium em showroom escuro com iluminação dourada"
          width={1920}
          height={1088}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background/95" />
        <HeroHeadlights />
        <div className="relative mx-auto max-w-5xl px-4 py-28 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Ouroville Motors</p>
          <h1 className="mt-5 font-display text-5xl font-bold uppercase leading-[0.95] tracking-wide text-foreground sm:text-7xl">
            Encontre o seu próximo carro, <span className="text-gold">no padrão de ouro</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-foreground">
            Estoque selecionado, procedência checada e financiamento sem complicação.
          </p>

          <form
            className="mx-auto mt-10 flex max-w-2xl overflow-hidden rounded-full border border-primary/50 bg-card/90"
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
              className="flex-1 bg-transparent px-6 py-4 text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-gold px-6 text-base font-semibold text-primary-foreground transition hover:brightness-110"
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
      </section>

      <div className="relative z-30 bg-background">
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Últimas novidades</h2>
          <Link to="/estoque" className="text-sm font-semibold text-primary hover:underline">
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
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-base font-semibold text-black shadow-lg transition hover:brightness-110"
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

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">O que dizem nossos clientes</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {depoimentos.map((d) => (
            <figure key={d.nome} className="rounded-xl border border-border/70 bg-card p-6">
              <blockquote className="text-sm text-muted-foreground">“{d.texto}”</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-primary">{d.nome}</figcaption>
            </figure>
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
