'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Home, FolderOpen, FileText, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrendingTopic {
  topic: string;
  trend: number[];
}

interface SidebarProps {
  open: boolean;
  onToggle: (open: boolean) => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [apiConnected, setApiConnected] = useState(true);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch(`/api/dashboard/stats`);
        setApiConnected(response.ok);
      } catch {
        setApiConnected(false);
      }
    };

    checkApiStatus();
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Browse', href: '/dashboard/browse', icon: FolderOpen },
    { name: 'My Materials', href: '/dashboard/materials', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => onToggle(!open)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 hover:bg-card rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-30 top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="px-6 pt-8 pb-8 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">OM</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-sidebar-foreground">OmniMind</h1>
              <p className="text-xs text-sidebar-foreground/60">Hub</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors duration-200 group"
              >
                <Icon className="w-5 h-5 group-hover:text-sidebar-primary transition-colors" />
                <span className="text-sm font-medium">{link.name}</span>
              </a>
            );
          })}
        </nav>

        {/* Trending Topics */}
        <div className="px-4 py-6 border-t border-sidebar-border space-y-4">
          <div className="flex items-center gap-2 px-4">
            <TrendingUp className="w-4 h-4 text-sidebar-foreground/60" />
            <h3 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider">
              In Demand
            </h3>
          </div>
          <div className="space-y-2">
            {['AI Agents', 'LLM Fine-tuning', 'Vector DBs', 'RAG Systems'].map((topic) => (
              <button
                key={topic}
                className="w-full text-left px-4 py-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-primary hover:bg-sidebar-accent/20 rounded transition-colors duration-200"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* API Status Footer */}
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-sidebar-accent/20 border border-sidebar-border/50">
            <div
              className={`w-2 h-2 rounded-full ${
                apiConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-sidebar-foreground">
                {apiConnected ? 'API Connected' : 'API Offline'}
              </p>
              <p className="text-[10px] text-sidebar-foreground/60">
                {apiConnected ? 'All systems' : 'Limited'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => onToggle(false)}
        />
      )}
    </>
  );
}
