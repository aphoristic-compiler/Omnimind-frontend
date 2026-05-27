'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in both title and content',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:8000/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();

      toast({
        title: 'Material Uploaded',
        description: `Category: ${data.category || 'Uncategorized'} • Summary processed`,
      });

      setTitle('');
      setContent('');
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      toast({
        title: 'Upload Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => !isSubmitting && onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-display text-card-foreground">Upload Material</h2>
            <button
              onClick={() => !isSubmitting && onOpenChange(false)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-card-foreground mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter material title"
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                disabled={isSubmitting}
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-card-foreground mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your content here..."
                rows={8}
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 resize-none"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-2">
                AI will analyze, categorize, and create a summary
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => !isSubmitting && onOpenChange(false)}
                disabled={isSubmitting}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  'Upload Material'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
