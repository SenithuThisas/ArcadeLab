/**
 * Chroma Bloom: Zen Orbital Cascade Engine
 * Pure Vanilla JS + HTML5 Canvas + Web Audio API
 * Zero external dependencies.
 */

(function () {
  'use strict';

  // ── Web Audio Synth (Generative Crystal Chimes & Ambient Singing Bowls) ──
  class ZenAudio {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.muted = false;
      this.isInitialized = false;
      // Pentatonic harmonic scale frequencies (C major / A minor pentatonic: C, D, E, G, A in multiple octaves)
      this.scale = [
        130.81, 146.83, 164.81, 196.00, 220.00, // C3 - A3
        261.63, 293.66, 329.63, 392.00, 440.00, // C4 - A4
        523.25, 587.33, 659.25, 783.99, 880.00, // C5 - A5
        1046.50, 1174.66, 1318.51, 1567.98, 1760.00 // C6 - A6
      ];
      this.droneOsc = null;
    }

    init() {
      if (this.isInitialized) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.isInitialized = true;
        this.startAmbientDrone();
      } catch (e) {
        console.warn('Web Audio could not be initialized:', e);
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.28, this.ctx.currentTime, 0.05);
      }
      return this.muted;
    }

    startAmbientDrone() {
      if (!this.ctx || this.droneOsc) return;
      try {
        // Soft warm background root drone
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(98.00, this.ctx.currentTime); // G2 (Fifth)

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, this.ctx.currentTime);

        droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(this.masterGain);

        osc1.start();
        osc2.start();
        this.droneOsc = { osc1, osc2, gain: droneGain };
      } catch (e) {}
    }

    // Play soft crystal chime on bloom / collision
    playChime(noteIndex = 5, resonanceDuration = 1.2, brightness = 1.0) {
      if (!this.ctx || this.muted) return;
      try {
        const freq = this.scale[Math.max(0, Math.min(this.scale.length - 1, noteIndex))];
        const now = this.ctx.currentTime;

        // Primary Bell Oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Harmonic shimmer overtone
        const overtone = this.ctx.createOscillator();
        const overtoneGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.76, now); // Natural crystal inharmonic

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500 * brightness, now);

        // Bell envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.35, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + resonanceDuration);

        overtoneGain.gain.setValueAtTime(0.001, now);
        overtoneGain.gain.exponentialRampToValueAtTime(0.08 * brightness, now + 0.01);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + (resonanceDuration * 0.6));

        osc.connect(filter);
        overtone.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + resonanceDuration);
        overtone.stop(now + resonanceDuration);
      } catch (e) {}
    }

    // Soft orbital launch sound
    playLaunch(pitch = 1.0) {
      if (!this.ctx || this.muted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180 * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(420 * pitch, now + 0.22);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    }

    // Resonance Cascade chord
    playChord(baseIndex = 5) {
      const chordOffsets = [0, 2, 4, 7];
      chordOffsets.forEach((offset, idx) => {
        setTimeout(() => {
          this.playChime(baseIndex + offset, 1.8 + idx * 0.2, 1.2);
        }, idx * 60);
      });
    }
  }

  // ── Palette Definitions ──
  const PALETTES = {
    lavender: {
      name: 'Lavender Dusk',
      primary: '#9d8df1',
      secondary: '#b8c0ff',
      accent: '#ff9a76',
      accentGlow: 'rgba(255, 154, 118, 0.45)',
      glow: 'rgba(157, 141, 241, 0.45)',
      bgDeep: '#0b0e1b',
      bgMuted: '#14182e'
    },
    mint: {
      name: 'Mint Aurora',
      primary: '#48eed6',
      secondary: '#80ffdb',
      accent: '#fed368',
      accentGlow: 'rgba(254, 211, 104, 0.45)',
      glow: 'rgba(72, 238, 214, 0.45)',
      bgDeep: '#06131b',
      bgMuted: '#0d222e'
    },
    sakura: {
      name: 'Sakura Petal',
      primary: '#ff7597',
      secondary: '#ffccd5',
      accent: '#70d6ff',
      accentGlow: 'rgba(112, 214, 255, 0.45)',
      glow: 'rgba(255, 117, 151, 0.45)',
      bgDeep: '#180a14',
      bgMuted: '#2d1424'
    },
    celestial: {
      name: 'Celestial Prism',
      primary: '#7209b7',
      secondary: '#4cc9f0',
      accent: '#f72585',
      accentGlow: 'rgba(247, 37, 133, 0.45)',
      glow: 'rgba(76, 201, 240, 0.45)',
      bgDeep: '#090514',
      bgMuted: '#190e33'
    }
  };

  // ── Particle & Floating Mote ──
  class Particle {
    constructor(x, y, vx, vy, color, radius, life, maxLife, decayRate = 1.0, isGlow = true) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.radius = radius;
      this.life = life;
      this.maxLife = maxLife;
      this.decayRate = decayRate;
      this.isGlow = isGlow;
      this.friction = 0.985;
    }

    update(dt) {
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.life -= dt * this.decayRate;
      return this.life > 0;
    }

    draw(ctx) {
      const alpha = Math.max(0, Math.min(1, this.life / this.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      if (this.isGlow) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.radius * 2.5;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.radius * (0.4 + 0.6 * alpha)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // ── Expanding Harmonic Ripple Wave ──
  class RippleWave {
    constructor(x, y, maxRadius, color, speed = 160, width = 3) {
      this.x = x;
      this.y = y;
      this.radius = 4;
      this.maxRadius = maxRadius;
      this.color = color;
      this.speed = speed;
      this.width = width;
      this.alpha = 1.0;
    }

    update(dt) {
      this.radius += this.speed * dt;
      this.alpha = 1.0 - (this.radius / this.maxRadius);
      return this.alpha > 0;
    }

    draw(ctx) {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.7;
      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.width * this.alpha;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Resonator / Gravity Well Node ──
  class ResonatorNode {
    constructor(x, y, radius, mass, color, harmonyType = 'normal', noteIdx = 5) {
      this.x = x;
      this.y = y;
      this.targetX = x;
      this.targetY = y;
      this.radius = radius;
      this.baseRadius = radius;
      this.mass = mass; // Gravitational pull strength
      this.color = color;
      this.harmonyType = harmonyType; // 'normal', 'multiplier', 'repulsor', 'prism'
      this.noteIdx = noteIdx;

      this.bloomed = false;
      this.bloomProgress = 0; // 0 to 1
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 1.5 + Math.random() * 0.8;
      this.scale = 1.0;
      this.velocityScale = 0;
      this.requiredHits = harmonyType === 'prism' ? 2 : 1;
      this.currentHits = 0;

      // Outer orbit aesthetic ring
      this.ringRotation = Math.random() * Math.PI;
      this.petals = harmonyType === 'prism' ? 6 : (harmonyType === 'multiplier' ? 8 : 5);
    }

    update(dt) {
      this.pulsePhase += this.pulseSpeed * dt;
      this.ringRotation += 0.4 * dt;

      // Spring physics for soft bounce when touched/bloomed
      const targetScale = this.bloomed ? 1.25 : 1.0;
      const springK = 18.0;
      const damping = 0.72;
      const f = (targetScale - this.scale) * springK;
      this.velocityScale += f * dt;
      this.velocityScale *= damping;
      this.scale += this.velocityScale * dt;

      if (this.bloomed && this.bloomProgress < 1.0) {
        this.bloomProgress = Math.min(1.0, this.bloomProgress + dt * 2.0);
      }
    }

    triggerBloom(audio) {
      this.currentHits++;
      this.scale = 1.55;
      this.velocityScale = 3.0;

      if (this.currentHits >= this.requiredHits) {
        this.bloomed = true;
      }

      if (audio) {
        audio.playChime(this.noteIdx, 1.6, this.harmonyType === 'multiplier' ? 1.4 : 1.0);
      }
    }

    draw(ctx) {
      ctx.save();
      const pulse = Math.sin(this.pulsePhase) * 3;
      const r = (this.radius + pulse) * this.scale;

      // 1. Soft Gravitational Aura / Outer Glow
      const glowGrad = ctx.createRadialGradient(this.x, this.y, r * 0.2, this.x, this.y, r * 3.5);
      const isRepulsor = this.mass < 0;

      glowGrad.addColorStop(0, this.bloomed ? 'rgba(255, 255, 255, 0.4)' : `${this.color}40`);
      glowGrad.addColorStop(0.5, this.bloomed ? 'rgba(200, 230, 255, 0.15)' : `${this.color}15`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 2. Geometric Bloom Petals / Orbit Rings
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.ringRotation);
      ctx.strokeStyle = this.bloomed ? '#ffffff' : `${this.color}80`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Flower petal geometry
      for (let i = 0; i < this.petals; i++) {
        const angle = (i / this.petals) * Math.PI * 2;
        const px = Math.cos(angle) * r * 1.35;
        const py = Math.sin(angle) * r * 1.35;
        ctx.fillStyle = this.bloomed ? '#ffffff' : this.color;
        ctx.beginPath();
        ctx.arc(px, py, 2.5 * (this.bloomed ? 1.5 : 1.0), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 3. Central Core (Soft Frosted Sphere with Glass Reflection)
      const coreGrad = ctx.createRadialGradient(this.x - r * 0.3, this.y - r * 0.3, r * 0.1, this.x, this.y, r);
      if (this.bloomed) {
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#e0f2fe');
        coreGrad.addColorStop(1, this.color);
      } else {
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.2, this.color);
        coreGrad.addColorStop(0.85, isRepulsor ? '#4a0018' : '#14182e');
        coreGrad.addColorStop(1, '#070a14');
      }

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = this.bloomed ? 28 : 14;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Glass specular rim
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r - 1, 0, Math.PI * 2);
      ctx.stroke();

      // Center symbol / icon for special node types
      if (this.harmonyType === 'multiplier') {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(r * 0.9)}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('2×', this.x, this.y + 1);
      } else if (this.harmonyType === 'prism') {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(r * 0.8)}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❖', this.x, this.y + 1);
      }

      ctx.restore();
    }
  }

  // ── Player Launched Light Orb ──
  class LightOrb {
    constructor(x, y, vx, vy, color = '#ffffff', energy = 100, radius = 6.5) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.energy = energy;
      this.maxEnergy = energy;
      this.radius = radius;
      this.trail = [];
      this.maxTrail = 36;
      this.alive = true;
      this.age = 0;
      this.resonanceScore = 0;
      this.visitedNodes = new Set();
    }

    update(dt, resonators, bounds, gravityConst = 1800) {
      this.age += dt;

      // Gravity simulation towards all active resonators
      for (const node of resonators) {
        const dx = node.x - this.x;
        const dy = node.y - this.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        // Gravitational attraction / repulsion
        if (dist > 8 && dist < 500) {
          const force = (node.mass * gravityConst) / Math.max(400, distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          this.vx += nx * force * dt;
          this.vy += ny * force * dt;
        }

        // Collision / Bloom check
        if (dist < node.radius + this.radius + 6) {
          if (!this.visitedNodes.has(node)) {
            this.visitedNodes.add(node);
            node.triggerBloom(window.chromaEngine ? window.chromaEngine.audio : null);
            this.resonanceScore += node.harmonyType === 'multiplier' ? 200 : 100;

            if (window.chromaEngine) {
              window.chromaEngine.createBloomBurst(node.x, node.y, node.color);
              window.chromaEngine.addScore(node.harmonyType === 'multiplier' ? 200 : 100);
            }
          }
        }
      }

      // Physics integration
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;

      // Gentle atmospheric friction
      this.vx *= 0.9985;
      this.vy *= 0.9985;

      // Update trail ribbon points
      this.trail.unshift({ x: this.x, y: this.y, color: this.color });
      if (this.trail.length > this.maxTrail) {
        this.trail.pop();
      }

      // Energy / life decay
      this.energy -= dt * 12.5;

      // Screen edge soft bounce
      const pad = this.radius;
      if (this.x < pad) { this.x = pad; this.vx = -this.vx * 0.85; }
      if (this.x > bounds.width - pad) { this.x = bounds.width - pad; this.vx = -this.vx * 0.85; }
      if (this.y < pad) { this.y = pad; this.vy = -this.vy * 0.85; }
      if (this.y > bounds.height - pad) { this.y = bounds.height - pad; this.vy = -this.vy * 0.85; }

      if (this.energy <= 0 || this.age > 15) {
        this.alive = false;
      }
    }

    draw(ctx) {
      // 1. Draw smooth ribbon trail
      if (this.trail.length > 2) {
        ctx.save();
        for (let i = 0; i < this.trail.length - 1; i++) {
          const p1 = this.trail[i];
          const p2 = this.trail[i + 1];
          const progress = 1 - (i / this.trail.length);
          const width = this.radius * progress * 1.6;
          const alpha = progress * 0.75;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = Math.max(0.5, width);
          ctx.lineCap = 'round';
          ctx.globalAlpha = alpha;
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 8 * progress;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 2. Draw Orb Core
      ctx.save();
      const alpha = Math.max(0.2, this.energy / this.maxEnergy);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 20;

      // Outer radiant glow
      const grad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, this.radius * 2.2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, this.color);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Solid central pearl
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // ── Main Engine Controller ──
  class ChromaBloomEngine {
    constructor() {
      this.canvas = document.getElementById('gameCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.audio = new ZenAudio();

      // State
      this.mode = 'journey'; // 'journey', 'flow', 'sandbox'
      this.currentLevel = 1;
      this.maxLevel = 12;
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.shotsRemaining = 5;
      this.totalBlooms = 0;
      this.paletteKey = 'lavender';
      this.palette = PALETTES[this.paletteKey];

      // Physics Settings
      this.gravityStrength = 1.0;
      this.trailLength = 36;
      this.timeScale = 1.0;
      this.isPaused = false;
      this.isAiming = false;

      // Entities
      this.resonators = [];
      this.orbs = [];
      this.particles = [];
      this.waves = [];
      this.ambientMotes = [];

      // Aiming vector
      this.launchOrigin = { x: 0, y: 0 };
      this.aimPoint = { x: 0, y: 0 };
      this.dragDistance = 0;

      // Mouse & Pointer
      this.pointer = { x: -100, y: -100, isDown: false, downX: 0, downY: 0 };

      // Sandbox tools: 'well', 'repulsor', 'multiplier', 'prism'
      this.sandboxTool = 'well';

      this.lastTime = performance.now();
      this.init();
    }

    init() {
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());

      this.setupInputListeners();
      this.createAmbientMotes(45);
      this.loadLevel(this.currentLevel);
      this.updateUI();

      // Start animation loop
      requestAnimationFrame((t) => this.loop(t));
    }

    resizeCanvas() {
      const container = this.canvas.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.ctx.scale(dpr, dpr);

      // Default launch origin at bottom center
      this.launchOrigin = { x: this.width * 0.5, y: this.height * 0.88 };
    }

    setPalette(key) {
      if (PALETTES[key]) {
        this.paletteKey = key;
        this.palette = PALETTES[key];
        document.documentElement.style.setProperty('--color-zen-primary', this.palette.primary);
        document.documentElement.style.setProperty('--color-zen-glow', this.palette.glow);
      }
    }

    createAmbientMotes(count = 40) {
      this.ambientMotes = [];
      for (let i = 0; i < count; i++) {
        this.ambientMotes.push({
          x: Math.random() * (this.width || 800),
          y: Math.random() * (this.height || 600),
          radius: 0.8 + Math.random() * 2.2,
          vx: (Math.random() - 0.5) * 0.25,
          vy: -0.1 - Math.random() * 0.35,
          alpha: 0.2 + Math.random() * 0.6,
          pulse: Math.random() * Math.PI * 2,
          color: Math.random() > 0.5 ? this.palette.primary : this.palette.secondary
        });
      }
    }

    // Load handcrafted levels for Zen Journey
    loadLevel(lvl) {
      this.currentLevel = lvl;
      this.resonators = [];
      this.orbs = [];
      this.particles = [];
      this.waves = [];
      this.shotsRemaining = Math.max(3, 7 - Math.floor(lvl / 3));

      const cx = this.width * 0.5;
      const cy = this.height * 0.42;

      if (this.mode === 'journey') {
        switch (lvl) {
          case 1: // Gentle Trio
            this.resonators.push(new ResonatorNode(cx, cy - 80, 24, 1.2, this.palette.primary, 'normal', 5));
            this.resonators.push(new ResonatorNode(cx - 120, cy + 40, 20, 1.0, this.palette.secondary, 'normal', 7));
            this.resonators.push(new ResonatorNode(cx + 120, cy + 40, 20, 1.0, this.palette.secondary, 'normal', 9));
            break;
          case 2: // Diamond Cascade
            this.resonators.push(new ResonatorNode(cx, cy - 110, 22, 1.1, this.palette.accent, 'multiplier', 10));
            this.resonators.push(new ResonatorNode(cx - 130, cy, 20, 1.0, this.palette.primary, 'normal', 6));
            this.resonators.push(new ResonatorNode(cx + 130, cy, 20, 1.0, this.palette.primary, 'normal', 8));
            this.resonators.push(new ResonatorNode(cx, cy + 110, 25, 1.4, this.palette.secondary, 'normal', 4));
            break;
          case 3: // The Yin-Yang Gravity Ring
            this.resonators.push(new ResonatorNode(cx - 80, cy, 26, 1.6, this.palette.primary, 'normal', 5));
            this.resonators.push(new ResonatorNode(cx + 80, cy, 26, 1.6, this.palette.accent, 'normal', 9));
            this.resonators.push(new ResonatorNode(cx, cy - 130, 18, 0.8, this.palette.secondary, 'normal', 11));
            this.resonators.push(new ResonatorNode(cx, cy + 130, 18, 0.8, this.palette.secondary, 'normal', 3));
            break;
          case 4: // Prism Sanctuary
            this.resonators.push(new ResonatorNode(cx, cy, 32, 2.0, this.palette.accent, 'prism', 7));
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const px = cx + Math.cos(angle) * 140;
              const py = cy + Math.sin(angle) * 140;
              this.resonators.push(new ResonatorNode(px, py, 18, 0.9, this.palette.primary, 'normal', 5 + i * 2));
            }
            break;
          case 5: // Repulsor Nebula
            this.resonators.push(new ResonatorNode(cx, cy, 26, -1.8, '#ff477e', 'repulsor', 4)); // Repels!
            this.resonators.push(new ResonatorNode(cx - 150, cy - 60, 22, 1.2, this.palette.primary, 'normal', 6));
            this.resonators.push(new ResonatorNode(cx + 150, cy - 60, 22, 1.2, this.palette.primary, 'normal', 8));
            this.resonators.push(new ResonatorNode(cx - 100, cy + 100, 20, 1.1, this.palette.accent, 'multiplier', 10));
            this.resonators.push(new ResonatorNode(cx + 100, cy + 100, 20, 1.1, this.palette.secondary, 'normal', 12));
            break;
          default: // Procedural orbital flower for levels 6+
            const count = 4 + (lvl % 5);
            const radius = 110 + (lvl % 3) * 25;
            this.resonators.push(new ResonatorNode(cx, cy, 28, 1.8, this.palette.accent, (lvl % 2 === 0) ? 'multiplier' : 'prism', 6));
            for (let i = 0; i < count; i++) {
              const angle = (i / count) * Math.PI * 2;
              const px = cx + Math.cos(angle) * radius;
              const py = cy + Math.sin(angle) * radius;
              const col = (i % 2 === 0) ? this.palette.primary : this.palette.secondary;
              this.resonators.push(new ResonatorNode(px, py, 19, 0.95, col, 'normal', (5 + i * 2) % 18));
            }
            break;
        }
      } else if (this.mode === 'flow') {
        this.shotsRemaining = 999;
        this.spawnFlowResonators(6);
      } else if (this.mode === 'sandbox') {
        this.shotsRemaining = 999;
        // Seed initial sandbox with 2 balanced wells
        this.resonators.push(new ResonatorNode(cx - 90, cy, 26, 1.5, this.palette.primary, 'normal', 5));
        this.resonators.push(new ResonatorNode(cx + 90, cy, 26, 1.5, this.palette.accent, 'multiplier', 9));
      }

      this.updateUI();
    }

    spawnFlowResonators(count = 6) {
      for (let i = 0; i < count; i++) {
        const x = this.width * 0.15 + Math.random() * (this.width * 0.7);
        const y = this.height * 0.15 + Math.random() * (this.height * 0.55);
        const type = Math.random() > 0.75 ? 'multiplier' : 'normal';
        const color = type === 'multiplier' ? this.palette.accent : (Math.random() > 0.5 ? this.palette.primary : this.palette.secondary);
        const note = Math.floor(Math.random() * 14) + 2;
        this.resonators.push(new ResonatorNode(x, y, 20 + Math.random() * 8, 0.9 + Math.random() * 0.8, color, type, note));
      }
    }

    setupInputListeners() {
      const getPos = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const startAim = (pos) => {
        this.audio.init();
        this.audio.resume();

        // If sandbox click on empty space with a tool
        if (this.mode === 'sandbox' && pos.y < this.height * 0.75) {
          this.placeSandboxNode(pos.x, pos.y);
          return;
        }

        this.pointer.isDown = true;
        this.pointer.downX = pos.x;
        this.pointer.downY = pos.y;
        this.isAiming = true;
        this.aimPoint = { x: pos.x, y: pos.y };
      };

      const moveAim = (pos) => {
        this.pointer.x = pos.x;
        this.pointer.y = pos.y;
        if (this.isAiming) {
          this.aimPoint = { x: pos.x, y: pos.y };
          const dx = this.launchOrigin.x - pos.x;
          const dy = this.launchOrigin.y - pos.y;
          this.dragDistance = Math.min(220, Math.hypot(dx, dy));
        }
      };

      const endAim = () => {
        if (!this.isAiming) return;
        this.isAiming = false;
        this.pointer.isDown = false;

        // Calculate launch vector: pull back to launch forward
        const dx = this.launchOrigin.x - this.aimPoint.x;
        const dy = this.launchOrigin.y - this.aimPoint.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 18 && this.shotsRemaining > 0) {
          const power = Math.min(18, dist * 0.085);
          const angle = Math.atan2(dy, dx);
          const vx = Math.cos(angle) * power;
          const vy = Math.sin(angle) * power;

          this.launchOrb(this.launchOrigin.x, this.launchOrigin.y, vx, vy);
          if (this.mode === 'journey') {
            this.shotsRemaining--;
            this.updateUI();
          }
        }
      };

      this.canvas.addEventListener('mousedown', (e) => startAim(getPos(e)));
      window.addEventListener('mousemove', (e) => moveAim(getPos(e)));
      window.addEventListener('mouseup', () => endAim());

      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startAim(getPos(e));
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        moveAim(getPos(e));
      }, { passive: true });

      window.addEventListener('touchend', () => endAim());
    }

    placeSandboxNode(x, y) {
      let node;
      const note = Math.floor(Math.random() * 12) + 4;
      if (this.sandboxTool === 'well') {
        node = new ResonatorNode(x, y, 24, 1.4, this.palette.primary, 'normal', note);
      } else if (this.sandboxTool === 'repulsor') {
        node = new ResonatorNode(x, y, 22, -1.6, '#ff477e', 'repulsor', note);
      } else if (this.sandboxTool === 'multiplier') {
        node = new ResonatorNode(x, y, 25, 1.2, this.palette.accent, 'multiplier', note);
      } else if (this.sandboxTool === 'prism') {
        node = new ResonatorNode(x, y, 28, 1.8, this.palette.secondary, 'prism', note);
      }
      if (node) {
        this.resonators.push(node);
        this.createBloomBurst(x, y, node.color);
        this.audio.playChime(note, 1.4);
      }
    }

    launchOrb(x, y, vx, vy) {
      const orb = new LightOrb(x, y, vx, vy, this.palette.primary, 100, 6.5);
      this.orbs.push(orb);
      this.audio.playLaunch(1.0 + Math.random() * 0.2);

      // Launch ripple
      this.waves.push(new RippleWave(x, y, 70, this.palette.primary, 220, 2.5));
    }

    createBloomBurst(x, y, color) {
      this.totalBlooms++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      // Ripple wave
      this.waves.push(new RippleWave(x, y, 140, color, 190, 3.5));

      // Particle stardust burst
      const particleCount = 24;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5);
        const speed = 1.5 + Math.random() * 4.5;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const size = 1.5 + Math.random() * 3.0;
        const life = 0.8 + Math.random() * 0.8;
        this.particles.push(new Particle(x, y, vx, vy, color, size, life, life, 1.0, true));
      }

      this.checkLevelCompletion();
      this.updateUI();
    }

    addScore(pts) {
      const multiplier = Math.max(1, Math.floor(this.combo / 2));
      this.score += pts * multiplier;
      this.updateUI();
    }

    checkLevelCompletion() {
      if (this.mode !== 'journey') return;

      const allBloomed = this.resonators.every((n) => n.bloomed);
      if (allBloomed) {
        setTimeout(() => {
          this.audio.playChord(5);
          this.showVictoryModal();
        }, 400);
      } else if (this.shotsRemaining === 0 && this.orbs.length === 0) {
        setTimeout(() => {
          if (!this.resonators.every((n) => n.bloomed)) {
            this.showDefeatModal();
          }
        }, 1200);
      }
    }

    showVictoryModal() {
      const modal = document.getElementById('victory-modal');
      if (modal) {
        modal.classList.add('active');
        const scoreEl = document.getElementById('victory-score');
        if (scoreEl) scoreEl.textContent = this.score.toLocaleString();
        const levelEl = document.getElementById('victory-level');
        if (levelEl) levelEl.textContent = `Level ${this.currentLevel} Cleared`;
      }
    }

    showDefeatModal() {
      const modal = document.getElementById('defeat-modal');
      if (modal) {
        modal.classList.add('active');
      }
    }

    nextLevel() {
      const modal = document.getElementById('victory-modal');
      if (modal) modal.classList.remove('active');

      if (this.currentLevel < this.maxLevel) {
        this.currentLevel++;
        this.loadLevel(this.currentLevel);
      } else {
        // Loop back or switch to flow mode
        this.currentLevel = 1;
        this.loadLevel(1);
      }
    }

    restartLevel() {
      const modalV = document.getElementById('victory-modal');
      const modalD = document.getElementById('defeat-modal');
      if (modalV) modalV.classList.remove('active');
      if (modalD) modalD.classList.remove('active');
      this.combo = 0;
      this.loadLevel(this.currentLevel);
    }

    clearSandbox() {
      this.resonators = [];
      this.orbs = [];
      this.particles = [];
      this.waves = [];
    }

    updateUI() {
      const elScore = document.getElementById('hud-score');
      if (elScore) elScore.textContent = this.score.toLocaleString();

      const elLevel = document.getElementById('hud-level');
      if (elLevel) {
        if (this.mode === 'journey') elLevel.textContent = `Level ${this.currentLevel}`;
        else if (this.mode === 'flow') elLevel.textContent = `Flow Mode`;
        else elLevel.textContent = `Sandbox`;
      }

      const elShots = document.getElementById('hud-shots');
      if (elShots) {
        elShots.textContent = this.shotsRemaining > 90 ? '∞' : `${this.shotsRemaining}`;
      }

      const elCombo = document.getElementById('hud-combo');
      if (elCombo) {
        elCombo.textContent = `${this.combo}×`;
        elCombo.style.opacity = this.combo > 1 ? '1' : '0.4';
      }

      // Progress bar for active level blooms
      const elProgress = document.getElementById('level-progress-fill');
      if (elProgress && this.resonators.length > 0) {
        const bloomedCount = this.resonators.filter((n) => n.bloomed).length;
        const pct = Math.round((bloomedCount / this.resonators.length) * 100);
        elProgress.style.width = `${pct}%`;
      }
    }

    // ── Simulation and Draw Loop ──
    loop(timestamp) {
      const dt = Math.min(0.06, (timestamp - this.lastTime) / 1000) * this.timeScale;
      this.lastTime = timestamp;

      if (!this.isPaused) {
        this.update(dt);
      }

      this.render();
      requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
      const bounds = { width: this.width, height: this.height };

      // Update Resonators
      for (const res of this.resonators) {
        res.update(dt);
      }

      // Update Orbs
      for (let i = this.orbs.length - 1; i >= 0; i--) {
        const orb = this.orbs[i];
        orb.update(dt, this.resonators, bounds, 1800 * this.gravityStrength);
        if (!orb.alive) {
          this.orbs.splice(i, 1);
          if (this.orbs.length === 0 && this.mode === 'journey') {
            this.checkLevelCompletion();
          }
        }
      }

      // Update Waves
      for (let i = this.waves.length - 1; i >= 0; i--) {
        if (!this.waves[i].update(dt)) {
          this.waves.splice(i, 1);
        }
      }

      // Update Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        if (!this.particles[i].update(dt)) {
          this.particles.splice(i, 1);
        }
      }

      // Update Ambient Motes
      for (const mote of this.ambientMotes) {
        mote.x += mote.vx * dt * 60;
        mote.y += mote.vy * dt * 60;
        mote.pulse += dt * 1.5;

        // Wrap around boundaries
        if (mote.y < -10) mote.y = this.height + 10;
        if (mote.x < -10) mote.x = this.width + 10;
        if (mote.x > this.width + 10) mote.x = -10;
      }

      // Flow mode continuous resonator replenish
      if (this.mode === 'flow' && this.resonators.length < 5) {
        this.spawnFlowResonators(2);
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      // 1. Soft Dynamic Gradient Canvas Background
      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, Math.max(w, h));
      bgGrad.addColorStop(0, this.palette.bgMuted);
      bgGrad.addColorStop(1, this.palette.bgDeep);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle atmospheric grid
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Ambient Floating Motes
      for (const mote of this.ambientMotes) {
        const pulse = 0.5 + 0.5 * Math.sin(mote.pulse);
        ctx.fillStyle = mote.color;
        ctx.globalAlpha = mote.alpha * pulse;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 3. Gravitational Field Lines between Resonators
      if (this.resonators.length > 1) {
        ctx.save();
        for (let i = 0; i < this.resonators.length; i++) {
          for (let j = i + 1; j < this.resonators.length; j++) {
            const n1 = this.resonators[i];
            const n2 = this.resonators[j];
            const dist = Math.hypot(n2.x - n1.x, n2.y - n1.y);
            if (dist < 280) {
              const alpha = (1 - dist / 280) * 0.18;
              ctx.strokeStyle = (n1.bloomed && n2.bloomed) ? '#ffffff' : this.palette.primary;
              ctx.globalAlpha = alpha;
              ctx.lineWidth = 1;
              ctx.setLineDash([2, 4]);
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // 4. Render Resonators
      for (const res of this.resonators) {
        res.draw(ctx);
      }

      // 5. Render Ripple Waves
      for (const wave of this.waves) {
        wave.draw(ctx);
      }

      // 6. Render Particles
      for (const p of this.particles) {
        p.draw(ctx);
      }

      // 7. Render Active Light Orbs
      for (const orb of this.orbs) {
        orb.draw(ctx);
      }

      // 8. Render Launch Pad & Aiming Trajectory
      this.drawLauncher(ctx);
    }

    drawLauncher(ctx) {
      const ox = this.launchOrigin.x;
      const oy = this.launchOrigin.y;

      // Draw Launch Pedestal / Base Pad
      ctx.save();
      const padGrad = ctx.createRadialGradient(ox, oy, 4, ox, oy, 28);
      padGrad.addColorStop(0, '#ffffff');
      padGrad.addColorStop(0.4, this.palette.primary);
      padGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = padGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, 28, 0, Math.PI * 2);
      ctx.fill();

      // Frosted Glass Ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ox, oy, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Launch Ready Orb inside pedestal
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = this.palette.primary;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ox, oy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Aiming Trajectory Preview Dots
      if (this.isAiming) {
        const dx = ox - this.aimPoint.x;
        const dy = oy - this.aimPoint.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 15) {
          const power = Math.min(18, dist * 0.085);
          const angle = Math.atan2(dy, dx);
          let simX = ox;
          let simY = oy;
          let simVx = Math.cos(angle) * power;
          let simVy = Math.sin(angle) * power;

          ctx.save();
          // Draw elastic drag string
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(this.aimPoint.x, this.aimPoint.y);
          ctx.stroke();

          // Reticle at aim pull point
          ctx.strokeStyle = this.palette.accent;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(this.aimPoint.x, this.aimPoint.y, 10, 0, Math.PI * 2);
          ctx.stroke();

          // Simulate future trajectory dots
          const simSteps = 28;
          const simDt = 0.028;

          for (let s = 0; s < simSteps; s++) {
            // Apply gravity from resonators in simulation
            for (const res of this.resonators) {
              const rdx = res.x - simX;
              const rdy = res.y - simY;
              const rDistSq = rdx * rdx + rdy * rdy;
              if (rDistSq > 64 && rDistSq < 250000) {
                const force = (res.mass * 1800 * this.gravityStrength) / Math.max(400, rDistSq);
                const rDist = Math.sqrt(rDistSq);
                simVx += (rdx / rDist) * force * simDt;
                simVy += (rdy / rDist) * force * simDt;
              }
            }

            simX += simVx * simDt * 60;
            simY += simVy * simDt * 60;

            const alpha = 1 - (s / simSteps);
            ctx.fillStyle = this.palette.primary;
            ctx.globalAlpha = alpha * 0.7;
            ctx.beginPath();
            ctx.arc(simX, simY, Math.max(1, 3.5 * alpha), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }
    }
  }

  // Expose global instance
  window.addEventListener('DOMContentLoaded', () => {
    window.chromaEngine = new ChromaBloomEngine();
  });
})();
