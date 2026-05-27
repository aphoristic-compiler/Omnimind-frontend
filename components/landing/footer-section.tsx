"use client";

export function FooterSection() {
  return (
    <footer className="relative border-t border-foreground/10">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-8 lg:py-12">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <a href="#" className="inline-flex items-center gap-2">
            <span className="text-xl font-display">OmniMind</span>
            <span className="text-xs text-muted-foreground font-mono">Hub</span>
          </a>

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
