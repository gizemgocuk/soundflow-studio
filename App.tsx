import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Insights } from './pages/Insights';
import { Playlists } from './pages/Playlists';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { Profile } from './pages/Profile';
import { RoutePath } from './types';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path={RoutePath.LOGIN} element={<Login />} />
        
        {/* Protected Routes Wrapper */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path={RoutePath.DASHBOARD} element={<Dashboard />} />
                <Route path={RoutePath.UPLOAD} element={<Upload />} />
                <Route path={RoutePath.PLAYLISTS} element={<Playlists />} />
                <Route path={`${RoutePath.PLAYLISTS}/:id`} element={<PlaylistDetail />} />
                <Route path={RoutePath.INSIGHTS} element={<Insights />} />
                <Route path={RoutePath.PROFILE} element={<Profile />} />
                {/* Fallback */}
                <Route path="*" element={<Navigate to={RoutePath.DASHBOARD} replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;