import { useState } from "react";
import { Search, MapPin, Route, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { mockRoutes, mockStops } from "@/lib/mockData";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  name: string;
  type: "route" | "stop";
  routeName?: string;
}

interface SearchBarProps {
  onSelectResult: (result: SearchResult) => void;
}

const SearchBar = ({ onSelectResult }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = (value: string) => {
    setQuery(value);
    
    if (value.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const routeResults: SearchResult[] = mockRoutes
      .filter(route => 
        route.name.toLowerCase().includes(value.toLowerCase())
      )
      .map(route => ({
        id: route.id,
        name: route.name,
        type: "route" as const,
      }));

    const stopResults: SearchResult[] = mockStops
      .filter(stop => 
        stop.name.toLowerCase().includes(value.toLowerCase())
      )
      .map(stop => {
        const route = mockRoutes.find(r => r.id === stop.routeId);
        return {
          id: stop.id,
          name: stop.name,
          type: "stop" as const,
          routeName: route?.name,
        };
      });

    const allResults = [...routeResults, ...stopResults].slice(0, 6);
    setResults(allResults);
    setIsOpen(allResults.length > 0);
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search routes or stops..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10 shadow-soft border-0 bg-card/80 backdrop-blur-sm"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur-md">
              <div className="p-2 space-y-1">
                {results.map((result, index) => (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left p-3 rounded-md hover:bg-muted/50 transition-colors flex items-center space-x-3 group"
                  >
                    <div className="flex-shrink-0">
                      {result.type === "route" ? (
                        <Route className="w-4 h-4 text-primary group-hover:text-primary-glow transition-colors" />
                      ) : (
                        <MapPin className="w-4 h-4 text-accent group-hover:text-accent-glow transition-colors" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                        {result.name}
                      </p>
                      {result.routeName && (
                        <p className="text-xs text-muted-foreground">
                          {result.routeName}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize bg-muted px-2 py-1 rounded">
                      {result.type}
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;