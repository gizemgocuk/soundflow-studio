import React from 'react';
import { NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../Icons';
import { RoutePath, NavItem } from '../../types';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: RoutePath.DASHBOARD, icon: <Icons.LayoutDashboard className="w-5 h-5" /> },
  { label: 'Upload', path: RoutePath.UPLOAD, icon: <Icons.UploadCloud className="w-5 h-5" /> },
  { label: 'Playlists', path: RoutePath.PLAYLISTS, icon: <Icons.ListMusic className="w-5 h-5" /> },
  { label: 'Insights', path: RoutePath.INSIGHTS, icon: <Icons.Sparkles className="w-5 h-5" /> },
  { label: 'Profile', path: RoutePath.PROFILE, icon: <Icons.User className="w-5 h-5" /> },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <Icons.Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={RoutePath.LOGIN} state={{ from: location }} replace />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border hidden md:flex flex-col bg-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icons.Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SoundFlow</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center mb-4 space-x-3">
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-10 h-10 rounded-full bg-secondary"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-2"
          >
            <Icons.LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-border flex items-center px-4 justify-between bg-card">
          <div className="flex items-center space-x-2">
            <Icons.Music className="w-6 h-6 text-primary" />
            <span className="font-bold">SoundFlow</span>
          </div>
          <button onClick={() => signOut()}>
            <Icons.LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden border-t border-border bg-card flex justify-around p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-md ${isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
              <span className="text-[10px] mt-1">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
};