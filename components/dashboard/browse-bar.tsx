'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BrowseBarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrowseBar({ open, onOpenChange }: BrowseBarProps) {
  const router = useRouter();
  
  const browseItems = [
    { label: 'Most Viewed', filter: 'most-viewed' },
    { label: 'Trending', filter: 'trending' },
    { label: 'All', filter: 'all' },
    { label: 'My Contributions', filter: 'contributions' },
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

  const handleNavigation = (filter: string) => {
    onOpenChange(false);
    router.push(`/browse?filter=${filter}`);
  };

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
              <button
                key={item.label}
                onClick={() => handleNavigation(item.filter)}
                className="relative group px-5 py-2 text-sm text-foreground/70 hover:text-foreground transition-colors duration-300 animate-char-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-foreground transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
