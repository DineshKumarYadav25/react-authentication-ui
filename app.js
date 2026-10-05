/**
 * ==========================================================================
 * RADARAI HACKATHON // APPLICATION LOGIC
 * Dynamic Radar Simulation, Real-time Countdown, Telemetry, and Auth Handling
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all subsystems
  initAudioSystem();
  initAmbientCanvas();
  initRadarCanvas();
  initCountdown();
  initTelemetryFeed();
  initAuthTabs();
  initPasswordToggles();
  initFormValidation();
  initDemoFillers();
  initRecoveryModal();
});

/* ==========================================================================
   1. SYNTHESIZED AUDIO SYSTEM (WEB AUDIO API)
   ========================================================================== */
let audioCtx = null;
let soundEnabled = true;

function initAudioSystem() {
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIconOn = document.getElementById('soundIconOn');
  const soundIconOff = document.getElementById('soundIconOff');

  // Check stored preference
  const savedSound = localStorage.getItem('radarai_sound_enabled');
  if (savedSound !== null) {
    soundEnabled = savedSound === 'true';
  }

  updateSoundIcon();

  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('radarai_sound_enabled', soundEnabled);
      updateSoundIcon();
      if (soundEnabled) {
        playSciFiChime(880, 'sine', 0.1, 0.05);
        showToast('Audio FX Online', 'Synthesized radar telemetry sounds enabled.', 'info');
      } else {
        showToast('Audio FX Muted', 'Sound effects are now silent.', 'info');
      }
    });
  }

  function updateSoundIcon() {
    if (soundEnabled) {
      soundIconOn.classList.remove('hidden');
      soundIconOff.classList.add('hidden');
    } else {
      soundIconOn.classList.add('hidden');
      soundIconOff.classList.remove('hidden');
    }
  }
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSciFiChime(freq = 640, type = 'sine', duration = 0.12, volume = 0.04) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // Ignore audio permission edge cases
  }
}

function playRadarPing() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

/* ==========================================================================
   2. AMBIENT BACKGROUND CANVAS (SUBTLE DIGITAL PARTICLES)
   ========================================================================== */
