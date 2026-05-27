'use client';

import React, { useState } from 'react';
import { Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [username, setUsername] = useState<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
    // Get username from localStorage (set during login)
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleSearch = async (value: string) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/stats`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      toast({
        title: 'Search Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
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

      <header className="relative mb-16">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-center gap-4 animate-char-in" style={{ animationDelay: '300ms' }}>
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors duration-200 group-focus-within:text-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
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
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    {searchResults.map((result, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-4 py-2 rounded hover:bg-secondary/50 transition-colors text-sm"
                      >
                        <p className="font-medium text-card-foreground">{result.title || result.content?.slice(0, 50)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{result.category || 'General'}</p>
                      </button>
                    ))}
                  </div>
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
