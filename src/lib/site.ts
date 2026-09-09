export const SITE = {
  name: "Ouroville Motors",
  url: "https://ourovillemotors.com.br",
  domain: "ourovillemotors.com.br",
  description:
    "Concessionária de veículos novos e seminovos de procedência em Uberlândia MG. Confira nosso estoque com ofertas imperdíveis e financiamento facilitado.",
  phoneDisplay: "(34) 9 9829-0394",
  phoneDigits: "5534998290394",
  address: "Avenida João Pinheiro, 3488 - Uberlândia - MG",
  streetAddress: "Avenida João Pinheiro, 3488",
  city: "Uberlândia",
  state: "MG",
  postalCode: "38400-714",
  country: "BR",
  hours: "Segunda à sábado, das 08:00 às 18:00",
  email: "contato@ourovillemotors.com.br",
  mapEmbed:
    "https://www.google.com/maps?q=Avenida+Jo%C3%A3o+Pinheiro,+3488,+Uberl%C3%A2ndia+-+MG&output=embed",
  geo: {
    latitude: "-18.8953",
    longitude: "-48.2612",
  },
  ogImage: "https://ourovillemotors.com.br/favicon.png",
};

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SITE.phoneDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function brl(value: number | null | undefined) {
  if (value == null) return "Consulte";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export function km(value: number | null | undefined) {
  if (value == null) return "-";
  return `${value.toLocaleString("pt-BR")} km`;
}

export function formatCarName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function getAutoDealerSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: SITE.name,
    image: SITE.ogImage,
    url: SITE.url,
    telephone: `+${SITE.phoneDigits}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE.streetAddress,
      addressLocality: SITE.city,
      addressRegion: SITE.state,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    priceRange: "$$$",
  };
}
