import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Placeholderide loomine, et rakendus käivituks
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const DashboardPage = () => <div>Dashboard</div>;
const TicketDetailPage = () => <div>Ticket Detail</div>;
const AdminPage = () => <div>Admin Dashboard</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/tickets/:id" element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;