import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Cog,
  Fuel,
  Gauge,
  MessageCircle,
  Palette,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { brl, formatCarName, km, whatsappLink } from "@/lib/site";
import { carTitle, PLACEHOLDER_CAR, supabase, type Carro } from "@/lib/supabase";

async function fetchCarro(id: number) {
  const { data, error } = await supabase.from("carros").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Carro | null) ?? null;
}

export const Route = createFileRoute("/carros/$marca/$modelo/$ano/$id")({
  head: ({ params }) => {
    const nome = `${params.marca} ${params.modelo} ${params.ano}`.replace(/-/g, " ").toUpperCase();
    const title = `${nome} à venda — Ouroville Motors`;
    const description = `${nome} disponível na Ouroville Motors em Uberlândia MG. Veja fotos, ficha técnica, preço e fale com um consultor pelo WhatsApp.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: Detalhe,
});

type FichaItem = {
  label: string;
  value: string;
  Icon: ComponentType<{ className?: string }>;
};

function Detalhe() {
  const { id } = Route.useParams();
  const { data: carro, isLoading } = useQuery({
    queryKey: ["carro", id],
    queryFn: () => fetchCarro(Number(id)),
  });
  const [ativa, setAtiva] = useState(0);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="aspect-video w-full animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!carro || carro.status === "vendido") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">Veículo indisponível</h1>
        <p className="mt-2 text-sm text-muted-foreground">Este carro já foi vendido ou não está mais no estoque.</p>
        <Link to="/estoque" className="mt-6 inline-block rounded-full bg-gold px-6 py-3 text-sm font-semibold text-white">
          Ver estoque
        </Link>
      </div>
    );
  }

  const fotos = carro.fotos?.length ? carro.fotos : [PLACEHOLDER_CAR];
  const quilometragem = carro.quilometragem ?? (carro.marca.toUpperCase() === "BYD" ? 0 : null);
  const nomeMarca = formatCarName(carro.marca);
  const nomeModelo = formatCarName(carro.modelo);
  const nomeCarro = `${nomeMarca} ${nomeModelo} ${carro.ano}`;
  const ficha: FichaItem[] = [
    { label: "Ano", value: `${carro.ano}${carro.ano_modelo ? `/${carro.ano_modelo}` : ""}`, Icon: CalendarDays },
    { label: "Quilometragem", value: km(quilometragem), Icon: Gauge },
    { label: "Câmbio", value: carro.cambio ?? "-", Icon: Cog },
    { label: "Combustível", value: carro.combustivel ?? "-", Icon: Fuel },
    { label: "Cor", value: carro.cor ?? "-", Icon: Palette },
    { label: "Versão", value: carro.versao ?? "-", Icon: Cog },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <nav className="text-xs text-muted-foreground">
        <Link to="/estoque" className="transition hover:text-primary">Estoque</Link> / {nomeCarro}
      </nav>

      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
        <div>
          <img
            src={fotos[ativa] ?? fotos[0]}
            alt={`${carTitle(carro)} — foto ${ativa + 1}`}
            loading="lazy"
            className="aspect-4/3 w-full rounded-xl border border-border/70 object-cover"
          />
          {fotos.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto">
              {fotos.map((f, i) => (
                <button
                  key={f + i}
                  onClick={() => setAtiva(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-md border ${i === ativa ? "border-primary" : "border-border"}`}
                >
                  <img src={f} alt={`${carTitle(carro)} miniatura ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {carro.descricao && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground">Descrição</h2>
              <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{carro.descricao}</p>
            </section>
          )}
        </div>

        <aside>
          <h1 className="font-oswald text-[30px] font-semibold leading-tight tracking-wide sm:text-[32px]">
            <span className="text-white">{nomeMarca}</span>{" "}
            <span className="text-gold">{nomeModelo}</span>{" "}
            <span className="text-white">{carro.ano}</span>
          </h1>
          <p className="mt-1 text-base text-muted-foreground">{carro.versao}</p>
          <p className="gold-glow mt-10 inline-flex rounded-full bg-gold px-6 py-3 font-inter text-xl font-semibold tracking-wide text-black sm:text-2xl">
            {brl(carro.preco)}
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            {ficha.map(({ label, value, Icon }) => (
              <div key={label} className="min-w-0 rounded-lg border border-border/70 bg-card px-3 py-3">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span className="truncate">{label}</span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <a
            href={whatsappLink(`Olá! Tenho interesse no ${carTitle(carro)} anunciado no site.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="gold-glow mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-base font-semibold text-black shadow-lg transition hover:brightness-110"
          >
            <MessageCircle className="h-5 w-5" /> Tenho interesse
          </a>
        </aside>
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/estoque"
          className="gold-glow inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3 text-base font-semibold text-black shadow-lg transition hover:brightness-110"
        >
          Ver o estoque completo
        </Link>
      </div>
    </div>
  );
}
