import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
import EventsSection from "@/components/EventsSection";
import BishopCard from "@/components/BishopCard";
import DirectorySection from "@/components/DirectorySection";
import GovernmentSection from "@/components/GovernmentSection";
import TimelineSection from "@/components/TimelineSection";
import ImportantLinksSection from "@/components/ImportantLinksSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Seção do Bispo - Otimizado para mobile */}
        <section className="py-8 sm:py-12 md:py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-3 sm:mb-4">
                Nosso Pastor
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
                Conheça nosso Bispo Diocesano e sua mensagem pastoral para nossa comunidade
              </p>
            </div>
            <div className="max-w-md mx-auto px-2 sm:px-0">
              <BishopCard />
            </div>
          </div>
        </section>

        <NewsSection />
        <EventsSection />
        <GovernmentSection />
        <DirectorySection />
        <TimelineSection />
        <ImportantLinksSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
