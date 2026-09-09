import { Link } from "@tanstack/react-router";
import { CalendarDays, Gauge } from "lucide-react";
import { brl, formatCarName, km } from "@/lib/site";
import { carTitle, PLACEHOLDER_CAR, slugify, type Carro } from "@/lib/supabase";

export function CarCard({ carro, compact = false }: { carro: Carro; compact?: boolean }) {
  const foto = carro.fotos?.[0] ?? PLACEHOLDER_CAR;
  const quilometragem = carro.quilometragem ?? (carro.marca.toUpperCase() === "BYD" ? 0 : null);
  const versao = carro.versao?.trim();

  return (
    <Link
      to="/carros/$marca/$modelo/$ano/$id"
      params={{
        marca: slugify(carro.marca),
        modelo: slugify(carro.modelo),
        ano: String(carro.ano),
        id: String(carro.id),
      }}
      className="group flex flex-col overflow-hidden rounded-[28px] border border-[#d4a64a]/80 bg-[#17130d] shadow-[0_0_0_1px_rgba(212,166,74,0.18)] transition duration-200 hover:-translate-y-0.5 hover:border-[#e8bf60]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={foto}
          alt={`${carTitle(carro)} à venda na Ouroville Motors`}
          loading="lazy"
          className={`h-full w-full transition duration-500 group-hover:scale-105 ${compact ? "object-contain sm:object-cover" : "object-cover"}`}
        />
        {carro.destaque && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary-foreground">
            {carro.destaque}
          </span>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${compact ? "gap-2 px-3 pb-3 pt-2 sm:gap-3 sm:px-4 sm:pb-4 sm:pt-3" : "gap-3 px-4 pb-4 pt-3"}`}>
        <h3 className={`font-oswald font-semibold leading-none tracking-[0.02em] text-foreground ${compact ? "text-[18px] sm:text-[22px]" : "text-[22px]"}`}>
          <span className="text-white">{formatCarName(carro.marca)}</span>{" "}
          <span className="text-gold">{formatCarName(carro.modelo)}</span>
        </h3>

        <p className={`${compact ? "min-h-4 text-xs sm:min-h-5 sm:text-sm" : "min-h-5 text-sm"} line-clamp-1 text-foreground/80`} aria-hidden={!versao}>
          {versao || "\u00a0"}
        </p>

        <div className={`flex items-center text-muted-foreground ${compact ? "gap-2 text-[11px] sm:gap-4 sm:text-sm" : "gap-4 text-sm"}`}>
          <span className={`inline-flex items-center ${compact ? "gap-1 sm:gap-1.5" : "gap-1.5"}`}>
            <CalendarDays className={`${compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4"} text-primary`} />
            {carro.ano}{carro.ano_modelo ? `/${carro.ano_modelo}` : ""}
          </span>
          <span className={`inline-flex items-center ${compact ? "gap-1 sm:gap-1.5" : "gap-1.5"}`}>
            <Gauge className={`${compact ? "h-3.5 w-3.5 sm:h-4 sm:w-4" : "h-4 w-4"} text-primary`} />
            {km(quilometragem)}
          </span>
        </div>

        <div className={`flex items-center justify-between ${compact ? "mt-0 gap-2 sm:mt-1 sm:gap-3" : "mt-1 gap-3"}`}>
          <span className={`inline-flex rounded-full bg-gold font-inter font-normal tracking-wide text-primary-foreground ${compact ? "px-3 py-1.5 text-sm sm:px-5 sm:py-2 sm:text-lg" : "px-5 py-2 text-lg"}`}>
            {brl(carro.preco)}
          </span>
          <span className={`inline-flex rounded-full border border-border font-medium text-foreground transition group-hover:border-primary group-hover:text-primary ${compact ? "px-3 py-1.5 text-xs sm:px-4 sm:text-sm" : "px-4 py-1.5 text-sm"}`}>
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
