import { createFileRoute } from "@tanstack/react-router";
import { recordAnalyticsEvent } from "@/lib/analytics-server";

const validEvents = new Set(["site_visit", "car_view"]);

export const Route = createFileRoute("/pulse/$event/$id")({
  server: {
    handlers: {
      POST: async ({ params }) => {
        const carId = Number(params.id);
        if (!validEvents.has(params.event) || !Number.isInteger(carId) || carId < 0) {
          return new Response(null, { status: 204 });
        }
        try {
          await recordAnalyticsEvent(params.event as "site_visit" | "car_view", carId || undefined);
        } catch (error) {
          console.error("Analytics pulse failed", error);
        }
        return new Response(null, { status: 204 });
      },
    },
  },
});
