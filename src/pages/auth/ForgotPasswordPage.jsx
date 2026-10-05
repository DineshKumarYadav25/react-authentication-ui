import React, { useState } from 'react';
import { validateEmail } from '../../utils/validation';
import { authService } from '../../services/authService';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(email);
      setStatusMessage(response.message);
    } catch (err) {
      setError('Unable to send reset instructions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="card-header">
        <h2 className="card-title">Reset Access Token</h2>
        <p className="card-subtitle">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      {statusMessage && (
        <div className="alert alert-success" role="status">
          <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div className="alert-content">
            <span className="alert-message">{statusMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <div className="alert-content">
            <span className="alert-message">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="reset-email" className="form-label">Registered Email</label>
          <input
            type="email"
            id="reset-email"
            name="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="participant@radar-ai.dev"
            disabled={isSubmitting}
            className={`form-input ${error ? 'has-error' : ''}`}
          />
          {error && <p className="field-error">{error}</p>}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Transmitting Request...' : 'Send Recovery Link'}
        </button>

        <div className="card-footer-nav">
          <button
            type="button"
            className="text-link font-semibold"
            onClick={() => onNavigate('login')}
            disabled={isSubmitting}
          >
            ← Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
