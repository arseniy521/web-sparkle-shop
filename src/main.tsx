import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "./index.css";
import "./i18n/config";
import { captureReferral } from "./lib/referral";

captureReferral();

createRoot(document.getElementById("root")!).render(<App />);
