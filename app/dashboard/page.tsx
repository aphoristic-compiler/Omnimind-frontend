'use client';

import { useEffect, useState } from 'react';
import { FloatingNav } from '@/components/dashboard/floating-nav';
import { Header } from '@/components/dashboard/header';
import { MostVisitedCard } from '@/components/dashboard/most-visited-card';
import { RecommendedCarousel } from '@/components/dashboard/recommended-carousel';
import { ContributionsFeed } from '@/components/dashboard/contributions-feed';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  most_visited: Array<{
    id: string;
    title: string;
    category: string;
    views: number;
    summary: string;
  }>;
  recently_uploaded: Array<{
    id: string;
    title: string;
    category: string;
    uploaded_at: string;
  }>;
  user_contributions: number;
  trending_topics: Array<{
    topic: string;
    trend: number[];
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          // Not logged in, redirect to login
          window.location.href = '/login';
          return;
        }

        const response = await fetch(`/api/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.status === 401) {
          // Token expired or invalid, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          window.location.href = '/login';
          return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch stats');
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay bg-background">
      <FloatingNav />
      
      {/* Grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-30 max-w-[1600px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div className="mb-8 animate-char-in">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            Knowledge Management Hub
          </span>
        </div>

        <Header />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Bento Grid */}
        {!loading && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 auto-rows-max">
            {/* Most Visited - Large Card */}
            <div className="lg:col-span-2 lg:row-span-2 animate-char-in" style={{ animationDelay: '100ms' }}>
              {stats.most_visited[0] && (
                <MostVisitedCard
                  title={stats.most_visited[0].title}
                  category={stats.most_visited[0].category}
                  views={stats.most_visited[0].views}
                  summary={stats.most_visited[0].summary}
                  items={stats.recently_uploaded}
                />
              )}
            </div>

            {/* AI Recommended - Top Right */}
            <div className="lg:col-span-1 animate-char-in" style={{ animationDelay: '200ms' }}>
              <RecommendedCarousel topics={stats.trending_topics} />
            </div>

            {/* Contributions Feed - Bottom Right */}
            <div className="lg:col-span-1 animate-char-in" style={{ animationDelay: '300ms' }}>
              <ContributionsFeed
                count={stats.user_contributions}
                recent={stats.recently_uploaded.slice(0, 5)}
              />
            </div>

            {/* Global Feed - Bottom Left */}
            <div className="lg:col-span-2 animate-char-in" style={{ animationDelay: '400ms' }}>
              <div className="bg-card border border-border rounded-lg p-6 h-full min-h-96">
                <h2 className="text-xl font-display mb-4">Recent Activity</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div className="hover-lift p-3 rounded bg-secondary/30 cursor-pointer">
                    <p className="text-sm font-medium text-card-foreground">New material uploaded</p>
                    <p className="text-xs text-muted-foreground mt-1">AI Knowledge Base expanded</p>
                  </div>
                  <div className="hover-lift p-3 rounded bg-secondary/30 cursor-pointer">
                    <p className="text-sm font-medium text-card-foreground">Trending topic discovered</p>
                    <p className="text-xs text-muted-foreground mt-1">Machine Learning in Production</p>
                  </div>
                  <div className="hover-lift p-3 rounded bg-secondary/30 cursor-pointer">
                    <p className="text-sm font-medium text-card-foreground">User contribution verified</p>
                    <p className="text-xs text-muted-foreground mt-1">Your summary was helpful</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
