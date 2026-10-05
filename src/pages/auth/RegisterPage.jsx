import React, { useState } from 'react';
import PasswordInput from '../../components/auth/PasswordInput';
import { validateEmail, validatePassword } from '../../utils/validation';
import { authService } from '../../services/authService';

export default function RegisterPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    track: 'Autonomous Systems & Edge AI',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await authService.register(formData);
      setSuccessMessage(response.message);
      setTimeout(() => {
        onNavigate('login');
      }, 1500);
    } catch (err) {
      setErrors({ form: err.message || 'Registration failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="card-header">
        <h2 className="card-title">Register for Radar AI</h2>
        <p className="card-subtitle">
          Join the 48-hour hackathon sprint. Deploy intelligent edge agents.
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success" role="status">
          <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <div className="alert-content">
            <span className="alert-message">{successMessage}</span>
          </div>
        </div>
      )}

      {errors.form && (
        <div className="alert alert-error" role="alert">
          <div className="alert-content">
            <span className="alert-message">{errors.form}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label htmlFor="reg-name" className="form-label">Full Name</label>
          <input
            type="text"
            id="reg-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Ada Lovelace"
            disabled={isSubmitting}
            className={`form-input ${errors.name ? 'has-error' : ''}`}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Email Address</label>
          <input
            type="email"
            id="reg-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="participant@radar-ai.dev"
            disabled={isSubmitting}
            className={`form-input ${errors.email ? 'has-error' : ''}`}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-password" className="form-label">Create Password</label>
          <PasswordInput
            id="reg-password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            disabled={isSubmitting}
            error={Boolean(errors.password)}
          />
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="reg-track" className="form-label">Challenge Track</label>
          <select
            id="reg-track"
            name="track"
            value={formData.track}
            onChange={handleChange}
            disabled={isSubmitting}
            className="form-input form-select"
          >
            <option value="Autonomous Systems & Edge AI">Autonomous Systems & Edge AI</option>
            <option value="Sensor Fusion & Real-Time Perception">Sensor Fusion & Real-Time Perception</option>
            <option value="Neural Cyber Defense">Neural Cyber Defense</option>
            <option value="Spatial World Models">Spatial World Models</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting Registration...' : 'Complete Registration'}
        </button>

        <div className="card-footer-nav">
          <span className="footer-text">Already registered? </span>
          <button
            type="button"
            className="text-link font-semibold"
            onClick={() => onNavigate('login')}
            disabled={isSubmitting}
          >
            Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
}
