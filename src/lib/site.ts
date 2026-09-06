export const SITE = {
  name: "Ouroville Motors",
  phoneDisplay: "(34) 9 9829-0394",
  phoneDigits: "5534998290394",
  address: "Avenida João Pinheiro, 3488 - Uberlândia - MG",
  hours: "Segunda à sábado, das 08:00 às 18:00",
  email: "",
  mapEmbed:
    "https://www.google.com/maps?q=Avenida+Jo%C3%A3o+Pinheiro,+3488,+Uberl%C3%A2ndia+-+MG&output=embed",
};

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SITE.phoneDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function brl(value: number | null | undefined) {
  if (value == null) return "Consulte";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function km(value: number | null | undefined) {
  if (value == null) return "-";
  return `${value.toLocaleString("pt-BR")} km`;
}
