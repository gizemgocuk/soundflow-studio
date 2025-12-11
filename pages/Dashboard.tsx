import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockBackend } from '../services/mockBackend';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { Icons } from '../components/Icons';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { RoutePath } from '../types';

export const Dashboard = () => {
  const queryClient = useQueryClient();
  const { data: tracks, isLoading, isError, error } = useQuery({
    queryKey: ['tracks'],
    queryFn: mockBackend.getTracks
  });

  const deleteMutation = useMutation({
    mutationFn: mockBackend.deleteTrack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
    }
  });

  if (isLoading) return <div className="flex justify-center p-12"><Icons.Loader className="animate-spin w-8 h-8 text-primary" /></div>;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-destructive/20 rounded-xl bg-destructive/5">
        <Icons.AlertCircle className="w-12 h-12 text-destructive" />
        <div className="space-y-2">
            <h3 className="text-xl font-semibold">Failed to load tracks</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">{error instanceof Error ? error.message : "An unknown error occurred while fetching your library."}</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['tracks'] })} variant="outline">
            Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Your Tracks</h1>
            <p className="text-muted-foreground mt-1">Manage and preview your audio library.</p>
        </div>
        <Link to={RoutePath.UPLOAD}>
            <Button>
                <Icons.UploadCloud className="mr-2 h-4 w-4" /> Upload New
            </Button>
        </Link>
      </div>

      {!tracks || tracks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Icons.Music className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No tracks uploaded yet</h3>
          <p className="text-muted-foreground mb-6">Upload your first master to get started.</p>
          <Link to={RoutePath.UPLOAD}>
            <Button variant="outline">Upload Track</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {tracks.map((track) => (
            <div key={track.id} className="bg-card border border-border rounded-xl p-6 transition-all hover:border-primary/50 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">{track.genre}</span>
                             <span className="text-xs text-muted-foreground">{track.bpm} BPM</span>
                        </div>
                        <h3 className="text-xl font-bold truncate">{track.title}</h3>
                        <p className="text-muted-foreground">{track.artist}</p>
                    </div>
                    
                    <div className="flex gap-2">
                         <Link to={RoutePath.INSIGHTS}>
                             <Button variant="secondary" size="sm">
                                <Icons.Sparkles className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Insights</span>
                             </Button>
                        </Link>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMutation.mutate(track.id)}
                            disabled={deleteMutation.isPending}
                        >
                            <Icons.Trash className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <AudioPlayer url={track.url} height={40} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
