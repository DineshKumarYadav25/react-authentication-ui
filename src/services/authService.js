/**
 * Mock Authentication Service for Hackathon Radar AI
 *
 * Simulates asynchronous API requests with realistic delays, validation,
 * and responses. Keeps business logic isolated from UI components so it
 * can be replaced with real backend endpoints in the future.
 */

const API_SIMULATION_DELAY_MS = 800;

export const authService = {
  /**
   * Simulates a user login request.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, user?: object, token?: string, message: string }>}
   */
  async login(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedEmail = (email || '').trim().toLowerCase();

        // Specific test credential simulation for error testing:
        // Passwords like "wrongpass" or emails like "error@radar.ai" simulate credential rejections
        if (password === 'wrongpass' || normalizedEmail === 'error@radar.ai') {
          reject(new Error('Invalid email or password. Please verify your credentials and try again.'));
          return;
        }

        // Standard mock success response for valid credentials
        const mockUser = {
          id: 'hacker_' + Math.random().toString(36).substring(2, 9),
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          role: normalizedEmail.includes('judge') ? 'Mentor / Judge' : 'Hacker Participant',
          radarTrack: 'Autonomous Systems & Edge AI',
          lastLogin: new Date().toISOString(),
        };

        const mockToken = `radar_jwt_${Date.now()}_${Math.random().toString(36).substring(2)}`;

        // Store active session in localStorage for session persistence
        try {
          localStorage.setItem('radar_user', JSON.stringify(mockUser));
          localStorage.setItem('radar_auth_token', mockToken);
        } catch (e) {
          // Fallback if localStorage is unavailable
        }

        resolve({
          success: true,
          user: mockUser,
          token: mockToken,
          message: 'Authentication successful! Welcome to Radar AI Hub.',
        });
      }, API_SIMULATION_DELAY_MS);
    });
  },

  /**
   * Simulates a user registration request.
   * @param {Object} data
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async register(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Account registered successfully! You can now log in.',
        });
      }, API_SIMULATION_DELAY_MS);
    });
  },

  /**
   * Simulates a password reset request.
   * @param {string} email
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  async forgotPassword(email) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Password reset instructions have been sent to ${email}`,
        });
      }, API_SIMULATION_DELAY_MS);
    });
  },

  /**
   * Logs out the user and clears stored session.
   */
  logout() {
    try {
      localStorage.removeItem('radar_user');
      localStorage.removeItem('radar_auth_token');
    } catch (e) {
      // Ignore
    }
  },

  /**
   * Retrieves any existing cached session.
   * @returns {Object|null}
   */
  getCurrentUser() {
    try {
      const stored = localStorage.getItem('radar_user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  },
};
