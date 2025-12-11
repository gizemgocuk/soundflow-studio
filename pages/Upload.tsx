import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { mockBackend } from '../services/mockBackend';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Icons } from '../components/Icons';
import { RoutePath } from '../types';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const Upload = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('120');

  const uploadMutation = useMutation({
    mutationFn: (data: { file: File, metadata: any }) => 
        mockBackend.uploadTrack(data.file, data.metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      navigate(RoutePath.DASHBOARD);
    },
    onError: (err) => {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed. Please try again.");
      }
    }
  });

  const validateFile = (selectedFile: File): boolean => {
    setError(null);
    if (!selectedFile.type.startsWith('audio/')) {
      setError("Invalid file type. Please upload an audio file (MP3, WAV, FLAC).");
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File is too large (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB). Max size is 20MB.`);
      return false;
    }
    return true;
  };

  const handleFileSelection = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    uploadMutation.mutate({
      file,
      metadata: {
        title,
        artist,
        genre,
        bpm: parseInt(bpm) || 0
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Upload Track</h1>
        <p className="text-muted-foreground">Add a new master to your library for analysis and distribution.</p>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Drag & Drop Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Audio File</label>
            {!file ? (
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ease-in-out
                  ${dragActive ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50 hover:border-muted-foreground/50"}
                  ${error ? "border-destructive/50 bg-destructive/5" : ""}
                `}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="audio/*" 
                  onChange={handleChange}
                  className="hidden" 
                />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className={`p-4 rounded-full ${dragActive ? "bg-primary/20" : "bg-secondary"}`}>
                    <Icons.UploadCloud className={`w-8 h-8 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      <span className="text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">WAV, MP3, FLAC (Max 20MB)</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20">
                <div className="flex items-center space-x-4 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icons.FileAudio className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={removeFile}
                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {error && (
              <div className="flex items-center space-x-2 text-sm text-destructive mt-2 animate-in slide-in-from-top-1">
                <Icons.AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Metadata Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
                label="Track Title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="e.g. Midnight City"
                required
            />
            <Input 
                label="Artist Name" 
                value={artist} 
                onChange={e => setArtist(e.target.value)} 
                placeholder="e.g. M83"
                required
            />
            <Input 
                label="Genre" 
                value={genre} 
                onChange={e => setGenre(e.target.value)} 
                placeholder="e.g. Synthpop"
                required
            />
            <div className="space-y-2">
               <label className="text-sm font-medium">BPM</label>
               <div className="relative">
                 <input
                    type="number"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={bpm}
                    onChange={e => setBpm(e.target.value)}
                    required
                 />
                 <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <span className="text-xs text-muted-foreground">BPM</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-border flex justify-end space-x-4">
            <Button 
                type="button" 
                variant="ghost" 
                onClick={() => navigate(-1)}
                disabled={uploadMutation.isPending}
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                loading={uploadMutation.isPending} 
                disabled={!file}
                className="min-w-[140px]"
            >
                {uploadMutation.isPending ? 'Uploading...' : 'Upload Track'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};