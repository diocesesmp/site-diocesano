import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NewsSection from "@/components/NewsSection";
import EventsSection from "@/components/EventsSection";
import BishopCard from "@/components/BishopCard";
import DirectorySection from "@/components/DirectorySection";
import GovernmentSection from "@/components/GovernmentSection";
import TimelineSection from "@/components/TimelineSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Seção do Bispo */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                Nosso Pastor
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Conheça nosso Bispo Diocesano e sua mensagem pastoral para nossa comunidade
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <BishopCard />
            </div>
          </div>
        </section>

        <NewsSection />
        <EventsSection />
        <GovernmentSection />
        <DirectorySection />
        <TimelineSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