function initAmbientCanvas() {
  const canvas = document.getElementById('ambientGridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const particleCount = Math.floor(Math.min(width, 1400) / 24);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.4 + 0.1
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
      ctx.fill();

      // Connect close particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.06 * (1 - dist / 110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   3. INTERACTIVE RADAR SCOPE DISPLAY
   ========================================================================== */
function initRadarCanvas() {
  const canvas = document.getElementById('radarSweepCanvas');
  const coordsLabel = document.getElementById('radarCoords');
  const targetCountLabel = document.getElementById('targetCount');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let angle = 0;
  const sweepSpeed = 0.024; // radians per frame

  // Radar Targets / Hackathon teams blips
  const targets = [
    { distanceRatio: 0.35, angle: 0.8, name: "Team CyberViper", active: true, pulse: 0 },
    { distanceRatio: 0.65, angle: 2.1, name: "SwarmAgent-4", active: true, pulse: 0 },
    { distanceRatio: 0.48, angle: 3.7, name: "SensorNet Core", active: true, pulse: 0 },
    { distanceRatio: 0.82, angle: 4.6, name: "NeuralLiDAR", active: true, pulse: 0 },
    { distanceRatio: 0.25, angle: 5.3, name: "AgentZero", active: true, pulse: 0 },
    { distanceRatio: 0.70, angle: 1.4, name: "EdgeVision HQ", active: true, pulse: 0 },
    { distanceRatio: 0.88, angle: 0.3, name: "BioRadar", active: true, pulse: 0 },
  ];

  // Dynamic clicks ripple
  let clickRipples = [];

  function resizeRadar() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  window.addEventListener('resize', resizeRadar);
  resizeRadar();

  // Mouse hover tracking for coordinates
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    let rad = Math.atan2(y, x);
    if (rad < 0) rad += Math.PI * 2;
    const deg = (rad * (180 / Math.PI)).toFixed(1);
    const distKm = ((Math.sqrt(x * x + y * y) / (rect.width / 2)) * 25).toFixed(1);

    if (coordsLabel) {
      coordsLabel.textContent = `AZ: ${deg}° | DIST: ${distKm}km`;
    }
  });

  // Click on radar spawns pulse ping
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    clickRipples.push({ x, y, radius: 2, maxRadius: 50, alpha: 1 });
    playRadarPing();
  });

  function drawRadar() {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) - 14;

    ctx.clearRect(0, 0, width, height);

    // 1. Concentric Range Rings
    const rings = 4;
    for (let i = 1; i <= rings; i++) {
      const r = (maxRadius / rings) * i;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = i === rings ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.15)';
      ctx.lineWidth = i === rings ? 1.5 : 1;
      ctx.stroke();

      // Range text mark
      ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillText(`${(i * 6)}km`, cx + 4, cy - r + 11);
    }

    // 2. Radial Crosshair Lines & 45-degree angle lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let a = 0; a < Math.PI; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * maxRadius, cy + Math.sin(a) * maxRadius);
      ctx.lineTo(cx - Math.cos(a) * maxRadius, cy - Math.sin(a) * maxRadius);
      ctx.stroke();
    }

    // 3. Sweeping Beam (Cone Gradient)
    const sweepTrailAngle = 0.55; // Angle width of sweep trail
    const steps = 30;
    for (let s = 0; s < steps; s++) {
      const startSeg = angle - (sweepTrailAngle * (s / steps));
      const endSeg = angle - (sweepTrailAngle * ((s + 1) / steps));
      const alpha = (1 - s / steps) * 0.28;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxRadius, endSeg, startSeg);
      ctx.closePath();
      ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.fill();
    }

    // Main sharp sweep needle
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxRadius, cy + Math.sin(angle) * maxRadius);
    ctx.strokeStyle = '#00FF9D';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00FF9D';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset

    // 4. Update and Draw Radar Targets
    targets.forEach((target) => {
      const tx = cx + Math.cos(target.angle) * (target.distanceRatio * maxRadius);
      const ty = cy + Math.sin(target.angle) * (target.distanceRatio * maxRadius);

      // Check if sweep beam is currently passing this target
      let diff = angle - target.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      if (Math.abs(diff) < 0.05) {
        target.pulse = 1;
      }

      // Draw target blip
      const blipSize = 3.5 + target.pulse * 3;
      ctx.beginPath();
      ctx.arc(tx, ty, blipSize, 0, Math.PI * 2);
      ctx.fillStyle = target.pulse > 0.4 ? '#00FF9D' : '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = target.pulse > 0 ? 12 : 4;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Ripple around target when illuminated
      if (target.pulse > 0.1) {
        ctx.beginPath();
        ctx.arc(tx, ty, (1 - target.pulse) * 18 + 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 157, ${target.pulse * 0.7})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        target.pulse -= 0.015;
      }
    });

    // 5. Draw Interactive Click Ripples
    for (let i = clickRipples.length - 1; i >= 0; i--) {
      const rip = clickRipples[i];
      rip.radius += 1.8;
      rip.alpha -= 0.035;

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 157, ${Math.max(0, rip.alpha)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (rip.alpha <= 0) {
        clickRipples.splice(i, 1);
      }
    }

    // Center Core Anchor Dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#00FF9D';
    ctx.fill();

    // Advance Sweep
    angle = (angle + sweepSpeed) % (Math.PI * 2);

    requestAnimationFrame(drawRadar);
  }

  drawRadar();
}

/* ==========================================================================
   4. LIVE COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMins = document.getElementById('cdMins');
  const cdSecs = document.getElementById('cdSecs');

  if (!cdDays) return;

  // Set target date 12 days, 8 hours, 30 mins into the future
  const now = new Date();
  let targetTime = new Date(now.getTime() + (12 * 86400000) + (8 * 3600000) + (30 * 60000));

  function update() {
    const current = new Date();
    let diff = targetTime - current;

    if (diff <= 0) {
      targetTime = new Date(current.getTime() + 86400000 * 3); // Reset if past
      diff = targetTime - current;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    cdDays.textContent = String(days).padStart(2, '0');
    cdHours.textContent = String(hours).padStart(2, '0');
    cdMins.textContent = String(mins).padStart(2, '0');
    cdSecs.textContent = String(secs).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   5. REAL-TIME HACKER TELEMETRY FEED
   ========================================================================== */
