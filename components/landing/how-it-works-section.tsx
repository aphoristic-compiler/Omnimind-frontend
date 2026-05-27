"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "I",
    title: "Upload Your Materials",
    description: "Drop files into OmniMind Hub. Supports documents, PDFs, articles, research papers, and more.",
    code: `// Upload via dashboard or API
const upload = await omnimind.upload({
  file: document,
  category: 'research',
  tags: ['ai', 'semantics']
})`,
  },
  {
    number: "II",
    title: "AI Processing",
    description: "Our semantic engine indexes and understands your content instantly, extracting insights and connections.",
    code: `// Automatic processing
const indexed = await omnimind.index({
  document_id: upload.id,
  extract: true,
  relationships: true
})`,
  },
  {
    number: "III",
    title: "Search & Discover",
    description: "Find knowledge with natural language. Ask questions and get relevant insights from your entire hub.",
    code: `// Semantic search
const results = await omnimind.search({
  query: 'Show papers on AI ethics',
  limit: 10,
  include_insights: true
})`,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-background text-foreground overflow-hidden"
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Process
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Three steps.
            <br />
            <span className="text-muted-foreground">Infinite possibilities.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left py-8 border-b border-foreground/10 transition-all duration-500 group ${
                  activeStep === index ? "opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-display text-3xl text-foreground/30">{step.number}</span>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Progress indicator */}
                    {activeStep === index && (
                      <div className="mt-4 h-px bg-foreground/20 overflow-hidden">
                        <div 
                          className="h-full bg-foreground w-0"
                          style={{
                            animation: 'progress 5s linear forwards'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-foreground/20 overflow-hidden rounded-lg bg-card">
              {/* Window header */}
              <div className="px-6 py-4 border-b border-foreground/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                  <div className="w-3 h-3 rounded-full bg-foreground/20" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">workflow.ts</span>
              </div>

              {/* Code content with syntax highlighting */}
              <div className="p-8 font-mono text-sm min-h-[280px] space-y-1">
                {steps[activeStep].code.split('\n').map((line, lineIndex) => {
                  // Simple syntax highlighter
                  const tokens = [];
                  let remaining = line;
                  let position = 0;

                  // Tokenize the line
                  while (remaining.length > 0) {
                    if (remaining.match(/^\/\//)) {
                      // Comment
                      tokens.push({ type: 'comment', text: remaining });
                      remaining = '';
                    } else if (remaining.match(/^(const|await|export|function|return|import|from)\b/)) {
                      const match = remaining.match(/^(const|await|export|function|return|import|from)\b/);
                      tokens.push({ type: 'keyword', text: match[0] });
                      remaining = remaining.slice(match[0].length);
                    } else if (remaining.match(/^['"`][^'"`]*['"`]/)) {
                      const match = remaining.match(/^['"`][^'"`]*['"`]/);
                      tokens.push({ type: 'string', text: match[0] });
                      remaining = remaining.slice(match[0].length);
                    } else if (remaining.match(/^\d+/)) {
                      const match = remaining.match(/^\d+/);
                      tokens.push({ type: 'number', text: match[0] });
                      remaining = remaining.slice(match[0].length);
                    } else if (remaining.match(/^[\{\}\[\]\(\),\.;:=]/)) {
                      const match = remaining.match(/^[\{\}\[\]\(\),\.;:=]/);
                      tokens.push({ type: 'punctuation', text: match[0] });
                      remaining = remaining.slice(match[0].length);
                    } else if (remaining.match(/^ +/)) {
                      const match = remaining.match(/^ +/);
                      tokens.push({ type: 'space', text: match[0] });
                      remaining = remaining.slice(match[0].length);
                    } else {
                      const match = remaining.match(/^[a-zA-Z_$][\w$]*/);
                      if (match) {
                        tokens.push({ type: 'variable', text: match[0] });
                        remaining = remaining.slice(match[0].length);
                      } else {
                        tokens.push({ type: 'text', text: remaining.charAt(0) });
                        remaining = remaining.slice(1);
                      }
                    }
                  }

                  return (
                    <div 
                      key={`${activeStep}-${lineIndex}`} 
                      className="leading-relaxed code-line-reveal flex items-center"
                      style={{ 
                        animationDelay: `${lineIndex * 80}ms`,
                      }}
                    >
                      <span className="text-foreground/30 select-none w-6 inline-block text-right mr-4">{lineIndex + 1}</span>
                      <span className="inline-flex flex-wrap items-center">
                        {tokens.map((token, tokenIndex) => {
                          let color = 'text-muted-foreground';
                          if (token.type === 'comment') color = 'text-[#6272A4] opacity-50';
                          if (token.type === 'keyword') color = 'text-[#FF79C6] drop-shadow-[0_0_6px_rgba(255,121,198,0.7)]';
                          if (token.type === 'string') color = 'text-[#50FA7B] drop-shadow-[0_0_6px_rgba(80,250,123,0.7)]';
                          if (token.type === 'number') color = 'text-[#8BE9FD] drop-shadow-[0_0_8px_rgba(139,233,253,0.8)]';
                          if (token.type === 'variable') color = 'text-[#F1FA8C] drop-shadow-[0_0_6px_rgba(241,250,140,0.6)]';
                          if (token.type === 'punctuation') color = 'text-[#BD93F9] drop-shadow-[0_0_4px_rgba(189,147,249,0.5)]';


                          if (token.type === 'space') return <span key={tokenIndex}>&nbsp;</span>;

                          return (
                            <span key={tokenIndex} className={`${color} code-char-reveal`}>
                              {token.text}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status */}
              <div className="px-6 py-4 border-t border-foreground/10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .code-line-reveal {
          opacity: 0;
          transform: translateX(-8px);
          animation: lineReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        @keyframes lineReveal {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .code-char-reveal {
          opacity: 0;
          filter: blur(8px);
          animation: charReveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        @keyframes charReveal {
          to {
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
}
