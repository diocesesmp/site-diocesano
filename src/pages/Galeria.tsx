import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Filter, Calendar, Camera, ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Photo {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  event_id?: string;
  album_name?: string;
  taken_date?: string;
  photographer?: string;
}

interface Event {
  id: string;
  title: string;
}

const GaleriaPage = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const photosPerPage = 24;

  useEffect(() => {
    fetchPhotos();
    fetchEvents();
    fetchAlbums();
  }, [currentPage, searchTerm, selectedEvent, selectedAlbum, selectedYear]);

  const fetchPhotos = async () => {
    try {
      let query = supabase
        .from('photos')
        .select('*')
        .order('taken_date', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      if (selectedEvent) {
        query = query.eq('event_id', selectedEvent);
      }

      if (selectedAlbum) {
        query = query.eq('album_name', selectedAlbum);
      }

      if (selectedYear) {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        query = query.gte('taken_date', startDate).lte('taken_date', endDate);
      }

      const { data, error } = await query
        .range((currentPage - 1) * photosPerPage, currentPage * photosPerPage - 1);

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('title');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('album_name')
        .not('album_name', 'is', null);

      if (error) throw error;
      
      const uniqueAlbums = [...new Set(data?.map(item => item.album_name).filter(Boolean))];
      setAlbums(uniqueAlbums);
    } catch (error) {
      console.error('Erro ao carregar álbuns:', error);
    }
  };

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    setSelectedPhoto(photos[(currentImageIndex + 1) % photos.length]);
  };

  const prevImage = () => {
    const newIndex = currentImageIndex === 0 ? photos.length - 1 : currentImageIndex - 1;
    setCurrentImageIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEvent('');
    setSelectedAlbum('');
    setSelectedYear('');
    setCurrentPage(1);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Galeria de Fotos</h1>
          <p className="text-muted-foreground">
            Momentos especiais e celebrações da nossa comunidade diocesana
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-muted/50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fotos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os eventos</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por álbum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os álbuns</SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album} value={album}>
                    {album}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os anos</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || selectedEvent || selectedAlbum || selectedYear) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {searchTerm && <Badge variant="secondary">Busca: {searchTerm}</Badge>}
              {selectedEvent && (
                <Badge variant="secondary">
                  Evento: {events.find(e => e.id === selectedEvent)?.title}
                </Badge>
              )}
              {selectedAlbum && <Badge variant="secondary">Álbum: {selectedAlbum}</Badge>}
              {selectedYear && <Badge variant="secondary">Ano: {selectedYear}</Badge>}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma foto encontrada.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openLightbox(photo, index)}
                >
                  <img
                    src={photo.thumbnail_url || photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={photos.length < photosPerPage}
              >
                Próxima
              </Button>
            </div>
          </>
        )}

        {/* Lightbox Modal */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => closeLightbox()}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-left">{selectedPhoto?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedPhoto && (
              <div className="relative">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.title}
                  className="w-full max-h-[60vh] object-contain"
                />
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={prevImage}
                  disabled={photos.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={nextImage}
                  disabled={photos.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {selectedPhoto && (
              <div className="p-6 pt-0">
                {selectedPhoto.description && (
                  <p className="text-muted-foreground mb-4">{selectedPhoto.description}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {selectedPhoto.taken_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(selectedPhoto.taken_date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  {selectedPhoto.photographer && (
                    <div className="flex items-center gap-1">
                      <Camera className="h-4 w-4" />
                      <span>{selectedPhoto.photographer}</span>
                    </div>
                  )}
                  {selectedPhoto.album_name && (
                    <Badge variant="outline">{selectedPhoto.album_name}</Badge>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default GaleriaPage;