function initTelemetryFeed() {
  const container = document.getElementById('telemetryStream');
  if (!container) return;

  const events = [
    { tag: "SCAN_PING", msg: "New hacker @nova_agent linked from San Francisco (Vision AI track)" },
    { tag: "BOUNTY_NEW", msg: "$10,000 Edge Swarm Detection prize sponsored by Radar Labs" },
    { tag: "AGENT_VERIFY", msg: "Telemetry node #092 initialized: 120 FPS Sensor Pipeline ready" },
    { tag: "REGISTRATION", msg: "Team 'QuantumRadar' registered (4 hackers, Stanford & IIT)" },
    { tag: "HARDWARE_LAB", msg: "LiDAR and Synthetic Aperture Radar simulators active" },
    { tag: "DEFENSE_CHLG", msg: "Adversarial sensor spoofing attack vector sandbox deployed" },
    { tag: "GLOBAL_FEED", msg: "3,490+ hackers online across 48 countries" },
    { tag: "SYSTEM_OK", msg: "ECDSA auth handshakes: 0ms latency latency cluster" }
  ];

  let currentIndex = 0;

  function addTelemetryLine() {
    const ev = events[currentIndex % events.length];
    currentIndex++;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const line = document.createElement('div');
    line.className = 'tele-line';
    line.innerHTML = `
      <span class="tele-time">[${timeStr}]</span>
      <span class="tele-tag">[${ev.tag}]</span>
      <span class="tele-msg">${ev.msg}</span>
    `;

    container.appendChild(line);

    // Keep max 3 lines in view
    while (container.children.length > 3) {
      container.removeChild(container.firstChild);
    }
  }

  // Prepopulate 2 lines
  addTelemetryLine();
  addTelemetryLine();

  // Feed update interval
  setInterval(addTelemetryLine, 3600);
}

/* ==========================================================================
   6. AUTHENTICATION TABS (SIGN IN vs REGISTER)
   ========================================================================== */
function initAuthTabs() {
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (!tabLogin || !tabRegister) return;

  tabLogin.addEventListener('click', () => {
    switchTab('login');
    playSciFiChime(600, 'sine', 0.08, 0.03);
  });

  tabRegister.addEventListener('click', () => {
    switchTab('register');
    playSciFiChime(750, 'sine', 0.08, 0.03);
  });

  function switchTab(mode) {
    if (mode === 'login') {
      tabLogin.classList.add('active');
      tabLogin.setAttribute('aria-selected', 'true');
      tabRegister.classList.remove('active');
      tabRegister.setAttribute('aria-selected', 'false');

      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    } else {
      tabRegister.classList.add('active');
      tabRegister.setAttribute('aria-selected', 'true');
      tabLogin.classList.remove('active');
      tabLogin.setAttribute('aria-selected', 'false');

      registerForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    }
  }
}

/* ==========================================================================
   7. PASSWORD VISIBILITY TOGGLE & STRENGTH METER
   ========================================================================== */
function initPasswordToggles() {
  setupToggle('toggleLoginPasswordBtn', 'loginPassword');
  setupToggle('toggleRegPasswordBtn', 'regPassword');

  function setupToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';

      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');

      if (isPassword) {
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
        btn.setAttribute('aria-label', 'Hide password');
      } else {
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
        btn.setAttribute('aria-label', 'Show password');
      }
    });
  }

  // Registration Password Strength Meter
  const regPassword = document.getElementById('regPassword');
  const passStrengthFill = document.getElementById('passStrengthFill');
  const passStrengthText = document.getElementById('passStrengthText');

  if (regPassword && passStrengthFill && passStrengthText) {
    regPassword.addEventListener('input', () => {
      const val = regPassword.value;
      const strength = evaluatePasswordStrength(val);

      passStrengthFill.className = 'strength-fill';
      if (val.length === 0) {
        passStrengthText.textContent = 'Token strength: Empty';
        passStrengthFill.style.width = '0%';
      } else if (strength < 2) {
        passStrengthFill.classList.add('weak');
        passStrengthText.textContent = 'Token strength: Vulnerable (too short)';
      } else if (strength === 2) {
        passStrengthFill.classList.add('fair');
        passStrengthText.textContent = 'Token strength: Moderate';
      } else if (strength === 3) {
        passStrengthFill.classList.add('good');
        passStrengthText.textContent = 'Token strength: Solid Defense';
      } else {
        passStrengthFill.classList.add('strong');
        passStrengthText.textContent = 'Token strength: Military-Grade Quantum Resistant';
      }
    });
  }

  function evaluatePasswordStrength(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  }
}

/* ==========================================================================
   8. FORM VALIDATION & SUBMISSION HANDLING
   ========================================================================== */
