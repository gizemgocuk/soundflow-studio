import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Track, User, Playlist } from '../types';

// --- Local Storage Helpers for Fallback ---
const STORAGE_KEYS = {
  USER: 'soundflow_user',
  TRACKS: 'soundflow_tracks',
  PLAYLISTS: 'soundflow_playlists'
};

const getLocalUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : null;
};

const getLocalTracks = (): Track[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRACKS);
  return stored ? JSON.parse(stored) : [];
};

const saveLocalTracks = (tracks: Track[]) => {
  localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
};

const getLocalPlaylists = (): Playlist[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
  return stored ? JSON.parse(stored) : [];
};

const saveLocalPlaylists = (playlists: Playlist[]) => {
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
};

// --- Helper to map Supabase User ---
const mapUser = (sbUser: any): User => {
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
    avatar_url: sbUser.user_metadata?.avatar_url
  };
};

// --- Backend Implementation ---

export const mockBackend = {
  getCurrentUser: async (): Promise<User | null> => {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      return user ? mapUser(user) : null;
    } else {
      return getLocalUser();
    }
  },

  // --- Tracks ---
  uploadTrack: async (file: File, metadata: Omit<Track, 'id' | 'url' | 'created_at' | 'user_id' | 'duration'>): Promise<Track> => {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // 1. Upload File
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audio')
        .getPublicUrl(fileName);

      // 3. Insert Record
      const { data, error } = await supabase
        .from('tracks')
        .insert({
          user_id: user.id,
          title: metadata.title,
          artist: metadata.artist,
          genre: metadata.genre,
          bpm: metadata.bpm,
          duration: 180, 
          url: publicUrl,
          insights: null
        })
        .select()
        .single();
      if (error) throw error;
      return data as Track;
    } else {
      // Local Fallback
      const user = getLocalUser();
      if (!user) throw new Error("Unauthorized");

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newTrack: Track = {
            id: Math.random().toString(36).substring(7),
            user_id: user.id,
            url: reader.result as string, // Data URI
            created_at: new Date().toISOString(),
            duration: 180, // Mock duration
            ...metadata,
          };
          const tracks = getLocalTracks();
          saveLocalTracks([newTrack, ...tracks]);
          setTimeout(() => resolve(newTrack), 800);
        };
        reader.readAsDataURL(file);
      });
    }
  },

  getTracks: async (): Promise<Track[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Track[];
    } else {
      // Local Fallback
      // In a real app we'd filter by user_id, but for local demo we return all
      return new Promise(resolve => {
        setTimeout(() => resolve(getLocalTracks()), 500);
      });
    }
  },
  
  updateTrackInsights: async (trackId: string, insights: any) => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('tracks')
        .update({ insights })
        .eq('id', trackId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Local Fallback
      const tracks = getLocalTracks();
      const idx = tracks.findIndex(t => t.id === trackId);
      if (idx !== -1) {
        tracks[idx].insights = insights;
        saveLocalTracks(tracks);
        return tracks[idx];
      }
      throw new Error("Track not found");
    }
  },

  deleteTrack: async (trackId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId);
      if (error) throw error;
    } else {
      // Local Fallback
      const tracks = getLocalTracks();
      const newTracks = tracks.filter(t => t.id !== trackId);
      saveLocalTracks(newTracks);
    }
  },

  // --- Playlists ---
  createPlaylist: async (name: string, description: string = ''): Promise<Playlist> => {
    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          user_id: user.id,
          name,
          description,
          tracks: [] 
        })
        .select()
        .single();
      if (error) throw error;
      return data as Playlist;
    } else {
      // Local Fallback
      const user = getLocalUser();
      if (!user) throw new Error("Unauthorized");
      const newPlaylist: Playlist = {
        id: Math.random().toString(36).substring(7),
        user_id: user.id,
        name,
        description,
        tracks: [],
        created_at: new Date().toISOString()
      };
      const playlists = getLocalPlaylists();
      saveLocalPlaylists([newPlaylist, ...playlists]);
      return newPlaylist;
    }
  },

  getPlaylists: async (): Promise<Playlist[]> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Playlist[];
    } else {
      return new Promise(resolve => setTimeout(() => resolve(getLocalPlaylists()), 500));
    }
  },

  getPlaylist: async (id: string): Promise<Playlist | undefined> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return undefined;
      return data as Playlist;
    } else {
      const playlists = getLocalPlaylists();
      return playlists.find(p => p.id === id);
    }
  },

  updatePlaylist: async (id: string, updates: Partial<Playlist>): Promise<Playlist> => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('playlists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Playlist;
    } else {
      const playlists = getLocalPlaylists();
      const idx = playlists.findIndex(p => p.id === id);
      if (idx !== -1) {
        playlists[idx] = { ...playlists[idx], ...updates };
        saveLocalPlaylists(playlists);
        return playlists[idx];
      }
      throw new Error("Playlist not found");
    }
  },

  deletePlaylist: async (id: string): Promise<void> => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } else {
      const playlists = getLocalPlaylists();
      const newPlaylists = playlists.filter(p => p.id !== id);
      saveLocalPlaylists(newPlaylists);
    }
  }
};