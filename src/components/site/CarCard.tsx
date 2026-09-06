import { Link } from "@tanstack/react-router";
import { CalendarDays, Gauge } from "lucide-react";
import { brl, km } from "@/lib/site";
import { carTitle, carUrl, PLACEHOLDER_CAR, type Carro } from "@/lib/supabase";

export function CarCard({ carro }: { carro: Carro }) {
  const foto = carro.fotos?.[0] ?? PLACEHOLDER_CAR;
  return (
    <Link
      to={carUrl(carro)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition hover:border-primary/60"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={foto}
          alt={`${carTitle(carro)} à venda na Ouroville Motors`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {carro.destaque && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            {carro.destaque}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold text-foreground">
          {carro.marca} {carro.modelo}
        </h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{carro.versao ?? carro.cor ?? ""}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{carro.ano}{carro.ano_modelo ? `/${carro.ano_modelo}` : ""}</span>
          <span className="inline-flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{km(carro.quilometragem)}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            {brl(carro.preco)}
          </span>
          <span className="text-sm font-medium text-primary group-hover:underline">Ver mais</span>
        </div>
      </div>
    </Link>
  );
}

export function CarCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <div className="aspect-4/3 animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-9 w-32 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}
