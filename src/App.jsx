import React from 'react';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import './components/auth/Auth.css';

export default function App() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}
