'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FloatingNav } from '@/components/dashboard/floating-nav';
import { ArrowLeft, Download, Eye, Calendar, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Material {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  views: number;
  created_at: string;
  category?: string;
  has_original_file?: boolean;
}

export default function MaterialPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = params?.id as string;

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetching this endpoint automatically increments the view count
        const response = await fetch(`/api/materials/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          router.push('/login');
          return;
        }

        if (response.status === 404) {
          setError('Material not found.');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch material');
        }

        const data = await response.json();
        setMaterial(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load material';
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

    if (id) {
      fetchMaterial();
    }
  }, [id, router, toast]);

  const handleDownload = () => {
    if (!material) return;

    // Create a text blob from the content and trigger download
    const blob = new Blob([material.content || material.summary || ''], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${material.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download started',
      description: `Downloading "${material.title}" as text`,
    });
  };

  const handleDownloadOriginal = async () => {
    if (!material) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      toast({
        title: 'Download started',
        description: `Downloading original file for "${material.title}"`,
      });

      const response = await fetch(`/api/materials/${id}/download/original`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to download original file');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers.get('content-disposition');
      let filename = material.title;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
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
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 lg:px-12 py-32">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/browse')}
          className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading material...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            {error}
          </div>
        )}

        {/* Material Content */}
        {!loading && !error && material && (
          <div className="animate-char-in">
            {/* Header card */}
            <div className="bg-card border border-border rounded-2xl p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                  {/* Tags */}
                  {material.tags && material.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {material.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <h1 className="text-3xl lg:text-4xl font-display text-card-foreground leading-tight mb-4">
                    {material.title}
                  </h1>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {(material.views || 0).toLocaleString()} views
                    </span>
                    {material.created_at && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(material.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                    {material.category && (
                      <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                        {material.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  {material.has_original_file && (
                    <Button
                      onClick={handleDownloadOriginal}
                      className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-11 px-6 shadow-lg shadow-primary/25"
                    >
                      <Download className="w-4 h-4" />
                      Original File
                    </Button>
                  )}
                  <Button
                    onClick={handleDownload}
                    variant={material.has_original_file ? "outline" : "default"}
                    className={`gap-2 rounded-full h-11 px-6 ${!material.has_original_file ? 'bg-foreground hover:bg-foreground/90 text-background' : ''}`}
                  >
                    <FileText className="w-4 h-4" />
                    As Text
                  </Button>
                </div>
              </div>
            </div>

            {/* Summary */}
            {material.summary && (
              <div className="bg-card/50 border border-border/50 rounded-2xl p-8 mb-8 animate-char-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  <h2 className="text-lg font-semibold text-card-foreground">AI Summary</h2>
                </div>
                <p className="text-card-foreground/80 leading-relaxed">{material.summary}</p>
              </div>
            )}

            {/* Full Content */}
            {material.content && (
              <div className="bg-card border border-border rounded-2xl p-8 animate-char-in" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold text-card-foreground">Content</h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-card-foreground/80 leading-relaxed text-sm bg-secondary/30 rounded-lg p-6 overflow-auto max-h-[600px] border border-border/50">
                    {material.content}
                  </pre>
                </div>

                <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Want to keep this for offline reading?
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {material.has_original_file && (
                      <Button
                        variant="outline"
                        onClick={handleDownloadOriginal}
                        className="gap-2 rounded-full border-primary/20 hover:bg-primary/5 text-primary"
                      >
                        <Download className="w-4 h-4" />
                        Original File
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      className="gap-2 rounded-full"
                    >
                      <FileText className="w-4 h-4" />
                      As Text
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
