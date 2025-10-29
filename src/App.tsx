import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import IVFSupport from "./pages/IVFSupport";
import IVDripTherapy from "./pages/IVDripTherapy";
import PostSurgeryCare from "./pages/PostSurgeryCare";
import DisabledCare from "./pages/DisabledCare";
import SpecializedServices from "./pages/SpecializedServices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Language wrapper component that sets i18n language based on URL
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const validLangs = ['cs', 'ru', 'uk'];
  
  useEffect(() => {
    const language = lang || 'en';
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [lang, i18n]);
  
  // Redirect invalid language codes
  if (lang && !validLangs.includes(lang)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Route configuration for all pages
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/blog/:slug" element={<BlogPost />} />
    <Route path="/ivf-injection-support-prague" element={<IVFSupport />} />
    <Route path="/iv-drip-therapy-prague" element={<IVDripTherapy />} />
    <Route path="/post-surgery-recovery-care-prague" element={<PostSurgeryCare />} />
    <Route path="/disabled-daily-care-prague" element={<DisabledCare />} />
    <Route path="/specialized-services" element={<SpecializedServices />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* English routes (default, no prefix) */}
            <Route path="/*" element={
              <LanguageWrapper>
                <AppRoutes />
              </LanguageWrapper>
            } />
            
            {/* Language-prefixed routes (cs, ru, uk) */}
            <Route path="/:lang/*" element={
              <LanguageWrapper>
                <AppRoutes />
              </LanguageWrapper>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
