'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, File, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FilePreview {
  file: File;
  name: string;
  size: string;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const newFiles = Array.from(selectedFiles).map(file => ({
      file,
      name: file.name,
      size: formatFileSize(file.size),
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast({
        title: 'No Files',
        description: 'Please upload at least one file',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const formData = new FormData();
      
      files.forEach((filePreview) => {
        formData.append('files', filePreview.file);
      });
      
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch(`/api/materials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: Do NOT set Content-Type for FormData - browser does it automatically
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();

      toast({
        title: 'Materials Uploaded Successfully!',
        description: `${files.length} file(s) processed • Tags: ${tags.length > 0 ? tags.join(', ') : 'None'}`,
      });

      setFiles([]);
      setTags([]);
      setTagInput('');
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      console.error('[v0] Upload error:', error);
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
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
        onClick={() => !isSubmitting && onOpenChange(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl font-display text-card-foreground">Upload Materials</h2>
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
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-3">
                Files
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer hover:border-primary/50 hover:bg-primary/5 ${
                  isDragging
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary/30'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileChange(e.target.files)}
                  className="hidden"
                  disabled={isSubmitting}
                  accept=".txt,.pdf,.doc,.docx,.md"
                />
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-card-foreground">
                  Drag files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: TXT, PDF, DOC, DOCX, MD
                </p>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-semibold">
                    {files.length} file(s) selected
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {files.map((filePreview, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-secondary/50 border border-border rounded-lg hover:bg-secondary transition-colors group"
                      >
                        <File className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-card-foreground truncate">
                            {filePreview.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {filePreview.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1 hover:bg-destructive/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tags Input */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-card-foreground mb-3">
                Tags (Optional)
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    disabled={isSubmitting || !tagInput.trim()}
                    className="gap-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-all duration-200"
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>

                {/* Tags Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full group hover:bg-primary/20 transition-colors"
                      >
                        <span className="text-sm text-primary">{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-0.5 hover:bg-primary/30 rounded-full transition-colors"
                        >
                          <X className="w-3 h-3 text-primary" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
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
                disabled={isSubmitting || files.length === 0}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
