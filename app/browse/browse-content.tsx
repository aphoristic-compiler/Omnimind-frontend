'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FloatingNav } from '@/components/dashboard/floating-nav';
import { ArrowLeft, Eye, Calendar, User, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Material {
  id: string;
  title: string;
  category?: string;
  views: number;
  summary: string;
  created_at?: string;
  tags?: string[];
}

type FilterType = 'most-viewed' | 'trending' | 'all' | 'contributions';

export default function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const filter = (searchParams.get('filter') as FilterType) || 'all';
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filterLabels: Record<FilterType, string> = {
    'most-viewed': 'Most Viewed',
    'trending': 'Trending',
    'all': 'All Materials',
    'contributions': 'My Contributions',
  };

  const filterIcons: Record<FilterType, React.ReactNode> = {
    'most-viewed': <Eye className="w-5 h-5" />,
    'trending': <TrendingUp className="w-5 h-5" />,
    'all': <Calendar className="w-5 h-5" />,
    'contributions': <User className="w-5 h-5" />,
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Build the API endpoint based on filter
        let endpoint = '/api/materials';
        const params = new URLSearchParams();
        
        switch (filter) {
          case 'most-viewed':
            params.set('sort', 'views');
            params.set('order', 'desc');
            break;
          case 'trending':
            params.set('sort', 'views');
            params.set('order', 'desc');
            params.set('limit', '20');
            break;
          case 'contributions':
            params.set('mine', 'true');
            break;
          case 'all':
          default:
            params.set('sort', 'created_at');
            params.set('order', 'desc');
            break;
        }

        const url = `${endpoint}?${params.toString()}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          router.push('/login');
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }
        
        const data = await response.json();
        setMaterials(Array.isArray(data) ? data : data.materials || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load materials';
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

    fetchMaterials();
  }, [filter, router, toast]);

  const handleFilterChange = (newFilter: FilterType) => {
    router.push(`/browse?filter=${newFilter}`);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay bg-background">
      <FloatingNav />
      
      {/* Grid background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
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

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-32">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {filterIcons[filter]}
            <h1 className="text-4xl font-display">{filterLabels[filter]}</h1>
          </div>
          <p className="text-muted-foreground">
            {filter === 'contributions' 
              ? 'Materials you have uploaded'
              : filter === 'most-viewed'
                ? 'The most popular materials in the library'
                : filter === 'trending'
                  ? 'Currently trending materials'
                  : 'Browse all available materials'
            }
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(Object.keys(filterLabels) as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => handleFilterChange(f)}
              className="gap-2"
            >
              {filterIcons[f]}
              {filterLabels[f]}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading materials...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && materials.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              {filterIcons[filter]}
            </div>
            <h3 className="text-xl font-medium mb-2">No materials found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'contributions'
                ? "You haven't uploaded any materials yet."
                : 'No materials match this filter.'}
            </p>
            {filter === 'contributions' && (
              <Button onClick={() => router.push('/dashboard')}>
                Upload Your First Material
              </Button>
            )}
          </div>
        )}

        {/* Materials Grid */}
        {!loading && !error && materials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material, index) => (
              <div
                key={material.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group animate-char-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => router.push(`/material/${material.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                    {material.tags?.[0] || material.category || 'General'}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Eye className="w-4 h-4" />
                    {material.views}
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {material.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {material.summary || 'No summary available'}
                </p>
                {material.created_at && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Uploaded {new Date(material.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
