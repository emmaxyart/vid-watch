import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import WatchPage from './pages/WatchPage';
import SettingsPage from './pages/SettingsPage';
import { LibraryProvider } from './contexts/LibraryContext';

function App() {
  // Initialize dark mode
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = storedDarkMode ? storedDarkMode === 'true' : prefersDark;
    
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  return (
    <LibraryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/watch/:videoId" element={<WatchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
      </BrowserRouter>
    </LibraryProvider>
  );
}

export default App;