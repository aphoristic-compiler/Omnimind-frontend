'use client';

import { useEffect, useState } from 'react';

export function BotSortingAnimation() {
  const [activeDrawer, setActiveDrawer] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [flipIndex, setFlipIndex] = useState(0);
  const [filesIndexed, setFilesIndexed] = useState(2847);
  const [botMoving, setBotMoving] = useState(false);

  const fileLabels = [
    ['Schema', 'API Doc', 'Config', 'Model', 'Dataset', 'Report', 'Analysis', 'Query'],
    ['Embed', 'Vector', 'Index', 'Cache', 'Pipeline', 'Workflow', 'Template', 'Script'],
    ['Backup', 'Archive', 'Logs', 'Meta', 'Export', 'Import', 'Sync', 'Draft'],
  ];

  const tabColors = [
    ['#7a9f7a', '#9f8a6a', '#8a7a9f', '#6a8a9f', '#9f7a7a', '#7a8a9f', '#9a7a9f', '#7a9f8a'],
    ['#8a9f7a', '#7a8a9f', '#9f8a7a', '#7a9f9f', '#9f7a8a', '#8a7a8a', '#7a7a9f', '#9f9f7a'],
    ['#9f8a8a', '#8a9f8a', '#8a8a9f', '#9f9f8a', '#8a9f9f', '#9f8a9f', '#7a8a8a', '#8a7a7a'],
  ];

  const drawerLabels = ['MODELS & SCHEMAS', 'VECTORS & PIPELINES', 'ARCHIVES & LOGS'];

  // Main cycle: bot arrives -> drawer opens -> flip files -> drawer closes -> bot moves
  useEffect(() => {
    let mounted = true;
    
    const runCycle = async () => {
      if (!mounted) return;
      
      // Bot arrives, open drawer
      setIsDrawerOpen(true);
      
      // Wait while flipping through files
      await new Promise(resolve => setTimeout(resolve, 4000));
      if (!mounted) return;
      
      // Close drawer
      setIsDrawerOpen(false);
      setFlipIndex(0);
      
      // Wait for drawer to close
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!mounted) return;
      
      // Bot starts moving
      setBotMoving(true);
      
      // Move to next drawer
      setActiveDrawer((prev) => (prev + 1) % 3);
      
      // Wait for bot to arrive
      await new Promise(resolve => setTimeout(resolve, 600));
      if (!mounted) return;
      
      setBotMoving(false);
    };

    const cycleInterval = setInterval(runCycle, 5200);
    
    // Initial open
    setTimeout(() => setIsDrawerOpen(true), 500);

    return () => {
      mounted = false;
      clearInterval(cycleInterval);
    };
  }, []);

  // Rapid file flipping when drawer is open
  useEffect(() => {
    if (!isDrawerOpen) return;
    
    const flipInterval = setInterval(() => {
      setFlipIndex((prev) => (prev + 1) % 8);
      setFilesIndexed((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 100);

    return () => clearInterval(flipInterval);
  }, [isDrawerOpen]);

  // Fixed drawer positions (percentage from top of container)
  const drawerPositions = ['0%', '34%', '68%'];
  const drawerHeight = '30%';
  
  // Bot position based on active drawer
  const botYPositions = ['12%', '46%', '80%'];

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      {/* Subtle grid background */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Single Header */}
      <div className="absolute top-6 left-6 z-10">
        <h1 className="text-2xl font-light tracking-wider text-foreground/90">OmniMind</h1>
        <p className="text-xs font-mono text-foreground/40 tracking-widest mt-1">Knowledge Management Hub</p>
      </div>

      {/* Filing Cabinet Container - Fixed positions for all 3 drawers */}
      <div className="absolute top-20 left-6 right-24 bottom-16">
        {[0, 1, 2].map((drawerIdx) => {
          const isActive = activeDrawer === drawerIdx;
          const isOpen = isActive && isDrawerOpen;
          
          return (
            <div 
              key={drawerIdx}
              className="absolute left-0 right-0 overflow-hidden"
              style={{
                top: drawerPositions[drawerIdx],
                height: drawerHeight,
              }}
            >
              {/* Collapsed State - Thin vertical strip on left */}
              <div
                className={`absolute top-0 bottom-0 left-0 rounded-lg border transition-all duration-500 ease-out overflow-hidden flex flex-col justify-center ${
                  isOpen 
                    ? 'w-0 opacity-0' 
                    : 'w-10 opacity-100'
                } ${
                  isActive && !isOpen
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-foreground/10 bg-foreground/[0.03]'
                }`}
              >
                {/* Vertical text for collapsed drawer */}
                <div className="flex flex-col items-center gap-2 py-4">
                  <div className={`w-5 h-1 rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-primary/60' : 'bg-foreground/20'
                  }`} />
                  <span 
                    className={`text-[9px] font-mono tracking-wider whitespace-nowrap transition-colors duration-300 ${
                      isActive ? 'text-primary/80' : 'text-foreground/30'
                    }`}
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
                  >
                    DRAWER {drawerIdx + 1}
                  </span>
                </div>
              </div>

              {/* Expanded State - Full width drawer with files */}
              <div
                className={`absolute top-0 bottom-0 rounded-lg border border-foreground/15 bg-foreground/[0.02] transition-all duration-500 ease-out overflow-hidden ${
                  isOpen 
                    ? 'left-0 right-0 opacity-100' 
                    : 'left-0 right-[calc(100%-2.5rem)] opacity-0'
                }`}
                style={{
                  boxShadow: isOpen ? '0 10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)' : 'none',
                }}
              >
                {/* Drawer header */}
                <div className="absolute top-0 left-0 right-0 h-7 border-b border-foreground/10 flex items-center px-3 bg-foreground/[0.02]">
                  <div className="w-6 h-1 rounded-full bg-foreground/20 mr-2" />
                  <span className="text-[10px] font-mono text-foreground/40 tracking-wider">
                    DRAWER {drawerIdx + 1}
                  </span>
                  <span className="text-[9px] font-mono text-foreground/25 tracking-wide ml-2">
                    {drawerLabels[drawerIdx]}
                  </span>
                  
                  {/* Search indicator */}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[9px] font-mono text-primary/70 tracking-wider animate-pulse">
                      SEARCHING
                    </span>
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <div 
                          key={i}
                          className="w-1 h-1 rounded-full bg-primary/70 animate-pulse"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Files container */}
                <div className="absolute top-9 left-2 right-2 bottom-2 flex items-end gap-[3px]">
                  {fileLabels[drawerIdx].map((label, fileIdx) => {
                    const isFlipped = fileIdx < flipIndex;
                    const isCurrentlyFlipping = fileIdx === flipIndex;
                    
                    return (
                      <div
                        key={fileIdx}
                        className="relative flex-1 h-full transition-all"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: isCurrentlyFlipping
                            ? 'rotateY(-50deg) translateX(-10px) scale(1.02)'
                            : isFlipped
                            ? 'rotateY(-75deg) translateX(-18px)'
                            : 'rotateY(0deg) translateX(0px)',
                          transformOrigin: 'left center',
                          transition: 'transform 0.08s ease-out',
                          zIndex: isFlipped ? 5 : isCurrentlyFlipping ? 15 : 10 - fileIdx,
                          opacity: isFlipped ? 0.35 : 1,
                        }}
                      >
                        {/* File Tab */}
                        <div 
                          className="absolute -top-5 left-0 right-0 h-6 rounded-t flex items-center justify-center transition-all duration-100"
                          style={{ 
                            backgroundColor: tabColors[drawerIdx][fileIdx],
                            boxShadow: isCurrentlyFlipping 
                              ? `0 -2px 15px ${tabColors[drawerIdx][fileIdx]}60` 
                              : 'none',
                          }}
                        >
                          <span className="text-[8px] font-mono text-white/90 tracking-wide font-medium">
                            {label}
                          </span>
                        </div>
                        
                        {/* File Body */}
                        <div 
                          className="absolute inset-0 rounded-b border-l border-r border-b transition-all duration-100"
                          style={{
                            backgroundColor: isCurrentlyFlipping ? '#1f1f1f' : '#141414',
                            borderColor: isCurrentlyFlipping 
                              ? `${tabColors[drawerIdx][fileIdx]}80`
                              : 'rgba(255,255,255,0.06)',
                            boxShadow: isCurrentlyFlipping 
                              ? `0 0 25px ${tabColors[drawerIdx][fileIdx]}30, inset 0 0 20px rgba(255,255,255,0.02)`
                              : 'inset 0 0 15px rgba(0,0,0,0.4)',
                          }}
                        >
                          {/* Content lines */}
                          <div className="p-1.5 space-y-1 pt-2">
                            {[...Array(4)].map((_, i) => (
                              <div 
                                key={i}
                                className="h-[2px] rounded-full transition-colors duration-100"
                                style={{ 
                                  width: `${45 + (i * 11) % 50}%`,
                                  backgroundColor: isCurrentlyFlipping 
                                    ? 'rgba(255,255,255,0.15)' 
                                    : 'rgba(255,255,255,0.06)',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bot Character */}
      <div
        className="absolute right-4 w-16 z-20 transition-all ease-out"
        style={{ 
          top: botYPositions[activeDrawer],
          transitionDuration: botMoving ? '500ms' : '200ms',
        }}
      >
        <div className="relative">
          {/* Antenna */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="w-0.5 h-3 bg-foreground/40 rounded-full" />
            <div 
              className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-primary rounded-full"
              style={{ 
                boxShadow: '0 0 12px rgba(var(--primary), 0.6)',
                animation: 'pulse 1s ease-in-out infinite',
              }}
            />
          </div>

          {/* Head */}
          <div className="w-14 h-14 mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-b from-[#5a9aec] to-[#3575c4] rounded-xl border-2 border-[#6aabe8]/50">
              <div className="absolute inset-[4px] bg-[#0a0a12] rounded-lg flex items-center justify-center gap-2">
                {/* Eyes */}
                <div 
                  className="w-2 h-4 bg-[#5a9aec] rounded-full"
                  style={{
                    animation: isDrawerOpen ? 'eyeBlink 0.15s ease infinite' : 'none',
                    boxShadow: '0 0 8px #5a9aec80',
                  }}
                />
                <div 
                  className="w-2 h-4 bg-[#5a9aec] rounded-full"
                  style={{
                    animation: isDrawerOpen ? 'eyeBlink 0.15s ease infinite' : 'none',
                    animationDelay: '0.05s',
                    boxShadow: '0 0 8px #5a9aec80',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="w-10 h-12 mx-auto -mt-1 bg-gradient-to-b from-[#2a2a30] to-[#1a1a20] rounded-lg border border-foreground/10 relative">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded bg-[#0a0a0a] border border-foreground/10 flex items-center justify-center">
              <div 
                className="w-2.5 h-2.5 rounded-full bg-primary/80"
                style={{ 
                  boxShadow: '0 0 12px rgba(var(--primary), 0.5)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </div>
          </div>

          {/* Arms */}
          {isDrawerOpen ? (
            <>
              <div 
                className="absolute top-[58px] -left-2 origin-top"
                style={{ animation: 'armFlipLeft 0.1s ease-in-out infinite' }}
              >
                <div className="w-2 h-6 bg-gradient-to-b from-[#3a3a40] to-[#2a2a30] rounded-full" />
                <div className="w-3 h-3 bg-[#5a9aec] rounded-full -mt-0.5 -ml-0.5" />
              </div>
              <div 
                className="absolute top-[58px] -right-2 origin-top"
                style={{ animation: 'armFlipRight 0.1s ease-in-out infinite' }}
              >
                <div className="w-2 h-6 bg-gradient-to-b from-[#3a3a40] to-[#2a2a30] rounded-full ml-auto" />
                <div className="w-3 h-3 bg-[#5a9aec] rounded-full -mt-0.5 ml-auto -mr-0.5" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute top-[60px] left-0.5 w-1.5 h-8 bg-gradient-to-b from-[#3a3a40] to-[#2a2a30] rounded-full" />
              <div className="absolute top-[60px] right-0.5 w-1.5 h-8 bg-gradient-to-b from-[#3a3a40] to-[#2a2a30] rounded-full" />
            </>
          )}

          {/* Feet */}
          <div className="flex justify-center gap-2 -mt-0.5">
            <div className="w-3 h-2 bg-[#5a9aec] rounded-full" />
            <div className="w-3 h-2 bg-[#5a9aec] rounded-full" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
        <div>
          <p className="text-[9px] font-mono text-primary/50 tracking-wider">PROCESSING</p>
          <p className="text-xs text-foreground/40 mt-0.5">Organizing your knowledge</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-500/60 animate-pulse" />
            <span className="text-[9px] text-foreground/25">Smart Organization</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-blue-500/60 animate-pulse" />
            <span className="text-[9px] text-foreground/25">Instant Search</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-mono text-foreground/25 tracking-wider">FILES INDEXED</p>
          <p className="text-lg font-light text-foreground/50 tabular-nums">{filesIndexed.toLocaleString()}</p>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes armFlipLeft {
          0%, 100% { transform: rotate(-40deg) translateX(-6px); }
          50% { transform: rotate(-10deg) translateX(4px); }
        }
        @keyframes armFlipRight {
          0%, 100% { transform: rotate(40deg) translateX(6px); }
          50% { transform: rotate(10deg) translateX(-4px); }
        }
        @keyframes eyeBlink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.3); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
