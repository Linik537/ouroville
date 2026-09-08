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
import { useEffect, useRef, useState, type ComponentType } from "react";
import { brl, formatCarName, km, SITE, whatsappLink } from "@/lib/site";
import { carTitle, PLACEHOLDER_CAR, supabase, type Carro } from "@/lib/supabase";
import { useWhatsAppMessage } from "@/components/site/WhatsAppFloater";

async function fetchCarro(id: number) {
  const { data, error } = await supabase.from("carros").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Carro | null) ?? null;
}

export const Route = createFileRoute("/carros/$marca/$modelo/$ano/$id")({
  head: ({ params }) => {
    const nome = `${params.marca} ${params.modelo} ${params.ano}`.replace(/-/g, " ").toUpperCase();
    const title = `${nome} à venda em Uberlândia MG - ${SITE.name}`;
    const description = `${nome} disponível na Ouroville Motors em Uberlândia (MG). Confira fotos, ficha técnica, preço e entre em contato via WhatsApp.`;
    const canonicalUrl = `${SITE.url}/carros/${params.marca}/${params.modelo}/${params.ano}/${params.id}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: `${nome.toLowerCase()}, comprar ${params.modelo.replace(/-/g, " ")}, ${params.marca.replace(/-/g, " ")} uberlandia, seminovos uberlandia` },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: canonicalUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
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
  const [anterior, setAnterior] = useState<number | null>(null);
  const [imagemEntrando, setImagemEntrando] = useState(true);
  const pausaAte = useRef(0);
  const transicao = useRef<number | null>(null);
  const inicioMiniaturasRef = useRef(0);

  const fotos = carro?.fotos?.length ? carro.fotos : [PLACEHOLDER_CAR];

  useEffect(() => {
    if (fotos.length < 2) return;
    const timer = window.setInterval(() => {
      if (Date.now() < pausaAte.current) return;
      trocarFoto((ativa + 1) % fotos.length);
    }, 4000);
    return () => {
      window.clearInterval(timer);
      if (transicao.current) window.clearTimeout(transicao.current);
    };
  }, [ativa, fotos.length]);

  function trocarFoto(indice: number) {
    if (indice === ativa) return;
    if (indice < inicioMiniaturasRef.current || indice >= inicioMiniaturasRef.current + janelaMiniaturas) {
      inicioMiniaturasRef.current = Math.min(
        Math.max(0, indice - 2),
        Math.max(0, fotos.length - janelaMiniaturas),
      );
    }
    setAnterior(ativa);
    setImagemEntrando(false);
    setAtiva(indice);
    window.setTimeout(() => setImagemEntrando(true), 20);
    if (transicao.current) window.clearTimeout(transicao.current);
    transicao.current = window.setTimeout(() => setAnterior(null), 420);
  }

  function selecionarFoto(indice: number) {
    pausaAte.current = Date.now() + 12000;
    trocarFoto(indice);
  }

  function moverGaleria(direcao: -1 | 1) {
    const proxima = (ativa + direcao + fotos.length) % fotos.length;
    inicioMiniaturasRef.current = Math.min(
      Math.max(0, proxima - 2),
      Math.max(0, fotos.length - Math.min(5, fotos.length)),
    );
    selecionarFoto(proxima);
  }

  const janelaMiniaturas = Math.min(5, fotos.length);
  const inicioMiniaturas = inicioMiniaturasRef.current;
  const miniaturas = fotos.slice(inicioMiniaturas, inicioMiniaturas + janelaMiniaturas);
  const quilometragem = carro?.quilometragem ?? (carro?.marca.toUpperCase() === "BYD" ? 0 : null);
  const nomeMarca = carro ? formatCarName(carro.marca) : "";
  const nomeModelo = carro ? formatCarName(carro.modelo) : "";
  const nomeCarro = carro ? `${nomeMarca} ${nomeModelo} ${carro.ano}` : "";

  const mensagemWhatsApp = carro ? `Olá! Tenho interesse no ${carTitle(carro)} anunciado no site.` : null;
  useWhatsAppMessage(mensagemWhatsApp);

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

  const ficha: FichaItem[] = [
    { label: "Ano", value: `${carro.ano}${carro.ano_modelo ? `/${carro.ano_modelo}` : ""}`, Icon: CalendarDays },
    { label: "Quilometragem", value: km(quilometragem), Icon: Gauge },
    { label: "Câmbio", value: carro.cambio ?? "-", Icon: Cog },
    { label: "Combustível", value: carro.combustivel ?? "-", Icon: Fuel },
    { label: "Cor", value: carro.cor ?? "-", Icon: Palette },
    { label: "Versão", value: carro.versao ?? "-", Icon: Cog },
  ];

  const carSchema = {
    "@context": "https://schema.org",
    "@type": "Car",
    "name": nomeCarro,
    "brand": {
      "@type": "Brand",
      "name": nomeMarca,
    },
    "model": nomeModelo,
    "vehicleModelDate": String(carro.ano),
    "fuelType": carro.combustivel || undefined,
    "vehicleTransmission": carro.cambio || undefined,
    "color": carro.cor || undefined,
    "mileageFromOdometer":
      quilometragem != null
        ? {
            "@type": "QuantitativeValue",
            "value": quilometragem,
            "unitCode": "KMT",
          }
        : undefined,
    "image": fotos,
    "description":
      carro.descricao ||
      `${nomeCarro} disponível na Ouroville Motors em Uberlândia MG.`,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "BRL",
      "price": carro.preco ?? 0,
      "availability":
        carro.status === "disponivel"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/UsedCondition",
      "seller": {
        "@type": "AutoDealer",
        "name": SITE.name,
        "telephone": `+${SITE.phoneDigits}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": SITE.streetAddress,
          "addressLocality": SITE.city,
          "addressRegion": SITE.state,
          "addressCountry": SITE.country,
        },
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Início",
        "item": `${SITE.url}/`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Estoque",
        "item": `${SITE.url}/estoque`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": nomeCarro,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav className="text-xs text-muted-foreground">
        <Link to="/estoque" className="transition hover:text-primary">Estoque</Link> / {nomeCarro}
      </nav>

      <div className="mt-5 grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-8">
        <div>
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border/70 bg-muted">
            {anterior !== null && (
              <img
                src={fotos[anterior] ?? fotos[0]}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[420ms] ease-out"
                style={{ opacity: anterior === null ? 0 : 1 }}
              />
            )}
            <img
              src={fotos[ativa] ?? fotos[0]}
              alt={`${carTitle(carro)} - foto ${ativa + 1}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[420ms] ease-out"
              style={{ opacity: imagemEntrando ? 1 : 0 }}
            />
          </div>
          {fotos.length > 1 && (
            <div className="mt-3 flex w-full items-center gap-2">
              {fotos.length > 5 && (
                <button
                  type="button"
                  onClick={() => moverGaleria(-1)}
                  aria-label="Ver fotos anteriores"
                  className="flex h-20 w-8 shrink-0 items-center justify-center rounded-md border border-border text-xl text-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
                  disabled={inicioMiniaturas === 0}
                >
                  &#8249;
                </button>
              )}
              <div className="grid min-w-0 flex-1 grid-cols-5 gap-2">
              {miniaturas.map((f, localIndex) => {
                const i = inicioMiniaturas + localIndex;
                return (
                <button
                  key={f + i}
                  type="button"
                  onClick={() => {
                    inicioMiniaturasRef.current = Math.min(
                      Math.max(0, i - 2),
                      Math.max(0, fotos.length - janelaMiniaturas),
                    );
                    selecionarFoto(i);
                  }}
                  aria-label={`Ver foto ${i + 1}`}
                  className={`aspect-[7/5] min-w-0 overflow-hidden rounded-md border ${i === ativa ? "border-primary" : "border-border"}`}
                >
                  <img src={f} alt={`${carTitle(carro)} miniatura ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                </button>
                );
              })}
              </div>
              {fotos.length > 5 && (
                <button
                  type="button"
                  onClick={() => moverGaleria(1)}
                  aria-label="Ver próximas fotos"
                  className="flex h-20 w-8 shrink-0 items-center justify-center rounded-md border border-border text-xl text-foreground transition hover:border-primary hover:text-primary disabled:opacity-40"
                  disabled={inicioMiniaturas + janelaMiniaturas >= fotos.length}
                >
                  &#8250;
                </button>
              )}
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
            href={whatsappLink(mensagemWhatsApp ?? "")}
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