function initFormValidation() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginEmailError = document.getElementById('loginEmailError');
  const loginPasswordError = document.getElementById('loginPasswordError');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const loginSpinner = document.getElementById('loginSpinner');

  // Clear email button
  const clearEmailBtn = document.getElementById('clearEmailBtn');
  if (loginEmail && clearEmailBtn) {
    loginEmail.addEventListener('input', () => {
      clearEmailBtn.classList.toggle('hidden', loginEmail.value.length === 0);
      loginEmail.classList.remove('input-error');
      loginEmailError.textContent = '';
    });
    clearEmailBtn.addEventListener('click', () => {
      loginEmail.value = '';
      clearEmailBtn.classList.add('hidden');
      loginEmail.focus();
    });
  }

  if (loginPassword) {
    loginPassword.addEventListener('input', () => {
      loginPassword.classList.remove('input-error');
      loginPasswordError.textContent = '';
    });
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      // Validate email
      const emailVal = loginEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailVal) {
        loginEmail.classList.add('input-error');
        loginEmailError.textContent = 'Please enter your hacker ID or email.';
        valid = false;
      } else if (!emailRegex.test(emailVal)) {
        loginEmail.classList.add('input-error');
        loginEmailError.textContent = 'Invalid format. Use name@domain.com';
        valid = false;
      }

      // Validate password
      if (!loginPassword.value) {
        loginPassword.classList.add('input-error');
        loginPasswordError.textContent = 'Access token/password cannot be blank.';
        valid = false;
      }

      if (!valid) {
        playSciFiChime(320, 'sawtooth', 0.15, 0.05);
        return;
      }

      // Simulated Login Request with Loading State
      loginSubmitBtn.disabled = true;
      loginSpinner.classList.remove('hidden');
      loginSubmitBtn.querySelector('.btn-text').textContent = 'Decrypting Session...';
      playSciFiChime(550, 'sine', 0.12, 0.04);

      setTimeout(() => {
        loginSubmitBtn.disabled = false;
        loginSpinner.classList.add('hidden');
        loginSubmitBtn.querySelector('.btn-text').textContent = 'Authenticate & Enter Hub';

        playSciFiChime(950, 'sine', 0.2, 0.05);
        showToast(
          'ACCESS GRANTED',
          `Welcome to RadarAI Mission Control, ${emailVal.split('@')[0]}! Initializing your workspace...`,
          'success'
        );
      }, 1200);
    });
  }

  // Handle Register Submit
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const regName = document.getElementById('regName').value.trim();
      const regHandle = document.getElementById('regHandle').value.trim();
      const regEmail = document.getElementById('regEmail').value.trim();
      const regTrack = document.getElementById('regTrack').value;
      const regPassword = document.getElementById('regPassword').value;
      const regTerms = document.getElementById('regTermsCheck').checked;
      const regSubmitBtn = document.getElementById('regSubmitBtn');
      const regSpinner = document.getElementById('regSpinner');

      if (!regName || !regHandle || !regEmail || !regPassword) {
        showToast('Incomplete Registration', 'Please fill in all mandatory hacker profile fields.', 'error');
        playSciFiChime(320, 'sawtooth', 0.15, 0.05);
        return;
      }

      if (!regTrack) {
        showToast('Track Required', 'Please select a primary challenge track for your project.', 'error');
        return;
      }

      if (!regTerms) {
        showToast('Code of Conduct', 'Please accept the hackathon conduct and IP agreement.', 'error');
        return;
      }

      // Simulated Register Submit
      regSubmitBtn.disabled = true;
      regSpinner.classList.remove('hidden');
      regSubmitBtn.querySelector('.btn-text').textContent = 'Minting Hacker Credential...';
      playSciFiChime(700, 'sine', 0.1, 0.04);

      setTimeout(() => {
        regSubmitBtn.disabled = false;
        regSpinner.classList.add('hidden');
        regSubmitBtn.querySelector('.btn-text').textContent = 'Register Hacker & Reserve Slot';

        // Increment hackers count live
        const hackersRegisteredCount = document.getElementById('hackersRegisteredCount');
        if (hackersRegisteredCount) {
          const currentCount = parseInt(hackersRegisteredCount.textContent.replace(/,/g, ''), 10) || 3489;
          hackersRegisteredCount.textContent = (currentCount + 1).toLocaleString();
        }

        playSciFiChime(1100, 'sine', 0.25, 0.05);
        showToast(
          'REGISTRATION CONFIRMED!',
          `Slot reserved for ${regHandle}. Check ${regEmail} for Discord & starter kit credentials.`,
          'success'
        );

        // Switch to sign in tab
        document.getElementById('tabLogin').click();
        document.getElementById('loginEmail').value = regEmail;
        document.getElementById('loginPassword').value = regPassword;
      }, 1400);
    });
  }

  // OAuth Simulation buttons
  const oauthBtns = [
    { id: 'oauthGithubBtn', provider: 'GitHub' },
    { id: 'oauthDevpostBtn', provider: 'Devpost' },
    { id: 'oauthGoogleBtn', provider: 'Google' }
  ];

  oauthBtns.forEach(({ id, provider }) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        playSciFiChime(720, 'sine', 0.08, 0.04);
        showToast(
          `${provider} Handshake`,
          `Simulating OAuth 2.0 handshake with ${provider} developer ecosystem...`,
          'info'
        );
        setTimeout(() => {
          showToast(
            'Handshake Authenticated',
            `Connected via ${provider} OAuth! Redirecting to RadarAI Hub...`,
            'success'
          );
        }, 1100);
      });
    }
  });
}

