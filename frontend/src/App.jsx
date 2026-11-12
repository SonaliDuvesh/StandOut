import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { PortfolioProvider } from './contexts/PortfolioContext';
import Builder from './pages/Builder';
import PortfolioView from './pages/PortfolioView';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <PortfolioProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/builder" element={<Builder />} />

            <Route path="/preview" element={<PortfolioView isPreview={true} />} />

            <Route path="/p/:slug" element={<PortfolioView isPublishedView={true} />} />

            <Route path="/:username" element={<PortfolioView isPreview={false} />} />

            <Route path="/" element={<PortfolioView isPreview={false} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PortfolioProvider>
    </ThemeProvider>
  );
}

export default App;
