'use client';

import { useEffect, useRef } from 'react';

interface BrowseBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrowseBar({ open, onOpenChange }: BrowseBarProps) {
  const browseItems = [
    { label: 'Most Viewed', href: '#browse/most-viewed' },
    { label: 'Trending', href: '#browse/trending' },
    { label: 'All', href: '#browse/all' },
    { label: 'My Contributions', href: '#browse/contributions' },
  ];

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [open, onOpenChange]);

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Floating Browse Bar - Positioned below Browse button in header */}
      <div
        className={`fixed z-40 transition-all duration-300 ${
          open
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        style={{
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'fit-content',
        }}
      >
        <div className="relative bg-background/95 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Navigation Items - Horizontal layout like landing nav */}
          <div className="flex items-center gap-1 px-6 py-4">
            {browseItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenChange(false);
                }}
                className="relative group px-5 py-2 text-sm text-foreground/70 hover:text-foreground transition-colors duration-300 animate-char-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
