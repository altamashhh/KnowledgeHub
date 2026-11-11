import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/Login/LoginPage';
import { RegisterPage } from './pages/Register/RegisterPage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { KnowledgeLibraryPage } from './pages/KnowledgeLibrary/KnowledgeLibraryPage';
import { SearchPage } from './pages/Search/SearchPage';
import { KnowledgeItemDetailPage } from './pages/KnowledgeItemDetail/KnowledgeItemDetailPage';
import { KnowledgeItemEditPage } from './pages/KnowledgeItemEdit/KnowledgeItemEditPage';
import { TopicsPage } from './pages/Topics/TopicsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="library" element={<KnowledgeLibraryPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="items/:id" element={<KnowledgeItemDetailPage />} />
            <Route path="items/:id/edit" element={<KnowledgeItemEditPage />} />
            <Route path="topics" element={<TopicsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
