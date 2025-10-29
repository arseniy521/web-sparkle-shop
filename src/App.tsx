import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageWrapper } from "./components/LanguageWrapper";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import IVFSupport from "./pages/IVFSupport";
import IVDripTherapy from "./pages/IVDripTherapy";
import PostSurgeryCare from "./pages/PostSurgeryCare";
import DisabledCare from "./pages/DisabledCare";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* English (default) */}
            <Route path="/" element={<LanguageWrapper language="en"><Index /></LanguageWrapper>} />
            <Route path="/blog" element={<LanguageWrapper language="en"><Blog /></LanguageWrapper>} />
            <Route path="/blog/:slug" element={<LanguageWrapper language="en"><BlogPost /></LanguageWrapper>} />
            <Route path="/ivf-injection-support-prague" element={<LanguageWrapper language="en"><IVFSupport /></LanguageWrapper>} />
            <Route path="/iv-drip-therapy-prague" element={<LanguageWrapper language="en"><IVDripTherapy /></LanguageWrapper>} />
            <Route path="/post-surgery-recovery-care-prague" element={<LanguageWrapper language="en"><PostSurgeryCare /></LanguageWrapper>} />
            <Route path="/disabled-daily-care-prague" element={<LanguageWrapper language="en"><DisabledCare /></LanguageWrapper>} />
            
            {/* Czech */}
            <Route path="/cz" element={<LanguageWrapper language="cs"><Index /></LanguageWrapper>} />
            <Route path="/cz/blog" element={<LanguageWrapper language="cs"><Blog /></LanguageWrapper>} />
            <Route path="/cz/blog/:slug" element={<LanguageWrapper language="cs"><BlogPost /></LanguageWrapper>} />
            <Route path="/cz/ivf-injection-support-prague" element={<LanguageWrapper language="cs"><IVFSupport /></LanguageWrapper>} />
            <Route path="/cz/iv-drip-therapy-prague" element={<LanguageWrapper language="cs"><IVDripTherapy /></LanguageWrapper>} />
            <Route path="/cz/post-surgery-recovery-care-prague" element={<LanguageWrapper language="cs"><PostSurgeryCare /></LanguageWrapper>} />
            <Route path="/cz/disabled-daily-care-prague" element={<LanguageWrapper language="cs"><DisabledCare /></LanguageWrapper>} />
            
            {/* Russian */}
            <Route path="/ru" element={<LanguageWrapper language="ru"><Index /></LanguageWrapper>} />
            <Route path="/ru/blog" element={<LanguageWrapper language="ru"><Blog /></LanguageWrapper>} />
            <Route path="/ru/blog/:slug" element={<LanguageWrapper language="ru"><BlogPost /></LanguageWrapper>} />
            <Route path="/ru/ivf-injection-support-prague" element={<LanguageWrapper language="ru"><IVFSupport /></LanguageWrapper>} />
            <Route path="/ru/iv-drip-therapy-prague" element={<LanguageWrapper language="ru"><IVDripTherapy /></LanguageWrapper>} />
            <Route path="/ru/post-surgery-recovery-care-prague" element={<LanguageWrapper language="ru"><PostSurgeryCare /></LanguageWrapper>} />
            <Route path="/ru/disabled-daily-care-prague" element={<LanguageWrapper language="ru"><DisabledCare /></LanguageWrapper>} />
            
            {/* Ukrainian */}
            <Route path="/uk" element={<LanguageWrapper language="uk"><Index /></LanguageWrapper>} />
            <Route path="/uk/blog" element={<LanguageWrapper language="uk"><Blog /></LanguageWrapper>} />
            <Route path="/uk/blog/:slug" element={<LanguageWrapper language="uk"><BlogPost /></LanguageWrapper>} />
            <Route path="/uk/ivf-injection-support-prague" element={<LanguageWrapper language="uk"><IVFSupport /></LanguageWrapper>} />
            <Route path="/uk/iv-drip-therapy-prague" element={<LanguageWrapper language="uk"><IVDripTherapy /></LanguageWrapper>} />
            <Route path="/uk/post-surgery-recovery-care-prague" element={<LanguageWrapper language="uk"><PostSurgeryCare /></LanguageWrapper>} />
            <Route path="/uk/disabled-daily-care-prague" element={<LanguageWrapper language="uk"><DisabledCare /></LanguageWrapper>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
