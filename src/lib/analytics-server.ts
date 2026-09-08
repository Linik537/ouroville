const SUPABASE_URL = "https://xjokgcsozlqiqjfnzxle.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_c50RR1HGqK3NSgAC_x85bA_AWtnc9Lc";
const WHATSAPP_NUMBER = "5534998290394";

type AnalyticsEventType = "site_visit" | "car_view" | "whatsapp_click";

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  "Content-Type": "application/json",
};

export async function recordAnalyticsEvent(eventType: AnalyticsEventType, carId?: number) {
  await fetch(`${SUPABASE_URL}/rest/v1/rpc/track_analytics_event`, {
    method: "POST",
    headers,
    body: JSON.stringify({ _event_type: eventType, _car_id: carId ?? null }),
  });
}

export async function vehicleWhatsAppUrl(carId: number) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/carros?id=eq.${encodeURIComponent(String(carId))}&select=marca,modelo,ano&limit=1`,
    { headers },
  );
  const cars = response.ok ? (await response.json()) as Array<{ marca: string; modelo: string; ano: number }> : [];
  const car = cars[0];
  const message = car
    ? `Olá! Tenho interesse no ${car.marca} ${car.modelo} ${car.ano} anunciado no site.`
    : "Olá! Tenho interesse em um veículo anunciado no site.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
