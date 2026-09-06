import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { CarCard, CarCardSkeleton } from "@/components/site/CarCard";
import { fetchCarros } from "@/lib/supabase";

type EstoqueSearch = {
  q?: string | undefined;
  marca?: string | undefined;
  cambio?: string | undefined;
  combustivel?: string | undefined;
  anoMin?: number | undefined;
  precoMax?: number | undefined;
};

export const Route = createFileRoute("/estoque")({
  validateSearch: (s: Record<string, unknown>): EstoqueSearch => ({
    q: typeof s['q'] === "string" ? s['q'] : undefined,
    marca: typeof s['marca'] === "string" ? s['marca'] : undefined,
    cambio: typeof s['cambio'] === "string" ? s['cambio'] : undefined,
    combustivel: typeof s['combustivel'] === "string" ? s['combustivel'] : undefined,
    anoMin: s['anoMin'] ? Number(s['anoMin']) : undefined,
    precoMax: s['precoMax'] ? Number(s['precoMax']) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Estoque de veículos — Ouroville Motors Uberlândia" },
      {
        name: "description",
        content: "Veja todos os carros disponíveis na Ouroville Motors: filtre por marca, ano, preço, câmbio e combustível.",
      },
      { property: "og:title", content: "Estoque de veículos — Ouroville Motors" },
      { property: "og:description", content: "Carros seminovos e novos disponíveis em Uberlândia MG." },
    ],
  }),
  component: Estoque,
});

function Estoque() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/estoque" });
  const [termo, setTermo] = useState(search.q ?? "");

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

  const setFilter = (patch: Partial<EstoqueSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const selectCls =
    "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

  return (
    <div className="relative z-30 bg-background">
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
          <button type="submit" className="bg-primary px-5 text-primary-foreground" aria-label="Buscar">
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
            <p className="mb-4 text-sm text-muted-foreground">
              <strong className="text-foreground">{data?.length ?? 0}</strong> veículos encontrados
            </p>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <CarCardSkeleton key={i} />)
                : (data ?? []).map((c) => <CarCard key={c.id} carro={c} />)}
            </div>
            {!isLoading && (data ?? []).length === 0 && (
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
