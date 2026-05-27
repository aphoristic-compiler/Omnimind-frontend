'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RecentItem {
  id: string;
  title: string;
  category: string;
  uploaded_at: string;
}

interface MostVisitedCardProps {
  title: string;
  category: string;
  views: number;
  summary: string;
  items: RecentItem[];
}

export function MostVisitedCard({
  title,
  category,
  views,
  summary,
  items,
}: MostVisitedCardProps) {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  return (
    <div className="bg-card/50 backdrop-blur border border-border/50 rounded-2xl overflow-hidden hover-lift transition-all duration-500 h-full flex flex-col hover:border-foreground/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-foreground/5 via-transparent to-transparent p-8 border-b border-border/50">
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-foreground/10 text-foreground/70 text-xs font-semibold mb-3 border border-foreground/20">
              {category}
            </span>
            <h2 className="text-2xl lg:text-3xl font-display text-card-foreground leading-tight line-reveal">
              {title}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-3xl font-display text-foreground font-semibold">{views.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">views</p>
          </div>
        </div>

        {/* Summary */}
        <p className="text-card-foreground/80 text-sm leading-relaxed line-clamp-3">
          {summary}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Collapsible Section */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between p-6 hover:bg-foreground/5 transition-all duration-300 border-b border-border/50 group"
        >
          <div className="text-left">
            <h3 className="font-semibold text-card-foreground group-hover:translate-x-1 transition-transform">
              Recent Materials
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{items.length} recent uploads</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expandable Content */}
        {expanded && (
          <div className="flex-1 overflow-auto">
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-secondary/20 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/material/${item.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-card-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-2 py-1 rounded bg-secondary text-muted-foreground">
                          {item.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.uploaded_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!expanded && items.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <p className="text-sm text-muted-foreground">No recent materials</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Upload content to see it here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
