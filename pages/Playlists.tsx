import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Icons } from '../components/Icons';
import { RoutePath } from '../types';

export const Playlists = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists'],
    queryFn: mockBackend.getPlaylists
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => mockBackend.createPlaylist(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      setIsModalOpen(false);
      setNewPlaylistName('');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createMutation.mutate(newPlaylistName);
  };

  if (isLoading) return <div className="flex justify-center p-12"><Icons.Loader className="animate-spin w-8 h-8 text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Playlists</h1>
            <p className="text-muted-foreground mt-1">Organize your tracks into collections.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
            <Icons.Plus className="mr-2 h-4 w-4" /> New Playlist
        </Button>
      </div>

      {!playlists || playlists.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-xl">
          <Icons.ListMusic className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No playlists yet</h3>
          <p className="text-muted-foreground mb-6">Create a playlist to organize your library.</p>
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>Create Playlist</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <Link 
              key={playlist.id} 
              to={`${RoutePath.PLAYLISTS}/${playlist.id}`}
              className="group block"
            >
              <div className="bg-card border border-border rounded-xl p-6 transition-all group-hover:border-primary/50 group-hover:shadow-lg h-full flex flex-col">
                 <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <Icons.ListMusic className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">{playlist.name}</h3>
                 <p className="text-muted-foreground text-sm line-clamp-2 mt-2 flex-1">
                   {playlist.description || "No description"}
                 </p>
                 <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                    <span>{playlist.tracks.length} tracks</span>
                    <span className="group-hover:translate-x-1 transition-transform">View &rarr;</span>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Playlist"
      >
        <form onSubmit={handleCreate} className="space-y-4">
            <Input
                label="Playlist Name"
                placeholder="e.g. Summer Hits 2024"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
            />
            <div className="flex justify-end pt-4">
                <Button type="submit" loading={createMutation.isPending} disabled={!newPlaylistName.trim()}>
                    Create Playlist
                </Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};