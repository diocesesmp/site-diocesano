import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { globalSearch, SearchResult } from "@/integrations/supabase/search";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

const GlobalSearch = ({ className, placeholder = "Buscar..." }: GlobalSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.trim().length >= 2) {
        setLoading(true);
        try {
          const searchResults = await globalSearch(searchTerm);
          setResults(searchResults);
        } catch (error) {
          console.error('Erro na busca:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchTerm("");
    setResults([]);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm("");
    setResults([]);
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {!isOpen ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="hover:bg-secondary"
        >
          <Search className="h-5 w-5" />
        </Button>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-9"
                autoFocus
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Results dropdown */}
          {(loading || results.length > 0 || (searchTerm.length >= 2 && results.length === 0)) && (
            <Card className="absolute top-full left-0 right-0 mt-2 p-2 max-h-96 overflow-y-auto z-50 shadow-lg">
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">Buscando...</span>
                </div>
              )}

              {!loading && searchTerm.length >= 2 && results.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nenhum resultado encontrado.
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="space-y-1">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.url}
                      className="flex flex-col gap-1 p-3 rounded-md hover:bg-secondary transition-smooth cursor-pointer"
                      onClick={handleResultClick}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-sm line-clamp-1 flex-1">{result.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      {result.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.description.replace(/<[^>]*>/g, '')}
                        </p>
                      )}
                      {result.date && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(result.date), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;