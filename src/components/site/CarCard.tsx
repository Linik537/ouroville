import { Link } from "@tanstack/react-router";
import { CalendarDays, Gauge } from "lucide-react";
import { brl, formatCarName, km } from "@/lib/site";
import { carTitle, PLACEHOLDER_CAR, slugify, type Carro } from "@/lib/supabase";

export function CarCard({ carro, compact = false }: { carro: Carro; compact?: boolean }) {
  const foto = carro.fotos?.[0] ?? PLACEHOLDER_CAR;
  const quilometragem = carro.quilometragem ?? (carro.marca.toUpperCase() === "BYD" ? 0 : null);
  const versao = carro.versao?.trim();
  const anoCompleto = `${carro.ano}${carro.ano_modelo ? `/${carro.ano_modelo}` : ""}`;
  const kmCompacta = quilometragem == null ? "-" : quilometragem < 1000 ? `${quilometragem} km` : `${Math.round(quilometragem / 1000)}k km`;

  return (
    <Link
      to="/carros/$marca/$modelo/$ano/$id"
      params={{
        marca: slugify(carro.marca),
        modelo: slugify(carro.modelo),
        ano: String(carro.ano),
        id: String(carro.id),
      }}
      className="group flex flex-col overflow-hidden rounded-[28px] bg-card transition duration-200 hover:-translate-y-0.5 sm:bg-[#17130d]"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[28px] border border-border bg-muted">
        <img
          src={foto}
          alt={`${carTitle(carro)} à venda na Ouroville Motors`}
          loading="lazy"
          decoding="async"
          className={`h-full w-full transition duration-500 group-hover:scale-105 ${compact ? "object-contain sm:object-cover" : "object-cover"}`}
        />
        {carro.destaque && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground">
            {carro.destaque}
          </span>
        )}
      </div>

      <div className={`flex flex-1 flex-col rounded-b-[28px] border border-t-0 border-[#d4a64a]/80 shadow-[0_0_0_1px_rgba(212,166,74,0.18)] transition group-hover:border-[#e8bf60] ${compact ? "gap-2 px-3 pb-3 pt-2 sm:gap-3 sm:px-4 sm:pb-4 sm:pt-3" : "gap-3 px-4 pb-4 pt-3"}`}>
        <h3 className={`font-oswald font-semibold leading-none tracking-[0.02em] text-foreground ${compact ? "text-[18px] sm:text-[22px]" : "text-[22px]"}`}>
          <span className="text-white">{formatCarName(carro.marca)}</span>{" "}
          <span className="text-gold">{formatCarName(carro.modelo)}</span>
        </h3>

        <p className={`${compact ? "min-h-4 text-xs sm:min-h-5 sm:text-sm" : "min-h-5 text-sm"} line-clamp-1 text-foreground/80`} aria-hidden={!versao}>
          {versao || "\u00a0"}
        </p>

        <div className={`flex items-center text-muted-foreground ${compact ? "gap-2 text-xs sm:gap-4 sm:text-sm" : "gap-4 text-sm"}`}>
          <span className={`inline-flex shrink-0 items-center whitespace-nowrap ${compact ? "gap-1 sm:gap-1.5" : "gap-1.5"}`}>
            <CalendarDays className={`${compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4"} text-primary`} />
            {compact ? <><span className="sm:hidden">{carro.ano}</span><span className="hidden sm:inline">{anoCompleto}</span></> : anoCompleto}
          </span>
          <span className={`inline-flex shrink-0 items-center whitespace-nowrap ${compact ? "gap-1 sm:gap-1.5" : "gap-1.5"}`}>
            <Gauge className={`${compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4"} text-primary`} />
            {compact ? <><span className="sm:hidden">{kmCompacta}</span><span className="hidden sm:inline">{km(quilometragem)}</span></> : km(quilometragem)}
          </span>
        </div>

        <div className={`flex items-center ${compact ? "mt-0 justify-center gap-2 sm:mt-1 sm:justify-between sm:gap-3" : "mt-1 justify-between gap-3"}`}>
          <span className={`inline-flex rounded-full bg-gold font-inter font-normal tracking-wide text-primary-foreground ${compact ? "px-3 py-1.5 text-sm sm:px-5 sm:py-2 sm:text-lg" : "px-5 py-2 text-lg"}`}>
            {brl(carro.preco)}
          </span>
          <span className={`rounded-full border border-border font-medium text-foreground transition group-hover:border-primary group-hover:text-primary ${compact ? "hidden px-3 py-1.5 text-xs sm:inline-flex sm:px-4 sm:text-sm" : "inline-flex px-4 py-1.5 text-sm"}`}>
            Ver mais
          </span>
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
