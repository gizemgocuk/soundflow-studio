export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: number; // in seconds
  url: string; // Blob URL or Storage URL
  created_at: string;
  user_id: string;
  insights?: TrackInsight;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  tracks: string[]; // Array of Track IDs
  created_at: string;
  user_id: string;
}

export interface TrackInsight {
  mood: string;
  commercialViability: string;
  suggestedPlacements: string[];
  summary: string;
  generatedAt: string;
}

export enum RoutePath {
  LOGIN = '/login',
  DASHBOARD = '/dashboard',
  UPLOAD = '/upload',
  PLAYLISTS = '/playlists',
  INSIGHTS = '/insights',
  PROFILE = '/profile',
}

export interface NavItem {
  label: string;
  path: RoutePath;
  icon: React.ReactNode;
}