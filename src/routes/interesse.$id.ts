import { createFileRoute } from "@tanstack/react-router";
import { recordAnalyticsEvent, vehicleWhatsAppUrl } from "@/lib/analytics-server";

const fallbackUrl = "https://wa.me/5534998290394?text=Ol%C3%A1%21";

export const Route = createFileRoute("/interesse/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const carId = Number(params.id);
        if (!Number.isInteger(carId) || carId < 1) return Response.redirect(fallbackUrl, 302);

        try {
          const [url] = await Promise.all([
            vehicleWhatsAppUrl(carId),
            recordAnalyticsEvent("whatsapp_click", carId),
          ]);
          return Response.redirect(url, 302);
        } catch (error) {
          console.error("WhatsApp interest redirect failed", error);
          return Response.redirect(fallbackUrl, 302);
        }
      },
    },
  },
});
