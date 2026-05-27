import { Suspense } from 'react';
import BrowseContent from './browse-content';

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoadingFallback />}>
      <BrowseContent />
    </Suspense>
  );
}

function BrowseLoadingFallback() {
  return (
    <main className="relative min-h-screen overflow-x-hidden noise-overlay bg-background">
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12 py-32">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-border border-t-foreground animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
