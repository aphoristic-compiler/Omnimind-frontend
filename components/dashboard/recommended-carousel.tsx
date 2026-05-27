'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface Topic {
  topic: string;
  trend: number[];
}

interface RecommendedCarouselProps {
  topics: Topic[];
}

export function RecommendedCarousel({ topics }: RecommendedCarouselProps) {
  const displayTopics = topics.slice(0, 4);
  const maxValue = Math.max(...displayTopics.flatMap(t => t.trend));

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full hover-lift transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-lg text-card-foreground">For You</h2>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {displayTopics.map((item, index) => (
          <div
            key={index}
            className="group cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Topic Title */}
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                {item.topic}
              </p>
              <span className="text-xs text-muted-foreground">
                {(() => {
                  const lastValue = item.trend[item.trend.length - 1] || 0;
                  const firstValue = item.trend[0] || 1;
                  const growth = Math.round(((lastValue - firstValue) / firstValue) * 100);
                  return growth > 0 ? `+${growth}%` : `${growth}%`;
                })()}
              </span>
            </div>

            {/* Sparkline Chart */}
            <svg
              viewBox="0 0 100 20"
              className="w-full h-8 text-primary/50 group-hover:text-primary transition-colors duration-300"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Sparkline Path */}
              <polyline
                points={item.trend
                  .map((value, i) => {
                    const x = (i / (item.trend.length - 1)) * 100;
                    const y = 20 - (value / maxValue) * 15;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />

              {/* Fill Area */}
              <polygon
                points={`0,20 ${item.trend
                  .map((value, i) => {
                    const x = (i / (item.trend.length - 1)) * 100;
                    const y = 20 - (value / maxValue) * 15;
                    return `${x},${y}`;
                  })
                  .join(' ')} 100,20`}
                fill={`url(#grad-${index})`}
              />

              {/* Dots at start and end */}
              <circle
                cx="0"
                cy={20 - (item.trend[0] / maxValue) * 15}
                r="1"
                fill="currentColor"
              />
              <circle
                cx="100"
                cy={20 - (item.trend[item.trend.length - 1] / maxValue) * 15}
                r="1.5"
                fill="currentColor"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Footer */}
      {displayTopics.length === 0 && (
        <div className="flex items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">No trending topics yet</p>
        </div>
      )}
    </div>
  );
}
