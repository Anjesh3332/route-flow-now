import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Route, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSearchData } from "@/hooks/useTransitData";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  name: string;
  type: "route" | "stop";
  routeName?: string;
  lat?: number;
  lon?: number;
}

interface SearchBarNewProps {
  onSelectResult: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBarNew({ 
  onSelectResult, 
  placeholder = "Search routes or stops...",
  className = "" 
}: SearchBarNewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { searchResults } = useSearchData();

  useEffect(() => {
    const handleSearch = async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      // Simulate search delay for better UX
      setTimeout(() => {
        const searchData = searchResults(query);
        setResults(searchData);
        setIsOpen(searchData.length > 0);
        setIsLoading(false);
        setSelectedIndex(-1);
      }, 300);
    };

    const debounceTimer = setTimeout(handleSearch, 200);
    return () => clearTimeout(debounceTimer);
  }, [query, searchResults]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    onSelectResult(result);
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (query.length >= 2 && results.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-md ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 shadow-soft border-0 bg-card/80 backdrop-blur-sm focus:ring-2 focus:ring-primary/20"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Clear button */}
        {query && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur-md max-h-80 overflow-hidden">
              <div className="p-2">
                <div className="text-xs text-muted-foreground px-3 py-2 font-medium">
                  Search Results ({results.length})
                </div>
                <div className="space-y-1" role="listbox">
                  {results.map((result, index) => (
                    <motion.button
                      key={`${result.type}-${result.id}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectResult(result)}
                      className={`w-full text-left p-3 rounded-md transition-colors flex items-center space-x-3 group ${
                        selectedIndex === index
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50 text-foreground'
                      }`}
                      role="option"
                      aria-selected={selectedIndex === index}
                    >
                      <div className="flex-shrink-0">
                        {result.type === "route" ? (
                          <Route className={`w-4 h-4 ${
                            selectedIndex === index 
                              ? 'text-primary' 
                              : 'text-primary group-hover:text-primary-glow'
                          } transition-colors`} />
                        ) : (
                          <MapPin className={`w-4 h-4 ${
                            selectedIndex === index 
                              ? 'text-accent' 
                              : 'text-accent group-hover:text-accent-glow'
                          } transition-colors`} />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm ${
                          selectedIndex === index 
                            ? 'text-primary' 
                            : 'group-hover:text-primary'
                        } transition-colors truncate`}>
                          {result.name}
                        </p>
                        {result.routeName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.routeName}
                          </p>
                        )}
                        {result.lat && result.lon && (
                          <p className="text-xs text-muted-foreground">
                            {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
                          </p>
                        )}
                      </div>
                      
                      <div className={`text-xs capitalize px-2 py-1 rounded transition-colors ${
                        selectedIndex === index
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {result.type}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No results message */}
      <AnimatePresence>
        {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur-md">
              <div className="p-4 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try searching for routes or stops</p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}