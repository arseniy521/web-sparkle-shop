import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import prerender from "vite-plugin-prerender";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && prerender({
      staticDir: path.join(__dirname, "dist"),
      routes: [
        "/",
        "/en",
        "/ru",
        "/uk",
        "/blog",
        "/en/blog",
        "/ru/blog",
        "/uk/blog",
        "/iv-drip-therapy-prague",
        "/en/iv-drip-therapy-prague",
        "/ru/iv-drip-therapy-prague",
        "/uk/iv-drip-therapy-prague",
        "/ivf-injection-support-prague",
        "/en/ivf-injection-support-prague",
        "/ru/ivf-injection-support-prague",
        "/uk/ivf-injection-support-prague",
        "/post-surgery-recovery-care-prague",
        "/en/post-surgery-recovery-care-prague",
        "/ru/post-surgery-recovery-care-prague",
        "/uk/post-surgery-recovery-care-prague",
        "/disabled-daily-care-prague",
        "/en/disabled-daily-care-prague",
        "/ru/disabled-daily-care-prague",
        "/uk/disabled-daily-care-prague",
        "/sestricka-praha-1",
        "/sestricka-praha-vinohrady",
        "/sestricka-praha-zizkov",
        "/blog/iv-therapy-at-home-prague-guide",
        "/blog/when-to-call-home-nurse-prague",
        "/blog/wound-care-dressing-changes-prague",
        "/blog/elderly-care-nursing-services-prague",
        "/blog/medical-injections-home-service-prague",
      ],
      renderer: "puppeteer",
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
