import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockBackend } from '../services/mockBackend';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { AudioPlayer } from '../components/audio/AudioPlayer';
import { Icons } from '../components/Icons';
import { RoutePath } from '../types';

export const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isAddTrackOpen, setIsAddTrackOpen] = useState(false);
  
  // Edit State
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  // Search State for adding tracks
  const [searchQuery, setSearchQuery] = useState('');

  const { data: playlist, isLoading: playlistLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => mockBackend.getPlaylist(id!),
    enabled: !!id
  });

  const { data: allTracks } = useQuery({
    queryKey: ['tracks'],
    queryFn: mockBackend.getTracks
  });

  // Derived state: Tracks in this playlist
  const playlistTracks = allTracks?.filter(t => playlist?.tracks.includes(t.id)) || [];
  
  // Derived state: Tracks NOT in this playlist (for adding)
  const availableTracks = allTracks?.filter(t => !playlist?.tracks.includes(t.id)) || [];
  const filteredAvailableTracks = availableTracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateMutation = useMutation({
    mutationFn: (updates: any) => mockBackend.updatePlaylist(id!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setIsEditing(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => mockBackend.deletePlaylist(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      navigate(RoutePath.PLAYLISTS);
    }
  });

  const handleSaveInfo = () => {
    updateMutation.mutate({ name: editName, description: editDesc });
  };

  const startEdit = () => {
    if (playlist) {
        setEditName(playlist.name);
        setEditDesc(playlist.description || '');
        setIsEditing(true);
    }
  };

  const addTrack = (trackId: string) => {
    if (!playlist) return;
    const newTracks = [...playlist.tracks, trackId];
    updateMutation.mutate({ tracks: newTracks });
  };

  const removeTrack = (trackId: string) => {
    if (!playlist) return;
    const newTracks = playlist.tracks.filter(tid => tid !== trackId);
    updateMutation.mutate({ tracks: newTracks });
  };

  if (playlistLoading) return <div className="flex justify-center p-12"><Icons.Loader className="animate-spin w-8 h-8 text-primary" /></div>;
  if (!playlist) return <div className="text-center p-12">Playlist not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex-1 space-y-4 w-full">
            <Link to={RoutePath.PLAYLISTS} className="text-sm text-muted-foreground hover:text-primary flex items-center mb-2">
                <Icons.ArrowLeft className="w-4 h-4 mr-1" /> Back to Playlists
            </Link>
            
            {isEditing ? (
                <div className="bg-card border border-border p-6 rounded-xl space-y-4 shadow-lg">
                    <Input label="Name" value={editName} onChange={e => setEditName(e.target.value)} />
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={editDesc} 
                            onChange={e => setEditDesc(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSaveInfo} loading={updateMutation.isPending}>Save Changes</Button>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold tracking-tight">{playlist.name}</h1>
                        <button onClick={startEdit} className="text-muted-foreground hover:text-primary p-1">
                            <Icons.Edit className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-lg text-muted-foreground mt-2">{playlist.description || "No description provided."}</p>
                    <div className="mt-4 flex items-center text-sm text-muted-foreground space-x-4">
                        <span>{playlistTracks.length} tracks</span>
                        <span>•</span>
                        <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            )}
        </div>

        <div className="flex gap-2">
            <Button onClick={() => setIsAddTrackOpen(true)}>
                <Icons.Plus className="mr-2 w-4 h-4" /> Add Tracks
            </Button>
            <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate()}>
                <Icons.Trash className="w-4 h-4" />
            </Button>
        </div>
      </div>

      <div className="h-px bg-border w-full" />

      {/* Track List */}
      <div className="space-y-4">
        {playlistTracks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                <p>This playlist is empty.</p>
                <Button variant="link" onClick={() => setIsAddTrackOpen(true)}>Add your first track</Button>
            </div>
        ) : (
            playlistTracks.map((track) => (
                <div key={track.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-all">
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold truncate">{track.title}</h4>
                                <p className="text-sm text-muted-foreground">{track.artist}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                onClick={() => removeTrack(track.id)}
                            >
                                <Icons.X className="w-4 h-4" />
                            </Button>
                        </div>
                        <AudioPlayer url={track.url} height={32} />
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Add Track Modal */}
      <Modal
        isOpen={isAddTrackOpen}
        onClose={() => setIsAddTrackOpen(false)}
        title="Add Tracks to Playlist"
      >
        <div className="space-y-4">
            <div className="relative">
                <Icons.Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input 
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Search your library..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoFocus
                />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {filteredAvailableTracks.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                        {searchQuery ? "No matching tracks found." : "No available tracks to add."}
                    </div>
                ) : (
                    filteredAvailableTracks.map(track => (
                        <div key={track.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors border border-transparent hover:border-border">
                            <div className="min-w-0 mr-3">
                                <div className="font-medium truncate">{track.title}</div>
                                <div className="text-xs text-muted-foreground">{track.artist}</div>
                            </div>
                            <Button size="sm" variant="secondary" onClick={() => addTrack(track.id)}>
                                Add
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
      </Modal>
    </div>
  );
};