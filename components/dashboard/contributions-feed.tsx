'use client';

import React from 'react';
import { FileText, ArrowUpRight } from 'lucide-react';

interface RecentItem {
  id: string;
  title: string;
  category: string;
  uploaded_at: string;
}

interface ContributionsFeedProps {
  count: number;
  recent: RecentItem[];
}

export function ContributionsFeed({ count, recent }: ContributionsFeedProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full hover-lift transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-display text-primary font-semibold">{count}</span>
          <span className="text-sm text-muted-foreground">contributions</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Total materials uploaded</p>
      </div>

      {/* Recent Contributions */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-sm font-semibold text-card-foreground mb-3">Recent</h3>
        <div className="space-y-2 flex-1 min-h-0 overflow-y-auto">
          {recent.length > 0 ? (
            recent.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group"
              >
                <FileText className="w-4 h-4 text-primary/60 group-hover:text-primary flex-shrink-0 mt-0.5 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
              <p className="text-xs">No contributions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* View All Link */}
      {recent.length > 0 && (
        <button className="mt-4 flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg text-sm font-medium text-primary hover:bg-secondary/50 transition-colors border border-border/50 hover:border-primary/30 group">
          View All
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}
