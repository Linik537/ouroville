import { createClient } from "@supabase/supabase-js";

// Chave publicável do projeto: a segurança é aplicada pelas políticas RLS no Supabase.
const SUPABASE_URL = "https://xjokgcsozlqiqjfnzxle.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_c50RR1HGqK3NSgAC_x85bA_AWtnc9Lc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window === "undefined" ? undefined : window.localStorage,
  },
});

export type Carro = {
  id: number;
  marca: string;
  modelo: string;
  versao: string | null;
  ano: number;
  ano_modelo: number | null;
  preco: number | null;
  quilometragem: number | null;
  combustivel: string | null;
  motor: string | null;
  tracao: string | null;
  cambio: string | null;
  cor: string | null;
  fotos: string[] | null;
  descricao: string | null;
  destaque: string | null;
  status: "disponivel" | "vendido";
  created_at: string;
};

export type AnalyticsEventType = "site_visit" | "car_view" | "whatsapp_click";

export async function trackAnalyticsEvent(eventType: AnalyticsEventType, carId?: number) {
  try {
    await supabase.rpc("track_analytics_event", {
      _event_type: eventType,
      _car_id: carId ?? null,
    });
  } catch {
    // Analytics must never interrupt a visitor's journey to WhatsApp.
  }
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const carUrl = (c: Pick<Carro, "id" | "marca" | "modelo" | "ano">) =>
  `/carros/${slugify(c.marca)}/${slugify(c.modelo)}/${c.ano}/${c.id}`;

export const carTitle = (c: Pick<Carro, "marca" | "modelo" | "ano">) =>
  `${c.marca} ${c.modelo} ${c.ano}`;

export const PLACEHOLDER_CAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#1a1a1a"/><text x="400" y="300" fill="#8a8a8a" font-family="sans-serif" font-size="28" text-anchor="middle">Foto em breve</text></svg>`,
  );

export async function fetchCarros(filters?: {
  termo?: string | undefined;
  marca?: string | undefined;
  cambio?: string | undefined;
  combustivel?: string | undefined;
  anoMin?: number | undefined;
  precoMax?: number | undefined;
  limit?: number | undefined;
}) {
  try {
    let q = supabase.from("carros").select("*").eq("status", "disponivel");
    if (filters?.marca) q = q.eq("marca", filters.marca);
    if (filters?.cambio) q = q.eq("cambio", filters.cambio);
    if (filters?.combustivel) q = q.eq("combustivel", filters.combustivel);
    if (filters?.anoMin && Number.isFinite(filters.anoMin)) q = q.gte("ano", filters.anoMin);
    if (filters?.precoMax && Number.isFinite(filters.precoMax)) q = q.lte("preco", filters.precoMax);
    if (filters?.limit && Number.isFinite(filters.limit)) q = q.limit(filters.limit);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) {
      console.error("Erro ao buscar carros do Supabase:", error);
      return [];
    }
    let rows = (data ?? []) as Carro[];
    if (filters?.termo?.trim()) rows = fuzzyFilter(rows, filters.termo);
    return rows;
  } catch (err) {
    console.error("Exceção ao buscar carros:", err);
    return [];
  }
}

// Busca tolerante a erros de digitação (client-side, complementa o índice trigram do Postgres)
export function fuzzyFilter(rows: Carro[], termo: string) {
  const tokens = slugify(termo).split("-").filter(Boolean);
  if (!tokens.length) return rows;
  const scored = rows
    .map((c) => {
      const hay = slugify(`${c.marca} ${c.modelo} ${c.versao ?? ""} ${c.ano} ${c.cor ?? ""}`).split("-");
      let score = 0;
      for (const t of tokens) {
        let best = 0;
        for (const w of hay) best = Math.max(best, similarity(t, w));
        score += best;
      }
      return { c, score: score / tokens.length };
    })
    .filter((r) => r.score >= 0.55)
    .sort((a, b) => b.score - a.score);
  return scored.map((r) => r.c);
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  if (b.startsWith(a) || a.startsWith(b)) return 1;
  const d = levenshtein(a, b);
  return 1 - d / Math.max(a.length, b.length);
}

function levenshtein(a: string, b: string) {
  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur: number[] = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min((cur[j - 1] as number) + 1, (prev[j] as number) + 1, (prev[j - 1] as number) + cost);
    }
    prev = cur;
  }
  return prev[b.length] as number;
}
