import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to map Supabase user to app user
  const mapAndSetUser = (sbUser: any) => {
    const appUser: User = {
      id: sbUser.id,
      email: sbUser.email,
      name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0],
      avatar_url: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.email}`
    };
    setUser(appUser);
    setIsLoading(false);
  };

  useEffect(() => {
    let subscription: { subscription: { unsubscribe: () => void } } | null = null;

    const initAuth = async () => {
      // 1. Supabase Mode
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            mapAndSetUser(session.user);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Session check failed", error);
        } finally {
          setIsLoading(false);
        }

        const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            mapAndSetUser(session.user);
          } else {
            setUser(null);
            setIsLoading(false);
          }
        });

        subscription = data;
      }
      // 2. Mock/Local Mode
      else {
        const storedUser = localStorage.getItem('soundflow_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      if (subscription?.subscription) {
        subscription.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Fallback for demo: try signup if login fails
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setIsLoading(false);
          throw error;
        }

        // Let the authStateChange handler update the user
      }
    } else {
      // Mock Sign In
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network
      const mockUser: User = {
        id: 'mock-user-123',
        email,
        name: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      localStorage.setItem('soundflow_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('soundflow_user');
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};