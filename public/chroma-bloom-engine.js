/**
 * Chroma Bloom: Zen Orbital Cascade Engine
 * Pure Vanilla JS + HTML5 Canvas + Web Audio API
 * Zero external dependencies.
 */

(function () {
  'use strict';

  // ── Musical Song Scales and Harmonic Chord Progressions ──
  // 8-part meditative chord progression: Cmaj9 -> Am9 -> Fmaj7#11 -> Gadd9 -> Em9 -> Dm9 -> Fmaj9 -> Cadd9
  const SONG_PROGRESSIONS = [
    { name: 'Cmaj9', rootFreq: 65.41, bassFreq: 130.81, notes: [261.63, 293.66, 329.63, 392.00, 493.88, 523.25, 587.33, 659.25, 783.99, 987.77, 1046.50, 1174.66] },
    { name: 'Am9', rootFreq: 55.00, bassFreq: 110.00, notes: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50] },
    { name: 'Fmaj7#11', rootFreq: 87.31, bassFreq: 174.61, notes: [174.61, 220.00, 261.63, 329.63, 370.00, 440.00, 523.25, 659.25, 740.00, 880.00, 1046.50, 1318.51] },
    { name: 'Gadd9', rootFreq: 98.00, bassFreq: 196.00, notes: [196.00, 220.00, 246.94, 293.66, 392.00, 440.00, 493.88, 587.33, 783.99, 880.00, 987.77, 1174.66] },
    { name: 'Em9', rootFreq: 82.41, bassFreq: 164.81, notes: [164.81, 196.00, 246.94, 293.66, 329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 987.77, 1174.66] },
    { name: 'Dm9', rootFreq: 73.42, bassFreq: 146.83, notes: [146.83, 174.61, 220.00, 261.63, 293.66, 349.23, 440.00, 523.25, 587.33, 698.46, 880.00, 1046.50] },
    { name: 'Fmaj9', rootFreq: 87.31, bassFreq: 174.61, notes: [174.61, 220.00, 261.63, 293.66, 329.63, 349.23, 440.00, 523.25, 587.33, 659.25, 880.00, 1046.50] },
    { name: 'Cadd9', rootFreq: 65.41, bassFreq: 130.81, notes: [130.81, 196.00, 261.63, 293.66, 329.63, 392.00, 523.25, 587.33, 659.25, 783.99, 1046.50, 1174.66] }
  ];

  // ── Generative Web Audio Synth Engine ──
  class ZenAudio {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.muted = false;
      this.isInitialized = false;
      this.progression = SONG_PROGRESSIONS;
      this.chordIndex = 0;
      this.songHitCount = 0;
      this.droneOsc = null;
    }

    init() {
      if (this.isInitialized) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
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
        this.masterGain.gain.setTargetAtTime(this.muted ? 0 : 0.32, this.ctx.currentTime, 0.05);
      }
      return this.muted;
    }

    getCurrentChord() {
      return this.progression[this.chordIndex % this.progression.length];
    }

    advanceChord() {
      this.chordIndex = (this.chordIndex + 1) % this.progression.length;
      const nextChord = this.getCurrentChord();
      if (this.droneOsc && this.ctx) {
        const now = this.ctx.currentTime;
        this.droneOsc.osc1.frequency.setTargetAtTime(nextChord.rootFreq, now, 1.2);
        this.droneOsc.osc2.frequency.setTargetAtTime(nextChord.rootFreq * 1.5, now, 1.2);
      }
    }

    startAmbientDrone() {
      if (!this.ctx || this.droneOsc) return;
      try {
        const chord = this.getCurrentChord();
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(chord.rootFreq, this.ctx.currentTime);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(chord.rootFreq * 1.5, this.ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(260, this.ctx.currentTime);

        droneGain.gain.setValueAtTime(0.045, this.ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(droneGain);
        droneGain.connect(this.masterGain);

        osc1.start();
        osc2.start();
        this.droneOsc = { osc1, osc2, gain: droneGain, filter };
      } catch (e) {}
    }

    playTone(freq, duration = 1.2, volume = 0.3, type = 'sine', brightness = 1.0) {
      if (!this.ctx || this.muted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const overtone = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const overtoneGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);

        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(freq * 2.76, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(12000, 2400 * brightness), now);

        // Exponential envelope for natural crystalline bell decay
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        overtoneGain.gain.setValueAtTime(0.001, now);
        overtoneGain.gain.exponentialRampToValueAtTime(volume * 0.25 * brightness, now + 0.01);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.55));

        osc.connect(filter);
        overtone.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + duration);
        overtone.stop(now + duration);
      } catch (e) {}
    }

    // ── Main Song & Chord Event: Called on each node hit ──
    playHarmonicHit(harmonyType = 'normal', combo = 1, noteIdx = 5, mode = 'flow') {
      if (!this.ctx || this.muted) return;

      this.songHitCount++;
      // In Flow Mode, advance the musical chord every 4-5 hits to continuously compose a living song
      if (this.songHitCount % 4 === 0) {
        this.advanceChord();
      }

      const chord = this.getCurrentChord();
      const notes = chord.notes;
      const noteCount = notes.length;

      // Pitch climbs gracefully with combo streak
      const comboOffset = Math.min(6, Math.floor((combo - 1) / 2));
      const melodicIdx = (noteIdx + comboOffset) % noteCount;
      const primaryFreq = notes[melodicIdx];

      if (harmonyType === 'repulsor') {
        // Red repulsor: Plays a rich resonant bass chord note + warm singing bowl gong
        this.playTone(chord.bassFreq, 2.2, 0.45, 'triangle', 0.8);
        this.playTone(chord.rootFreq * 2, 1.8, 0.25, 'sine', 0.9);
      } else if (harmonyType === 'multiplier') {
        // Multiplier (2x): Plays an ascending dual arpeggio sparkle chord
        const note1 = notes[melodicIdx];
        const note2 = notes[(melodicIdx + 3) % noteCount];
        this.playTone(note1, 1.6, 0.35, 'sine', 1.3);
        setTimeout(() => {
          this.playTone(note2, 1.8, 0.38, 'sine', 1.5);
        }, 55);
      } else if (harmonyType === 'prism') {
        // Prism (❖): Plays a lush 3-note harmonic shimmer chord in key
        const chordPitches = [
          notes[melodicIdx],
          notes[(melodicIdx + 2) % noteCount],
          notes[(melodicIdx + 4) % noteCount]
        ];
        chordPitches.forEach((f, i) => {
          setTimeout(() => {
            this.playTone(f, 2.0 + i * 0.2, 0.28, 'sine', 1.4);
          }, i * 45);
        });
      } else {
        // Normal Node: Crystal bell chime matching the current active chord note
        this.playTone(primaryFreq, 1.4 + Math.min(0.6, combo * 0.08), 0.35, 'sine', 1.1 + combo * 0.05);
      }
    }

    playLaunch(pitch = 1.0) {
      if (!this.ctx || this.muted) return;
      try {
        const chord = this.getCurrentChord();
        const baseFreq = chord.bassFreq || 130.81;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * pitch, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.5 * pitch, now + 0.22);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    }

    playChord(baseIndex = 5) {
      const chord = this.getCurrentChord();
      const notes = chord.notes;
      [0, 2, 4, 6].forEach((idx, i) => {
        setTimeout(() => {
          this.playTone(notes[idx % notes.length], 2.2 + i * 0.2, 0.32, 'sine', 1.2);
        }, i * 70);
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
      this.mass = mass;
      this.color = color;
      this.harmonyType = harmonyType;
      this.noteIdx = noteIdx;

      this.bloomed = false;
      this.bloomProgress = 0;
      this.bloomLife = 0; // For Flow Mode auto-dissolve and refresh
      this.isDissolving = false;
      this.dissolveProgress = 0;
      this.birthProgress = 0; // Smooth entry fade-in

      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 1.5 + Math.random() * 0.8;
      this.scale = 1.0;
      this.velocityScale = 0;
      this.requiredHits = harmonyType === 'prism' ? 2 : 1;
      this.currentHits = 0;

      // Cosmic gentle drift in Flow Mode
      this.driftAngle = Math.random() * Math.PI * 2;
      this.driftSpeed = 0.15 + Math.random() * 0.2;

      this.ringRotation = Math.random() * Math.PI;
      this.petals = harmonyType === 'prism' ? 6 : (harmonyType === 'multiplier' ? 8 : (harmonyType === 'repulsor' ? 4 : 5));
    }

    update(dt, mode = 'journey') {
      this.pulsePhase += this.pulseSpeed * dt;
      this.ringRotation += 0.4 * dt;

      // Smooth birth fade in
      if (this.birthProgress < 1.0) {
        this.birthProgress = Math.min(1.0, this.birthProgress + dt * 2.5);
      }

      // Spring physics
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

      // Flow Mode: Gentle cosmic floating drift & auto-dissolve after blooming
      if (mode === 'flow') {
        this.driftAngle += 0.25 * dt;
        this.x += Math.cos(this.driftAngle) * this.driftSpeed;
        this.y += Math.sin(this.driftAngle) * this.driftSpeed;

        if (this.bloomed) {
          this.bloomLife += dt;
          if (this.bloomLife > 2.5) {
            this.isDissolving = true;
            this.dissolveProgress = Math.min(1.0, this.dissolveProgress + dt * 1.6);
          }
        }
      }
    }

    triggerBloom(audio, combo = 1, mode = 'flow') {
      this.currentHits++;
      this.scale = 1.55;
      this.velocityScale = 3.0;

      if (this.currentHits >= this.requiredHits) {
        this.bloomed = true;
      }

      if (audio) {
        audio.playHarmonicHit(this.harmonyType, combo, this.noteIdx, mode);
      }
    }

    draw(ctx) {
      if (this.dissolveProgress >= 1.0) return;

      const nodeAlpha = (this.birthProgress || 1.0) * (1.0 - this.dissolveProgress);
      if (nodeAlpha <= 0) return;

      ctx.save();
      ctx.globalAlpha = nodeAlpha;

      const pulse = Math.sin(this.pulsePhase) * 3;
      const r = (this.radius + pulse) * this.scale * (1.0 - this.dissolveProgress * 0.3);

      const glowGrad = ctx.createRadialGradient(this.x, this.y, r * 0.2, this.x, this.y, r * 3.5);
      const isRepulsor = this.mass < 0;

      glowGrad.addColorStop(0, this.bloomed ? 'rgba(255, 255, 255, 0.4)' : `${this.color}40`);
      glowGrad.addColorStop(0.5, this.bloomed ? 'rgba(200, 230, 255, 0.15)' : `${this.color}15`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Bloom Petals / Orbit Rings
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

      // Central Core
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

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r - 1, 0, Math.PI * 2);
      ctx.stroke();

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
      } else if (this.harmonyType === 'repulsor') {
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(r * 0.9)}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('−', this.x, this.y);
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

      for (const node of resonators) {
        if (node.isDissolving) continue;

        const dx = node.x - this.x;
        const dy = node.y - this.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);

        if (dist > 8 && dist < 500) {
          const force = (node.mass * gravityConst) / Math.max(400, distSq);
          const nx = dx / dist;
          const ny = dy / dist;
          this.vx += nx * force * dt;
          this.vy += ny * force * dt;
        }

        if (dist < node.radius + this.radius + 6) {
          if (!this.visitedNodes.has(node)) {
            this.visitedNodes.add(node);
            const comboCount = window.chromaEngine ? window.chromaEngine.combo + 1 : this.visitedNodes.size;
            const currentMode = window.chromaEngine ? window.chromaEngine.mode : 'flow';
            node.triggerBloom(window.chromaEngine ? window.chromaEngine.audio : null, comboCount, currentMode);
            this.resonanceScore += node.harmonyType === 'multiplier' ? 200 : 100;

            if (window.chromaEngine) {
              window.chromaEngine.createBloomBurst(node.x, node.y, node.color);
              window.chromaEngine.addScore(node.harmonyType === 'multiplier' ? 200 : 100);
            }
          }
        }
      }

      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;

      this.vx *= 0.9985;
      this.vy *= 0.9985;

      this.trail.unshift({ x: this.x, y: this.y, color: this.color });
      if (this.trail.length > this.maxTrail) {
        this.trail.pop();
      }

      this.energy -= dt * 12.5;

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

      ctx.save();
      const alpha = Math.max(0.2, this.energy / this.maxEnergy);
      ctx.globalAlpha = alpha;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 20;

      const grad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, this.radius * 2.2);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.5, this.color);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

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

      // Transitions & Flags
      this.levelCompleted = false;
      this.levelTransitioning = false;

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

      // Sandbox tools
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

    loadLevel(lvl) {
      this.currentLevel = Math.max(1, Math.min(this.maxLevel, lvl));
      this.levelCompleted = false;
      this.resonators = [];
      this.orbs = [];
      this.particles = [];
      this.waves = [];
      this.shotsRemaining = Math.max(3, 7 - Math.floor(this.currentLevel / 3));

      const cx = this.width * 0.5;
      const cy = this.height * 0.42;

      if (this.mode === 'journey') {
        switch (this.currentLevel) {
          case 1:
            this.resonators.push(new ResonatorNode(cx, cy - 80, 24, 1.2, this.palette.primary, 'normal', 5));
            this.resonators.push(new ResonatorNode(cx - 120, cy + 40, 20, 1.0, this.palette.secondary, 'normal', 7));
            this.resonators.push(new ResonatorNode(cx + 120, cy + 40, 20, 1.0, this.palette.secondary, 'normal', 9));
            break;
          case 2:
            this.resonators.push(new ResonatorNode(cx, cy - 110, 22, 1.1, this.palette.accent, 'multiplier', 10));
            this.resonators.push(new ResonatorNode(cx - 130, cy, 20, 1.0, this.palette.primary, 'normal', 6));
            this.resonators.push(new ResonatorNode(cx + 130, cy, 20, 1.0, this.palette.primary, 'normal', 8));
            this.resonators.push(new ResonatorNode(cx, cy + 110, 25, 1.4, this.palette.secondary, 'normal', 4));
            break;
          case 3:
            this.resonators.push(new ResonatorNode(cx - 85, cy, 26, 1.6, this.palette.primary, 'normal', 5));
            this.resonators.push(new ResonatorNode(cx + 85, cy, 26, 1.6, this.palette.accent, 'normal', 9));
            this.resonators.push(new ResonatorNode(cx, cy - 130, 19, 0.8, this.palette.secondary, 'normal', 11));
            this.resonators.push(new ResonatorNode(cx, cy + 130, 19, 0.8, this.palette.secondary, 'normal', 3));
            break;
          case 4:
            this.resonators.push(new ResonatorNode(cx, cy, 32, 2.0, this.palette.accent, 'prism', 7));
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const px = cx + Math.cos(angle) * 135;
              const py = cy + Math.sin(angle) * 135;
              this.resonators.push(new ResonatorNode(px, py, 18, 0.9, this.palette.primary, 'normal', 5 + i * 2));
            }
            break;
          case 5:
            this.resonators.push(new ResonatorNode(cx, cy, 26, -1.8, '#ff477e', 'repulsor', 4));
            this.resonators.push(new ResonatorNode(cx - 150, cy - 60, 22, 1.2, this.palette.primary, 'normal', 6));
            this.resonators.push(new ResonatorNode(cx + 150, cy - 60, 22, 1.2, this.palette.primary, 'normal', 8));
            this.resonators.push(new ResonatorNode(cx - 100, cy + 100, 20, 1.1, this.palette.accent, 'multiplier', 10));
            this.resonators.push(new ResonatorNode(cx + 100, cy + 100, 20, 1.1, this.palette.secondary, 'normal', 12));
            break;
          default:
            const count = 4 + (this.currentLevel % 5);
            const radius = 110 + (this.currentLevel % 3) * 25;
            this.resonators.push(new ResonatorNode(cx, cy, 28, 1.8, this.palette.accent, (this.currentLevel % 2 === 0) ? 'multiplier' : 'prism', 6));
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
        this.resonators.push(new ResonatorNode(cx - 90, cy, 26, 1.5, this.palette.primary, 'normal', 5));
        this.resonators.push(new ResonatorNode(cx + 90, cy, 26, 1.5, this.palette.accent, 'multiplier', 9));
      }

      this.updateUI();
    }

    spawnFlowResonators(count = 1) {
      const padX = this.width * 0.14;
      const padYTop = this.height * 0.12;
      const padYBottom = this.height * 0.68;

      for (let i = 0; i < count; i++) {
        // Find well-spaced coordinate
        let x = padX + Math.random() * (this.width - padX * 2);
        let y = padYTop + Math.random() * (padYBottom - padYTop);

        // Avoid clustering too close to existing resonators
        for (let attempt = 0; attempt < 5; attempt++) {
          const tooClose = this.resonators.some(r => Math.hypot(r.x - x, r.y - y) < 80);
          if (!tooClose) break;
          x = padX + Math.random() * (this.width - padX * 2);
          y = padYTop + Math.random() * (padYBottom - padYTop);
        }

        const roll = Math.random();
        let type = 'normal';
        let color = Math.random() > 0.5 ? this.palette.primary : this.palette.secondary;
        let mass = 1.0 + Math.random() * 0.6;
        let radius = 20 + Math.random() * 6;

        if (roll > 0.82) {
          type = 'multiplier';
          color = this.palette.accent;
          mass = 1.3;
          radius = 24;
        } else if (roll > 0.66) {
          type = 'repulsor';
          color = '#ff477e';
          mass = -1.6;
          radius = 23;
        } else if (roll > 0.48) {
          type = 'prism';
          color = this.palette.secondary;
          mass = 1.6;
          radius = 26;
        }

        const note = Math.floor(Math.random() * 14) + 2;
        const node = new ResonatorNode(x, y, radius, mass, color, type, note);
        this.resonators.push(node);
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
        this.audio.playHarmonicHit(node.harmonyType, 1, note, this.mode);
      }
    }

    launchOrb(x, y, vx, vy) {
      const orb = new LightOrb(x, y, vx, vy, this.palette.primary, 100, 6.5);
      this.orbs.push(orb);
      this.audio.playLaunch(1.0 + Math.random() * 0.2);
      this.waves.push(new RippleWave(x, y, 70, this.palette.primary, 220, 2.5));
    }

    createBloomBurst(x, y, color) {
      this.totalBlooms++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      this.waves.push(new RippleWave(x, y, 140, color, 190, 3.5));

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
      if (this.mode !== 'journey' || this.levelCompleted) return;

      const allBloomed = this.resonators.every((n) => n.bloomed);
      if (allBloomed) {
        this.levelCompleted = true;
        setTimeout(() => {
          this.audio.playChord(5);
          this.showVictoryModal();
        }, 400);
      } else if (this.shotsRemaining === 0 && this.orbs.length === 0) {
        setTimeout(() => {
          if (!this.levelCompleted && !this.resonators.every((n) => n.bloomed)) {
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
      if (this.levelTransitioning) return;
      this.levelTransitioning = true;

      const modal = document.getElementById('victory-modal');
      if (modal) modal.classList.remove('active');

      if (this.currentLevel < this.maxLevel) {
        const nextLvl = this.currentLevel + 1;
        this.loadLevel(nextLvl);
      } else {
        this.loadLevel(1);
      }

      setTimeout(() => {
        this.levelTransitioning = false;
      }, 400);
    }

    restartLevel() {
      const modalV = document.getElementById('victory-modal');
      const modalD = document.getElementById('defeat-modal');
      if (modalV) modalV.classList.remove('active');
      if (modalD) modalD.classList.remove('active');
      this.combo = 0;
      this.levelCompleted = false;
      this.levelTransitioning = false;
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

      const elProgress = document.getElementById('level-progress-fill');
      if (elProgress && this.resonators.length > 0) {
        const bloomedCount = this.resonators.filter((n) => n.bloomed).length;
        const pct = Math.round((bloomedCount / this.resonators.length) * 100);
        elProgress.style.width = `${pct}%`;
      }
    }

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

      // Update Resonators & handle Flow Mode auto-dissolve / replenish
      for (let i = this.resonators.length - 1; i >= 0; i--) {
        const res = this.resonators[i];
        res.update(dt, this.mode);

        if (this.mode === 'flow' && res.dissolveProgress >= 1.0) {
          // Dissolve burst
          for (let p = 0; p < 12; p++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 2.5;
            this.particles.push(new Particle(res.x, res.y, Math.cos(angle) * speed, Math.sin(angle) * speed, res.color, 1.8, 0.7, 0.7, 1.2, true));
          }
          this.resonators.splice(i, 1);
        }
      }

      // Flow Mode continuous regeneration: ensure at least 5 unbloomed resonators at all times
      if (this.mode === 'flow') {
        const unbloomedCount = this.resonators.filter((n) => !n.bloomed && !n.isDissolving).length;
        if (unbloomedCount < 5) {
          this.spawnFlowResonators(1);
        }
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

        if (mote.y < -10) mote.y = this.height + 10;
        if (mote.x < -10) mote.x = this.width + 10;
        if (mote.x > this.width + 10) mote.x = -10;
      }
    }

    render() {
      const ctx = this.ctx;
      const w = this.width;
      const h = this.height;

      const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.45, 20, w * 0.5, h * 0.5, Math.max(w, h));
      bgGrad.addColorStop(0, this.palette.bgMuted);
      bgGrad.addColorStop(1, this.palette.bgDeep);
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

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

      for (const mote of this.ambientMotes) {
        const pulse = 0.5 + 0.5 * Math.sin(mote.pulse);
        ctx.fillStyle = mote.color;
        ctx.globalAlpha = mote.alpha * pulse;
        ctx.beginPath();
        ctx.arc(mote.x, mote.y, mote.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

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

      for (const res of this.resonators) {
        res.draw(ctx);
      }

      for (const wave of this.waves) {
        wave.draw(ctx);
      }

      for (const p of this.particles) {
        p.draw(ctx);
      }

      for (const orb of this.orbs) {
        orb.draw(ctx);
      }

      this.drawLauncher(ctx);
    }

    drawLauncher(ctx) {
      const ox = this.launchOrigin.x;
      const oy = this.launchOrigin.y;

      ctx.save();
      const padGrad = ctx.createRadialGradient(ox, oy, 4, ox, oy, 28);
      padGrad.addColorStop(0, '#ffffff');
      padGrad.addColorStop(0.4, this.palette.primary);
      padGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = padGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ox, oy, 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = this.palette.primary;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ox, oy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

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
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(this.aimPoint.x, this.aimPoint.y);
          ctx.stroke();

          ctx.strokeStyle = this.palette.accent;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(this.aimPoint.x, this.aimPoint.y, 10, 0, Math.PI * 2);
          ctx.stroke();

          const simSteps = 28;
          const simDt = 0.028;

          for (let s = 0; s < simSteps; s++) {
            for (const res of this.resonators) {
              if (res.isDissolving) continue;
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
