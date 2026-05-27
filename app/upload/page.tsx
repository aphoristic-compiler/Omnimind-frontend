'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, FileText, Tag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface FilePreview {
  file: File;
  name: string;
  size: string;
  tags: string[];
  tagInput: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [globalTagInput, setGlobalTagInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleFiles = useCallback((newFiles: FileList | File[]) => {
    const validExtensions = ['.txt', '.pdf', '.doc', '.docx', '.md'];
    const fileArray = Array.from(newFiles);
    
    const validFiles = fileArray.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return validExtensions.includes(ext);
    });

    if (validFiles.length !== fileArray.length) {
      toast({
        title: 'Invalid File Type',
        description: 'Only TXT, PDF, DOC, DOCX, and MD files are supported.',
        variant: 'destructive',
      });
    }

    const newPreviews: FilePreview[] = validFiles.map(file => ({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      tags: [],
      tagInput: ''
    }));

    setFiles(prev => [...prev, ...newPreviews]);
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileTagInput = (index: number, value: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, tagInput: value } : f));
  };

  const addTagToFile = (index: number) => {
    setFiles(prev => prev.map((f, i) => {
      if (i === index) {
        const trimmedTag = f.tagInput.trim();
        if (trimmedTag && !f.tags.includes(trimmedTag)) {
          return { ...f, tags: [...f.tags, trimmedTag], tagInput: '' };
        }
      }
      return f;
    }));
  };

  const removeTagFromFile = (fileIndex: number, tagToRemove: string) => {
    setFiles(prev => prev.map((f, i) => {
      if (i === fileIndex) {
        return { ...f, tags: f.tags.filter(tag => tag !== tagToRemove) };
      }
      return f;
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTagToFile(index);
    }
  };

  const addGlobalTag = () => {
    const trimmedTag = globalTagInput.trim();
    if (trimmedTag) {
      setFiles(prev => prev.map(f => {
        if (!f.tags.includes(trimmedTag)) {
          return { ...f, tags: [...f.tags, trimmedTag] };
        }
        return f;
      }));
      setGlobalTagInput('');
    }
  };

  const handleGlobalTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGlobalTag();
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
      const formData = new FormData();
      
      files.forEach((filePreview) => {
        formData.append('files', filePreview.file);
      });
      
      // Send tags as a 2D array, mapping to each file
      const allTags = files.map(f => f.tags);
      formData.append('tags', JSON.stringify(allTags));

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated. Please log in again.');
      }

      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      toast({
        title: 'Materials Uploaded Successfully!',
        description: `${files.length} file(s) processed`,
      });

      // Clear dashboard cache to update stats and contributions
      sessionStorage.removeItem('dashboard_stats');

      // Redirect to dashboard after successful upload
      router.push('/dashboard');
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-display">Upload Materials</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Drop Zone */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground/80">
              Files
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                transition-all duration-200
                ${isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-foreground/20 hover:border-foreground/40 hover:bg-secondary/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.pdf,.doc,.docx,.md"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
              />
              <Upload className="w-10 h-10 mx-auto mb-4 text-foreground/40" />
              <p className="text-foreground/70 mb-1">
                Drag files here or click to browse
              </p>
              <p className="text-sm text-foreground/50">
                Supports: TXT, PDF, DOC, DOCX, MD
              </p>
            </div>
          </div>

          {/* Selected Files & Per-File Tags */}
          {files.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-foreground/60">
                {files.length} file(s) selected
              </p>
              <div className="space-y-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="p-4 bg-secondary/30 rounded-xl border border-foreground/10 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-foreground/60" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-foreground/50">{file.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1.5 hover:bg-foreground/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Per-File Tags Input */}
                    <div className="relative pl-8">
                      <input
                        type="text"
                        value={file.tagInput}
                        onChange={(e) => updateFileTagInput(index, e.target.value)}
                        onKeyDown={(e) => handleTagKeyDown(e, index)}
                        placeholder="Add manual tags for this file (Enter to save)"
                        className="w-full px-4 py-2 pr-10 bg-background/50 border border-foreground/10 rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => addTagToFile(index)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-foreground/10 rounded transition-colors"
                      >
                        <Tag className="w-4 h-4 text-foreground/50" />
                      </button>
                    </div>

                    {/* Per-File Tags Display */}
                    {file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-8">
                        {file.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTagFromFile(index, tag)}
                              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Global Tags Input */}
          {files.length > 1 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="block text-sm font-medium text-foreground/80">
                Apply Tag to All Files
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={globalTagInput}
                  onChange={(e) => setGlobalTagInput(e.target.value)}
                  onKeyDown={handleGlobalTagKeyDown}
                  placeholder="Add a tag to all files and press Enter"
                  className="w-full px-4 py-3 pr-12 bg-secondary/50 border border-foreground/10 rounded-lg text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={addGlobalTag}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-foreground/10 rounded transition-colors"
                >
                  <Tag className="w-4 h-4 text-foreground/50" />
                </button>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border">
            <Link href="/dashboard" className="flex-1">
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-full"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || files.length === 0}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
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
      </main>
    </div>
  );
}
