import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Noticias from "./pages/Noticias";
import Eventos from "./pages/Eventos";
import MensagensPastor from "./pages/MensagensPastor";
import Galeria from "./pages/Galeria";
import DiretorioClero from "./pages/DiretorioClero";
import DiretorioParoquias from "./pages/DiretorioParoquias";
import Institucional from "./pages/Institucional";
import Bispo from "./pages/Bispo";
import GovernoDiocese from "./pages/GovernoDiocese";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Doacoes from "./pages/Doacoes";
import DoacoesCheckout from "./pages/DoacoesCheckout";
import DoacoesObrigado from "./pages/DoacoesObrigado";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/noticias/:slug" element={<Noticias />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/eventos/:slug" element={<Eventos />} />
          <Route path="/governo" element={<GovernoDiocese />} />
          <Route path="/mensagens-do-pastor" element={<MensagensPastor />} />
          <Route path="/mensagens-do-pastor/:slug" element={<MensagensPastor />} />
          <Route path="/galeria" element={<Galeria />} />
          <Route path="/diretorio/clero" element={<DiretorioClero />} />
          <Route path="/diretorio/clero/:slug" element={<DiretorioClero />} />
          <Route path="/diretorio/paroquias" element={<DiretorioParoquias />} />
          <Route path="/diretorio/paroquias/:slug" element={<DiretorioParoquias />} />
          <Route path="/bispo" element={<Bispo />} />
          {/* Páginas de doação */}
          <Route path="/doacoes/:slug" element={<Doacoes />} />
          <Route path="/doacoes/:slug/checkout" element={<DoacoesCheckout />} />
          <Route path="/doacoes/obrigado" element={<DoacoesObrigado />} />
          {/* Redirecionamentos para páginas institucionais */}
          <Route path="/sobre" element={<Institucional />} />
          <Route path="/missao" element={<Institucional />} />
          <Route path="/contato" element={<Institucional />} />
          <Route path="/institucional/:page" element={<Institucional />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
