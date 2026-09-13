// =============================================================================
//  SPACE DODGE: STARFIGHTER ODYSSEY — Ultra-Realistic Canvas Arcade Engine
//  Discrete Level Campaigns, Level Complete Debriefings, Unique Hazards & Audio
// =============================================================================

(function () {
  'use strict';

  // ── Canvas & Sizing ────────────────────────────────────────────────────────
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let cw = 800, ch = 450;
  let dpr = window.devicePixelRatio || 1;

  // ── DOM UI Elements ────────────────────────────────────────────────────────
  const elSectorBadge = document.getElementById('btn-select-sector');
  const elScore = document.getElementById('ui-score');
  const elMinerals = document.getElementById('ui-minerals');
  const elDestroyed = document.getElementById('ui-destroyed');
  const elHigh = document.getElementById('ui-high');
  const elShieldVal = document.getElementById('val-shield');
  const elShieldBar = document.getElementById('bar-shield');
  const elBoostVal = document.getElementById('val-boost');
  const elBoostBar = document.getElementById('bar-boost');
  const elEmpIcons = document.getElementById('emp-icons');
  const elAchCount = document.getElementById('ach-count');

  // Sector Progress
  const elSectorProgressLabel = document.getElementById('sector-progress-label');
  const elSectorProgressFill = document.getElementById('sector-progress-fill');

  // Modals & Navigation
  const elPauseModal = document.getElementById('pause-modal');
  const elAchModal = document.getElementById('modal-achievements');
  const elLevelsModal = document.getElementById('modal-levels');
  const elLevelCompleteModal = document.getElementById('modal-level-complete');
  const elAchContainer = document.getElementById('achievements-container');
  const elLevelsContainer = document.getElementById('levels-container');

  // Level Complete UI fields
  const elLcTitle = document.getElementById('lc-title');
  const elLcSubtitle = document.getElementById('lc-subtitle');
  const elLcStars = document.getElementById('lc-stars');
  const elLcDistance = document.getElementById('lc-distance');
  const elLcMinerals = document.getElementById('lc-minerals');
  const elLcDestroyed = document.getElementById('lc-destroyed');
  const elLcShield = document.getElementById('lc-shield');

  const btnNextLevel = document.getElementById('btn-next-level');
  const btnReplayLevel = document.getElementById('btn-replay-level');
  const btnSectorSelect = document.getElementById('btn-sector-select');

  const btnPause = document.getElementById('btn-pause');
  const btnResume = document.getElementById('btn-resume');
  const btnRestart = document.getElementById('btn-restart');
  const btnAchievements = document.getElementById('btn-achievements');
  const btnCloseAch = document.getElementById('btn-close-ach');
  const btnCloseLevels = document.getElementById('btn-close-levels');
  const btnVolMute = document.getElementById('btn-vol-mute');

  // Toasts
  const elToast = document.getElementById('achievement-toast');
  const elToastIcon = document.getElementById('toast-icon');
  const elToastTitle = document.getElementById('toast-title');
  const elToastDesc = document.getElementById('toast-desc');

  // Mobile Touch Controls
  const btnTouchFire = document.getElementById('btn-touch-fire');
  const btnTouchBoost = document.getElementById('btn-touch-boost');
  const btnTouchEmp = document.getElementById('btn-touch-emp');

  // ── Persistence & Storage ──────────────────────────────────────────────────
  let highDist = Number(localStorage.getItem('space-dodge-hi')) || 0;
  if (elHigh) elHigh.textContent = highDist + 'm';

  let unlockedMaxLevel = Number(localStorage.getItem('space-dodge-unlocked-level')) || 1;
  let totalAsteroidsBlasted = Number(localStorage.getItem('space-dodge-total-rocks')) || 0;
  let totalMineralsGathered = Number(localStorage.getItem('space-dodge-total-minerals')) || 0;
  let totalDronesDestroyed = Number(localStorage.getItem('space-dodge-total-drones')) || 0;

  // ── Achievements Definition & Manager ──────────────────────────────────────
  const ACHIEVEMENTS = [
    { id: 'first_flight', name: 'First Flight', desc: 'Launch your first starfighter mission', icon: '🚀' },
    { id: 'rock_destroyer_25', name: 'Asteroid Buster', desc: 'Destroy 25 asteroids in a single run', icon: '💥' },
    { id: 'rock_destroyer_100', name: 'Demolition Master', desc: 'Destroy 100 asteroids across all missions', icon: '☄️' },
    { id: 'miner_50', name: 'Mineral Miner', desc: 'Collect 50 space minerals in a single run', icon: '💎' },
    { id: 'miner_200', name: 'Tycoon of the Void', desc: 'Collect 200 total space minerals', icon: '💰' },
    { id: 'emp_master', name: 'Supernova', desc: 'Deploy a Nova EMP Smart Bomb', icon: '⚡' },
    { id: 'shield_flawless', name: 'Untouchable', desc: 'Clear a Sector without taking any shield damage', icon: '🛡️' },
    { id: 'reach_sector_3', name: 'Cryo Navigator', desc: 'Reach Sector 3: Glacial Cryo Void', icon: '🌌' },
    { id: 'drone_hunter', name: 'Drone Hunter', desc: 'Destroy 5 rogue alien drones', icon: '🛸' },
    { id: 'ace_pilot', name: 'Singularity Conqueror', desc: 'Reach Sector 5: Singularity Horizon', icon: '👑' }
  ];

  let unlockedAchievements = {};
  try {
    unlockedAchievements = JSON.parse(localStorage.getItem('space-dodge-achievements')) || {};
  } catch (e) {
    unlockedAchievements = {};
  }

  function updateAchievementCountUI() {
    const count = Object.keys(unlockedAchievements).length;
    if (elAchCount) elAchCount.textContent = `${count}/${ACHIEVEMENTS.length}`;
  }
  updateAchievementCountUI();

  let toastTimeout = null;
  function triggerAchievement(id) {
    if (unlockedAchievements[id]) return;
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;

    unlockedAchievements[id] = { unlockedAt: Date.now() };
    localStorage.setItem('space-dodge-achievements', JSON.stringify(unlockedAchievements));
    updateAchievementCountUI();
    renderAchievementsModal();

    audio.playAchievementChime();

    if (elToast && elToastTitle && elToastDesc && elToastIcon) {
      elToastIcon.textContent = ach.icon;
      elToastTitle.textContent = ach.name;
      elToastDesc.textContent = ach.desc;

      elToast.classList.add('show');
      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        elToast.classList.remove('show');
      }, 4000);
    }
  }

  function renderAchievementsModal() {
    if (!elAchContainer) return;
    elAchContainer.innerHTML = '';

    ACHIEVEMENTS.forEach(ach => {
      const isUnlocked = !!unlockedAchievements[ach.id];
      const item = document.createElement('div');
      item.className = `achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`;
      item.innerHTML = `
        <div class="ach-icon">${ach.icon}</div>
        <div class="ach-info">
          <span class="ach-name">${ach.name}</span>
          <span class="ach-desc">${ach.desc}</span>
        </div>
        <span class="ach-status ${isUnlocked ? 'unlocked' : 'locked'}">
          ${isUnlocked ? 'UNLOCKED' : 'LOCKED'}
        </span>
      `;
      elAchContainer.appendChild(item);
    });
  }

  // ── 5 Unique, Escalating & Rewarding Levels / Sectors ──────────────────────
  const LEVELS = [
    {
      level: 1,
      name: 'SECTOR 1: PERIMETER',
      title: 'Kuiper Outskirts',
      desc: 'Calm asteroid corridor. Slow-tumbling basalt debris & gold rocks.',
      targetDistance: 900,
      scrollSpeed: 280,
      hazards: ['basalt', 'gold_ore'],
      bgGradient: ['#03050b', '#060d1f', '#091630'],
      nebulaColor: '#38dbf5',
      dustColor: '#80e9ff',
      shipColor: { hull1: '#eef2f9', hull2: '#9fa8bf', wing: '#38dbf5', flame: '#f5b942' },
      gunName: 'Dual Blue Plasma Blasters',
      gunColor: '#38dbf5',
      gunSoundPitch: 840,
      mineralVal: 10,
      mineralsTarget: 50
    },
    {
      level: 2,
      name: 'SECTOR 2: MAGMA BELT',
      title: 'Solar Magma Belt',
      desc: 'Fiery solar flare field. Molten Magma Asteroids that explode into flame sparks on death.',
      targetDistance: 1200,
      scrollSpeed: 340,
      hazards: ['magma', 'gold_ore'],
      bgGradient: ['#0a0303', '#240808', '#380e0e'],
      nebulaColor: '#f59e0b',
      dustColor: '#ff8c42',
      shipColor: { hull1: '#ffeedd', hull2: '#d48850', wing: '#ff5722', flame: '#ff3d00' },
      gunName: 'Magma Incendiary Repeaters',
      gunColor: '#ff7700',
      gunSoundPitch: 980,
      mineralVal: 25,
      mineralsTarget: 100
    },
    {
      level: 3,
      name: 'SECTOR 3: CRYO VOID',
      title: 'Glacial Cryo Void',
      desc: 'Frost blizzard void. High-velocity Ice Comets that shatter into crystalline shrapnel & Cryo-Mines.',
      targetDistance: 1550,
      scrollSpeed: 400,
      hazards: ['ice_comet', 'cryo_mine', 'gold_ore'],
      bgGradient: ['#020912', '#061a29', '#0d2d42'],
      nebulaColor: '#56c6e8',
      dustColor: '#c8f5ff',
      shipColor: { hull1: '#f0fdff', hull2: '#7dd3fc', wing: '#0284c7', flame: '#38dbf5' },
      gunName: 'Cryo-Frost Triple Split Cannon',
      gunColor: '#38dbf5',
      gunSoundPitch: 1100,
      mineralVal: 45,
      mineralsTarget: 160
    },
    {
      level: 4,
      name: 'SECTOR 4: DRONE HIVE',
      title: 'Rogue Alien Drone Hive',
      desc: 'Hostile warzone. Zig-zagging Hunter Drones firing tracking laser bolts & Shielded Heavy Drones.',
      targetDistance: 1950,
      scrollSpeed: 460,
      hazards: ['hunter_drone', 'heavy_drone', 'magma', 'gold_ore'],
      bgGradient: ['#12020e', '#2b0722', '#3d0a30'],
      nebulaColor: '#ec4899',
      dustColor: '#f43f5e',
      shipColor: { hull1: '#1f2937', hull2: '#4b5563', wing: '#e11d48', flame: '#f43f5e' },
      gunName: 'Alien Quad-Plasma Shredder',
      gunColor: '#f43f5e',
      gunSoundPitch: 1250,
      mineralVal: 75,
      mineralsTarget: 240
    },
    {
      level: 5,
      name: 'SECTOR 5: SINGULARITY',
      title: 'Singularity Horizon',
      desc: 'Gravitational vortex anomaly. Gravitational Pulsars, Sentinel Mothership Drones, and maximum warp.',
      targetDistance: 2400,
      scrollSpeed: 530,
      hazards: ['pulsar', 'sentinel_boss', 'hunter_drone', 'ice_comet', 'gold_ore'],
      bgGradient: ['#0c0214', '#1f0633', '#330a54'],
      nebulaColor: '#a855f7',
      dustColor: '#c084fc',
      shipColor: { hull1: '#fef08a', hull2: '#eab308', wing: '#a855f7', flame: '#e879f9' },
      gunName: 'Singularity Oblivion Overcharger',
      gunColor: '#c084fc',
      gunSoundPitch: 1400,
      mineralVal: 120,
      mineralsTarget: 350
    }
  ];

  let currentLevelIdx = 0;

  function renderLevelsModal() {
    if (!elLevelsContainer) return;
    elLevelsContainer.innerHTML = '';

    LEVELS.forEach(lvl => {
      const isUnlocked = lvl.level <= unlockedMaxLevel;
      const isSelected = lvl.level === currentLevelIdx + 1;

      const card = document.createElement('div');
      card.className = `level-card ${!isUnlocked ? 'locked' : ''} ${isSelected ? 'current' : ''}`;
      card.innerHTML = `
        <div class="level-meta">
          <h4>${lvl.name} ${!isUnlocked ? '🔒' : ''}</h4>
          <p>${lvl.desc}</p>
          <p style="color:var(--color-brand); font-size:10px; margin-top:2px;">Gun: ${lvl.gunName} • Reward: 💎 +${lvl.mineralVal}</p>
        </div>
        <div>
          <span style="font-family:'Orbitron', monospace; font-size:11px; font-weight:700; color:${isUnlocked ? 'var(--color-accent)' : 'var(--color-muted)'}">
            ${isUnlocked ? (isSelected ? 'ACTIVE' : 'SELECT') : 'LOCKED'}
          </span>
        </div>
      `;

      if (isUnlocked) {
        card.addEventListener('click', () => {
          currentLevelIdx = lvl.level - 1;
          if (elSectorBadge) elSectorBadge.textContent = `${lvl.name} ▾`;
          toggleLevelsModal(false);
          startMission();
        });
      }

      elLevelsContainer.appendChild(card);
    });
  }

  // ── Next-Gen Web Audio Synthesizer ─────────────────────────────────────────
  class SoundSystem {
    constructor() {
      this.ctx = null;
      this.sfxGain = null;
      this.bgmGain = null;
      this.masterGain = null;
      this.isMuted = false;
      this.isPlayingBGM = false;
      this.bgmStep = 0;
      this.bgmTimer = null;
    }

    init() {
      if (this.ctx) return;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();

      this.masterGain.gain.value = 0.8;
      this.sfxGain.gain.value = 0.5;
      this.bgmGain.gain.value = 0.25;

      this.sfxGain.connect(this.masterGain);
      this.bgmGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx ? this.ctx.currentTime : 0, 0.05);
      }
      if (btnVolMute) {
        btnVolMute.textContent = this.isMuted ? '🔇' : '🔊';
      }
      return this.isMuted;
    }

    playLaser(isSpread = false) {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      const lvl = LEVELS[currentLevelIdx];
      const basePitch = lvl ? lvl.gunSoundPitch : 840;

      osc.type = isSpread ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(isSpread ? basePitch * 1.15 : basePitch, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.12);
    }

    playRailgun() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.25);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    }

    playExplosion(isLarge = false) {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const dur = isLarge ? 0.6 : 0.35;
      
      const bufferSize = this.ctx.sampleRate * dur;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isLarge ? 600 : 900, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + dur);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isLarge ? 0.7 : 0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);

      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(isLarge ? 120 : 160, t);
      sub.frequency.exponentialRampToValueAtTime(30, t + dur);
      subGain.gain.setValueAtTime(0.5, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      sub.connect(subGain);
      subGain.connect(this.sfxGain);
      sub.start(t);
      sub.stop(t + dur);
    }

    playShieldHit() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.18);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.18);
    }

    playPickup(type = 'mineral') {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = type === 'powerup' ? 587.33 : 880;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, t + 0.15);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.15);
    }

    playEMP() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(2200, t + 0.4);

      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.6);
    }

    playAchievementChime() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.09);

        gain.gain.setValueAtTime(0.25, t + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + i * 0.09);
        osc.stop(t + i * 0.09 + 0.35);
      });
    }

    playLevelVictoryFanfare() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const chord = [261.63, 392.00, 523.25, 659.25, 783.99];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.12);

        gain.gain.setValueAtTime(0.35, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.9);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.9);
      });
    }

    startBGM(levelIndex = 0) {
      try {
        if (!this.ctx) this.init();
        this.resume();
        this.stopBGM();
        this.isPlayingBGM = true;
        this.bgmStep = 0;

        const tracks = [
          // Level 1: Kuiper Outskirts (Calm, Airy Cosmic Synth - 125 BPM)
          {
            stepTime: 0.19,
            bassNotes: [73.42, 87.31, 98.00, 110.00, 130.81, 110.00, 98.00, 87.31],
            leadNotes: [293.66, 369.99, 440.00, 554.37, 659.25, 739.99],
            leadType: 'sine',
            bassType: 'triangle',
            cutoff: 350
          },
          // Level 2: Solar Magma Belt (High-Energy Cyberpunk - 142 BPM)
          {
            stepTime: 0.16,
            bassNotes: [82.41, 98.00, 110.00, 123.47, 146.83, 123.47, 110.00, 98.00],
            leadNotes: [329.63, 392.00, 440.00, 493.88, 587.33, 659.25],
            leadType: 'sawtooth',
            bassType: 'sawtooth',
            cutoff: 580
          },
          // Level 3: Glacial Cryo Void (Icy Glass Crystalline Arpeggios - 155 BPM)
          {
            stepTime: 0.135,
            bassNotes: [110.00, 130.81, 146.83, 164.81, 196.00, 164.81, 146.83, 130.81],
            leadNotes: [440.00, 523.25, 659.25, 783.99, 880.00, 1046.50],
            leadType: 'triangle',
            bassType: 'sine',
            cutoff: 750
          },
          // Level 4: Rogue Drone Hive (Ominous Alien Phrygian War March - 170 BPM)
          {
            stepTime: 0.12,
            bassNotes: [69.30, 73.42, 87.31, 103.83, 110.00, 103.83, 87.31, 73.42],
            leadNotes: [277.18, 293.66, 349.23, 415.30, 440.00, 554.37],
            leadType: 'square',
            bassType: 'sawtooth',
            cutoff: 820
          },
          // Level 5: Singularity Horizon (Epic Hyperdrive Climax - 185 BPM)
          {
            stepTime: 0.105,
            bassNotes: [65.41, 77.78, 98.00, 116.54, 130.81, 155.56, 174.61, 196.00],
            leadNotes: [523.25, 622.25, 783.99, 932.33, 1046.50, 1244.51, 1567.98],
            leadType: 'sawtooth',
            bassType: 'sawtooth',
            cutoff: 1100
          }
        ];

        const validIdx = Math.min(tracks.length - 1, Math.max(0, levelIndex || 0));
        const currentTrack = tracks[validIdx];

        const playStep = () => {
          if (!this.isPlayingBGM || !this.ctx) return;
          try {
            const now = this.ctx.currentTime;
            const step = Math.floor(this.bgmStep);

            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = currentTrack.bassType;
            const bassFreq = currentTrack.bassNotes[step % currentTrack.bassNotes.length] || 110;
            bassOsc.frequency.setValueAtTime(bassFreq, now);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            const filterFreq = Math.max(120, currentTrack.cutoff + Math.sin(step * 0.25) * 160);
            filter.frequency.setValueAtTime(filterFreq, now);

            bassGain.gain.setValueAtTime(0.18, now);
            bassGain.gain.exponentialRampToValueAtTime(0.01, now + currentTrack.stepTime * 0.95);

            bassOsc.connect(filter);
            filter.connect(bassGain);
            bassGain.connect(this.bgmGain);
            bassOsc.start(now);
            bassOsc.stop(now + currentTrack.stepTime);

            if (step % 2 === 0 || step % 8 === 7) {
              const leadOsc = this.ctx.createOscillator();
              const leadGain = this.ctx.createGain();
              leadOsc.type = currentTrack.leadType;
              const leadIndex = Math.floor(step / 2) % currentTrack.leadNotes.length;
              const leadFreq = currentTrack.leadNotes[leadIndex] || 440;
              leadOsc.frequency.setValueAtTime(leadFreq, now);

              leadGain.gain.setValueAtTime(0.09, now);
              leadGain.gain.exponentialRampToValueAtTime(0.001, now + currentTrack.stepTime * 1.6);

              leadOsc.connect(leadGain);
              leadGain.connect(this.bgmGain);
              leadOsc.start(now);
              leadOsc.stop(now + currentTrack.stepTime * 1.6);
            }

            this.bgmStep++;
            this.bgmTimer = setTimeout(playStep, currentTrack.stepTime * 1000);
          } catch (err) {
            console.warn('BGM playStep recovery:', err);
          }
        };

        playStep();
      } catch (err) {
        console.warn('startBGM error caught:', err);
      }
    }

    stopBGM() {
      this.isPlayingBGM = false;
      if (this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  const audio = new SoundSystem();

  // ── Game States ────────────────────────────────────────────────────────────
  const STATES = { MENU: 0, PLAYING: 1, PAUSED: 2, LEVEL_COMPLETE: 3, GAMEOVER: 4 };
  let gameState = STATES.MENU;

  // ── Ship Specifications ────────────────────────────────────────────────────
  const SHIP_W = 32;
  const SHIP_H = 46;

  const player = {
    x: 400,
    y: 350,
    vx: 0,
    vy: 0,
    bankAngle: 0,
    shield: 100,
    maxShield: 100,
    tookDamageThisSector: false,
    shieldRegenTimer: 0,
    boost: 100,
    maxBoost: 100,
    isBoosting: false,
    invincibleTimer: 0,
    fireTimer: 0,
    weaponType: 'standard',
    weaponTime: 0,
    empBombs: 3,
    maxEmp: 3,
    flashHit: 0,
    strobeTimer: 0
  };

  // ── World & Distance Scrolling ─────────────────────────────────────────────
  let sectorDistance = 0;
  let runAsteroidsDestroyed = 0;
  let runMineralsCollected = 0;
  let runDronesDestroyed = 0;
  let screenShake = 0;

  // ── Starfield & Parallax Nebula ────────────────────────────────────────────
  const stars = [];
  const nebulae = [];
  const warpDust = [];

  function initStarfield() {
    stars.length = 0;
    for (let i = 0; i < 140; i++) {
      const depth = Math.random();
      stars.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        size: depth < 0.6 ? 0.8 : depth < 0.9 ? 1.4 : 2.2,
        speed: 0.2 + depth * 1.8,
        color: depth > 0.85 ? (Math.random() < 0.5 ? '#80e9ff' : '#ffd37f') : '#ffffff',
        twinkle: Math.random() * Math.PI * 2
      });
    }

    nebulae.length = 0;
    for (let i = 0; i < 4; i++) {
      nebulae.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        radius: 180 + Math.random() * 220,
        color: ['#38dbf5', '#a855f7', '#3b82f6', '#f59e0b'][i % 4],
        alpha: 0.04 + Math.random() * 0.05,
        speed: 0.15 + Math.random() * 0.2
      });
    }

    warpDust.length = 0;
    for (let i = 0; i < 30; i++) {
      warpDust.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        length: 8 + Math.random() * 24,
        speed: 3.5 + Math.random() * 4,
        alpha: 0.2 + Math.random() * 0.4
      });
    }
  }

  // ── Procedural Asteroids & Dynamic Hazards ─────────────────────────────────
  const asteroids = [];
  const HAZARD_TYPES = {
    BASALT: { id: 'basalt', color: '#686b78', highlight: '#9ba0b5', shadow: '#2c2e38', hpMult: 1 },
    GOLD_ORE: { id: 'gold_ore', color: '#c49a3f', highlight: '#ffd76b', shadow: '#4d3910', hpMult: 1.2 },
    MAGMA: { id: 'magma', color: '#b91c1c', highlight: '#f59e0b', shadow: '#450a0a', hpMult: 1.3, isMagma: true },
    ICE_COMET: { id: 'ice_comet', color: '#56c6e8', highlight: '#c8f5ff', shadow: '#1b4d6e', hpMult: 0.8, isIce: true },
    CRYO_MINE: { id: 'cryo_mine', color: '#0284c7', highlight: '#38dbf5', shadow: '#082f49', hpMult: 1.5, isMine: true },
    HUNTER_DRONE: { id: 'hunter_drone', color: '#dc2626', highlight: '#f87171', shadow: '#450a0a', hpMult: 1.4, isDrone: true },
    HEAVY_DRONE: { id: 'heavy_drone', color: '#7c3aed', highlight: '#c084fc', shadow: '#2e1065', hpMult: 2.5, isDrone: true, isHeavy: true },
    PULSAR: { id: 'pulsar', color: '#9333ea', highlight: '#e879f9', shadow: '#3b0764', hpMult: 3.0, isPulsar: true },
    SENTINEL_BOSS: { id: 'sentinel_boss', color: '#e11d48', highlight: '#fb7185', shadow: '#4c0519', hpMult: 5.0, isBoss: true }
  };

  function createHazard(x, y, radius, type = HAZARD_TYPES.BASALT, vx = 0, vy = 0) {
    const vertexCount = 9 + Math.floor(Math.random() * 5);
    const vertices = [];
    for (let i = 0; i < vertexCount; i++) {
      const angle = (i / vertexCount) * Math.PI * 2;
      const variance = 0.72 + Math.random() * 0.45;
      vertices.push({
        baseAngle: angle,
        baseDist: radius * variance,
        crater: Math.random() < 0.3
      });
    }

    const hp = Math.max(1, Math.round((radius / 12) * type.hpMult));

    return {
      x,
      y,
      radius,
      type,
      vertices,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.8,
      vx,
      vy: vy || (60 + Math.random() * 80),
      hp,
      maxHp: hp,
      droneShootTimer: Math.random() * 2,
      hitFlash: 0
    };
  }

  let hazardSpawnTimer = 0;
  function spawnHazards(dt) {
    hazardSpawnTimer -= dt;
    if (hazardSpawnTimer <= 0) {
      const currentLevel = LEVELS[currentLevelIdx];
      const spawnInterval = Math.max(0.32, 0.9 - currentLevel.level * 0.1);
      hazardSpawnTimer = spawnInterval * (0.8 + Math.random() * 0.4);

      const radius = 18 + Math.random() * 32;
      const x = 30 + Math.random() * (cw - 60);
      const y = -radius - 20;

      const available = currentLevel.hazards;
      const chosenKey = available[Math.floor(Math.random() * available.length)];
      let chosenType = HAZARD_TYPES.BASALT;

      if (chosenKey === 'gold_ore') chosenType = HAZARD_TYPES.GOLD_ORE;
      else if (chosenKey === 'magma') chosenType = HAZARD_TYPES.MAGMA;
      else if (chosenKey === 'ice_comet') chosenType = HAZARD_TYPES.ICE_COMET;
      else if (chosenKey === 'cryo_mine') chosenType = HAZARD_TYPES.CRYO_MINE;
      else if (chosenKey === 'hunter_drone') chosenType = HAZARD_TYPES.HUNTER_DRONE;
      else if (chosenKey === 'heavy_drone') chosenType = HAZARD_TYPES.HEAVY_DRONE;
      else if (chosenKey === 'pulsar') chosenType = HAZARD_TYPES.PULSAR;
      else if (chosenKey === 'sentinel_boss') chosenType = HAZARD_TYPES.SENTINEL_BOSS;

      const driftX = (Math.random() - 0.5) * (chosenType.isDrone ? 90 : 50);
      asteroids.push(createHazard(x, y, radius, chosenType, driftX));
    }
  }

  // ── Weapons, Projectiles & Particles ──────────────────────────────────────
  const projectiles = [];
  const particles = [];
  const pickups = [];
  const shockwaves = [];

  function fireWeapon() {
    if (player.fireTimer > 0 || gameState !== STATES.PLAYING) return;

    const currentLevel = LEVELS[currentLevelIdx];
    const lvlIdx = currentLevelIdx;

    if (player.weaponType === 'spread' || lvlIdx === 2) {
      // Level 3 inherent spread or powerup
      audio.playLaser(true);
      player.fireTimer = 0.12;
      const angles = [-0.18, 0, 0.18];
      angles.forEach(ang => {
        projectiles.push({
          x: player.x,
          y: player.y - SHIP_H * 0.4,
          vx: Math.sin(ang) * 750,
          vy: -Math.cos(ang) * 750,
          damage: 1.8,
          color: currentLevel.gunColor,
          glow: currentLevel.nebulaColor,
          radius: 3.5,
          isPlayer: true
        });
      });
    } else if (player.weaponType === 'beam' || lvlIdx === 4) {
      // Level 5 Singularity Oblivion Overcharger or beam powerup
      audio.playRailgun();
      player.fireTimer = 0.18;
      projectiles.push({
        x: player.x,
        y: player.y - SHIP_H * 0.4,
        vx: 0,
        vy: -1150,
        damage: 5.5,
        color: currentLevel.gunColor,
        glow: currentLevel.nebulaColor,
        radius: 7,
        isBeam: true,
        penetrates: 4,
        isPlayer: true
      });
    } else if (lvlIdx === 3) {
      // Level 4 Quad-Plasma Shredder
      audio.playLaser(false);
      player.fireTimer = 0.09;
      [-14, -5, 5, 14].forEach(offset => {
        projectiles.push({
          x: player.x + offset,
          y: player.y - SHIP_H * 0.25,
          vx: offset * 4,
          vy: -880,
          damage: 1.4,
          color: currentLevel.gunColor,
          glow: currentLevel.nebulaColor,
          radius: 3,
          isPlayer: true
        });
      });
    } else if (lvlIdx === 1) {
      // Level 2 Magma Repeaters (Rapid Fire + Splash)
      audio.playLaser(false);
      player.fireTimer = 0.08;
      const wingOffset = SHIP_W * 0.38;
      [-wingOffset, wingOffset].forEach(offset => {
        projectiles.push({
          x: player.x + offset,
          y: player.y - SHIP_H * 0.2,
          vx: 0,
          vy: -900,
          damage: 1.3,
          color: currentLevel.gunColor,
          glow: currentLevel.nebulaColor,
          radius: 3.5,
          isPlayer: true
        });
      });
    } else {
      // Level 1 Standard Dual Blue Plasma Blasters
      audio.playLaser(false);
      player.fireTimer = 0.11;
      const wingOffset = SHIP_W * 0.38;
      [-wingOffset, wingOffset].forEach(offset => {
        projectiles.push({
          x: player.x + offset,
          y: player.y - SHIP_H * 0.2,
          vx: 0,
          vy: -850,
          damage: 1,
          color: currentLevel.gunColor,
          glow: currentLevel.nebulaColor,
          radius: 3,
          isPlayer: true
        });
      });
    }

    for (let i = 0; i < 4; i++) {
      particles.push({
        x: player.x + (Math.random() - 0.5) * SHIP_W,
        y: player.y - SHIP_H * 0.3,
        vx: (Math.random() - 0.5) * 60,
        vy: -100 - Math.random() * 100,
        life: 0.15,
        maxLife: 0.15,
        color: currentLevel.gunColor,
        size: 2 + Math.random() * 2
      });
    }
  }

  function triggerEMP() {
    if (player.empBombs <= 0 || gameState !== STATES.PLAYING) return;
    player.empBombs--;
    updateEMPUI();
    audio.playEMP();
    triggerAchievement('emp_master');
    screenShake = 1.2;

    shockwaves.push({
      x: player.x,
      y: player.y,
      radius: 10,
      maxRadius: Math.max(cw, ch) * 1.1,
      speed: 1400,
      color: '#a855f7',
      alpha: 1
    });

    for (let i = asteroids.length - 1; i >= 0; i--) {
      destroyHazard(asteroids[i], i, false);
    }
    for (let i = projectiles.length - 1; i >= 0; i--) {
      if (!projectiles[i].isPlayer) projectiles.splice(i, 1);
    }
  }

  function spawnExplosion(x, y, colorPalette, count = 20, isLarge = false) {
    audio.playExplosion(isLarge);
    screenShake = Math.min(1.5, screenShake + (isLarge ? 0.6 : 0.25));

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * (isLarge ? 260 : 160);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * (isLarge ? 0.7 : 0.4),
        maxLife: 0.8,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        size: 2 + Math.random() * (isLarge ? 5 : 3)
      });
    }
  }

  function destroyHazard(ast, index, shouldSplit = true) {
    asteroids.splice(index, 1);
    runAsteroidsDestroyed++;
    totalAsteroidsBlasted++;
    localStorage.setItem('space-dodge-total-rocks', totalAsteroidsBlasted);

    if (ast.type.isDrone || ast.type.isBoss) {
      runDronesDestroyed++;
      totalDronesDestroyed++;
      localStorage.setItem('space-dodge-total-drones', totalDronesDestroyed);
      if (totalDronesDestroyed >= 5) triggerAchievement('drone_hunter');
    }

    if (runAsteroidsDestroyed >= 25) triggerAchievement('rock_destroyer_25');
    if (totalAsteroidsBlasted >= 100) triggerAchievement('rock_destroyer_100');

    if (elDestroyed) elDestroyed.textContent = runAsteroidsDestroyed;

    const isLarge = ast.radius >= 26;
    const currentLevel = LEVELS[currentLevelIdx];
    let palette = ['#ff8c42', '#f59e0b', '#9ba0b5', '#ff4154'];

    if (ast.type.isIce) palette = ['#c8f5ff', '#56c6e8', '#38dbf5', '#ffffff'];
    else if (ast.type.isMagma) palette = ['#ff4500', '#f59e0b', '#ff0000', '#ffffff'];
    else if (ast.type.id === 'gold_ore') palette = ['#ffd76b', '#f5b942', '#ffffff', '#ff9800'];
    else if (ast.type.isPulsar || ast.type.isBoss) palette = ['#e879f9', '#9333ea', '#38dbf5', '#ffffff'];

    spawnExplosion(ast.x, ast.y, palette, isLarge ? 32 : 18, isLarge);

    if (ast.type.id === 'gold_ore' || ast.type.isBoss || ast.type.isPulsar) {
      const dropCount = isLarge ? 3 : 1;
      for (let i = 0; i < dropCount; i++) {
        pickups.push({
          x: ast.x + (Math.random() - 0.5) * 20,
          y: ast.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 80,
          vy: 40 + Math.random() * 60,
          type: 'mineral',
          mineralValue: currentLevel.mineralVal,
          radius: 7,
          sparkle: Math.random() * Math.PI * 2
        });
      }
    } else if (Math.random() < 0.15) {
      const pTypes = ['spread', 'beam', 'shield', 'emp'];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];
      pickups.push({
        x: ast.x,
        y: ast.y,
        vx: (Math.random() - 0.5) * 40,
        vy: 50 + Math.random() * 40,
        type: pType,
        radius: 11,
        sparkle: 0
      });
    }

    if (shouldSplit && isLarge && !ast.type.isDrone) {
      const splitCount = 2;
      for (let s = 0; s < splitCount; s++) {
        const splitRad = ast.radius * 0.55;
        const offsetAng = (s === 0 ? -1 : 1) * (0.4 + Math.random() * 0.4);
        const splitVx = ast.vx + Math.sin(offsetAng) * 90;
        const splitVy = ast.vy + Math.cos(offsetAng) * 40;
        asteroids.push(createHazard(ast.x + Math.sin(offsetAng) * 16, ast.y, splitRad, ast.type, splitVx, splitVy));
      }
    }
  }

  // ── Level Completion Logic ─────────────────────────────────────────────────
  function triggerLevelComplete() {
    gameState = STATES.LEVEL_COMPLETE;
    audio.stopBGM();
    audio.playLevelVictoryFanfare();

    const currentLevel = LEVELS[currentLevelIdx];

    if (currentLevel.level < LEVELS.length) {
      if (currentLevel.level + 1 > unlockedMaxLevel) {
        unlockedMaxLevel = currentLevel.level + 1;
        localStorage.setItem('space-dodge-unlocked-level', unlockedMaxLevel);
      }
    }

    if (!player.tookDamageThisSector) {
      triggerAchievement('shield_flawless');
    }
    if (currentLevel.level >= 3) {
      triggerAchievement('reach_sector_3');
    }
    if (currentLevel.level === 5) {
      triggerAchievement('ace_pilot');
    }

    let stars = 1;
    if (player.shield >= 40) stars = 2;
    if (player.shield >= 75 && runMineralsCollected >= currentLevel.mineralsTarget * 0.5) stars = 3;

    if (elLcTitle) elLcTitle.textContent = `${currentLevel.name} CLEARED!`;
    if (elLcSubtitle) elLcSubtitle.textContent = `Warp Gate Reached. ${stars === 3 ? 'Flawless Flight Mastery!' : 'Starfighter Systems Optimal.'}`;
    if (elLcStars) {
      elLcStars.innerHTML = '⭐'.repeat(stars) + (stars < 3 ? '☆'.repeat(3 - stars) : '');
    }
    if (elLcDistance) elLcDistance.textContent = `${currentLevel.targetDistance}m`;
    if (elLcMinerals) elLcMinerals.textContent = `💎 +${runMineralsCollected}`;
    if (elLcDestroyed) elLcDestroyed.textContent = `💥 ${runAsteroidsDestroyed}`;
    if (elLcShield) elLcShield.textContent = `${Math.round(player.shield)}%`;

    if (btnNextLevel) {
      if (currentLevelIdx < LEVELS.length - 1) {
        btnNextLevel.style.display = 'block';
        btnNextLevel.textContent = `🚀 ENGAGE ${LEVELS[currentLevelIdx + 1].name}`;
      } else {
        btnNextLevel.textContent = '👑 CAMPAIGN COMPLETED — RESTART ODYSSEY';
      }
    }

    if (elLevelCompleteModal) elLevelCompleteModal.classList.add('active');
  }

  // ── Input & Modal Wiring ───────────────────────────────────────────────────
  const keys = {};
  const mouse = { x: 400, y: 350, isDown: false, isRightDown: false, active: false };

  function toggleAchievementsModal(forced) {
    const isShowing = elAchModal.classList.contains('active');
    const next = forced !== undefined ? forced : !isShowing;
    if (next) {
      renderAchievementsModal();
      elAchModal.classList.add('active');
      if (gameState === STATES.PLAYING) togglePause(true);
    } else {
      elAchModal.classList.remove('active');
    }
  }

  function toggleLevelsModal(forced) {
    const isShowing = elLevelsModal.classList.contains('active');
    const next = forced !== undefined ? forced : !isShowing;
    if (next) {
      renderLevelsModal();
      elLevelsModal.classList.add('active');
      if (gameState === STATES.PLAYING) togglePause(true);
    } else {
      elLevelsModal.classList.remove('active');
    }
  }

  function setupInput() {
    window.addEventListener('keydown', e => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      keys[e.code] = true;
      audio.init();

      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      } else if (e.code === 'KeyB' || e.code === 'KeyE') {
        triggerEMP();
      } else if (e.code === 'Space' && (gameState === STATES.MENU || gameState === STATES.GAMEOVER)) {
        startMission();
      }
    });

    window.addEventListener('keyup', e => { keys[e.code] = false; });

    function getCanvasPos(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (cw / rect.width),
        y: (e.clientY - rect.top) * (ch / rect.height)
      };
    }

    canvas.addEventListener('mousemove', e => {
      const pos = getCanvasPos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
      mouse.active = true;
    });

    canvas.addEventListener('mousedown', e => {
      audio.init();
      const pos = getCanvasPos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
      mouse.active = true;
      if (e.button === 0) mouse.isDown = true;
      if (e.button === 2) { e.preventDefault(); mouse.isRightDown = true; }
      if (gameState === STATES.MENU || gameState === STATES.GAMEOVER) startMission();
    });

    window.addEventListener('mouseup', e => {
      if (e.button === 0) mouse.isDown = false;
      if (e.button === 2) mouse.isRightDown = false;
    });

    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Touch Event Listeners
    canvas.addEventListener('touchstart', e => {
      audio.init();
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouse.x = (touch.clientX - rect.left) * (cw / rect.width);
        mouse.y = (touch.clientY - rect.top) * (ch / rect.height);
        mouse.active = true;
        mouse.isDown = true;
      }
      if (gameState === STATES.MENU || gameState === STATES.GAMEOVER) startMission();
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', e => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        mouse.x = (touch.clientX - rect.left) * (cw / rect.width);
        mouse.y = (touch.clientY - rect.top) * (ch / rect.height);
      }
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => { mouse.isDown = false; });

    // Touch Buttons
    if (btnTouchFire) {
      btnTouchFire.addEventListener('touchstart', e => { e.preventDefault(); keys['Space'] = true; });
      btnTouchFire.addEventListener('touchend', e => { e.preventDefault(); keys['Space'] = false; });
    }
    if (btnTouchBoost) {
      btnTouchBoost.addEventListener('touchstart', e => { e.preventDefault(); keys['ShiftLeft'] = true; });
      btnTouchBoost.addEventListener('touchend', e => { e.preventDefault(); keys['ShiftLeft'] = false; });
    }
    if (btnTouchEmp) {
      btnTouchEmp.addEventListener('touchstart', e => { e.preventDefault(); triggerEMP(); });
    }

    // Modal & Navigation Controls
    if (btnPause) btnPause.addEventListener('click', () => togglePause());
    if (btnResume) btnResume.addEventListener('click', () => togglePause(false));
    if (btnRestart) btnRestart.addEventListener('click', () => {
      togglePause(false);
      startMission();
    });
    if (btnVolMute) btnVolMute.addEventListener('click', () => audio.toggleMute());

    if (btnAchievements) btnAchievements.addEventListener('click', () => toggleAchievementsModal(true));
    if (btnCloseAch) btnCloseAch.addEventListener('click', () => toggleAchievementsModal(false));

    if (elSectorBadge) elSectorBadge.addEventListener('click', () => toggleLevelsModal(true));
    if (btnCloseLevels) btnCloseLevels.addEventListener('click', () => toggleLevelsModal(false));

    // Level Complete Action Buttons
    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => {
        if (elLevelCompleteModal) elLevelCompleteModal.classList.remove('active');
        if (currentLevelIdx < LEVELS.length - 1) {
          currentLevelIdx++;
        } else {
          currentLevelIdx = 0;
        }
        startMission();
      });
    }

    if (btnReplayLevel) {
      btnReplayLevel.addEventListener('click', () => {
        if (elLevelCompleteModal) elLevelCompleteModal.classList.remove('active');
        startMission();
      });
    }

    if (btnSectorSelect) {
      btnSectorSelect.addEventListener('click', () => {
        if (elLevelCompleteModal) elLevelCompleteModal.classList.remove('active');
        toggleLevelsModal(true);
      });
    }
  }

  function togglePause(forcedState) {
    if (gameState === STATES.MENU || gameState === STATES.GAMEOVER || gameState === STATES.LEVEL_COMPLETE) return;

    if (forcedState !== undefined) {
      gameState = forcedState ? STATES.PAUSED : STATES.PLAYING;
    } else {
      gameState = gameState === STATES.PAUSED ? STATES.PLAYING : STATES.PAUSED;
    }

    if (elPauseModal) {
      if (gameState === STATES.PAUSED) elPauseModal.classList.add('active');
      else elPauseModal.classList.remove('active');
    }
  }

  // ── Sizing and DPI ─────────────────────────────────────────────────────────
  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    cw = rect.width;
    ch = rect.height;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.scale(dpr, dpr);
    initStarfield();
  }
  window.addEventListener('resize', resize);

  // ── Mission Initialization ────────────────────────────────────────────────
  function startMission() {
    audio.init();
    audio.startBGM(currentLevelIdx);
    triggerAchievement('first_flight');

    const levelConfig = LEVELS[currentLevelIdx];

    player.x = cw / 2;
    player.y = ch * 0.78;
    player.vx = 0;
    player.vy = 0;
    player.shield = 100;
    player.boost = 100;
    player.tookDamageThisSector = false;
    player.weaponType = 'standard';
    player.weaponTime = 0;
    player.empBombs = 3;
    player.invincibleTimer = 1.5;

    sectorDistance = 0;
    runAsteroidsDestroyed = 0;
    runMineralsCollected = 0;
    runDronesDestroyed = 0;

    asteroids.length = 0;
    projectiles.length = 0;
    particles.length = 0;
    pickups.length = 0;
    shockwaves.length = 0;

    if (elSectorBadge) elSectorBadge.textContent = `${levelConfig.name} ▾`;
    updateHUD();
    updateEMPUI();
    if (elPauseModal) elPauseModal.classList.remove('active');
    if (elAchModal) elAchModal.classList.remove('active');
    if (elLevelsModal) elLevelsModal.classList.remove('active');
    if (elLevelCompleteModal) elLevelCompleteModal.classList.remove('active');
    gameState = STATES.PLAYING;
  }

  function updateHUD() {
    const currentLevel = LEVELS[currentLevelIdx];
    const pct = Math.min(100, Math.floor((sectorDistance / currentLevel.targetDistance) * 100));

    if (elScore) elScore.textContent = Math.floor(sectorDistance);
    if (elMinerals) elMinerals.textContent = runMineralsCollected;
    if (elDestroyed) elDestroyed.textContent = runAsteroidsDestroyed;
    if (elShieldVal) elShieldVal.textContent = Math.max(0, Math.round(player.shield));
    if (elShieldBar) elShieldBar.style.width = Math.max(0, Math.min(100, player.shield)) + '%';
    if (elBoostVal) elBoostVal.textContent = Math.round(player.boost);
    if (elBoostBar) elBoostBar.style.width = Math.max(0, Math.min(100, player.boost)) + '%';

    if (elSectorProgressLabel) elSectorProgressLabel.textContent = `WARP GATE: ${pct}%`;
    if (elSectorProgressFill) elSectorProgressFill.style.width = `${pct}%`;
  }

  function updateEMPUI() {
    if (!elEmpIcons) return;
    elEmpIcons.innerHTML = '';
    for (let i = 0; i < player.maxEmp; i++) {
      const pill = document.createElement('div');
      pill.className = `emp-icon ${i < player.empBombs ? '' : 'empty'}`;
      elEmpIcons.appendChild(pill);
    }
  }

  // ── Physics & Game Loop Update ─────────────────────────────────────────────
  function update(dt) {
    if (gameState !== STATES.PLAYING) return;

    const currentLevel = LEVELS[currentLevelIdx];

    const speedMult = player.isBoosting ? 1.8 : 1.0;
    sectorDistance += (currentLevel.scrollSpeed * speedMult * dt) / 20;

    if (sectorDistance >= currentLevel.targetDistance) {
      triggerLevelComplete();
      return;
    }

    if (sectorDistance > highDist) {
      highDist = Math.floor(sectorDistance);
      if (elHigh) elHigh.textContent = highDist + 'm';
      localStorage.setItem('space-dodge-hi', highDist);
    }

    screenShake = Math.max(0, screenShake - dt * 4);

    player.invincibleTimer = Math.max(0, player.invincibleTimer - dt);
    player.fireTimer = Math.max(0, player.fireTimer - dt);
    player.flashHit = Math.max(0, player.flashHit - dt * 5);
    player.strobeTimer = (player.strobeTimer + dt * 4) % (Math.PI * 2);

    if (player.weaponTime > 0) {
      player.weaponTime -= dt;
      if (player.weaponTime <= 0) player.weaponType = 'standard';
    }

    player.shieldRegenTimer -= dt;
    if (player.shieldRegenTimer <= 0 && player.shield < player.maxShield) {
      player.shield = Math.min(player.maxShield, player.shield + dt * 6);
    }

    const boostRequested = keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyK'] || mouse.isRightDown;
    if (boostRequested && player.boost > 10) {
      player.isBoosting = true;
      player.boost = Math.max(0, player.boost - dt * 38);
    } else {
      player.isBoosting = false;
      player.boost = Math.min(player.maxBoost, player.boost + dt * 18);
    }

    const moveSpeed = 480 * (player.isBoosting ? 1.3 : 1.0);
    let targetVx = 0;
    let targetVy = 0;

    if (keys['KeyA'] || keys['ArrowLeft']) targetVx -= moveSpeed;
    if (keys['KeyD'] || keys['ArrowRight']) targetVx += moveSpeed;
    if (keys['KeyW'] || keys['ArrowUp']) targetVy -= moveSpeed * 0.8;
    if (keys['KeyS'] || keys['ArrowDown']) targetVy += moveSpeed * 0.8;

    if (mouse.active) {
      const dx = mouse.x - player.x;
      const dy = mouse.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 10) {
        targetVx += (dx / dist) * Math.min(moveSpeed, dist * 8);
        targetVy += (dy / dist) * Math.min(moveSpeed * 0.8, dist * 6);
      }
    }

    player.vx += (targetVx - player.vx) * Math.min(1, dt * 10);
    player.vy += (targetVy - player.vy) * Math.min(1, dt * 10);

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    const pad = 20;
    player.x = Math.max(pad + SHIP_W / 2, Math.min(cw - pad - SHIP_W / 2, player.x));
    player.y = Math.max(ch * 0.25, Math.min(ch - pad - SHIP_H / 2, player.y));

    const targetBank = Math.max(-1, Math.min(1, player.vx / moveSpeed));
    player.bankAngle += (targetBank - player.bankAngle) * Math.min(1, dt * 12);

    if (keys['Space'] || keys['KeyJ'] || mouse.isDown) {
      fireWeapon();
    }

    const flameCount = player.isBoosting ? 4 : 2;
    for (let f = 0; f < flameCount; f++) {
      particles.push({
        x: player.x + (Math.random() - 0.5) * 8,
        y: player.y + SHIP_H * 0.42,
        vx: (Math.random() - 0.5) * 30 + player.vx * 0.2,
        vy: (player.isBoosting ? 260 : 160) + Math.random() * 80,
        life: player.isBoosting ? 0.28 : 0.18,
        maxLife: player.isBoosting ? 0.28 : 0.18,
        color: player.isBoosting ? '#38dbf5' : currentLevel.shipColor.flame,
        size: player.isBoosting ? 4 + Math.random() * 3 : 2 + Math.random() * 3
      });
    }

    // Spawn Hazards
    spawnHazards(dt);
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const ast = asteroids[i];
      ast.rotation += ast.rotSpeed * dt;
      ast.x += ast.vx * dt;
      ast.y += (ast.vy + (player.isBoosting ? currentLevel.scrollSpeed * 0.8 : 0)) * dt;
      ast.hitFlash = Math.max(0, ast.hitFlash - dt * 6);

      // Drone AI Attacks
      if (ast.type.isDrone || ast.type.isBoss) {
        ast.droneShootTimer -= dt;
        if (ast.droneShootTimer <= 0 && ast.y > 20 && ast.y < ch * 0.65) {
          ast.droneShootTimer = ast.type.isBoss ? 0.9 : 1.6;
          const dx = player.x - ast.x;
          const dy = player.y - ast.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) {
            projectiles.push({
              x: ast.x,
              y: ast.y + ast.radius,
              vx: (dx / len) * 320,
              vy: (dy / len) * 320,
              damage: ast.type.isBoss ? 20 : 12,
              color: '#ff4154',
              glow: 'rgba(255, 65, 84, 0.7)',
              radius: 4,
              isPlayer: false
            });
          }
        }
      }

      // Pulsar Gravitational Attraction
      if (ast.type.isPulsar) {
        const pdx = ast.x - player.x;
        const pdy = ast.y - player.y;
        const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pdist < 220 && pdist > 10) {
          player.vx += (pdx / pdist) * 140 * dt;
          player.vy += (pdy / pdist) * 140 * dt;
        }
      }

      if (ast.y > ch + ast.radius + 50) {
        asteroids.splice(i, 1);
        continue;
      }

      if (player.invincibleTimer <= 0) {
        const dx = player.x - ast.x;
        const dy = player.y - ast.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitDist = ast.radius + SHIP_W * 0.4;

        if (dist < hitDist) {
          const dmg = ast.radius > 24 ? 35 : 20;
          damagePlayer(dmg, ast.x, ast.y);
          destroyHazard(ast, i, false);
          continue;
        }
      }
    }

    // Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y < -30 || p.y > ch + 30 || p.x < -30 || p.x > cw + 30) {
        projectiles.splice(i, 1);
        continue;
      }

      if (p.isPlayer) {
        let hit = false;
        for (let j = asteroids.length - 1; j >= 0; j--) {
          const ast = asteroids[j];
          const dx = p.x - ast.x;
          const dy = p.y - ast.y;
          if (Math.sqrt(dx * dx + dy * dy) < ast.radius + p.radius) {
            hit = true;
            ast.hp -= p.damage;
            ast.hitFlash = 1;

            for (let s = 0; s < 4; s++) {
              particles.push({
                x: p.x,
                y: p.y,
                vx: (Math.random() - 0.5) * 120,
                vy: (Math.random() - 0.5) * 120,
                life: 0.15,
                maxLife: 0.15,
                color: p.color,
                size: 2
              });
            }

            if (ast.hp <= 0) destroyHazard(ast, j, true);
            if (p.isBeam && p.penetrates > 0) {
              p.penetrates--;
              hit = false;
            }
            break;
          }
        }
        if (hit) projectiles.splice(i, 1);
      } else {
        if (player.invincibleTimer <= 0) {
          const dx = p.x - player.x;
          const dy = p.y - player.y;
          if (Math.sqrt(dx * dx + dy * dy) < SHIP_W * 0.45 + p.radius) {
            damagePlayer(p.damage, p.x, p.y);
            projectiles.splice(i, 1);
          }
        }
      }
    }

    // Pickups
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pu = pickups[i];
      pu.sparkle += dt * 5;

      const dx = player.x - pu.x;
      const dy = player.y - pu.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const magnetRange = 160;

      if (dist < magnetRange) {
        const pull = (1 - dist / magnetRange) * 550;
        pu.vx += (dx / dist) * pull * dt;
        pu.vy += (dy / dist) * pull * dt;
      }

      pu.x += pu.vx * dt;
      pu.y += pu.vy * dt;

      if (dist < SHIP_W * 0.5 + pu.radius) {
        collectPickup(pu);
        pickups.splice(i, 1);
        continue;
      }

      if (pu.y > ch + 40) pickups.splice(i, 1);
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.life -= dt;
      if (pt.life <= 0) particles.splice(i, 1);
    }

    // Shockwaves
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius) shockwaves.splice(i, 1);
    }

    updateHUD();
  }

  function damagePlayer(amount, hitX, hitY) {
    player.shield -= amount;
    player.tookDamageThisSector = true;
    player.shieldRegenTimer = 3.5;
    player.flashHit = 1;
    audio.playShieldHit();
    screenShake = Math.min(1.6, screenShake + 0.5);

    for (let i = 0; i < 8; i++) {
      particles.push({
        x: hitX || player.x,
        y: hitY || player.y,
        vx: (Math.random() - 0.5) * 140,
        vy: (Math.random() - 0.5) * 140,
        life: 0.25,
        maxLife: 0.25,
        color: '#38dbf5',
        size: 3
      });
    }

    if (player.shield <= 0) {
      player.shield = 0;
      gameState = STATES.GAMEOVER;
      audio.stopBGM();
      audio.playExplosion(true);
      spawnExplosion(player.x, player.y, ['#ff4154', '#ff8c42', '#f5b942', '#ffffff'], 40, true);
    }
  }

  function collectPickup(pu) {
    if (pu.type === 'mineral') {
      const val = pu.mineralValue || 10;
      runMineralsCollected += val;
      totalMineralsGathered += val;
      localStorage.setItem('space-dodge-total-minerals', totalMineralsGathered);

      if (runMineralsCollected >= 50) triggerAchievement('miner_50');
      if (totalMineralsGathered >= 200) triggerAchievement('miner_200');

      audio.playPickup('mineral');
    } else if (pu.type === 'spread') {
      player.weaponType = 'spread';
      player.weaponTime = 12;
      audio.playPickup('powerup');
    } else if (pu.type === 'beam') {
      player.weaponType = 'beam';
      player.weaponTime = 10;
      audio.playPickup('powerup');
    } else if (pu.type === 'shield') {
      player.shield = Math.min(player.maxShield, player.shield + 40);
      audio.playPickup('powerup');
    } else if (pu.type === 'emp') {
      player.empBombs = Math.min(player.maxEmp, player.empBombs + 1);
      updateEMPUI();
      audio.playPickup('powerup');
    }

    for (let i = 0; i < 10; i++) {
      particles.push({
        x: pu.x,
        y: pu.y,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        life: 0.25,
        maxLife: 0.25,
        color: pu.type === 'mineral' ? '#f5b942' : '#38dbf5',
        size: 2.5
      });
    }
  }

  // ── High-Fidelity Rendering Layer ──────────────────────────────────────────
  function render(ts) {
    ctx.save();

    if (screenShake > 0) {
      const shakeMagnitude = screenShake * 10;
      ctx.translate((Math.random() - 0.5) * shakeMagnitude, (Math.random() - 0.5) * shakeMagnitude);
    }

    const currentLevel = LEVELS[currentLevelIdx];

    // 1. Dynamic Sector Cosmic Backdrop Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, ch);
    bgGrad.addColorStop(0, currentLevel.bgGradient[0]);
    bgGrad.addColorStop(0.6, currentLevel.bgGradient[1]);
    bgGrad.addColorStop(1, currentLevel.bgGradient[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cw, ch);

    // 2. Unique Sector Nebulae
    for (const neb of nebulae) {
      const ng = ctx.createRadialGradient(neb.x, neb.y, 10, neb.x, neb.y, neb.radius);
      ng.addColorStop(0, currentLevel.nebulaColor);
      ng.addColorStop(1, 'transparent');
      ctx.globalAlpha = neb.alpha * 1.5;
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Stars & Dynamic Sector Warp Dust
    for (const s of stars) {
      s.y += (s.speed + (player.isBoosting ? 4 : 1)) * 0.8;
      if (s.y > ch + 10) { s.y = -5; s.x = Math.random() * cw; }

      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(ts * 0.003 + s.twinkle);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const wd of warpDust) {
      wd.y += (wd.speed + (player.isBoosting ? 14 : 3));
      if (wd.y > ch + 20) { wd.y = -10; wd.x = Math.random() * cw; }

      ctx.strokeStyle = currentLevel.dustColor;
      ctx.globalAlpha = wd.alpha * (player.isBoosting ? 0.8 : 0.4);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(wd.x, wd.y);
      ctx.lineTo(wd.x, wd.y + wd.length * (player.isBoosting ? 2.5 : 1));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 4. Shockwaves
    for (const sw of shockwaves) {
      ctx.save();
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Asteroids / Hazards
    for (const ast of asteroids) drawHazard(ast);

    // 6. Pickups
    for (const pu of pickups) drawPickup(pu, ts);

    // 7. Projectiles
    for (const p of projectiles) {
      ctx.save();
      ctx.shadowColor = p.glow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;

      if (p.isBeam) {
        ctx.fillRect(p.x - p.radius / 2, p.y - 20, p.radius, 40);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 8. Particles
    for (const pt of particles) {
      ctx.save();
      ctx.globalAlpha = pt.life / pt.maxLife;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0.5, pt.size * (pt.life / pt.maxLife)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 9. Starfighter Model (Customized by Level upgrades)
    if (gameState !== STATES.GAMEOVER) {
      drawStarfighter(player.x, player.y, player.bankAngle, ts);
    }

    // 10. Menu / Game Over Screens
    if (gameState === STATES.MENU) renderMenu(ts);
    else if (gameState === STATES.GAMEOVER) renderGameOver(ts);

    ctx.restore();
  }

  // ── Starfighter Model ──────────────────────────────────────────────────────
  function drawStarfighter(px, py, bank, ts) {
    ctx.save();
    ctx.translate(px, py);

    const currentLevel = LEVELS[currentLevelIdx];
    const shipSkin = currentLevel.shipColor;

    if (player.invincibleTimer > 0 && Math.sin(ts * 0.03) > 0) {
      ctx.globalAlpha = 0.45;
    }

    const hw = (SHIP_W / 2) * (1 - Math.abs(bank) * 0.28);
    const hh = SHIP_H / 2;
    const bankShift = bank * 6;

    const engineGlow = ctx.createRadialGradient(0, hh * 0.7, 2, 0, hh * 0.7, 36);
    engineGlow.addColorStop(0, player.isBoosting ? 'rgba(56, 219, 245, 0.7)' : 'rgba(245, 185, 66, 0.5)');
    engineGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = engineGlow;
    ctx.beginPath();
    ctx.arc(0, hh * 0.7, 36, 0, Math.PI * 2);
    ctx.fill();

    const hullGrad = ctx.createLinearGradient(-hw, -hh, hw, hh);
    if (player.flashHit > 0) {
      hullGrad.addColorStop(0, '#ff4154');
      hullGrad.addColorStop(1, '#ffffff');
    } else {
      hullGrad.addColorStop(0, shipSkin.hull1);
      hullGrad.addColorStop(0.5, shipSkin.hull2);
      hullGrad.addColorStop(1, '#1e293b');
    }

    ctx.fillStyle = hullGrad;
    ctx.beginPath();
    ctx.moveTo(bankShift, -hh);
    ctx.lineTo(hw * 0.45, -hh * 0.2);
    ctx.lineTo(hw * 0.35, hh * 0.6);
    ctx.lineTo(0, hh * 0.75);
    ctx.lineTo(-hw * 0.35, hh * 0.6);
    ctx.lineTo(-hw * 0.45, -hh * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#2c3345';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Wings
    ctx.fillStyle = shipSkin.wing;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.3, -hh * 0.1);
    ctx.lineTo(-hw * 1.3, hh * 0.5);
    ctx.lineTo(-hw * 0.3, hh * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(hw * 0.3, -hh * 0.1);
    ctx.lineTo(hw * 1.3, hh * 0.5);
    ctx.lineTo(hw * 0.3, hh * 0.4);
    ctx.closePath();
    ctx.fill();

    // Strobe lights
    const strobeAlpha = 0.5 + 0.5 * Math.sin(player.strobeTimer);
    ctx.fillStyle = `rgba(255, 65, 84, ${strobeAlpha})`;
    ctx.beginPath();
    ctx.arc(-hw * 1.25, hh * 0.48, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(34, 197, 94, ${strobeAlpha})`;
    ctx.beginPath();
    ctx.arc(hw * 1.25, hh * 0.48, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit
    const canopyGrad = ctx.createRadialGradient(bankShift * 0.5, -hh * 0.25, 1, 0, -hh * 0.2, 9);
    canopyGrad.addColorStop(0, '#f0fcff');
    canopyGrad.addColorStop(0.4, currentLevel.gunColor);
    canopyGrad.addColorStop(1, '#0e4e68');
    ctx.fillStyle = canopyGrad;
    ctx.beginPath();
    ctx.ellipse(bankShift * 0.4, -hh * 0.22, hw * 0.32, hh * 0.28, bank * 0.2, 0, Math.PI * 2);
    ctx.fill();

    if (player.shield > 0) {
      const shieldRatio = player.shield / player.maxShield;
      ctx.strokeStyle = `rgba(56, 219, 245, ${0.15 + shieldRatio * 0.25 + (player.flashHit > 0 ? 0.5 : 0)})`;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#38dbf5';
      ctx.shadowBlur = player.flashHit > 0 ? 18 : 6;
      ctx.beginPath();
      ctx.ellipse(0, 0, hw * 1.6, hh * 1.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── Hazard Rendering ───────────────────────────────────────────────────────
  function drawHazard(ast) {
    ctx.save();
    ctx.translate(ast.x, ast.y);
    ctx.rotate(ast.rotation);

    const rad = ast.radius;
    const t = ast.type;

    if (t.isPulsar) {
      const pGrad = ctx.createRadialGradient(0, 0, rad * 0.1, 0, 0, rad * 1.4);
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.3, '#e879f9');
      pGrad.addColorStop(0.7, '#9333ea');
      pGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(0, 0, rad * 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      return;
    }

    const grad = ctx.createRadialGradient(-rad * 0.35, -rad * 0.35, rad * 0.1, 0, 0, rad * 1.2);
    if (ast.hitFlash > 0) {
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#ff4154');
    } else {
      grad.addColorStop(0, t.highlight);
      grad.addColorStop(0.45, t.color);
      grad.addColorStop(1, t.shadow);
    }
    ctx.fillStyle = grad;

    ctx.beginPath();
    for (let i = 0; i < ast.vertices.length; i++) {
      const v = ast.vertices[i];
      const vx = Math.cos(v.baseAngle) * v.baseDist;
      const vy = Math.sin(v.baseAngle) * v.baseDist;
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = t.highlight;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (t.isDrone || t.isBoss) {
      ctx.fillStyle = '#ff4154';
      ctx.shadowColor = '#ff4154';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, rad * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ── Collectibles Model ─────────────────────────────────────────────────────
  function drawPickup(pu, ts) {
    ctx.save();
    ctx.translate(pu.x, pu.y);

    const glowColor = pu.type === 'mineral' ? '#ffd76b' : '#38dbf5';
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 14;

    if (pu.type === 'mineral') {
      ctx.fillStyle = '#f5b942';
      ctx.rotate(pu.sparkle);
      ctx.beginPath();
      ctx.moveTo(0, -pu.radius);
      ctx.lineTo(pu.radius * 0.8, 0);
      ctx.lineTo(0, pu.radius);
      ctx.lineTo(-pu.radius * 0.8, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = pu.type === 'spread' ? '3X' : pu.type === 'beam' ? 'BM' : pu.type === 'shield' ? 'SH' : '⚡';
      ctx.fillText(label, 0, 0);
    }
    ctx.restore();
  }

  // ── Menus ──────────────────────────────────────────────────────────────────
  function renderMenu(ts) {
    ctx.save();
    ctx.textAlign = 'center';

    ctx.font = "900 36px 'Orbitron', monospace";
    const titleGrad = ctx.createLinearGradient(cw / 2 - 160, 0, cw / 2 + 160, 0);
    titleGrad.addColorStop(0, '#f5b942');
    titleGrad.addColorStop(1, '#38dbf5');
    ctx.fillStyle = titleGrad;
    ctx.shadowColor = 'rgba(56, 219, 245, 0.6)';
    ctx.shadowBlur = 18;
    ctx.fillText('SPACE DODGE', cw / 2, ch * 0.38);

    ctx.font = "600 13px 'Orbitron', monospace";
    ctx.fillStyle = '#8893a7';
    ctx.shadowBlur = 0;
    ctx.fillText('STARFIGHTER ODYSSEY', cw / 2, ch * 0.46);

    const pulse = 0.6 + 0.4 * Math.sin(ts * 0.005);
    ctx.font = "600 15px 'Inter', sans-serif";
    ctx.fillStyle = `rgba(238, 241, 245, ${pulse})`;
    ctx.fillText('Tap / Click or Press Space to Launch Mission', cw / 2, ch * 0.62);

    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.fillStyle = '#38dbf5';
    ctx.fillText('W/A/S/D • Space: Blasters • Shift: Afterburner • B: Nova EMP', cw / 2, ch * 0.72);

    ctx.restore();
  }

  function renderGameOver(ts) {
    ctx.save();
    ctx.fillStyle = 'rgba(3, 5, 11, 0.78)';
    ctx.fillRect(0, 0, cw, ch);

    ctx.textAlign = 'center';
    ctx.font = "900 32px 'Orbitron', monospace";
    ctx.fillStyle = '#ff4154';
    ctx.shadowColor = 'rgba(255, 65, 84, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillText('CRITICAL HULL FAILURE', cw / 2, ch * 0.32);

    ctx.shadowBlur = 0;
    ctx.font = "600 16px 'Orbitron', monospace";
    ctx.fillStyle = '#38dbf5';
    ctx.fillText(`Distance Reached: ${Math.floor(sectorDistance)}m`, cw / 2, ch * 0.46);

    ctx.fillStyle = '#f5b942';
    ctx.fillText(`Minerals: 💎 ${runMineralsCollected}  |  Targets Destroyed: 💥 ${runAsteroidsDestroyed}`, cw / 2, ch * 0.54);

    const pulse = 0.5 + 0.5 * Math.sin(ts * 0.006);
    ctx.font = "500 14px 'Inter', sans-serif";
    ctx.fillStyle = `rgba(238, 241, 245, ${pulse})`;
    ctx.fillText('Tap / Click or Space to Re-engage Mission', cw / 2, ch * 0.68);

    ctx.restore();
  }

  // ── Engine Main Loop ───────────────────────────────────────────────────────
  let lastTimestamp = 0;
  function gameLoop(timestamp) {
    let dt = (timestamp - lastTimestamp) / 1000;
    if (!isFinite(dt) || dt < 0 || dt > 0.1) dt = 0.016;
    lastTimestamp = timestamp;

    update(dt);
    render(timestamp);

    requestAnimationFrame(gameLoop);
  }

  // ── Engine Ignition ────────────────────────────────────────────────────────
  setupInput();
  resize();
  updateHUD();
  updateEMPUI();
  renderAchievementsModal();
  renderLevelsModal();
  requestAnimationFrame(gameLoop);

})();
