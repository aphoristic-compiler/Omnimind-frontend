'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  summary?: string;
  tags?: string[];
  views: number;
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [username, setUsername] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Get username from localStorage (set during login)
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (value: string) => {
    if (!value.trim()) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use the correct semantic search endpoint
      const response = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        router.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      // API returns an array of materials directly
      const results = Array.isArray(data) ? data : (data.results || []);
      setSearchResults(results);
      setShowResults(true); // Show dropdown regardless (handles empty results state too)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      toast({
        title: 'Search Error',
        description: message,
        variant: 'destructive',
      });
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);

    // Debounce the actual API call by 400ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 400);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery('');
    router.push(`/material/${result.id}`);
  };

  return (
    <>
      <div className="mb-16 animate-char-in" style={{ animationDelay: '200ms' }}>
        <h1 className="text-[clamp(2rem,8vw,5rem)] font-display leading-[0.95] tracking-tight mb-4">
          Welcome back{username && <span className="text-primary">, {username}</span>}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Upload materials, explore insights, and collaborate with your team.
        </p>
      </div>

      <header className="relative mb-16 z-50">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center gap-4 animate-char-in" style={{ animationDelay: '300ms' }}>
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative" ref={searchContainerRef}>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors duration-200 group-focus-within:text-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  placeholder="Ask anything... (AI Semantics Engine Search)"
                  className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover-lift"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full border-2 border-border border-t-primary animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground px-3 py-1 mb-1">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                    </p>
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-3 rounded-lg hover:bg-secondary/50 transition-colors text-sm group"
                      >
                        <p className="font-medium text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {result.title}
                        </p>
                        {result.summary && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{result.summary}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {result.tags && result.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {tag}
                            </span>
                          ))}
                          <span className="text-[10px] text-muted-foreground">{result.views} views</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No results state */}
              {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl z-50 p-4 text-center">
                  <p className="text-sm text-muted-foreground">No results found for &quot;{searchQuery}&quot;</p>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <Link href="/upload">
              <Button
                className="gap-2 bg-foreground hover:bg-foreground/90 text-background rounded-full h-12 px-6 transition-all duration-300 hover-lift font-medium"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload Material</span>
                <span className="sm:hidden">Upload</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
