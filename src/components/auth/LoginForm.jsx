import React, { useState } from 'react';
import PasswordInput from './PasswordInput';
import { validateEmail, validatePassword, validateLoginForm } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onNavigate }) {
  const { login, isLoading, authError, authSuccess, clearMessages, user, logout } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Handle individual field updates
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear backend/context messages when user starts typing again
    if (authError || authSuccess) {
      clearMessages();
    }

    // Real-time re-validation for touched fields
    if (touched[name]) {
      let err = null;
      if (name === 'email') err = validateEmail(value);
      if (name === 'password') err = validatePassword(value);

      setFieldErrors((prev) => ({
        ...prev,
        [name]: err,
      }));
    }
  };

  // Mark field as touched on blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let err = null;
    if (name === 'email') err = validateEmail(value);
    if (name === 'password') err = validatePassword(value);

    setFieldErrors((prev) => ({
      ...prev,
      [name]: err,
    }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({ email: true, password: true });

    // Validate
    const { errors, isValid } = validateLoginForm(formData);
    setFieldErrors(errors);

    if (!isValid) {
      return;
    }

    // Call mock authentication service
    await login(formData.email, formData.password);
  };


  // If already logged in, show authenticated state card with session overview
  if (user && authSuccess) {
    return (
      <div className="auth-card success-view" role="status" aria-live="polite">
        <div className="status-badge-success">
          <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>MOCK AUTHENTICATION COMPLETE</span>
        </div>

        <h2 className="card-title">Welcome, {user.name}!</h2>
        <p className="card-subtitle">
          You are authenticated into the <strong>Hackathon Radar AI</strong> hub.
        </p>

        <div className="user-profile-box">
          <div className="profile-row">
            <span className="profile-label">Email:</span>
            <span className="profile-val">{user.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Role:</span>
            <span className="profile-val">{user.role}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Track:</span>
            <span className="profile-val">{user.radarTrack}</span>
          </div>
        </div>

        <div className="success-action-group">
          <button
            type="button"
            className="btn btn-secondary btn-block"
            onClick={logout}
          >
            Sign Out (Reset Session)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="card-header">
        <h2 className="card-title">Hacker Sign In</h2>
        <p className="card-subtitle">
          Enter your credentials to access the Hackathon Radar AI portal.
        </p>
      </div>

      {/* Global Error Alert Banner */}
      {authError && (
        <div className="alert alert-error" role="alert">
          <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="alert-content">
            <span className="alert-title">Authentication Failed</span>
            <span className="alert-message">{authError}</span>
          </div>
        </div>
      )}

      {/* Global Success Alert Banner */}
      {authSuccess && (
        <div className="alert alert-success" role="status">
          <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div className="alert-content">
            <span className="alert-message">{authSuccess}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {/* Email Field */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <div className="input-field-wrap">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. participant@radar-ai.dev"
              disabled={isLoading}
              autoComplete="email"
              className={`form-input ${fieldErrors.email ? 'has-error' : ''}`}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              aria-invalid={fieldErrors.email ? 'true' : 'false'}
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className="field-error" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="form-group">
          <div className="label-with-action">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <button
              type="button"
              className="text-link"
              onClick={() => onNavigate('forgot-password')}
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>

          <PasswordInput
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="At least 6 characters"
            disabled={isLoading}
            error={Boolean(fieldErrors.password)}
          />

          {fieldErrors.password && (
            <p id="password-error" className="field-error" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="btn-loading-content">
              <span className="spinner" aria-hidden="true" />
              <span>Authenticating...</span>
            </span>
          ) : (
            <span>Log In to Radar AI</span>
          )}
        </button>

        {/* Registration navigation */}
        <div className="card-footer-nav">
          <span className="footer-text">Don't have an account? </span>
          <button
            type="button"
            className="text-link font-semibold"
            onClick={() => onNavigate('register')}
            disabled={isLoading}
          >
            Register
          </button>
        </div>

      </form>
    </div>
  );
}