/* ==========================================================================
   9. QUICK DEMO FILLERS
   ========================================================================== */
function initDemoFillers() {
  const fillHackerBtn = document.getElementById('fillDemoHackerBtn');
  const fillJudgeBtn = document.getElementById('fillDemoJudgeBtn');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const clearEmailBtn = document.getElementById('clearEmailBtn');

  if (fillHackerBtn && loginEmail && loginPassword) {
    fillHackerBtn.addEventListener('click', () => {
      loginEmail.value = 'alex.chen@radar-ai.dev';
      loginPassword.value = 'RadarHack#2026';
      clearEmailBtn.classList.remove('hidden');
      playSciFiChime(800, 'sine', 0.08, 0.04);
      showToast('Demo Hacker Loaded', 'Credentials populated: alex.chen@radar-ai.dev', 'info');
    });
  }

  if (fillJudgeBtn && loginEmail && loginPassword) {
    fillJudgeBtn.addEventListener('click', () => {
      loginEmail.value = 'dr.valkyrie@radar-eval.org';
      loginPassword.value = 'JudgeMaster$99X';
      clearEmailBtn.classList.remove('hidden');
      playSciFiChime(850, 'sine', 0.08, 0.04);
      showToast('Mentor / Judge Loaded', 'Credentials populated: dr.valkyrie@radar-eval.org', 'info');
    });
  }
}

/* ==========================================================================
   10. PASSWORD RECOVERY MODAL
   ========================================================================== */
function initRecoveryModal() {
  const triggerBtn = document.getElementById('forgotPassTriggerBtn');
  const modal = document.getElementById('recoveryModal');
  const closeBtn = document.getElementById('closeRecoveryModalBtn');
  const recoveryForm = document.getElementById('recoveryForm');
  const recoveryEmail = document.getElementById('recoveryEmail');
  const recoveryStatusBox = document.getElementById('recoveryStatusBox');

  if (!triggerBtn || !modal) return;

  triggerBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    recoveryEmail.focus();
    playSciFiChime(680, 'sine', 0.08, 0.03);
  });

  function closeModal() {
    modal.classList.add('hidden');
    if (recoveryStatusBox) {
      recoveryStatusBox.classList.add('hidden');
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Recovery Form Submit
  if (recoveryForm) {
    recoveryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = recoveryEmail.value.trim();
      if (!email) return;

      const randomCode = Math.floor(100000 + Math.random() * 900000);
      recoveryStatusBox.classList.remove('hidden');
      recoveryStatusBox.innerHTML = `
        <strong>TRANSMISSION LOG:</strong><br>
        Bypass verification code <code>#${randomCode}</code> dispatched to <em>${email}</em>.<br>
        Expires in 15:00 minutes.
      `;
      playSciFiChime(920, 'sine', 0.15, 0.05);
      showToast('Bypass Code Sent', `Recovery token broadcasted to ${email}`, 'success');
    });
  }
}

/* ==========================================================================
   11. FLOATING TOAST SYSTEM
   ========================================================================== */
function showToast(title, message, type = 'info') {
  const shelf = document.getElementById('toastShelf');
  if (!shelf) return;

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const iconMap = {
    success: '✅',
    error: '⚠️',
    info: '🛰️'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '⚡'}</span>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;

  shelf.appendChild(toast);

  // Auto remove after 4.2 seconds
  setTimeout(() => {
    toast.classList.add('toast-hide');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4200);
}
