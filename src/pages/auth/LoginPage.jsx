import React, { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterPage from './RegisterPage';
import ForgotPasswordPage from './ForgotPasswordPage';

export default function LoginPage() {
  const [currentView, setCurrentView] = useState('login'); // 'login' | 'register' | 'forgot-password'

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="auth-page-container">
      {/* Ambient background decorative elements */}
      <div className="ambient-spotlight spotlight-top" aria-hidden="true" />
      <div className="ambient-spotlight spotlight-bottom" aria-hidden="true" />

      {/* Main layout */}
      <div className="auth-layout-inner">
        {/* Brand Header */}
        <header className="auth-brand-header">
          <div className="brand-badge">
            <span className="radar-radar-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 10 10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </span>
            <span className="badge-text">RADAR AI // AUTHENTICATION</span>
          </div>

          <h1 className="brand-title">
            Hackathon <span className="brand-highlight">Radar AI</span>
          </h1>
          <p className="brand-tagline">
            Detecting the future of intelligent systems & multi-agent swarms.
          </p>
        </header>

        {/* View Switcher: Login, Register, or Forgot Password */}
        <main className="auth-card-wrapper">
          {currentView === 'login' && <LoginForm onNavigate={handleNavigate} />}
          {currentView === 'register' && <RegisterPage onNavigate={handleNavigate} />}
          {currentView === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigate} />}
        </main>

        {/* Hackathon Security & Status Footer */}
        <footer className="auth-page-footer">
          <div className="footer-status-pill">
            <span className="status-indicator-dot" />
            <span>MOCK AUTH SERVICE ONLINE (INTERNSHIP MODE)</span>
          </div>
          <p className="footer-copyright">
            RadarAI Hackathon Platform &bull; End-to-End Client Encryption
          </p>
        </footer>
      </div>
    </div>
  );
}
