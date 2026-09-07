import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { CarCard, CarCardSkeleton } from "@/components/site/CarCard";
import { SITE } from "@/lib/site";
import { fetchCarros } from "@/lib/supabase";

type EstoqueSearch = {
  q?: string | undefined;
  marca?: string | undefined;
  cambio?: string | undefined;
  combustivel?: string | undefined;
  anoMin?: number | undefined;
  precoMax?: number | undefined;
};

type Ordem =
  | "recentes"
  | "antigos"
  | "preco_asc"
  | "preco_desc"
  | "km"
  | "az";

export const Route = createFileRoute("/estoque")({
  validateSearch: (s: Record<string, unknown>): EstoqueSearch => {
    const q = typeof s['q'] === "string" ? s['q'] : undefined;
    const marca = typeof s['marca'] === "string" ? s['marca'] : undefined;
    const cambio = typeof s['cambio'] === "string" ? s['cambio'] : undefined;
    const combustivel = typeof s['combustivel'] === "string" ? s['combustivel'] : undefined;
    const anoMinRaw = s['anoMin'] ? Number(s['anoMin']) : undefined;
    const precoMaxRaw = s['precoMax'] ? Number(s['precoMax']) : undefined;
    return {
      q,
      marca,
      cambio,
      combustivel,
      anoMin: anoMinRaw && Number.isFinite(anoMinRaw) && anoMinRaw > 0 ? anoMinRaw : undefined,
      precoMax: precoMaxRaw && Number.isFinite(precoMaxRaw) && precoMaxRaw > 0 ? precoMaxRaw : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Estoque de Veículos Seminovos e Novos : Ouroville Motors Uberlândia" },
      {
        name: "description",
        content: "Confira todos os carros disponíveis na Ouroville Motors em Uberlândia MG. Filtre por marca, ano, faixa de preço, câmbio e combustível.",
      },
      { name: "keywords", content: "estoque de carros uberlandia, carros a venda uberlandia, seminovos uberlandia, filtro de carros" },
      { property: "og:title", content: "Estoque de Veículos : Ouroville Motors Uberlândia" },
      { property: "og:description", content: "Catálogo completo de carros seminovos e novos com garantia de procedência em Uberlândia." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE.url}/estoque` },
      { property: "og:image", content: SITE.ogImage },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Estoque de Carros : Ouroville Motors" },
      { name: "twitter:description", content: "Explore nosso estoque de veículos revisados em Uberlândia." },
    ],
    links: [
      { rel: "canonical", href: `${SITE.url}/estoque` },
    ],
  }),
  component: Estoque,
});

function Estoque() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/estoque" });
  const [termo, setTermo] = useState(search.q ?? "");
  const [ordem, setOrdem] = useState<Ordem>("recentes");

  const { data, isLoading } = useQuery({
    queryKey: ["carros", search],
    queryFn: () =>
      fetchCarros({
        termo: search.q,
        marca: search.marca,
        cambio: search.cambio,
        combustivel: search.combustivel,
        anoMin: search.anoMin,
        precoMax: search.precoMax,
      }),
  });

  const { data: todos } = useQuery({ queryKey: ["carros", "all"], queryFn: () => fetchCarros({}) });
  const marcas = Array.from(new Set((todos ?? []).map((c) => c.marca))).sort();

  const sorted = useMemo(() => sortCarros(data ?? [], ordem), [data, ordem]);

  const setFilter = (patch: Partial<EstoqueSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const selectCls =
    "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
  const orderSelectCls =
    "rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary w-full sm:w-auto sm:min-w-[190px]";

  return (
    <div className="relative z-30 bg-background">
      <HoursBar />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground">Estoque</h1>

        <form
          className="mt-6 flex overflow-hidden rounded-full border border-border bg-card"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter({ q: termo || undefined });
          }}
        >
          <input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Pesquisar marca, modelo ou ano..."
            aria-label="Pesquisar no estoque"
            className="flex-1 bg-transparent px-5 py-3 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button type="submit" className="bg-gold px-5 text-primary-foreground" aria-label="Buscar">
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-4 rounded-xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">Filtros</h2>
            <label className="block text-xs text-muted-foreground">
              Marca
              <select className={selectCls} value={search.marca ?? ""} onChange={(e) => setFilter({ marca: e.target.value || undefined })}>
                <option value="">Todas</option>
                {marcas.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label className="block text-xs text-muted-foreground">
              Câmbio
              <select className={selectCls} value={search.cambio ?? ""} onChange={(e) => setFilter({ cambio: e.target.value || undefined })}>
                <option value="">Todos</option>
                <option value="Manual">Manual</option>
                <option value="Automático">Automático</option>
              </select>
            </label>
            <label className="block text-xs text-muted-foreground">
              Combustível
              <select className={selectCls} value={search.combustivel ?? ""} onChange={(e) => setFilter({ combustivel: e.target.value || undefined })}>
                <option value="">Todos</option>
                <option value="Flex">Flex</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Diesel">Diesel</option>
                <option value="Elétrico">Elétrico</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </label>
            <label className="block text-xs text-muted-foreground">
              Ano a partir de
              <input type="number" className={selectCls} value={search.anoMin ?? ""} placeholder="2015"
                onChange={(e) => setFilter({ anoMin: e.target.value ? Number(e.target.value) : undefined })} />
            </label>
            <label className="block text-xs text-muted-foreground">
              Preço até (R$)
              <input type="number" className={selectCls} value={search.precoMax ?? ""} placeholder="150000"
                onChange={(e) => setFilter({ precoMax: e.target.value ? Number(e.target.value) : undefined })} />
            </label>
            <button
              type="button"
              onClick={() => { setTermo(""); navigate({ search: {} }); }}
              className="w-full rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-primary"
            >
              Limpar filtros
            </button>
          </aside>

          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{sorted.length}</strong> veículos encontrados
              </p>
              <label className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center">
                Ordenar por
                <select
                  className={orderSelectCls}
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as Ordem)}
                  aria-label="Ordenar veículos"
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="antigos">Menos recentes</option>
                  <option value="preco_asc">Menor preço</option>
                  <option value="preco_desc">Maior preço</option>
                  <option value="km">Menor kilometragem</option>
                  <option value="az">Ordem alfabética</option>
                </select>
              </label>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)
                : sorted.map((c) => <CarCard key={c.id} carro={c} />)}
            </div>
            {!isLoading && sorted.length === 0 && (
              <p className="rounded-xl border border-border/70 bg-card p-8 text-center text-sm text-muted-foreground">
                Nenhum veículo encontrado com esses filtros.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function sortCarros<T extends { id: number; marca: string; modelo: string; ano: number | null; ano_modelo: number | null; preco: number | null; quilometragem: number | null; created_at: string }>(
  rows: T[],
  ordem: Ordem,
): T[] {
  const list = [...rows];
  switch (ordem) {
    // "Recente" = ano do modelo (segundo número de "2022/2023"); em empate, ano de fabricação
    case "recentes":
      return list.sort((a, b) => compareAno(b, a));
    case "antigos":
      return list.sort((a, b) => compareAno(a, b));
    case "preco_asc":
      return list.sort((a, b) => compareNullable(a.preco, b.preco, "asc"));
    case "preco_desc":
      return list.sort((a, b) => compareNullable(a.preco, b.preco, "desc"));
    case "km":
      return list.sort((a, b) => compareNullable(a.quilometragem, b.quilometragem, "asc"));
    case "az":
      return list.sort((a, b) => {
        const nameA = `${a.marca} ${a.modelo} ${a.ano ?? ""}`.trim().toLowerCase();
        const nameB = `${b.marca} ${b.modelo} ${b.ano ?? ""}`.trim().toLowerCase();
        return nameA.localeCompare(nameB, "pt-BR");
      });
    default:
      return list;
  }
}

function compareAno(a: { ano: number | null; ano_modelo: number | null }, b: { ano: number | null; ano_modelo: number | null }) {
  // 1º critério: ano do modelo (segundo número de "2022/2023"); 2º: ano de fabricação
  return compareNullable(a.ano_modelo, b.ano_modelo, "asc") || compareNullable(a.ano, b.ano, "asc");
}

function compareNullable(a: number | null | undefined, b: number | null | undefined, dir: "asc" | "desc") {
  const aNull = a == null;
  const bNull = b == null;
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  const diff = (a as number) - (b as number);
  return dir === "asc" ? diff : -diff;
}
