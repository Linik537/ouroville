import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { brl, km, whatsappLink } from "@/lib/site";
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
        <Link to="/estoque" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          Ver estoque
        </Link>
      </div>
    );
  }

  const fotos = carro.fotos?.length ? carro.fotos : [PLACEHOLDER_CAR];
  const ficha: [string, string][] = [
    ["Ano", `${carro.ano}${carro.ano_modelo ? `/${carro.ano_modelo}` : ""}`],
    ["Quilometragem", km(carro.quilometragem)],
    ["Câmbio", carro.cambio ?? "-"],
    ["Combustível", carro.combustivel ?? "-"],
    ["Cor", carro.cor ?? "-"],
    ["Versão", carro.versao ?? "-"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/estoque" className="hover:text-primary">Estoque</Link> / {carTitle(carro)}
      </nav>
      <h1 className="mt-3 text-3xl font-bold text-foreground">{carTitle(carro)}</h1>
      <p className="text-sm text-muted-foreground">{carro.versao}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
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
                <button key={f + i} onClick={() => setAtiva(i)} aria-label={`Ver foto ${i + 1}`}
                  className={`h-20 w-28 shrink-0 overflow-hidden rounded-md border ${i === ativa ? "border-primary" : "border-border"}`}>
                  <img src={f} alt={`${carTitle(carro)} miniatura ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {carro.descricao && (
            <section className="mt-8">
              <h2 className="text-lg font-semibold text-foreground">Descrição</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{carro.descricao}</p>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-border/70 bg-card p-6">
          <p className="text-sm text-muted-foreground">Preço</p>
          <p className="text-3xl font-extrabold text-primary">{brl(carro.preco)}</p>
          <a
            href={whatsappLink(`Olá! Tenho interesse no ${carTitle(carro)} anunciado no site da Ouroville Motors.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" /> Tenho interesse
          </a>
          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wider text-foreground">Ficha técnica</h2>
          <dl className="mt-3 divide-y divide-border/60 text-sm">
            {ficha.map(([k, v]) => (
              <div key={k} className="flex justify-between py-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <section className="mt-12 text-center">
        <Link
          to="/estoque"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition hover:brightness-110"
        >
          Ver o estoque completo
        </Link>
      </section>
    </div>
  );
}
