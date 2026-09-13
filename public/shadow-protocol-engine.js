/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHADOW FIGHT: ANIME ARENA — 2D 1v1 Procedural Anime Martial Arts Engine
 * Themes: ⛩️ Shadow Dojo (Default) | 🍃 Naruto Shippuden | ⚔️ Demon Slayer
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ── Canvas Setup ───────────────────────────────────────────────────────────
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let cw = 1280;
  let ch = 720;
  let dpr = 1;

  // ── UI Element Queries ─────────────────────────────────────────────────────
  const elPlayerHpBar = document.getElementById('player-hp-bar');
  const elEnemyHpBar = document.getElementById('enemy-hp-bar');
  const elFightTimer = document.getElementById('fight-timer');
  const elHudPlayerName = document.getElementById('hud-player-name');
  const elHudEnemyName = document.getElementById('hud-enemy-name');
  const elHudPlayerWeapon = document.getElementById('hud-player-weapon');
  const elHudEnemyWeapon = document.getElementById('hud-enemy-weapon');
  const elPlayerRoundDots = document.getElementById('player-round-dots');
  const elEnemyRoundDots = document.getElementById('enemy-round-dots');
  const elAnnouncer = document.getElementById('fight-announcer');

  // Theme & Arena Badges
  const btnThemeSelect = document.getElementById('btn-theme-select');
  const btnSelectArena = document.getElementById('btn-select-arena');
  const themePickerGrid = document.getElementById('theme-picker-grid');
  const elSidebarThemeActive = document.getElementById('sidebar-theme-active');

  // Sidebar Elements
  const elSidebarLevelsList = document.getElementById('sidebar-levels-list');
  const btnSidebarEndless = document.getElementById('btn-sidebar-endless');
  const elSidebarUnlockedPill = document.getElementById('sidebar-unlocked-pill');
  const elSidebarWeaponActive = document.getElementById('sidebar-weapon-active');
  const weaponSelectorGrid = document.getElementById('weapon-selector-grid');
  const elSidebarLadderTitle = document.getElementById('sidebar-ladder-title');

  // Modals & Navigation
  const elPauseModal = document.getElementById('pause-modal');
  const elAchModal = document.getElementById('modal-achievements');
  const elLevelCompleteModal = document.getElementById('modal-level-complete');
  const elAchContainer = document.getElementById('achievements-container');
  const elAchCount = document.getElementById('ach-count');

  // Level Complete UI
  const elLcTitle = document.getElementById('lc-title');
  const elLcSubtitle = document.getElementById('lc-subtitle');
  const elLcRounds = document.getElementById('lc-rounds');
  const elLcCombo = document.getElementById('lc-combo');
  const elLcRating = document.getElementById('lc-rating');
  const btnNextLevel = document.getElementById('btn-next-level');
  const btnReplayLevel = document.getElementById('btn-replay-level');

  // Nav Buttons
  const btnPause = document.getElementById('btn-pause');
  const btnResume = document.getElementById('btn-resume');
  const btnRestart = document.getElementById('btn-restart');
  const btnAchievements = document.getElementById('btn-achievements');
  const btnCloseAch = document.getElementById('btn-close-ach');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnPauseFullscreen = document.getElementById('btn-pause-fullscreen');
  const gameWrapper = document.getElementById('game-wrapper');
  const btnVolMute = document.getElementById('btn-vol-mute');

  // Touch Controls
  const btnTouchUp = document.getElementById('btn-touch-up');
  const btnTouchDown = document.getElementById('btn-touch-down');
  const btnTouchLeft = document.getElementById('btn-touch-left');
  const btnTouchRight = document.getElementById('btn-touch-right');
  const btnTouchPunch = document.getElementById('btn-touch-punch');
  const btnTouchKick = document.getElementById('btn-touch-kick');
  const btnTouchWeapon = document.getElementById('btn-touch-weapon');
  const btnTouchRoll = document.getElementById('btn-touch-roll');

  // ── Universe Themes Definition ─────────────────────────────────────────────
  const THEMES = {
    dojo: {
      id: 'dojo',
      name: 'SHADOW DOJO',
      badge: '⛩️ DOJO',
      bgTheme: 'fuji_sakura',
      ladderTitle: 'SHADOW DUEL LADDER',
      particleColor: ['rgba(255, 120, 160, 0.75)', 'rgba(245, 185, 66, 0.65)', 'rgba(0, 240, 255, 0.6)'],
      particleType: 'petal',
      playerName: 'SHADOW',
      playerTitle: 'Navy Blade Shinobi',
      bgmTrack: 'dojo',
      weapons: {
        katana: { id: 'katana', name: 'SHADOW KATANA', shortName: 'KATANA', damage: 18, range: 85, speed: 1.15, trailColor: '#00ff9d', desc: 'Precision Slashes & Lunges' },
        kusarigama: { id: 'kusarigama', name: 'DUAL KUSARIGAMA', shortName: 'KUSARIGAMA', damage: 16, range: 120, speed: 1.0, trailColor: '#00f0ff', desc: 'Wide Whirling Chain Sweeps' },
        nunchaku: { id: 'nunchaku', name: 'TWIN NUNCHAKU', shortName: 'NUNCHAKU', damage: 12, range: 65, speed: 1.45, trailColor: '#ff0055', desc: 'Ultra Rapid Multi-Hit Flurries' },
        staff: { id: 'staff', name: 'BLOOD NAGINATA', shortName: 'NAGINATA', damage: 22, range: 135, speed: 0.9, trailColor: '#f5b942', desc: 'Long Polearm Thrusts & Vaults' },
        sai: { id: 'sai', name: 'TWIN CRIMSON SAI', shortName: 'DUAL SAI', damage: 14, range: 70, speed: 1.5, trailColor: '#ff2a85', desc: 'High Speed Dual Stabs & Parries' },
        hammer: { id: 'hammer', name: 'ONI WAR CLUB', shortName: 'WAR HAMMER', damage: 28, range: 110, speed: 0.75, trailColor: '#b55fe6', desc: 'Crushing Heavy Impact & Earth Shakes' }
      },
      masters: [
        { level: 1, name: 'SHINOBI', title: 'Apprentice of the Blade', weaponKey: 'katana', maxHp: 100, aiAggro: 0.45, color: '#00f0ff', bgTheme: 'fuji_sakura' },
        { level: 2, name: 'RONIN', title: 'Exiled Naginata Master', weaponKey: 'staff', maxHp: 130, aiAggro: 0.6, color: '#f5b942', bgTheme: 'arashiyama_bamboo' },
        { level: 3, name: 'KUNOICHI', title: 'Shadow Lotus Duelist', weaponKey: 'nunchaku', maxHp: 150, aiAggro: 0.75, color: '#ff0055', bgTheme: 'kyoto_autumn' },
        { level: 4, name: 'WARLORD', title: 'Chained Reaper of Shadows', weaponKey: 'kusarigama', maxHp: 180, aiAggro: 0.88, color: '#bd00ff', bgTheme: 'thunder_castle' },
        { level: 5, name: 'TITAN SHADOW', title: 'Supreme Gatekeeper of Darkness', weaponKey: 'katana', maxHp: 240, aiAggro: 0.98, color: '#ffd700', bgTheme: 'moonlit_waterfall' }
      ]
    },

    naruto: {
      id: 'naruto',
      name: 'SHINOBI CHRONICLES',
      badge: '🍃 NARUTO',
      bgTheme: 'naruto_leaf',
      ladderTitle: 'SHINOBI WORLD LADDER',
      particleColor: ['rgba(34, 197, 94, 0.8)', 'rgba(249, 115, 22, 0.75)', 'rgba(56, 189, 248, 0.7)'],
      particleType: 'leaf',
      playerName: 'NARUTO',
      playerTitle: 'Sage of Six Paths',
      bgmTrack: 'naruto',
      weapons: {
        katana: { id: 'katana', name: 'CHIDORI KUSANAGI', shortName: 'CHIDORI BLADE', damage: 18, range: 85, speed: 1.2, trailColor: '#00f0ff', desc: 'Lightning-infused electric Katana' },
        kusarigama: { id: 'kusarigama', name: 'RASENSHURIKEN', shortName: 'WIND SHURIKEN', damage: 17, range: 125, speed: 1.05, trailColor: '#38bdf8', desc: 'Spinning Chakra Vortex Shuriken' },
        nunchaku: { id: 'nunchaku', name: 'TWIN KUNAI FLURRY', shortName: 'TWIN KUNAI', damage: 13, range: 68, speed: 1.5, trailColor: '#f97316', desc: 'High-speed dual kunai slashes' },
        staff: { id: 'staff', name: 'SIX PATHS STAFF', shortName: 'TRUTH STAFF', damage: 23, range: 135, speed: 0.9, trailColor: '#10b981', desc: 'Truth-seeking orb black bo staff' },
        sai: { id: 'sai', name: 'FLYING RAIJIN KUNAI', shortName: 'RAIJIN KUNAI', damage: 15, range: 72, speed: 1.55, trailColor: '#facc15', desc: 'Minato Yellow Flash teleport stabs' },
        hammer: { id: 'hammer', name: 'KUBIKIRIBOCHO', shortName: 'EXECUTIONER', damage: 29, range: 110, speed: 0.75, trailColor: '#e11d48', desc: 'Giant iron cleaver blade' }
      },
      masters: [
        { level: 1, name: 'SASUKE', title: 'Genin Avenger of the Uchiha', weaponKey: 'katana', maxHp: 100, aiAggro: 0.48, color: '#38bdf8', bgTheme: 'naruto_leaf' },
        { level: 2, name: 'KAKASHI', title: 'The Copy Ninja of the Leaf', weaponKey: 'katana', maxHp: 135, aiAggro: 0.62, color: '#10b981', bgTheme: 'naruto_chunin' },
        { level: 3, name: 'GAARA', title: 'Kazekage of the Desert Sand', weaponKey: 'staff', maxHp: 155, aiAggro: 0.76, color: '#f59e0b', bgTheme: 'naruto_valley' },
        { level: 4, name: 'ITACHI', title: 'Akatsuki Phantom of the Crow', weaponKey: 'kusarigama', maxHp: 190, aiAggro: 0.9, color: '#ef4444', bgTheme: 'naruto_rain' },
        { level: 5, name: 'MADARA', title: 'Ghost of the Uchiha / Susanoo', weaponKey: 'hammer', maxHp: 250, aiAggro: 0.99, color: '#a855f7', bgTheme: 'naruto_divine' }
      ]
    },

    demon_slayer: {
      id: 'demon_slayer',
      name: 'KIMETSU BREATHING',
      badge: '⚔️ DEMON SLAYER',
      bgTheme: 'ds_wisteria',
      ladderTitle: 'CORPS & UPPER MOONS',
      particleColor: ['rgba(192, 132, 252, 0.85)', 'rgba(56, 189, 248, 0.8)', 'rgba(239, 68, 68, 0.75)'],
      particleType: 'wisteria',
      playerName: 'TANJIRO',
      playerTitle: 'Sun & Water Breather',
      bgmTrack: 'demon_slayer',
      weapons: {
        katana: { id: 'katana', name: 'NICHIRIN BLADE', shortName: 'NICHIRIN', damage: 19, range: 88, speed: 1.15, trailColor: '#38bdf8', desc: 'Water Dragon & Hinokami flame slashes' },
        kusarigama: { id: 'kusarigama', name: 'DUAL BEAST CLEAVERS', shortName: 'BEAST CLEAVERS', damage: 16, range: 115, speed: 1.1, trailColor: '#2dd4bf', desc: 'Inosuke jagged serrated fang strikes' },
        nunchaku: { id: 'nunchaku', name: 'THUNDERCLAP KATANA', shortName: 'THUNDER BLADE', damage: 14, range: 70, speed: 1.55, trailColor: '#facc15', desc: 'Zenitsu lightning first form godspeed' },
        staff: { id: 'staff', name: 'STONE HASHIRA FLAIL', shortName: 'STONE FLAIL', damage: 24, range: 135, speed: 0.88, trailColor: '#fb923c', desc: 'Gyomei iron spiked ball and broad axe' },
        sai: { id: 'sai', name: 'INSECT STINGER RAPIER', shortName: 'INSECT NEEDLE', damage: 14, range: 72, speed: 1.6, trailColor: '#c084fc', desc: 'Shinobu wisteria poison thrusts' },
        hammer: { id: 'hammer', name: 'SOUND HASHIRA TWIN CLEAVERS', shortName: 'SOUND CLEAVERS', damage: 30, range: 110, speed: 0.75, trailColor: '#f43f5e', desc: 'Tengen explosive chained dual blades' }
      },
      masters: [
        { level: 1, name: 'ZENITSU', title: 'Thunder Breathing Prodigy', weaponKey: 'nunchaku', maxHp: 100, aiAggro: 0.48, color: '#facc15', bgTheme: 'ds_wisteria' },
        { level: 2, name: 'INOSUKE', title: 'Beast Breathing Mountain Lord', weaponKey: 'kusarigama', maxHp: 130, aiAggro: 0.65, color: '#2dd4bf', bgTheme: 'ds_butterfly' },
        { level: 3, name: 'SHINOBU', title: 'Insect Hashira of the Poison Needle', weaponKey: 'sai', maxHp: 150, aiAggro: 0.78, color: '#c084fc', bgTheme: 'ds_spider' },
        { level: 4, name: 'RENGOKU', title: 'Flame Hashira of the Blazing Heart', weaponKey: 'katana', maxHp: 195, aiAggro: 0.9, color: '#f97316', bgTheme: 'ds_train' },
        { level: 5, name: 'MUZAN', title: 'Demon King / Upper Rank Absolute', weaponKey: 'hammer', maxHp: 260, aiAggro: 0.99, color: '#e11d48', bgTheme: 'ds_infinity' }
      ]
    }
  };

  const THEME_KEYS = ['dojo', 'naruto', 'demon_slayer'];
  let currentThemeKey = localStorage.getItem('shadow-fight-theme') || 'dojo';
  if (!THEMES[currentThemeKey]) currentThemeKey = 'dojo';

  function getActiveTheme() {
    return THEMES[currentThemeKey] || THEMES.dojo;
  }

  const WEAPON_KEYS = ['katana', 'kusarigama', 'nunchaku', 'staff', 'sai', 'hammer'];
  let selectedWeaponKey = 'katana';

  let currentMasterIdx = 0;
  let unlockedMasterLevel = Number(localStorage.getItem('shadow-fight-unlocked')) || 1;
  let isEndlessDojo = false;
  let endlessWins = 0;
  let currentLandscapeKey = 'fuji_sakura';

  // ── Web Audio Synthesizer (Martial Arts SFX & Synth Melodies) ───────────────
  class FightAudio {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.sfx = null;
      this.bgm = null;
      this.isMuted = false;
      this.bgmTimer = null;
      this.bgmStep = 0;
      this.isPlayingBGM = false;
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.bgm = this.ctx.createGain();

      this.master.gain.value = 0.85;
      this.sfx.gain.value = 0.7;
      this.bgm.gain.value = 0.35;

      this.sfx.connect(this.master);
      this.bgm.connect(this.master);
      this.master.connect(this.ctx.destination);
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.master) this.master.gain.value = this.isMuted ? 0 : 0.85;
      if (btnVolMute) btnVolMute.textContent = this.isMuted ? '🔇' : '🔊';
    }

    playWhoosh() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.14);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
      osc.connect(gain);
      gain.connect(this.sfx);
      osc.start(t);
      osc.stop(t + 0.14);
    }

    playHitPunch() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
      osc.connect(gain);
      gain.connect(this.sfx);
      osc.start(t);
      osc.stop(t + 0.12);
    }

    playHitKick() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.16);
      gain.gain.setValueAtTime(0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);
      osc.connect(gain);
      gain.connect(this.sfx);
      osc.start(t);
      osc.stop(t + 0.16);
    }

    playBladeClash() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1400, t);
      osc1.frequency.exponentialRampToValueAtTime(2800, t + 0.18);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(700, t);
      osc2.frequency.exponentialRampToValueAtTime(200, t + 0.18);

      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfx);
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 0.22);
      osc2.stop(t + 0.22);
    }

    playBlock() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.15);
      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.connect(gain);
      gain.connect(this.sfx);
      osc.start(t);
      osc.stop(t + 0.15);
    }

    playLockDenied() {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
      osc.connect(gain);
      gain.connect(this.sfx);
      osc.start(t);
      osc.stop(t + 0.18);
    }

    playAnnounceSound(type = 'fight') {
      if (!this.ctx || this.isMuted) return;
      this.resume();
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      if (type === 'fight') {
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.3);
      } else if (type === 'ko') {
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 0.5);
      }
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (type === 'ko' ? 0.5 : 0.3));
      osc.connect(gain);
      gain.connect(this.sfx);
      osc.start(t);
      osc.stop(t + (type === 'ko' ? 0.5 : 0.3));
    }

    startBattleBGM() {
      if (this.isPlayingBGM || !this.ctx) return;
      this.isPlayingBGM = true;
      this.bgmStep = 0;

      const theme = getActiveTheme();

      // Theme-specific synth scales & timings
      let drumFreqs = [70, 70, 110, 70, 85, 70, 140, 70];
      let melodyFreqs = [220, 261.63, 293.66, 349.23, 392.00, 440.00];
      let stepDuration = 0.11;

      if (theme.id === 'naruto') {
        // High-energy fast Shinobi battle theme (144 BPM)
        drumFreqs = [90, 60, 130, 60, 90, 130, 75, 150];
        melodyFreqs = [293.66, 329.63, 349.23, 440.00, 523.25, 587.33];
        stepDuration = 0.104;
      } else if (theme.id === 'demon_slayer') {
        // Epic Taiko & Breathing orchestra theme
        drumFreqs = [65, 100, 65, 120, 80, 65, 140, 90];
        melodyFreqs = [220, 246.94, 261.63, 329.63, 349.23, 440.00];
        stepDuration = 0.115;
      }

      const step = () => {
        if (!this.isPlayingBGM || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const s = this.bgmStep;

          // Taiko / Bass Drum
          const drumOsc = this.ctx.createOscillator();
          const drumGain = this.ctx.createGain();
          drumOsc.type = 'triangle';
          drumOsc.frequency.setValueAtTime(drumFreqs[s % drumFreqs.length], now);
          drumOsc.frequency.exponentialRampToValueAtTime(30, now + stepDuration * 0.9);

          drumGain.gain.setValueAtTime(0.25, now);
          drumGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 0.9);

          drumOsc.connect(drumGain);
          drumGain.connect(this.bgm);
          drumOsc.start(now);
          drumOsc.stop(now + stepDuration);

          // Lead Anime Synth Melody
          if (s % 2 === 0) {
            const fluteOsc = this.ctx.createOscillator();
            const fluteGain = this.ctx.createGain();
            fluteOsc.type = theme.id === 'naruto' ? 'sawtooth' : 'sine';
            const mIndex = Math.floor(s / 2) % melodyFreqs.length;
            fluteOsc.frequency.setValueAtTime(melodyFreqs[mIndex], now);

            fluteGain.gain.setValueAtTime(theme.id === 'naruto' ? 0.06 : 0.09, now);
            fluteGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

            fluteOsc.connect(fluteGain);
            fluteGain.connect(this.bgm);
            fluteOsc.start(now);
            fluteOsc.stop(now + stepDuration * 1.8);
          }

          this.bgmStep++;
          this.bgmTimer = setTimeout(step, stepDuration * 1000);
        } catch (e) {}
      };

      step();
    }

    stopBGM() {
      this.isPlayingBGM = false;
      if (this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  const audio = new FightAudio();

  // ── Game States & Match Variables ──────────────────────────────────────────
  const STATES = { MENU: 0, ROUND_START: 1, FIGHTING: 2, ROUND_OVER: 3, MATCH_OVER: 4, PAUSED: 5 };
  let gameState = STATES.MENU;

  let roundTime = 99;
  let playerRoundWins = 0;
  let enemyRoundWins = 0;
  let currentRound = 1;
  let maxRounds = 2; // Best of 3
  let hitStopTimer = 0;
  let slowMoTimer = 0;
  let screenShake = 0;
  let maxComboThisMatch = 0;
  let currentCombo = 0;

  // ── Particles, Sparks & Ambient Anime Petals ───────────────────────────────
  const particles = [];
  const ambientPetals = [];

  function initAmbientParticles() {
    ambientPetals.length = 0;
    const theme = getActiveTheme();
    for (let i = 0; i < 45; i++) {
      const col = theme.particleColor[i % theme.particleColor.length];
      ambientPetals.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        vx: 25 + Math.random() * 45,
        vy: 15 + Math.random() * 35,
        size: 2.5 + Math.random() * 3.5,
        angle: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 2.5,
        color: col,
        type: theme.particleType
      });
    }
  }

  // ── Fighter Object Factory ─────────────────────────────────────────────────
  function createFighter(isPlayer, startX, weaponKey) {
    const theme = getActiveTheme();
    const activeWeapons = theme.weapons;
    return {
      isPlayer,
      x: startX,
      y: 540,
      vx: 0,
      vy: 0,
      groundY: 540,
      facing: isPlayer ? 1 : -1, // 1 = right, -1 = left
      hp: 100,
      maxHp: 100,
      weapon: activeWeapons[weaponKey] || activeWeapons.katana,
      state: 'IDLE', // IDLE, WALK_FWD, WALK_BWD, JUMP, CROUCH, PUNCH, KICK, WEAPON, BLOCK, ROLL, HIT, KNOCKED
      stateTimer: 0,
      stateDuration: 0,
      isGrounded: true,
      isBlocking: false,
      isInvincible: false,
      attackPhase: 0,
      comboIndex: 0,
      hitConnected: false,
      aiCooldown: 0.5,
      aiActionTimer: 0,

      // Joint angles for procedural animation (radians)
      joints: {
        headAng: 0,
        torsoAng: 0,
        hipAng: 0,
        lArmUpper: 0.4,
        lArmLower: 0.8,
        rArmUpper: -0.4,
        rArmLower: -0.8,
        lLegUpper: 0.2,
        lLegLower: -0.2,
        rLegUpper: -0.2,
        rLegLower: 0.2,
        weaponAng: 0.2
      }
    };
  }

  let player = createFighter(true, 400, 'katana');
  let enemy = createFighter(false, 880, 'katana');

  let totalRoundsCompleted = 0;

  // ── Weapon Management System ──────────────────────────────────────────────
  function isWeaponSwitchUnlocked() {
    return unlockedMasterLevel >= 3 || currentMasterIdx >= 2 || currentRound >= 3 || isEndlessDojo || totalRoundsCompleted >= 2;
  }

  function updateWeaponUI() {
    const theme = getActiveTheme();
    const unlocked = isWeaponSwitchUnlocked();
    const activeWeapons = theme.weapons;

    if (elSidebarWeaponActive) {
      elSidebarWeaponActive.textContent = unlocked 
        ? `${player.weapon.shortName} ⚡` 
        : `${player.weapon.shortName} (🔒 LVL 3)`;
    }
    if (elHudPlayerWeapon) {
      elHudPlayerWeapon.textContent = unlocked 
        ? `[${player.weapon.shortName} ⚡]` 
        : `[${player.weapon.shortName} 🔒]`;
      elHudPlayerWeapon.title = unlocked 
        ? 'Weapon Arsenal Unlocked! Click or press 1-6 to switch' 
        : 'Locked until Level 3!';
    }
    if (elHudPlayerName) {
      elHudPlayerName.textContent = theme.playerName;
    }

    if (weaponSelectorGrid) {
      const btns = weaponSelectorGrid.querySelectorAll('.weapon-btn');
      btns.forEach(b => {
        const wKey = b.dataset.weapon;
        const wObj = activeWeapons[wKey] || activeWeapons.katana;
        const isCurrent = wKey === selectedWeaponKey;
        b.classList.toggle('active', isCurrent);
        b.classList.toggle('locked-weapon', !unlocked && !isCurrent);

        const nameEl = b.querySelector('.weapon-name');
        if (nameEl) nameEl.textContent = `${getWeaponIcon(wKey)} ${wObj.shortName}`;

        const descEl = b.querySelector('.weapon-desc');
        if (descEl) {
          if (!unlocked && !isCurrent) {
            descEl.innerHTML = '<span style="color:#ff3366;">🔒 Unlocks Lvl 3</span>';
          } else {
            const keyNum = WEAPON_KEYS.indexOf(wKey) + 1;
            descEl.textContent = `${wObj.desc.split(' ')[0]} [${keyNum}]`;
          }
        }
      });
    }
  }

  function getWeaponIcon(key) {
    if (key === 'katana') return '🗡️';
    if (key === 'kusarigama') return '⛓️';
    if (key === 'nunchaku') return '🥢';
    if (key === 'staff') return '🎋';
    if (key === 'sai') return '⚔️';
    if (key === 'hammer') return '🔨';
    return '🗡️';
  }

  function setPlayerWeapon(key, force = false) {
    const theme = getActiveTheme();
    const activeWeapons = theme.weapons;
    if (!activeWeapons[key]) return;

    if (!force && !isWeaponSwitchUnlocked() && key !== selectedWeaponKey) {
      audio.playLockDenied();
      showAnnouncer('🔒 UNLOCKS AT LEVEL 3!', 'red', 1000);
      return;
    }

    selectedWeaponKey = key;
    player.weapon = activeWeapons[key];
    updateWeaponUI();

    spawnSparkBurst(player.x, player.y - 40, player.weapon.trailColor, 14);
    audio.playBladeClash();
    showAnnouncer(`EQUIPPED: ${player.weapon.name}`, 'cyan', 800);
  }

  function cyclePlayerWeapon(direction = 1) {
    if (!isWeaponSwitchUnlocked()) {
      audio.playLockDenied();
      showAnnouncer('🔒 UNLOCKS AT LEVEL 3!', 'red', 1000);
      return;
    }
    const currentIndex = WEAPON_KEYS.indexOf(selectedWeaponKey);
    let nextIndex = (currentIndex + direction + WEAPON_KEYS.length) % WEAPON_KEYS.length;
    setPlayerWeapon(WEAPON_KEYS[nextIndex]);
  }

  // ── Universe Theme Switcher ────────────────────────────────────────────────
  function setUniverseTheme(themeKey) {
    if (!THEMES[themeKey]) return;
    currentThemeKey = themeKey;
    localStorage.setItem('shadow-fight-theme', currentThemeKey);

    const theme = getActiveTheme();

    if (btnThemeSelect) btnThemeSelect.textContent = `${theme.badge} ▾`;
    if (elSidebarThemeActive) elSidebarThemeActive.textContent = theme.badge;
    if (elSidebarLadderTitle) elSidebarLadderTitle.textContent = theme.ladderTitle;

    // Update Theme Picker Grid UI
    if (themePickerGrid) {
      const btns = themePickerGrid.querySelectorAll('.theme-card-btn');
      btns.forEach(b => {
        b.classList.toggle('active', b.dataset.theme === currentThemeKey);
      });
    }

    // Refresh ambient particles
    initAmbientParticles();

    // Re-equip weapon from new theme
    const activeWeapons = theme.weapons;
    player.weapon = activeWeapons[selectedWeaponKey] || activeWeapons.katana;

    // Update masters & start match with new theme
    currentMasterIdx = 0;
    renderSidebarMasters();
    updateWeaponUI();
    showAnnouncer(`UNIVERSE: ${theme.name}`, 'gold', 1200);

    if (gameState === STATES.FIGHTING || gameState === STATES.ROUND_START || gameState === STATES.ROUND_OVER) {
      startMatch();
    } else {
      currentLandscapeKey = theme.bgTheme;
      if (btnSelectArena) btnSelectArena.textContent = `${LANDSCAPES[currentLandscapeKey]?.shortName || 'ARENA'} ▾`;
    }
  }

  function cycleUniverseTheme(direction = 1) {
    const idx = THEME_KEYS.indexOf(currentThemeKey);
    const nextIdx = (idx + direction + THEME_KEYS.length) % THEME_KEYS.length;
    setUniverseTheme(THEME_KEYS[nextIdx]);
  }

  // ── Input & Keybinding Handling ────────────────────────────────────────────
  const keys = {};

  function setupInput() {
    window.addEventListener('keydown', e => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      keys[e.code] = true;
      audio.init();

      // Weapon Hotkeys (1-6 & Q/E)
      if (e.code === 'Digit1') setPlayerWeapon('katana');
      if (e.code === 'Digit2') setPlayerWeapon('kusarigama');
      if (e.code === 'Digit3') setPlayerWeapon('nunchaku');
      if (e.code === 'Digit4') setPlayerWeapon('staff');
      if (e.code === 'Digit5') setPlayerWeapon('sai');
      if (e.code === 'Digit6') setPlayerWeapon('hammer');
      if (e.code === 'KeyQ') cyclePlayerWeapon(-1);
      if (e.code === 'KeyE') cyclePlayerWeapon(1);
      if (e.code === 'KeyB') cycleLandscape(1);
      if (e.code === 'KeyT') cycleUniverseTheme(1);

      if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
      } else if (gameState === STATES.MENU || gameState === STATES.MATCH_OVER) {
        if (e.code === 'Space' || e.code === 'Enter') startMatch();
      } else if (gameState === STATES.FIGHTING) {
        if (e.code === 'KeyJ') triggerPlayerAttack('PUNCH');
        if (e.code === 'KeyK') triggerPlayerAttack('KICK');
        if (e.code === 'KeyL' || e.code === 'Space') triggerPlayerAttack('WEAPON');
        if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') triggerPlayerRoll();
      }
    });

    window.addEventListener('keyup', e => { keys[e.code] = false; });

    canvas.addEventListener('mousedown', e => {
      audio.init();
      if (gameState === STATES.MENU || gameState === STATES.MATCH_OVER) {
        startMatch();
        return;
      }
      if (gameState === STATES.FIGHTING) {
        if (e.button === 0) triggerPlayerAttack('WEAPON');
        if (e.button === 2) {
          e.preventDefault();
          triggerPlayerAttack('KICK');
        }
      }
    });
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    // Theme selector button in top nav
    if (btnThemeSelect) {
      btnThemeSelect.addEventListener('click', () => cycleUniverseTheme(1));
    }

    // Arena scenery button in top nav
    if (btnSelectArena) {
      btnSelectArena.addEventListener('click', () => cycleLandscape(1));
    }

    // Theme picker cards in drawer
    if (themePickerGrid) {
      const btns = themePickerGrid.querySelectorAll('.theme-card-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          setUniverseTheme(btn.dataset.theme);
        });
      });
    }

    // Weapon Selection UI
    if (weaponSelectorGrid) {
      const btns = weaponSelectorGrid.querySelectorAll('.weapon-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          setPlayerWeapon(btn.dataset.weapon);
        });
      });
    }

    // Clickable HUD Weapon Badge
    if (elHudPlayerWeapon) {
      elHudPlayerWeapon.style.cursor = 'pointer';
      elHudPlayerWeapon.style.pointerEvents = 'auto';
      elHudPlayerWeapon.title = 'Click to switch weapon (Hotkeys: 1-6, Q/E)';
      elHudPlayerWeapon.addEventListener('click', () => cyclePlayerWeapon(1));
    }

    // Touch Directional D-Pad & Actions
    if (btnTouchUp) {
      btnTouchUp.addEventListener('touchstart', e => { e.preventDefault(); keys['KeyW'] = true; });
      btnTouchUp.addEventListener('touchend', e => { e.preventDefault(); keys['KeyW'] = false; });
    }
    if (btnTouchDown) {
      btnTouchDown.addEventListener('touchstart', e => { e.preventDefault(); keys['KeyS'] = true; });
      btnTouchDown.addEventListener('touchend', e => { e.preventDefault(); keys['KeyS'] = false; });
    }
    if (btnTouchLeft) {
      btnTouchLeft.addEventListener('touchstart', e => { e.preventDefault(); keys['KeyA'] = true; });
      btnTouchLeft.addEventListener('touchend', e => { e.preventDefault(); keys['KeyA'] = false; });
    }
    if (btnTouchRight) {
      btnTouchRight.addEventListener('touchstart', e => { e.preventDefault(); keys['KeyD'] = true; });
      btnTouchRight.addEventListener('touchend', e => { e.preventDefault(); keys['KeyD'] = false; });
    }

    if (btnTouchPunch) btnTouchPunch.addEventListener('touchstart', e => { e.preventDefault(); triggerPlayerAttack('PUNCH'); });
    if (btnTouchKick) btnTouchKick.addEventListener('touchstart', e => { e.preventDefault(); triggerPlayerAttack('KICK'); });
    if (btnTouchWeapon) btnTouchWeapon.addEventListener('touchstart', e => { e.preventDefault(); triggerPlayerAttack('WEAPON'); });
    if (btnTouchRoll) btnTouchRoll.addEventListener('touchstart', e => { e.preventDefault(); triggerPlayerRoll(); });

    // Modals & Navigation
    if (btnFullscreen) btnFullscreen.addEventListener('click', () => toggleFullscreen());
    if (btnPauseFullscreen) btnPauseFullscreen.addEventListener('click', () => toggleFullscreen());
    if (btnPause) btnPause.addEventListener('click', () => togglePause());
    if (btnResume) btnResume.addEventListener('click', () => togglePause(false));
    if (btnRestart) btnRestart.addEventListener('click', () => { togglePause(false); startMatch(); });
    if (btnVolMute) btnVolMute.addEventListener('click', () => audio.toggleMute());

    if (btnSidebarEndless) {
      btnSidebarEndless.addEventListener('click', () => {
        isEndlessDojo = true;
        endlessWins = 0;
        startMatch();
      });
    }

    if (btnNextLevel) {
      btnNextLevel.addEventListener('click', () => {
        if (elLevelCompleteModal) elLevelCompleteModal.classList.remove('active');
        const theme = getActiveTheme();
        const masters = theme.masters;
        if (isEndlessDojo) {
          endlessWins++;
          currentMasterIdx = (endlessWins) % masters.length;
          startMatch();
        } else if (currentMasterIdx < masters.length - 1) {
          currentMasterIdx++;
          startMatch();
        } else {
          isEndlessDojo = true;
          startMatch();
        }
      });
    }

    if (btnReplayLevel) {
      btnReplayLevel.addEventListener('click', () => {
        if (elLevelCompleteModal) elLevelCompleteModal.classList.remove('active');
        startMatch();
      });
    }
  }

  // ── Announcer & Banner System ──────────────────────────────────────────────
  function showAnnouncer(text, colorClass = 'gold', duration = 1200) {
    if (!elAnnouncer) return;
    elAnnouncer.textContent = text;
    elAnnouncer.className = `active ${colorClass}`;
    setTimeout(() => {
      elAnnouncer.className = colorClass;
    }, duration);
  }

  // ── Match & Round Lifecycle ────────────────────────────────────────────────
  function startMatch() {
    audio.init();
    audio.startBattleBGM();

    const theme = getActiveTheme();
    const masters = theme.masters;
    const masterConfig = masters[currentMasterIdx] || masters[0];
    currentLandscapeKey = masterConfig.bgTheme || theme.bgTheme;
    
    const isPortrait = ch > cw || cw < 600;
    const startGroundY = isPortrait ? ch - 190 : ch - 160;
    const startPlayerX = cw * (isPortrait ? 0.28 : 0.32);
    const startEnemyX = cw * (isPortrait ? 0.72 : 0.68);

    player = createFighter(true, startPlayerX, selectedWeaponKey);
    player.groundY = startGroundY;
    player.y = startGroundY;

    enemy = createFighter(false, startEnemyX, masterConfig.weaponKey);
    enemy.groundY = startGroundY;
    enemy.y = startGroundY;
    enemy.hp = masterConfig.maxHp;
    enemy.maxHp = masterConfig.maxHp;

    if (elHudPlayerName) elHudPlayerName.textContent = theme.playerName;
    if (elHudEnemyName) elHudEnemyName.textContent = masterConfig.name;
    if (elHudEnemyWeapon) elHudEnemyWeapon.textContent = `[${enemy.weapon.shortName}]`;
    if (elHudPlayerWeapon) elHudPlayerWeapon.textContent = `[${player.weapon.shortName}]`;
    if (btnSelectArena) btnSelectArena.textContent = `${LANDSCAPES[currentLandscapeKey]?.shortName || 'ARENA'} ▾`;

    playerRoundWins = 0;
    enemyRoundWins = 0;
    currentRound = 1;
    maxComboThisMatch = 0;
    currentCombo = 0;

    renderRoundDots();
    renderSidebarMasters();
    updateWeaponUI();
    startRound();
  }

  function startRound() {
    const isPortrait = ch > cw || cw < 600;
    const gY = isPortrait ? ch - 190 : ch - 160;

    player.x = cw * (isPortrait ? 0.28 : 0.32);
    player.y = gY;
    player.groundY = gY;
    player.hp = player.maxHp;
    player.state = 'IDLE';

    const theme = getActiveTheme();
    const masters = theme.masters;
    const masterConfig = masters[currentMasterIdx] || masters[0];

    enemy.x = cw * (isPortrait ? 0.72 : 0.68);
    enemy.y = gY;
    enemy.groundY = gY;
    enemy.hp = enemy.maxHp;
    enemy.state = 'IDLE';

    roundTime = 99;
    gameState = STATES.ROUND_START;
    updateHUD();
    updateWeaponUI();

    showAnnouncer(`ROUND ${currentRound}`, 'gold', 1100);
    audio.playAnnounceSound('fight');

    setTimeout(() => {
      if (currentRound >= 3) {
        showAnnouncer('⚡ ARSENAL UNLOCKED: ANY WEAPON READY!', 'gold', 1500);
      } else {
        showAnnouncer('FIGHT!', 'cyan', 800);
      }
      gameState = STATES.FIGHTING;
    }, 1200);
  }

  function renderRoundDots() {
    if (elPlayerRoundDots) {
      const dots = elPlayerRoundDots.querySelectorAll('.round-dot');
      dots.forEach((d, i) => {
        if (i < playerRoundWins) d.classList.add('won');
        else d.classList.remove('won');
      });
    }
    if (elEnemyRoundDots) {
      const dots = elEnemyRoundDots.querySelectorAll('.round-dot');
      dots.forEach((d, i) => {
        if (i < enemyRoundWins) d.classList.add('won');
        else d.classList.remove('won');
      });
    }
  }

  // ── Attack Triggers ────────────────────────────────────────────────────────
  function triggerPlayerAttack(type) {
    if (player.state !== 'IDLE' && player.state !== 'WALK_FWD' && player.state !== 'WALK_BWD' && player.state !== 'CROUCH') {
      return;
    }

    player.state = type;
    player.stateTimer = 0;
    player.attackPhase = 0;
    player.hitConnected = false;

    if (type === 'PUNCH') {
      player.stateDuration = 0.28;
      audio.playWhoosh();
    } else if (type === 'KICK') {
      player.stateDuration = 0.38;
      audio.playWhoosh();
    } else if (type === 'WEAPON') {
      player.stateDuration = 0.42 / player.weapon.speed;
      audio.playWhoosh();
    }
  }

  function triggerPlayerRoll() {
    if (player.state === 'ROLL' || !player.isGrounded) return;
    player.state = 'ROLL';
    player.stateTimer = 0;
    player.stateDuration = 0.45;
    player.isInvincible = true;
    player.vx = player.facing * 420;
    audio.playWhoosh();
  }

  // ── Combat Hit & Damage Calculation ────────────────────────────────────────
  function checkAttackHit(attacker, defender) {
    if (attacker.attackPhase !== 1 || attacker.hitConnected || defender.isInvincible) return;

    let attackReach = 55;
    let baseDamage = 10;
    let hitType = attacker.state;

    if (hitType === 'PUNCH') {
      attackReach = 52;
      baseDamage = 11;
    } else if (hitType === 'KICK') {
      attackReach = 72;
      baseDamage = 16;
    } else if (hitType === 'WEAPON') {
      attackReach = attacker.weapon.range;
      baseDamage = attacker.weapon.damage;
    }

    const dist = Math.abs(attacker.x - defender.x);
    const inFacingDir = attacker.facing === 1 ? defender.x >= attacker.x - 10 : defender.x <= attacker.x + 10;

    if (inFacingDir && dist <= attackReach) {
      attacker.hitConnected = true;

      // Check if defender is blocking
      if (defender.state === 'BLOCK') {
        const chipDamage = Math.max(2, Math.floor(baseDamage * 0.2));
        defender.hp = Math.max(0, defender.hp - chipDamage);
        defender.vx = attacker.facing * 90;
        hitStopTimer = 0.08;
        screenShake = 0.15;
        audio.playBlock();
        spawnSparkBurst((attacker.x + defender.x) / 2, defender.y - 45, '#ffffff', 6);
        updateHUD();
        return;
      }

      // Successful Direct Hit
      const isHeavy = hitType === 'WEAPON' || baseDamage >= 18;
      defender.hp = Math.max(0, defender.hp - baseDamage);
      defender.state = isHeavy && defender.hp <= 0 ? 'KNOCKED' : 'HIT';
      defender.stateTimer = 0;
      defender.stateDuration = isHeavy ? 0.38 : 0.24;
      defender.vx = attacker.facing * (isHeavy ? 240 : 160);

      hitStopTimer = isHeavy ? 0.12 : 0.07;
      screenShake = isHeavy ? 0.45 : 0.2;

      // Audio & Sparks
      if (hitType === 'WEAPON') {
        audio.playBladeClash();
        spawnSparkBurst((attacker.x + defender.x) / 2, defender.y - 50, attacker.weapon.trailColor, 18);
      } else if (hitType === 'KICK') {
        audio.playHitKick();
        spawnSparkBurst((attacker.x + defender.x) / 2, defender.y - 40, '#ff0055', 12);
      } else {
        audio.playHitPunch();
        spawnSparkBurst((attacker.x + defender.x) / 2, defender.y - 55, '#00f0ff', 10);
      }

      // Combo Tracking
      if (attacker.isPlayer) {
        currentCombo++;
        if (currentCombo > maxComboThisMatch) maxComboThisMatch = currentCombo;
        if (currentCombo >= 2) {
          showAnnouncer(`${currentCombo}x COMBO!`, 'cyan', 600);
        }
      }

      updateHUD();

      // Check Round Winner
      if (defender.hp <= 0) {
        triggerRoundEnd(attacker.isPlayer ? 'PLAYER' : 'ENEMY');
      }
    }
  }

  function spawnSparkBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 450,
        vy: -100 - Math.random() * 350,
        size: 2 + Math.random() * 3,
        life: 0.35,
        maxLife: 0.35,
        color
      });
    }
  }

  function triggerRoundEnd(winner) {
    gameState = STATES.ROUND_OVER;
    slowMoTimer = 1.2;
    audio.playAnnounceSound('ko');
    showAnnouncer('K.O.!', 'red', 1800);

    setTimeout(() => {
      totalRoundsCompleted++;
      if (winner === 'PLAYER') {
        playerRoundWins++;
      } else {
        enemyRoundWins++;
      }
      renderRoundDots();
      updateWeaponUI();

      if (playerRoundWins >= maxRounds) {
        triggerMatchVictory();
      } else if (enemyRoundWins >= maxRounds) {
        triggerMatchDefeat();
      } else {
        currentRound++;
        startRound();
      }
    }, 1900);
  }

  function triggerMatchVictory() {
    gameState = STATES.MATCH_OVER;
    audio.stopBGM();

    const theme = getActiveTheme();
    const masters = theme.masters;

    if (currentMasterIdx + 1 >= unlockedMasterLevel) {
      unlockedMasterLevel = Math.min(5, currentMasterIdx + 2);
      localStorage.setItem('shadow-fight-unlocked', unlockedMasterLevel);
    }

    if (elLcTitle) elLcTitle.textContent = 'VICTORY!';
    if (elLcSubtitle) elLcSubtitle.textContent = `${masters[currentMasterIdx]?.name || 'Master'} Defeated. Honor Maintained.`;
    if (elLcRounds) elLcRounds.textContent = `${playerRoundWins} - ${enemyRoundWins}`;
    if (elLcCombo) elLcCombo.textContent = `${maxComboThisMatch}x`;
    if (elLcRating) elLcRating.textContent = playerRoundWins === 2 && enemyRoundWins === 0 ? 'PERFECT' : 'MASTER';

    if (elLevelCompleteModal) elLevelCompleteModal.classList.add('active');
  }

  function triggerMatchDefeat() {
    gameState = STATES.MATCH_OVER;
    audio.stopBGM();

    if (elLcTitle) {
      elLcTitle.textContent = 'DEFEATED';
      elLcTitle.style.color = '#ff0055';
    }
    if (elLcSubtitle) elLcSubtitle.textContent = 'You have fallen in battle. Train and challenge again.';
    if (elLcRounds) elLcRounds.textContent = `${playerRoundWins} - ${enemyRoundWins}`;
    if (elLcCombo) elLcCombo.textContent = `${maxComboThisMatch}x`;
    if (elLcRating) elLcRating.textContent = 'FALLEN';

    if (elLevelCompleteModal) elLevelCompleteModal.classList.add('active');
  }

  // ── Opponent AI Decision System ────────────────────────────────────────────
  function updateEnemyAI(dt) {
    if (gameState !== STATES.FIGHTING || enemy.state === 'HIT' || enemy.state === 'KNOCKED') return;

    enemy.aiActionTimer -= dt;
    const dist = Math.abs(player.x - enemy.x);
    const theme = getActiveTheme();
    const masters = theme.masters;
    const master = masters[currentMasterIdx] || masters[0];

    // Reactive Defense: If player is actively swinging a weapon, AI attempts block or dodge
    if (player.attackPhase === 1 && dist <= 110 && Math.random() < master.aiAggro * 0.7 && enemy.state === 'IDLE') {
      if (Math.random() < 0.3) {
        enemy.state = 'ROLL';
        enemy.stateTimer = 0;
        enemy.stateDuration = 0.45;
        enemy.isInvincible = true;
        enemy.vx = -enemy.facing * 420;
        audio.playWhoosh();
        return;
      } else {
        enemy.state = 'BLOCK';
        enemy.stateTimer = 0;
        enemy.stateDuration = 0.35;
        return;
      }
    }

    if (enemy.aiActionTimer <= 0) {
      enemy.aiActionTimer = (0.45 - master.aiAggro * 0.28) + Math.random() * 0.25;

      if (dist > 105) {
        enemy.state = 'WALK_FWD';
        enemy.stateDuration = 0.5;
        enemy.stateTimer = 0;
        enemy.vx = enemy.facing * (160 + master.aiAggro * 60);
      } else if (dist <= 65 && Math.random() < 0.25) {
        enemy.state = 'WALK_BWD';
        enemy.stateDuration = 0.3;
        enemy.stateTimer = 0;
        enemy.vx = -enemy.facing * 140;
      } else {
        const roll = Math.random();
        enemy.stateTimer = 0;
        enemy.attackPhase = 0;
        enemy.hitConnected = false;

        if (roll < 0.5) {
          enemy.state = 'WEAPON';
          enemy.stateDuration = 0.4 / enemy.weapon.speed;
          audio.playWhoosh();
        } else if (roll < 0.8) {
          enemy.state = 'KICK';
          enemy.stateDuration = 0.34;
          audio.playWhoosh();
        } else {
          enemy.state = 'PUNCH';
          enemy.stateDuration = 0.25;
          audio.playWhoosh();
        }
      }
    }

    if (enemy.state === 'WALK_FWD') {
      enemy.vx = enemy.facing * (160 + master.aiAggro * 60);
    } else if (enemy.state === 'WALK_BWD') {
      enemy.vx = -enemy.facing * 140;
    }
  }

  // ── Procedural Joint Animation Calculation ─────────────────────────────────
  function animateFighterJoints(f, dt) {
    const j = f.joints;
    const t = f.stateTimer;
    const dur = f.stateDuration || 0.3;
    const p = Math.min(1, t / dur);

    if (f.state === 'IDLE') {
      const breath = Math.sin(Date.now() * 0.005) * 0.08;
      j.torsoAng = breath * 0.5;
      j.headAng = -breath * 0.4;
      j.lArmUpper = 0.5 + breath;
      j.lArmLower = 0.9;
      j.rArmUpper = -0.3;
      j.rArmLower = -0.8;
      j.lLegUpper = 0.25;
      j.lLegLower = -0.25;
      j.rLegUpper = -0.25;
      j.rLegLower = 0.25;
      j.weaponAng = 0.25 + breath;
    } else if (f.state === 'WALK_FWD' || f.state === 'WALK_BWD') {
      const walkCycle = Math.sin(Date.now() * 0.014);
      j.lLegUpper = walkCycle * 0.6;
      j.lLegLower = -Math.abs(walkCycle) * 0.45;
      j.rLegUpper = -walkCycle * 0.6;
      j.rLegLower = -Math.abs(walkCycle) * 0.45;
      j.lArmUpper = -walkCycle * 0.45;
      j.rArmUpper = walkCycle * 0.45;
      j.torsoAng = (f.state === 'WALK_FWD' ? 0.12 : -0.1);
    } else if (f.state === 'PUNCH') {
      if (p < 0.4) {
        j.rArmUpper = -1.6 * (p / 0.4);
        j.rArmLower = -0.05;
        j.torsoAng = 0.25;
      } else {
        j.rArmUpper = -1.6 * (1 - (p - 0.4) / 0.6);
        j.rArmLower = -0.8;
      }
    } else if (f.state === 'KICK') {
      if (p < 0.4) {
        j.rLegUpper = -1.9 * (p / 0.4);
        j.rLegLower = 0.15;
        j.torsoAng = -0.35;
      } else {
        j.rLegUpper = -1.9 * (1 - (p - 0.4) / 0.6);
        j.rLegLower = 0.25;
      }
    } else if (f.state === 'WEAPON') {
      if (p < 0.3) {
        j.rArmUpper = 1.3 * (p / 0.3);
        j.weaponAng = -1.5;
      } else if (p < 0.6) {
        const slashP = (p - 0.3) / 0.3;
        j.rArmUpper = 1.3 - 2.9 * slashP;
        j.weaponAng = -1.5 + 3.0 * slashP;
        j.torsoAng = 0.32;
      } else {
        j.rArmUpper = -1.6 * (1 - (p - 0.6) / 0.4);
        j.weaponAng = 0.25;
      }
    } else if (f.state === 'BLOCK') {
      j.lArmUpper = -1.1;
      j.lArmLower = -1.4;
      j.rArmUpper = -0.9;
      j.rArmLower = -1.5;
      j.torsoAng = -0.15;
    } else if (f.state === 'HIT') {
      j.torsoAng = -0.45;
      j.headAng = -0.55;
      j.rArmUpper = 0.5;
      j.lArmUpper = 0.5;
    } else if (f.state === 'KNOCKED') {
      j.torsoAng = -1.3;
      j.headAng = -0.9;
      j.lLegUpper = -0.95;
      j.rLegUpper = -0.85;
    }
  }

  // ── Main Physics & State Updates ───────────────────────────────────────────
  function update(dt) {
    if (hitStopTimer > 0) {
      hitStopTimer -= dt;
      return;
    }

    const effectiveDt = slowMoTimer > 0 ? dt * 0.25 : dt;
    if (slowMoTimer > 0) slowMoTimer -= dt;

    // 1. Dynamic Spacing & Facing
    if (player.state !== 'ROLL' && enemy.state !== 'ROLL') {
      player.facing = player.x < enemy.x ? 1 : -1;
      enemy.facing = enemy.x < player.x ? 1 : -1;
    }

    // 2. Player Movement Input
    if (gameState === STATES.FIGHTING) {
      if (player.state === 'IDLE' || player.state === 'WALK_FWD' || player.state === 'WALK_BWD') {
        if (keys['KeyA'] || keys['ArrowLeft']) {
          player.vx = -190;
          player.state = player.facing === 1 ? 'WALK_BWD' : 'WALK_FWD';
        } else if (keys['KeyD'] || keys['ArrowRight']) {
          player.vx = 190;
          player.state = player.facing === 1 ? 'WALK_FWD' : 'WALK_BWD';
        } else {
          player.vx = 0;
          player.state = 'IDLE';
        }

        if (keys['KeyW'] || keys['ArrowUp']) {
          if (player.isGrounded) {
            player.vy = -560;
            player.isGrounded = false;
            player.state = 'JUMP';
          }
        }
      }
    }

    // 3. Enemy AI
    updateEnemyAI(effectiveDt);

    // 4. Update Fighters Physics
    [player, enemy].forEach(f => {
      // Gravity
      if (!f.isGrounded) {
        f.vy += 1250 * effectiveDt;
        f.y += f.vy * effectiveDt;
        if (f.y >= f.groundY) {
          f.y = f.groundY;
          f.vy = 0;
          f.isGrounded = true;
          if (f.state === 'JUMP') f.state = 'IDLE';
        }
      }

      f.x += f.vx * effectiveDt;

      if (f.state !== 'WALK_FWD' && f.state !== 'WALK_BWD' && f.state !== 'ROLL') {
        f.vx *= Math.pow(0.005, effectiveDt);
      }

      // Clamp inside arena walls
      const isPortrait = ch > cw || cw < 600;
      const wallMargin = isPortrait ? 30 : 80;
      f.x = Math.max(wallMargin, Math.min(cw - wallMargin, f.x));

      // State Timer & Attack Phases
      f.stateTimer += effectiveDt;
      if (f.state === 'PUNCH' || f.state === 'KICK' || f.state === 'WEAPON') {
        const p = f.stateTimer / f.stateDuration;
        if (p >= 0.35 && p <= 0.65) f.attackPhase = 1;
        else if (p > 0.65) f.attackPhase = 2;
        else f.attackPhase = 0;

        if (f.stateTimer >= f.stateDuration) {
          f.state = 'IDLE';
          f.attackPhase = 0;
        }
      } else if (f.state === 'ROLL') {
        if (f.stateTimer >= f.stateDuration) {
          f.state = 'IDLE';
          f.isInvincible = false;
        }
      } else if (f.state === 'BLOCK' && f.stateTimer >= f.stateDuration) {
        f.state = 'IDLE';
      } else if (f.state === 'HIT' && f.stateTimer >= f.stateDuration) {
        f.state = 'IDLE';
      }

      animateFighterJoints(f, effectiveDt);
    });

    // 5. Check Attack Collisions
    if (gameState === STATES.FIGHTING) {
      checkAttackHit(player, enemy);
      checkAttackHit(enemy, player);
    }

    // 6. Fight Timer Countdown
    if (gameState === STATES.FIGHTING) {
      roundTime -= effectiveDt;
      if (roundTime <= 0) {
        roundTime = 0;
        if (player.hp > enemy.hp) triggerRoundEnd('PLAYER');
        else if (enemy.hp > player.hp) triggerRoundEnd('ENEMY');
        else triggerRoundEnd('DRAW');
      }
      if (elFightTimer) elFightTimer.textContent = Math.ceil(roundTime);
    }

    // 7. Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * effectiveDt;
      p.y += p.vy * effectiveDt;
      p.vy += 650 * effectiveDt;
      p.life -= effectiveDt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // 8. Update Ambient Petals
    ambientPetals.forEach(pt => {
      pt.x += pt.vx * effectiveDt;
      pt.y += pt.vy * effectiveDt;
      pt.angle += pt.spin * effectiveDt;
      if (pt.x > cw + 20) pt.x = -20;
      if (pt.y > ch + 20) pt.y = -20;
    });

    // 9. Screen Shake Decay
    if (screenShake > 0) {
      screenShake -= effectiveDt * 1.8;
      if (screenShake < 0) screenShake = 0;
    }
  }

  function updateHUD() {
    if (elPlayerHpBar) elPlayerHpBar.style.width = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100)) + '%';
    if (elEnemyHpBar) elEnemyHpBar.style.width = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100)) + '%';
  }

  // ── Ultra-Realistic Anime & Martial Arts Figure Renderer ─────────────────
  function drawCartoonFighter(f) {
    const isPlayer = f.isPlayer;
    const theme = getActiveTheme();
    const lvl = currentMasterIdx + 1;
    const j = f.joints;

    // 0. Dynamic Contact Ground Shadow on Floor
    ctx.save();
    const airDist = Math.max(0, f.groundY - f.y);
    const shadowAlpha = Math.max(0.12, 0.55 - airDist / 380);
    const shadowWidth = Math.max(18, 46 - airDist * 0.08);
    const shadowHeight = Math.max(6, 14 - airDist * 0.025);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.beginPath();
    ctx.ellipse(f.x, f.groundY + 2, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.facing, 1);

    // Color & Material Configuration
    let skinTone = '#fcd34d';
    let skinShadow = '#eab308';
    let giColor = '#0b1b38';
    let giDark = '#060e1e';
    let giHighlight = '#1d4ed8';
    let accentColor = '#2563eb';
    let beltColor = '#1d4ed8';
    let hairColor = '#09152b';
    let hairHighlight = '#1e3a8a';
    let eyeColor = '#00f0ff';
    let isShirtless = false;

    if (theme.id === 'naruto') {
      if (isPlayer) {
        // NARUTO SAGE
        skinTone = '#fed7aa';
        skinShadow = '#fb923c';
        giColor = '#ea580c';     // Bright Orange Tracksuit
        giDark = '#9a3412';
        giHighlight = '#fb923c';
        accentColor = '#18181b'; // Black shoulder yoke & collar
        beltColor = '#0f172a';
        hairColor = '#facc15';   // Golden Spiky Hair
        hairHighlight = '#fef08a';
        eyeColor = '#38bdf8';    // Sapphire Blue Eyes
      } else {
        if (lvl === 1) { // SASUKE
          skinTone = '#fef08a';
          skinShadow = '#facc15';
          giColor = '#1e293b';     // High-collar Navy shirt
          giDark = '#0f172a';
          giHighlight = '#334155';
          accentColor = '#f8fafc'; // White arm warmers
          beltColor = '#7c3aed';   // Purple rope belt
          hairColor = '#09090b';   // Jet Black Spiky
          hairHighlight = '#3b82f6';
          eyeColor = '#ef4444';    // Sharingan Red
        } else if (lvl === 2) { // KAKASHI
          skinTone = '#fed7aa';
          skinShadow = '#f97316';
          giColor = '#15803d';     // Olive Jonin Flak Jacket
          giDark = '#14532d';
          giHighlight = '#22c55e';
          accentColor = '#0f172a'; // Navy mask
          beltColor = '#1e293b';
          hairColor = '#cbd5e1';   // Silver Tilted Spiky Hair
          hairHighlight = '#ffffff';
          eyeColor = '#10b981';
        } else if (lvl === 3) { // GAARA
          skinTone = '#fecdd3';
          skinShadow = '#f43f5e';
          giColor = '#991b1b';     // Sand Gourd Crimson Robe
          giDark = '#450a0a';
          giHighlight = '#dc2626';
          accentColor = '#d97706'; // Sand brown straps
          beltColor = '#b45309';
          hairColor = '#991b1b';   // Auburn Spiky Hair
          hairHighlight = '#ef4444';
          eyeColor = '#22c55e';
        } else if (lvl === 4) { // ITACHI
          skinTone = '#fef08a';
          skinShadow = '#facc15';
          giColor = '#09090b';     // Akatsuki Black Cloak
          giDark = '#020617';
          giHighlight = '#1e293b';
          accentColor = '#dc2626'; // Crimson Clouds & Red lining
          beltColor = '#ef4444';
          hairColor = '#18181b';
          hairHighlight = '#3f3f46';
          eyeColor = '#dc2626';    // Mangekyo Sharingan Red
        } else if (lvl === 5) { // MADARA
          skinTone = '#cbd5e1';
          skinShadow = '#94a3b8';
          giColor = '#881337';     // Crimson Samurai Battle Armor
          giDark = '#4c0519';
          giHighlight = '#be123c';
          accentColor = '#a855f7'; // Purple Susanoo Glow
          beltColor = '#4c0519';
          hairColor = '#020617';   // Long Wild Spiky Mane
          hairHighlight = '#334155';
          eyeColor = '#ef4444';
        }
      }
    } else if (theme.id === 'demon_slayer') {
      if (isPlayer) {
        // TANJIRO KAMADO
        skinTone = '#fed7aa';
        skinShadow = '#f97316';
        giColor = '#10b981';     // Checkered Green
        giDark = '#047857';
        giHighlight = '#34d399';
        accentColor = '#18181b'; // Checkered Black & Uniform
        beltColor = '#ffffff';   // White corps belt
        hairColor = '#881337';   // Burgundy Spiky
        hairHighlight = '#e11d48';
        eyeColor = '#e11d48';
      } else {
        if (lvl === 1) { // ZENITSU
          skinTone = '#fef08a';
          skinShadow = '#facc15';
          giColor = '#facc15';     // Yellow Triangle Pattern Haori
          giDark = '#b45309';
          giHighlight = '#fef08a';
          accentColor = '#ea580c';
          beltColor = '#ffffff';
          hairColor = '#fde047';   // Blonde with orange tips
          hairHighlight = '#fb923c';
          eyeColor = '#f59e0b';
        } else if (lvl === 2) { // INOSUKE
          skinTone = '#fed7aa';
          skinShadow = '#f97316';
          giColor = '#78716c';     // Boar Pelt Grey / Shirtless
          giDark = '#44403c';
          giHighlight = '#a8a29e';
          accentColor = '#38bdf8'; // Glowing blue boar eyes
          beltColor = '#44403c';
          hairColor = '#78716c';   // Boar mask head
          hairHighlight = '#cbd5e1';
          eyeColor = '#38bdf8';
          isShirtless = true;
        } else if (lvl === 3) { // SHINOBU
          skinTone = '#fecdd3';
          skinShadow = '#fb7185';
          giColor = '#f8fafc';     // Butterfly Wing White/Cyan/Pink
          giDark = '#cbd5e1';
          giHighlight = '#ffffff';
          accentColor = '#c084fc'; // Purple gradient
          beltColor = '#ffffff';
          hairColor = '#2e1065';   // Purple tips ponytail
          hairHighlight = '#a855f7';
          eyeColor = '#a855f7';
        } else if (lvl === 4) { // RENGOKU
          skinTone = '#fef08a';
          skinShadow = '#facc15';
          giColor = '#f97316';     // Flame Haori
          giDark = '#9a3412';
          giHighlight = '#fdba74';
          accentColor = '#dc2626'; // Burning red flames
          beltColor = '#ffffff';
          hairColor = '#facc15';   // Fiery red/yellow mane
          hairHighlight = '#ef4444';
          eyeColor = '#ea580c';
        } else if (lvl === 5) { // MUZAN KIBUTSUJI
          skinTone = '#e2e8f0';    // Pale Demon King
          skinShadow = '#94a3b8';
          giColor = '#09090b';     // Black Demon Suit
          giDark = '#020617';
          giHighlight = '#27272a';
          accentColor = '#881337'; // Crimson Tie & Red Eyes
          beltColor = '#4c0519';
          hairColor = '#020617';   // Black Wavy Hair / Fedora
          hairHighlight = '#475569';
          eyeColor = '#dc2626';    // Slit Demon Red Eyes
        }
      }
    } else {
      // DEFAULT SHADOW DOJO
      if (isPlayer) {
        skinTone = '#fed7aa';
        skinShadow = '#f97316';
        giColor = '#0b1b38';     // Deep Navy Blue
        giDark = '#050b18';
        giHighlight = '#1e3a8a';
        accentColor = '#00f0ff';
        beltColor = '#1d4ed8';
        hairColor = '#09152b';
        hairHighlight = '#1e40af';
        eyeColor = '#00f0ff';
      } else {
        if (lvl === 1) { // SHINOBI
          skinTone = '#fde047';
          skinShadow = '#ca8a04';
          giColor = '#070a14';
          giDark = '#020408';
          giHighlight = '#1e293b';
          accentColor = '#00f0ff';
          beltColor = '#0891b2';
          hairColor = '#0f172a';
          hairHighlight = '#38bdf8';
          eyeColor = '#00f0ff';
        } else if (lvl === 2) { // RONIN
          skinTone = '#fed7aa';
          skinShadow = '#f97316';
          giColor = '#1b382b';
          giDark = '#0c1e17';
          giHighlight = '#059669';
          accentColor = '#10b981';
          beltColor = '#78350f';
          hairColor = '#1c1917';
          hairHighlight = '#44403c';
          eyeColor = '#f5b942';
        } else if (lvl === 3) { // KUNOICHI
          skinTone = '#fecdd3';
          skinShadow = '#fb7185';
          giColor = '#881337';
          giDark = '#4c0519';
          giHighlight = '#be123c';
          accentColor = '#f43f5e';
          beltColor = '#ffd700';
          hairColor = '#18181b';
          hairHighlight = '#fb7185';
          eyeColor = '#fb7185';
        } else if (lvl === 4) { // WARLORD
          skinTone = '#d6b89c';
          skinShadow = '#a88365';
          giColor = '#18181b';
          giDark = '#09090b';
          giHighlight = '#3f3f46';
          accentColor = '#a855f7';
          beltColor = '#7c3aed';
          hairColor = '#27272a';
          hairHighlight = '#c084fc';
          eyeColor = '#c084fc';
        } else if (lvl === 5) { // TITAN SHADOW
          skinTone = '#cbd5e1';
          skinShadow = '#94a3b8';
          giColor = '#030712';
          giDark = '#000000';
          giHighlight = '#1f2937';
          accentColor = '#fbbf24';
          beltColor = '#f59e0b';
          hairColor = '#ffd700';
          hairHighlight = '#fef08a';
          eyeColor = '#facc15';
        }
      }
    }

    // Special Elemental Auras & Energy Cores
    if (theme.id === 'naruto') {
      if (isPlayer) {
        // Swirling Cyan Rasengan Chakra Aura
        ctx.save();
        const auraPulse = Math.sin(Date.now() * 0.008) * 6;
        const auraRot = (Date.now() * 0.004) % (Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18 + auraPulse;
        ctx.beginPath();
        ctx.arc(0, -48, 42 + auraPulse, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Chakra Spirals
        ctx.strokeStyle = 'rgba(14, 165, 233, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -48, 28 + auraPulse * 0.5, auraRot, auraRot + Math.PI * 1.4);
        ctx.stroke();
        ctx.restore();
      } else if (lvl === 5) {
        // Madara Susanoo Purple Flame Ribcage & Aura
        ctx.save();
        const auraPulse = Math.sin(Date.now() * 0.009) * 8;
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 24 + auraPulse;
        ctx.beginPath();
        ctx.arc(0, -50, 46 + auraPulse, 0, Math.PI * 2);
        ctx.stroke();
        // Susanoo Ethereal Ribs
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)';
        ctx.lineWidth = 3;
        [-20, 0, 20].forEach(ry => {
          ctx.beginPath();
          ctx.ellipse(0, -50 + ry, 36, 14, 0, 0, Math.PI);
          ctx.stroke();
        });
        ctx.restore();
      }
    } else if (theme.id === 'demon_slayer') {
      if (isPlayer) {
        // Tanjiro Water & Sun Dragon Swirls
        ctx.save();
        const breathAnim = Math.sin(Date.now() * 0.007) * 5;
        const breathRot = (Date.now() * 0.003) % (Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16 + breathAnim;
        ctx.beginPath();
        ctx.ellipse(0, -42, 38 + breathAnim, 48 + breathAnim, breathRot * 0.2, 0, Math.PI * 2);
        ctx.stroke();

        // Hinokami Kagura Sun Fire Spark
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -42, 26 + breathAnim * 0.4, -breathRot, -breathRot + Math.PI);
        ctx.stroke();
        ctx.restore();
      } else if (lvl === 5) {
        // Muzan Dark Demonic Blood Tendrils
        ctx.save();
        const auraPulse = Math.sin(Date.now() * 0.01) * 7;
        ctx.strokeStyle = 'rgba(225, 29, 72, 0.65)';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 22 + auraPulse;
        ctx.beginPath();
        ctx.arc(0, -46, 44 + auraPulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. BACK ARM (Underneath Torso)
    // ─────────────────────────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(-7, -70);
    ctx.rotate(j.lArmUpper);

    // Upper Arm Bicep / Shoulder Sleeve
    if (isShirtless) {
      // Sculpted Muscular Bicep (Inosuke)
      const armGrad = ctx.createLinearGradient(-5, 0, 5, 18);
      armGrad.addColorStop(0, skinTone);
      armGrad.addColorStop(1, skinShadow);
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.ellipse(0, 9, 6, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Fabric Gi Sleeve with Natural Folds & Volume
      const sleeveGrad = ctx.createLinearGradient(-6, 0, 6, 18);
      sleeveGrad.addColorStop(0, giHighlight);
      sleeveGrad.addColorStop(0.4, giColor);
      sleeveGrad.addColorStop(1, giDark);
      ctx.fillStyle = sleeveGrad;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(-7, 10, -5, 18);
      ctx.lineTo(5, 18);
      ctx.quadraticCurveTo(7, 10, 6, 0);
      ctx.closePath();
      ctx.fill();

      // Inner arm skin exposed at cuff
      ctx.fillStyle = skinTone;
      ctx.fillRect(-4, 16, 8, 6);
    }

    // Forearm & Hand Joint
    ctx.translate(0, 20);
    ctx.rotate(j.lArmLower);

    // Wrapped Forearm / Bracer
    const faGrad = ctx.createLinearGradient(-4, 0, 4, 18);
    faGrad.addColorStop(0, accentColor);
    faGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = faGrad;
    ctx.beginPath();
    ctx.moveTo(-4.5, 0);
    faGrad.addColorStop ? ctx.lineTo(4.5, 0) : null;
    ctx.lineTo(3.5, 18);
    ctx.lineTo(-3.5, 18);
    ctx.closePath();
    ctx.fill();

    // Bandage Wrap Ribs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    [4, 9, 14].forEach(wy => {
      ctx.beginPath();
      ctx.moveTo(-4, wy);
      ctx.lineTo(4, wy + 1);
      ctx.stroke();
    });

    // Back Hand Fist
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(0, 22, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ─────────────────────────────────────────────────────────────────────────
    // 2. BACK LEG (Underneath Hips)
    // ─────────────────────────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(-8, -32);
    ctx.rotate(j.lLegUpper);

    // Thigh (Hakama Pants / Quads)
    const thGrad = ctx.createLinearGradient(-7, 0, 7, 32);
    thGrad.addColorStop(0, giDark);
    thGrad.addColorStop(0.5, giColor);
    thGrad.addColorStop(1, giDark);
    ctx.fillStyle = thGrad;
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.quadraticCurveTo(-9, 16, -6, 32);
    ctx.lineTo(6, 32);
    ctx.quadraticCurveTo(8, 16, 7, 0);
    ctx.closePath();
    ctx.fill();

    // Calf & Footwear
    ctx.translate(0, 30);
    ctx.rotate(j.lLegLower);

    // Shin Guards / Wrapped Kyahan Leggings
    const legGrad = ctx.createLinearGradient(-5, 0, 5, 28);
    legGrad.addColorStop(0, '#090d18');
    legGrad.addColorStop(1, '#020408');
    ctx.fillStyle = legGrad;
    ctx.beginPath();
    ctx.moveTo(-5.5, 0);
    ctx.lineTo(5.5, 0);
    ctx.quadraticCurveTo(6, 14, 4.5, 26);
    ctx.lineTo(-4.5, 26);
    ctx.quadraticCurveTo(-6, 14, -5.5, 0);
    ctx.closePath();
    ctx.fill();

    // Leg Bandage Straps
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.2;
    [6, 13, 20].forEach(sy => {
      ctx.beginPath();
      ctx.moveTo(-5, sy);
      ctx.lineTo(5, sy + 1.5);
      ctx.stroke();
    });

    // Contoured Tabi Boot & Waraji Sandal
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-5, 25);
    ctx.lineTo(9, 25);
    ctx.lineTo(11, 31);
    ctx.lineTo(-6, 31);
    ctx.closePath();
    ctx.fill();
    // Sole
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6, 30, 17, 3);
    ctx.restore();

    // ─────────────────────────────────────────────────────────────────────────
    // 3. TORSO, CHEST & CLOTHING DRAPERY
    // ─────────────────────────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(0, -52);
    ctx.rotate(j.torsoAng);

    if (isShirtless) {
      // Inosuke Ripped Muscular Chest & 8-Pack Abs
      const chestGrad = ctx.createLinearGradient(-14, -28, 14, 20);
      chestGrad.addColorStop(0, skinTone);
      chestGrad.addColorStop(1, skinShadow);
      ctx.fillStyle = chestGrad;
      ctx.beginPath();
      ctx.moveTo(-14, -28);
      ctx.lineTo(14, -28);
      ctx.lineTo(10, 20);
      ctx.lineTo(-10, 20);
      ctx.closePath();
      ctx.fill();

      // Pectoral Muscle Definition
      ctx.strokeStyle = skinShadow;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-6, -18, 6, 0, Math.PI * 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(6, -18, 6, Math.PI * 0.1, Math.PI);
      ctx.stroke();

      // Six-Pack Abs Lines
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(0, 16);
      ctx.moveTo(-7, -6);
      ctx.lineTo(7, -6);
      ctx.moveTo(-6, 2);
      ctx.lineTo(6, 2);
      ctx.moveTo(-5, 10);
      ctx.lineTo(5, 10);
      ctx.stroke();

      // Fur Pelt Waist Wrap
      ctx.fillStyle = '#44403c';
      ctx.fillRect(-12, 14, 24, 10);
      ctx.fillStyle = '#78716c';
      [-10, -5, 0, 5, 10].forEach(fx => {
        ctx.beginPath();
        ctx.moveTo(fx - 2, 22);
        ctx.lineTo(fx, 28);
        ctx.lineTo(fx + 2, 22);
        ctx.fill();
      });
    } else {
      // Sculpted Martial Arts Gi / Haori Kimono
      const torsoGrad = ctx.createLinearGradient(-15, -28, 15, 20);
      torsoGrad.addColorStop(0, giHighlight);
      torsoGrad.addColorStop(0.35, giColor);
      torsoGrad.addColorStop(1, giDark);
      ctx.fillStyle = torsoGrad;
      ctx.beginPath();
      ctx.moveTo(-15, -28);
      ctx.lineTo(15, -28);
      ctx.lineTo(10, 20);
      ctx.lineTo(-10, 20);
      ctx.closePath();
      ctx.fill();

      // Left-Over-Right Kimono / Haori Lapels
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-14, -28);
      ctx.lineTo(3, 2);
      ctx.lineTo(-8, 20);
      ctx.stroke();

      // Theme-Specific Overlays
      if (theme.id === 'demon_slayer' && isPlayer) {
        // Tanjiro Green/Black Checkerboard Pattern
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-13, -26, 6, 8);
        ctx.fillRect(-1, -26, 6, 8);
        ctx.fillRect(-7, -18, 6, 8);
        ctx.fillRect(5, -18, 6, 8);
        ctx.fillRect(-13, -10, 6, 8);
        ctx.fillRect(-1, -10, 6, 8);

        // Inner Uniform Golden Brass Buttons
        ctx.fillStyle = '#fbbf24';
        [-16, -8, 0, 8].forEach(by => {
          ctx.beginPath();
          ctx.arc(0, by, 1.2, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (theme.id === 'naruto' && isPlayer) {
        // Naruto Black Shoulder Yoke & Uzumaki Red Spiral
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-15, -28, 30, 11);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -6, 5.5, 0, Math.PI * 1.85);
        ctx.stroke();

        // Tracksuit Metallic Zipper Line
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(0, 16);
        ctx.stroke();
      } else if (theme.id === 'naruto' && lvl === 4 && !isPlayer) {
        // Itachi Akatsuki Crimson Clouds
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(-4, -10, 5, 0, Math.PI * 2);
        ctx.arc(2, -12, 6, 0, Math.PI * 2);
        ctx.arc(7, -9, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (theme.id === 'demon_slayer' && lvl === 4 && !isPlayer) {
        // Rengoku Blazing Flame Haori Hem
        ctx.fillStyle = '#dc2626';
        [-12, -6, 0, 6, 12].forEach(fx => {
          ctx.beginPath();
          ctx.moveTo(fx - 3, 20);
          ctx.lineTo(fx, 10);
          ctx.lineTo(fx + 3, 20);
          ctx.fill();
        });
      }

      // Waist Belt (Obi Sash) with Texture & Tied Knot
      const obiGrad = ctx.createLinearGradient(-11, 14, 11, 22);
      obiGrad.addColorStop(0, beltColor);
      obiGrad.addColorStop(1, '#020617');
      ctx.fillStyle = obiGrad;
      ctx.fillRect(-11, 14, 22, 8);
      // Obi Knot & Dangling Sash Tails
      ctx.fillStyle = beltColor;
      ctx.fillRect(2, 13, 6, 10);
      ctx.beginPath();
      ctx.moveTo(3, 22);
      ctx.lineTo(5, 34);
      ctx.lineTo(8, 32);
      ctx.lineTo(6, 22);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();

    // ─────────────────────────────────────────────────────────────────────────
    // 4. FRONT LEG
    // ─────────────────────────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(6, -32);
    ctx.rotate(j.rLegUpper);

    // Front Thigh & Muscle Bulge
    const fThGrad = ctx.createLinearGradient(-7, 0, 7, 32);
    fThGrad.addColorStop(0, giHighlight);
    fThGrad.addColorStop(0.4, giColor);
    fThGrad.addColorStop(1, giDark);
    ctx.fillStyle = fThGrad;
    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.quadraticCurveTo(-9, 16, -6, 32);
    ctx.lineTo(6, 32);
    ctx.quadraticCurveTo(9, 16, 7, 0);
    ctx.closePath();
    ctx.fill();

    // Front Calf & Shin Guard
    ctx.translate(0, 30);
    ctx.rotate(j.rLegLower);

    const fLegGrad = ctx.createLinearGradient(-5, 0, 5, 28);
    fLegGrad.addColorStop(0, '#090d18');
    fLegGrad.addColorStop(1, '#020408');
    ctx.fillStyle = fLegGrad;
    ctx.beginPath();
    ctx.moveTo(-5.5, 0);
    ctx.lineTo(5.5, 0);
    ctx.quadraticCurveTo(6.5, 14, 4.5, 26);
    ctx.lineTo(-4.5, 26);
    ctx.quadraticCurveTo(-6.5, 14, -5.5, 0);
    ctx.closePath();
    ctx.fill();

    // Leg Bandages
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 1.3;
    [6, 13, 20].forEach(sy => {
      ctx.beginPath();
      ctx.moveTo(-5, sy);
      ctx.lineTo(5, sy + 1.5);
      ctx.stroke();
    });

    // Front Tabi Boot & Sandal
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-5, 25);
    ctx.lineTo(10, 25);
    ctx.lineTo(12, 31);
    ctx.lineTo(-6, 31);
    ctx.closePath();
    ctx.fill();
    // Sole
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-6, 30, 18, 3);
    ctx.restore();

    // ─────────────────────────────────────────────────────────────────────────
    // 5. ANIME HEAD, SCULPTED JAW, HAIR & EXPRESSIVE FACE
    // ─────────────────────────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(0, -84);
    ctx.rotate(j.headAng);

    // Anatomical Neck with Sternocleidomastoid Tendons
    const neckGrad = ctx.createLinearGradient(-5, 0, 5, 10);
    neckGrad.addColorStop(0, skinTone);
    neckGrad.addColorStop(1, skinShadow);
    ctx.fillStyle = neckGrad;
    ctx.fillRect(-4.5, 0, 9, 9);

    // Flat vector head shared with the thumbnail fighters.
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.ellipse(0, -8, 7.5, 10.5, 0, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    // Compact dark cap and the same bright visor band used in the thumbnail.
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    ctx.moveTo(-7.5, -14);
    ctx.quadraticCurveTo(-7, -22, 0, -24);
    ctx.quadraticCurveTo(7, -22, 7.5, -14);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = theme.id === 'naruto' ? '#38bdf8' : eyeColor;
    ctx.fillRect(-8.5, -15, 17, 3);
    ctx.fillStyle = '#eefaff';
    ctx.fillRect(isPlayer ? 3 : -4, -14.5, 1.5, 1.5);

    ctx.restore();

    // ─────────────────────────────────────────────────────────────────────────
    // 6. FRONT ARM & WEAPON
    // ─────────────────────────────────────────────────────────────────────────
    ctx.save();
    ctx.translate(6, -70);
    ctx.rotate(j.rArmUpper);

    // Front Bicep & Sleeve
    if (isShirtless) {
      const armGrad = ctx.createLinearGradient(-5, 0, 5, 18);
      armGrad.addColorStop(0, skinTone);
      armGrad.addColorStop(1, skinShadow);
      ctx.fillStyle = armGrad;
      ctx.beginPath();
      ctx.ellipse(0, 9, 6, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const sleeveGrad = ctx.createLinearGradient(-6, 0, 6, 18);
      sleeveGrad.addColorStop(0, giHighlight);
      sleeveGrad.addColorStop(0.4, giColor);
      sleeveGrad.addColorStop(1, giDark);
      ctx.fillStyle = sleeveGrad;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.quadraticCurveTo(-7, 10, -5, 18);
      ctx.lineTo(5, 18);
      ctx.quadraticCurveTo(7, 10, 6, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = skinTone;
      ctx.fillRect(-4, 16, 8, 6);
    }

    // Front Forearm & Weapon Mount
    ctx.translate(0, 20);
    ctx.rotate(j.rArmLower);

    // Forearm Armor Vambrace / Bandage
    const fFaGrad = ctx.createLinearGradient(-4, 0, 4, 18);
    fFaGrad.addColorStop(0, accentColor);
    fFaGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = fFaGrad;
    ctx.beginPath();
    ctx.moveTo(-4.5, 0);
    ctx.lineTo(4.5, 0);
    ctx.lineTo(3.5, 18);
    ctx.lineTo(-3.5, 18);
    ctx.closePath();
    ctx.fill();

    // Forearm Bandage Ribs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 1;
    [4, 9, 14].forEach(wy => {
      ctx.beginPath();
      ctx.moveTo(-4, wy);
      ctx.lineTo(4, wy + 1);
      ctx.stroke();
    });

    // Front Hand Knuckles & Grip
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(0, 21, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Weapon Attached to Front Hand
    ctx.save();
    ctx.translate(0, 20);
    ctx.rotate(j.weaponAng);
    drawHandcraftedWeapon(ctx, f.weapon, f.attackPhase === 1);
    ctx.restore();

    ctx.restore();

    ctx.restore();
  }

  // ── Realistic Weapon Visual Renderer with Metallic Sheen & Hamon ───────────
  function drawHandcraftedWeapon(ctx, weapon, isSlashing) {
    const wId = weapon.id;

    if (wId === 'katana') {
      // 1. Tsuka (Handle) with Ito Diamond Cord Wrap
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-3, -4, 6, 20);
      // Diamond Samegawa Wraps
      ctx.fillStyle = '#f5b942';
      [-1, 4, 9, 14].forEach(ty => {
        ctx.beginPath();
        ctx.moveTo(0, ty);
        ctx.lineTo(2.5, ty + 2);
        ctx.lineTo(0, ty + 4);
        ctx.lineTo(-2.5, ty + 2);
        ctx.closePath();
        ctx.fill();
      });

      // 2. Brass Habaki & Ornate Tsuba (Handguard)
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-7, -7, 14, 3.5);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-3, -10, 6, 3);

      // 3. Curved Forged Steel Blade with Hamon Wave Temper Line
      const bladeGrad = ctx.createLinearGradient(-3, -10, 3, -82);
      bladeGrad.addColorStop(0, '#ffffff');
      bladeGrad.addColorStop(0.3, '#e2e8f0');
      bladeGrad.addColorStop(0.7, '#94a3b8');
      bladeGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(-2.5, -10);
      ctx.lineTo(2.5, -10);
      ctx.lineTo(1, -84);
      ctx.lineTo(-3.5, -78);
      ctx.closePath();
      ctx.fill();

      // Sharp Edge Hamon Temper Glow
      ctx.strokeStyle = weapon.trailColor || '#00ff9d';
      ctx.lineWidth = isSlashing ? 3 : 1.5;
      if (isSlashing) {
        ctx.shadowColor = weapon.trailColor;
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      ctx.moveTo(2.5, -10);
      ctx.quadraticCurveTo(3.5, -45, 1, -84);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (wId === 'kusarigama') {
      // 1. Hardwood Kama Sickle Handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-3.5, -2, 7, 34);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-4.5, -4, 9, 3);

      // 2. Razor Sickle Blade
      const bladeGrad = ctx.createLinearGradient(0, -2, 38, -50);
      bladeGrad.addColorStop(0, '#ffffff');
      bladeGrad.addColorStop(0.6, '#94a3b8');
      bladeGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.quadraticCurveTo(32, -26, 38, -52);
      ctx.quadraticCurveTo(20, -30, 0, -12);
      ctx.closePath();
      ctx.fill();

      // 3. Interlocking Steel Chain & Iron Weighted Ball (Fundō)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 32);
      ctx.quadraticCurveTo(18, 45, 12, 65);
      ctx.stroke();
      // Iron Ball
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(12, 68, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (wId === 'nunchaku') {
      // Octagonal Hardwood Sticks with Metal Swivel Caps
      ctx.fillStyle = '#92400e';
      ctx.fillRect(-3.5, -30, 7, 28);
      ctx.fillRect(9, -22, 7, 28);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-3.5, -32, 7, 3);
      ctx.fillRect(9, -24, 7, 3);

      // Interlocking Steel Swivel Chain
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.quadraticCurveTo(6, -42, 12.5, -24);
      ctx.stroke();
    } else if (wId === 'staff') {
      // Polished Naginata Hardwood Shaft with Golden Collars
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-3, -90, 6, 180);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-4.5, -92, 9, 5);
      ctx.fillRect(-4.5, -30, 9, 3);

      // Polished Naginata Curved Blade
      const bladeGrad = ctx.createLinearGradient(-4, -92, 0, -135);
      bladeGrad.addColorStop(0, '#ffffff');
      bladeGrad.addColorStop(0.5, '#cbd5e1');
      bladeGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = bladeGrad;
      ctx.beginPath();
      ctx.moveTo(-4, -92);
      ctx.lineTo(4, -92);
      ctx.quadraticCurveTo(8, -115, 0, -136);
      ctx.quadraticCurveTo(-4, -115, -4, -92);
      ctx.closePath();
      ctx.fill();

      // Crimson Decorative Tassel
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-3, -88);
      ctx.lineTo(-9, -76);
      ctx.lineTo(-5, -76);
      ctx.closePath();
      ctx.fill();
    } else if (wId === 'sai') {
      // Leather Grip
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-3, 0, 6, 18);
      ctx.fillStyle = '#f5b942';
      ctx.beginPath();
      ctx.arc(0, 18, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Polished Chrome Monouchi Center Spear
      const saiGrad = ctx.createLinearGradient(-3, 0, 3, -56);
      saiGrad.addColorStop(0, '#ffffff');
      saiGrad.addColorStop(0.5, '#94a3b8');
      saiGrad.addColorStop(1, '#ffffff');
      ctx.fillStyle = saiGrad;
      ctx.fillRect(-2.5, -56, 5, 56);

      // Curved Yoku Side Guards
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-11, -18);
      ctx.quadraticCurveTo(-11, 0, 0, 0);
      ctx.quadraticCurveTo(11, 0, 11, -18);
      ctx.stroke();
    } else if (wId === 'hammer') {
      // Reinforced Wood/Iron Haft
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(-3.5, -85, 7, 130);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-4.5, -82, 9, 4);

      // Heavy Bevelled Forged Iron Hammer Block
      const hammerGrad = ctx.createLinearGradient(-22, -100, 22, -70);
      hammerGrad.addColorStop(0, '#71717a');
      hammerGrad.addColorStop(0.5, '#18181b');
      hammerGrad.addColorStop(1, '#09090b');
      ctx.fillStyle = hammerGrad;
      ctx.fillRect(-22, -100, 44, 30);

      // Bevelled Steel Rim
      ctx.strokeStyle = weapon.trailColor || '#f5b942';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-22, -100, 44, 30);
    }
  }

  // ── Traditional Japanese & Anime Sceneries ─────────────────────────────────
  const LANDSCAPES = {
    // ⛩️ Dojo Sceneries
    fuji_sakura: {
      id: 'fuji_sakura',
      name: 'MT. FUJI & SAKURA PAGODA',
      shortName: 'FUJI PAGODA',
      skyGradient: ['#0d021a', '#240638', '#4a1150', '#85215c', '#d64d54', '#f5b942'],
      sunColor: '#f5b942',
      sunGlow: 'rgba(245, 185, 66, 0.45)',
      sunRadius: 90,
      sunY: 220
    },
    arashiyama_bamboo: {
      id: 'arashiyama_bamboo',
      name: 'ARASHIYAMA BAMBOO GROVE',
      shortName: 'BAMBOO GROVE',
      skyGradient: ['#02120e', '#052b22', '#0a4f40', '#0e705b', '#1ab08f'],
      sunColor: '#00ffcc',
      sunGlow: 'rgba(0, 255, 204, 0.35)',
      sunRadius: 85,
      sunY: 200
    },
    kyoto_autumn: {
      id: 'kyoto_autumn',
      name: 'KYOTO AUTUMN MOMIJI SHRINE',
      shortName: 'KYOTO SHRINE',
      skyGradient: ['#120303', '#2b0707', '#541212', '#8c2518', '#c94a20', '#f39c12'],
      sunColor: '#ff4757',
      sunGlow: 'rgba(255, 71, 87, 0.4)',
      sunRadius: 95,
      sunY: 210
    },
    thunder_castle: {
      id: 'thunder_castle',
      name: 'FEUDAL CASTLE TENSHU',
      shortName: 'CASTLE TENSHU',
      skyGradient: ['#07030e', '#140822', '#240b36', '#3b124d', '#180726', '#09020f'],
      sunColor: '#e056fd',
      sunGlow: 'rgba(224, 86, 253, 0.35)',
      sunRadius: 80,
      sunY: 190
    },
    moonlit_waterfall: {
      id: 'moonlit_waterfall',
      name: 'SACRED CELESTIAL WATERFALL',
      shortName: 'WATERFALL',
      skyGradient: ['#01040f', '#060f26', '#102244', '#1e3a60', '#0a152e'],
      sunColor: '#ffffff',
      sunGlow: 'rgba(255, 255, 255, 0.65)',
      sunRadius: 90,
      sunY: 160
    },

    // 🍃 Naruto Sceneries
    naruto_leaf: {
      id: 'naruto_leaf',
      name: 'HOKAGE ROCK & LEAF VILLAGE',
      shortName: 'LEAF VILLAGE',
      skyGradient: ['#022c22', '#064e3b', '#047857', '#10b981', '#34d399', '#fde047'],
      sunColor: '#facc15',
      sunGlow: 'rgba(250, 204, 21, 0.45)',
      sunRadius: 95,
      sunY: 210
    },
    naruto_chunin: {
      id: 'naruto_chunin',
      name: 'CHUNIN EXAM COLISEUM ARENA',
      shortName: 'CHUNIN ARENA',
      skyGradient: ['#1c1917', '#292524', '#44403c', '#78716c', '#d97706', '#fef08a'],
      sunColor: '#f59e0b',
      sunGlow: 'rgba(245, 158, 11, 0.4)',
      sunRadius: 90,
      sunY: 200
    },
    naruto_valley: {
      id: 'naruto_valley',
      name: 'VALLEY OF THE END STATUES',
      shortName: 'VALLEY OF END',
      skyGradient: ['#0f172a', '#1e293b', '#334155', '#475569', '#38bdf8', '#fbbf24'],
      sunColor: '#38bdf8',
      sunGlow: 'rgba(56, 189, 248, 0.5)',
      sunRadius: 90,
      sunY: 180
    },
    naruto_rain: {
      id: 'naruto_rain',
      name: 'HIDDEN RAIN VILLAGE TOWERS',
      shortName: 'RAIN VILLAGE',
      skyGradient: ['#09090b', '#18181b', '#27272a', '#3f3f46', '#52525b'],
      sunColor: '#c084fc',
      sunGlow: 'rgba(192, 132, 252, 0.35)',
      sunRadius: 80,
      sunY: 190
    },
    naruto_divine: {
      id: 'naruto_divine',
      name: 'INFINITE TSUKUYOMI BLOOD MOON',
      shortName: 'BLOOD MOON',
      skyGradient: ['#18000a', '#3b0718', '#5b0a26', '#881337', '#be123c'],
      sunColor: '#ef4444',
      sunGlow: 'rgba(239, 68, 68, 0.65)',
      sunRadius: 105,
      sunY: 190
    },

    // ⚔️ Demon Slayer Sceneries
    ds_wisteria: {
      id: 'ds_wisteria',
      name: 'MOUNT SAGIRI WISTERIA FOREST',
      shortName: 'WISTERIA FOREST',
      skyGradient: ['#1e0b36', '#2e1065', '#4c1d95', '#6d28d9', '#a855f7', '#f472b6'],
      sunColor: '#e879f9',
      sunGlow: 'rgba(232, 121, 249, 0.5)',
      sunRadius: 90,
      sunY: 200
    },
    ds_infinity: {
      id: 'ds_infinity',
      name: 'DIMENSIONAL INFINITY CASTLE',
      shortName: 'INFINITY CASTLE',
      skyGradient: ['#0f0702', '#291005', '#4d1e08', '#78350f', '#b45309'],
      sunColor: '#f59e0b',
      sunGlow: 'rgba(245, 158, 11, 0.4)',
      sunRadius: 85,
      sunY: 190
    },
    ds_train: {
      id: 'ds_train',
      name: 'MUGEN TRAIN MOONLIT TRACKS',
      shortName: 'MUGEN TRAIN',
      skyGradient: ['#020617', '#0f172a', '#1e293b', '#334155', '#475569'],
      sunColor: '#f8fafc',
      sunGlow: 'rgba(248, 250, 252, 0.6)',
      sunRadius: 90,
      sunY: 170
    },
    ds_butterfly: {
      id: 'ds_butterfly',
      name: 'BUTTERFLY MANSION ESTATE',
      shortName: 'BUTTERFLY ESTATE',
      skyGradient: ['#042f2e', '#0d5c56', '#115e59', '#14b8a6', '#5eead4', '#fbcfe8'],
      sunColor: '#2dd4bf',
      sunGlow: 'rgba(45, 212, 191, 0.45)',
      sunRadius: 90,
      sunY: 200
    },
    ds_spider: {
      id: 'ds_spider',
      name: 'MOUNT NATAGUMO WEB WOODS',
      shortName: 'NATAGUMO WOODS',
      skyGradient: ['#180315', '#2d0826', '#4a0e3f', '#701a75', '#a21caf', '#e11d48'],
      sunColor: '#f43f5e',
      sunGlow: 'rgba(244, 63, 94, 0.5)',
      sunRadius: 95,
      sunY: 190
    }
  };

  function cycleLandscape(direction = 1) {
    const keys = Object.keys(LANDSCAPES);
    const idx = keys.indexOf(currentLandscapeKey);
    const nextIdx = (idx + direction + keys.length) % keys.length;
    currentLandscapeKey = keys[nextIdx];
    if (btnSelectArena) btnSelectArena.textContent = `${LANDSCAPES[currentLandscapeKey]?.shortName || 'ARENA'} ▾`;
    showAnnouncer(`SCENERY: ${LANDSCAPES[currentLandscapeKey].name}`, 'gold', 1000);
  }

  // ── Landmark Rendering Subroutines ─────────────────────────────────────────

  function drawMountFuji(ctx, cw, ch, gY = 540) {
    const isPortrait = ch > cw || cw < 600;
    const fujiX = cw * 0.48;
    const fujiBaseY = gY;
    const peakY = gY - (isPortrait ? 260 : 320);
    const halfWidth = Math.min(cw * 0.8, 360);

    ctx.fillStyle = '#1c0e2a';
    ctx.beginPath();
    ctx.moveTo(0, gY);
    ctx.quadraticCurveTo(cw * 0.25, gY - 120, cw * 0.5, gY - 50);
    ctx.quadraticCurveTo(cw * 0.75, gY - 110, cw, gY);
    ctx.fill();

    const fujiGrad = ctx.createLinearGradient(fujiX, peakY, fujiX, fujiBaseY);
    fujiGrad.addColorStop(0, '#2e153e');
    fujiGrad.addColorStop(0.5, '#220e30');
    fujiGrad.addColorStop(1, '#0e0516');

    ctx.fillStyle = fujiGrad;
    ctx.beginPath();
    ctx.moveTo(fujiX - 45, peakY);
    ctx.quadraticCurveTo(fujiX - 120, gY - 180, fujiX - halfWidth, fujiBaseY);
    ctx.lineTo(fujiX + halfWidth, fujiBaseY);
    ctx.quadraticCurveTo(fujiX + 120, gY - 180, fujiX + 45, peakY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(fujiX - 45, peakY);
    ctx.quadraticCurveTo(fujiX - 60, peakY + 55, fujiX - 80, peakY + 90);
    ctx.lineTo(fujiX - 55, peakY + 80);
    ctx.lineTo(fujiX - 30, peakY + 105);
    ctx.lineTo(fujiX - 10, peakY + 75);
    ctx.lineTo(fujiX + 15, peakY + 110);
    ctx.lineTo(fujiX + 35, peakY + 80);
    ctx.lineTo(fujiX + 60, peakY + 100);
    ctx.quadraticCurveTo(fujiX + 55, peakY + 55, fujiX + 45, peakY);
    ctx.closePath();
    ctx.fill();
  }

  function drawPagoda(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#1e1a29';
    ctx.fillRect(-34, -14, 68, 14);

    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const tierY = -14 - i * 42;
      const tierW = 54 - i * 6;
      const roofW = 76 - i * 8;

      ctx.fillStyle = '#b71540';
      ctx.fillRect(-tierW / 2, tierY - 24, tierW, 24);

      ctx.fillStyle = '#0a0512';
      ctx.fillRect(-tierW / 2, tierY - 24, 4, 24);
      ctx.fillRect(tierW / 2 - 4, tierY - 24, 4, 24);
      ctx.fillRect(-6, tierY - 18, 12, 18);

      ctx.fillStyle = '#0a0d18';
      ctx.beginPath();
      ctx.moveTo(-roofW / 2 - 12, tierY - 24);
      ctx.quadraticCurveTo(-roofW / 2, tierY - 28, 0, tierY - 38);
      ctx.quadraticCurveTo(roofW / 2, tierY - 28, roofW / 2 + 12, tierY - 24);
      ctx.lineTo(roofW / 2, tierY - 24);
      ctx.quadraticCurveTo(0, tierY - 34, -roofW / 2, tierY - 24);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawToriiGate(ctx, x, y, scale = 1, color = '#d63031') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const w = 110;
    const h = 135;

    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h, 12, h);
    ctx.fillRect(w / 2 - 12, -h, 12, h);
    ctx.fillRect(-w / 2 - 20, -h + 28, w + 40, 10);

    ctx.beginPath();
    ctx.moveTo(-w / 2 - 28, -h - 8);
    ctx.quadraticCurveTo(0, -h - 4, w / 2 + 28, -h - 8);
    ctx.lineTo(w / 2 + 24, -h + 8);
    ctx.quadraticCurveTo(0, -h + 10, -w / 2 - 24, -h + 8);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawCherryBlossomTree(ctx, x, y, ts) {
    ctx.save();
    ctx.translate(x, y);

    const sway = Math.sin(ts * 0.0015) * 4;

    ctx.fillStyle = '#2d1810';
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.quadraticCurveTo(-22, -90, -48 + sway * 0.5, -180);
    ctx.quadraticCurveTo(-60 + sway, -240, -110 + sway, -280);
    ctx.lineTo(-90 + sway, -285);
    ctx.quadraticCurveTo(-45 + sway, -230, -32, -170);
    ctx.quadraticCurveTo(-8, -80, 12, 0);
    ctx.closePath();
    ctx.fill();

    const blossoms = [
      { bx: -120 + sway, by: -290, r: 42, c: '#ff76a6' },
      { bx: -85 + sway, by: -315, r: 48, c: '#ff9ebb' },
      { bx: -45 + sway, by: -270, r: 44, c: '#ff76a6' },
      { bx: 25 + sway, by: -220, r: 38, c: '#ffb8d1' }
    ];

    blossoms.forEach(b => {
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.arc(b.bx, b.by, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawBambooGrove(ctx, cw, ch, ts, gY = 540) {
    const stalkCount = Math.min(14, Math.max(8, Math.floor(cw / 30)));
    for (let i = 0; i < stalkCount; i++) {
      const bx = (cw / stalkCount) * i + ((i % 3) * 10);
      const sway = Math.sin(ts * 0.0018 + i * 0.8) * 6;
      const isForeground = i % 2 === 0;

      ctx.fillStyle = isForeground ? '#08332c' : '#041f1a';
      const stalkWidth = isForeground ? 11 : 7;
      ctx.fillRect(bx - stalkWidth / 2 + sway * 0.4, 40, stalkWidth, gY - 40);

      ctx.fillStyle = isForeground ? '#00f0ff' : '#0a4f44';
      for (let j = 80; j < gY; j += 48) {
        ctx.fillRect(bx - stalkWidth / 2 - 2 + sway * 0.4, j, stalkWidth + 4, 3);
      }
    }
  }

  function drawJapaneseBridge(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, 70, 130, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    ctx.restore();
  }

  function drawMapleTree(ctx, x, y, ts) {
    ctx.save();
    ctx.translate(x, y);
    const sway = Math.sin(ts * 0.002) * 5;

    ctx.fillStyle = '#261109';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(-10, -90, -35 + sway * 0.5, -170);
    ctx.quadraticCurveTo(-50 + sway, -230, -90 + sway, -260);
    ctx.lineTo(-75 + sway, -266);
    ctx.quadraticCurveTo(-30 + sway, -220, -18, -160);
    ctx.quadraticCurveTo(5, -80, 14, 0);
    ctx.closePath();
    ctx.fill();

    const maplePuffs = [
      { mx: -100 + sway, my: -270, r: 42, c: '#c0392b' },
      { mx: -65 + sway, my: -295, r: 46, c: '#e67e22' },
      { mx: -25 + sway, my: -250, r: 40, c: '#d35400' }
    ];

    maplePuffs.forEach(m => {
      ctx.fillStyle = m.c;
      ctx.beginPath();
      ctx.arc(m.mx, m.my, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawKyotoShrine(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#1e1a24';
    ctx.fillRect(-80, -18, 160, 18);

    ctx.fillStyle = '#c0392b';
    for (let c = -60; c <= 60; c += 30) {
      ctx.fillRect(c - 3, -110, 6, 92);
    }

    ctx.fillStyle = '#0a0d18';
    ctx.beginPath();
    ctx.moveTo(-105, -110);
    ctx.quadraticCurveTo(0, -135, 105, -110);
    ctx.lineTo(95, -118);
    ctx.quadraticCurveTo(0, -145, -95, -118);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawCastleFortress(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#181124';
    ctx.beginPath();
    ctx.moveTo(-90, 0);
    ctx.lineTo(-65, -80);
    ctx.lineTo(65, -80);
    ctx.lineTo(90, 0);
    ctx.closePath();
    ctx.fill();

    for (let t = 0; t < 3; t++) {
      const ty = -80 - t * 65;
      const tw = 110 - t * 24;
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-tw / 2, ty - 45, tw, 45);
    }

    ctx.restore();
  }

  function drawWaterfallCliff(ctx, x, y, ts) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-45, -280, 90, 280);

    const fallGrad = ctx.createLinearGradient(0, -280, 0, 0);
    fallGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    fallGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.8)');
    fallGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

    ctx.fillStyle = fallGrad;
    ctx.fillRect(-20, -280, 40, 280);

    ctx.restore();
  }

  function drawBonsaiPine(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.quadraticCurveTo(15, -70, -20, -140);
    ctx.quadraticCurveTo(-45, -190, 10, -230);
    ctx.lineTo(20, -225);
    ctx.quadraticCurveTo(-30, -185, -8, -135);
    ctx.quadraticCurveTo(22, -65, 8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 🍃 Naruto Hokage Monument Landmark
  function drawHokageRock(ctx, cw, ch, gY) {
    ctx.save();
    const rockBase = gY;
    const rockTop = gY - 300;

    // Mountain Rock Formation
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.moveTo(0, rockBase);
    ctx.lineTo(0, rockTop + 40);
    ctx.lineTo(cw * 0.2, rockTop);
    ctx.lineTo(cw * 0.8, rockTop);
    ctx.lineTo(cw, rockTop + 60);
    ctx.lineTo(cw, rockBase);
    ctx.closePath();
    ctx.fill();

    // Carved Hokage Faces (Monument Silhouettes)
    const faces = [
      { x: cw * 0.22, name: '1st' },
      { x: cw * 0.40, name: '2nd' },
      { x: cw * 0.58, name: '3rd' },
      { x: cw * 0.76, name: '4th' }
    ];

    faces.forEach(f => {
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.arc(f.x, rockTop + 80, 32, 0, Math.PI * 2);
      ctx.fill();

      // Hair silhouette
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(f.x, rockTop + 68, 30, Math.PI, Math.PI * 2);
      ctx.fill();
    });

    // Village Red Tile Roofs
    ctx.fillStyle = '#b91c1c';
    for (let r = 20; r < cw - 40; r += 70) {
      ctx.fillRect(r, rockBase - 25, 45, 25);
    }

    ctx.restore();
  }

  // ⚔️ Demon Slayer Wisteria Canopy Landmark
  function drawWisteriaCanopy(ctx, cw, ch, gY, ts) {
    ctx.save();
    const branchCount = Math.floor(cw / 60);
    for (let b = 0; b < branchCount; b++) {
      const bx = b * 60 + 20;
      const sway = Math.sin(ts * 0.002 + b) * 8;

      // Night Tree Branch
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(bx - 4, 0, 8, 80);

      // Cascading Purple Wisteria Flower Chains (Fujinohana)
      for (let f = 0; f < 5; f++) {
        const fy = 80 + f * 34;
        const col = f % 2 === 0 ? '#c084fc' : '#e879f9';
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(bx + sway * (f / 5), fy, 14 - f * 1.5, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();
  }

  function drawStoneLantern(ctx, x, y, scale = 1, glowColor = '#f5b942') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, -8, 28, 8);
    ctx.fillRect(-7, -32, 14, 24);
    ctx.fillRect(-16, -38, 32, 6);

    ctx.fillStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 16;
    ctx.fillRect(-10, -54, 20, 16);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-22, -54);
    ctx.lineTo(0, -68);
    ctx.lineTo(22, -54);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawBrazier(ctx, x, y, ts) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(0, -45);
    ctx.lineTo(16, 0);
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -48, 16, 0, Math.PI);
    ctx.fill();

    const flicker = Math.sin(ts * 0.02 + x) * 4;
    ctx.fillStyle = '#ff3838';
    ctx.shadowColor = '#ff3838';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(-10, -48);
    ctx.quadraticCurveTo(0, -75 + flicker, 0, -82 + flicker);
    ctx.quadraticCurveTo(8, -65, 10, -48);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  function drawStars(ctx, cw, ch) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 45; i++) {
      const sx = (i * 123.4) % cw;
      const sy = (i * 87.6) % 360;
      const size = (i % 3 === 0) ? 2 : 1;
      ctx.fillRect(sx, sy, size, size);
    }
  }

  function drawStormLightning(ctx, cw, ch, ts) {
    if (Math.sin(ts * 0.004) > 0.96) {
      ctx.fillStyle = 'rgba(230, 200, 255, 0.25)';
      ctx.fillRect(0, 0, cw, ch);

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(cw * 0.65, 0);
      ctx.lineTo(cw * 0.62, 80);
      ctx.lineTo(cw * 0.68, 130);
      ctx.lineTo(cw * 0.64, 220);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  function drawDojoFloor(ctx, cw, ch, theme, gY = 540) {
    const floorGrad = ctx.createLinearGradient(0, gY, 0, ch);
    floorGrad.addColorStop(0, '#090d18');
    floorGrad.addColorStop(0.3, '#05070c');
    floorGrad.addColorStop(1, '#020306');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, gY, cw, Math.max(0, ch - gY));

    ctx.strokeStyle = theme.sunGlow || 'rgba(245, 185, 66, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, gY);
    ctx.lineTo(cw, gY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let px = 60; px < cw; px += 100) {
      ctx.beginPath();
      ctx.moveTo(px, gY);
      ctx.lineTo(px - 25, ch);
      ctx.stroke();
    }
  }

  function drawJapaneseLandscape(landscapeKey, ts) {
    const theme = LANDSCAPES[landscapeKey] || LANDSCAPES.fuji_sakura;
    const isPortrait = ch > cw || cw < 600;
    const gY = player ? player.groundY : (isPortrait ? ch - 190 : ch - 160);
    const sunY = isPortrait ? ch * 0.22 : theme.sunY;
    const lScale = isPortrait ? 0.82 : 1.0;

    // 1. Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, gY);
    const step = 1 / (theme.skyGradient.length - 1);
    theme.skyGradient.forEach((col, i) => {
      sky.addColorStop(Math.min(1, i * step), col);
    });
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, cw, ch);

    // 2. Glowing Sun or Moon Disc
    ctx.save();
    ctx.fillStyle = theme.sunGlow;
    ctx.beginPath();
    ctx.arc(cw / 2, sunY, theme.sunRadius * (isPortrait ? 1.25 : 1.5), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.sunColor;
    ctx.shadowColor = theme.sunGlow;
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(cw / 2, sunY, theme.sunRadius * (isPortrait ? 0.88 : 1), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Render Landmark Layers
    if (landscapeKey === 'fuji_sakura') {
      drawMountFuji(ctx, cw, ch, gY);
      drawPagoda(ctx, cw * (isPortrait ? 0.12 : 0.16), gY, lScale * 1.05);
      drawToriiGate(ctx, cw * (isPortrait ? 0.86 : 0.82), gY, lScale * 0.95, '#d63031');
      drawCherryBlossomTree(ctx, cw * (isPortrait ? 0.92 : 0.88), gY, ts);
      drawStoneLantern(ctx, cw * (isPortrait ? 0.38 : 0.32), gY, lScale * 0.85);
    } else if (landscapeKey === 'arashiyama_bamboo') {
      drawBambooGrove(ctx, cw, ch, ts, gY);
      drawJapaneseBridge(ctx, cw * 0.22, gY, lScale);
      drawToriiGate(ctx, cw * 0.78, gY, lScale * 0.85, '#1e293b');
      drawStoneLantern(ctx, cw * 0.84, gY, lScale * 0.9, '#00ffcc');
    } else if (landscapeKey === 'kyoto_autumn') {
      drawKyotoShrine(ctx, cw * 0.18, gY, lScale * 0.95);
      drawMapleTree(ctx, cw * 0.82, gY, ts);
      drawStoneLantern(ctx, cw * 0.65, gY, lScale * 0.85, '#ff7675');
    } else if (landscapeKey === 'thunder_castle') {
      drawStormLightning(ctx, cw, ch, ts);
      drawCastleFortress(ctx, cw * (isPortrait ? 0.72 : 0.76), gY, lScale * 1.1);
      drawBrazier(ctx, isPortrait ? 28 : 80, gY, ts);
      drawBrazier(ctx, isPortrait ? cw - 28 : cw - 80, gY, ts);
    } else if (landscapeKey === 'moonlit_waterfall') {
      drawStars(ctx, cw, ch);
      drawWaterfallCliff(ctx, cw * 0.22, gY, ts);
      drawBonsaiPine(ctx, cw * 0.78, gY);
      drawToriiGate(ctx, cw * 0.28, gY - 220, lScale * 0.6, '#d63031');
      drawStoneLantern(ctx, cw * 0.86, gY, lScale * 0.9, '#00f0ff');
    } else if (landscapeKey === 'naruto_leaf') {
      drawHokageRock(ctx, cw, ch, gY);
    } else if (landscapeKey === 'ds_wisteria') {
      drawWisteriaCanopy(ctx, cw, ch, gY, ts);
      drawStoneLantern(ctx, cw * 0.25, gY, lScale, '#e879f9');
      drawStoneLantern(ctx, cw * 0.75, gY, lScale, '#e879f9');
    } else {
      // General atmospheric scenery
      drawStars(ctx, cw, ch);
      drawToriiGate(ctx, cw * 0.8, gY, lScale * 0.9, '#d63031');
      drawStoneLantern(ctx, cw * 0.25, gY, lScale * 0.85, '#f5b942');
    }

    // 4. Dojo Floor Ground
    drawDojoFloor(ctx, cw, ch, theme, gY);
  }

  // ── 2D Fighting Arena Rendering ────────────────────────────────────────────
  function render(ts) {
    ctx.save();
    ctx.clearRect(0, 0, cw, ch);

    // Screen Shake
    if (screenShake > 0) {
      const sx = (Math.random() - 0.5) * screenShake * 14;
      const sy = (Math.random() - 0.5) * screenShake * 14;
      ctx.translate(sx, sy);
    }

    // 1. Traditional Japanese / Anime Arena Background
    drawJapaneseLandscape(currentLandscapeKey, ts);

    // 2. Ambient Sakura / Leaf / Wisteria Petals
    ambientPetals.forEach(pt => {
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle);
      ctx.fillStyle = pt.color;
      if (pt.type === 'leaf') {
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size * 1.5, pt.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 1.6);
      }
      ctx.restore();
    });

    // 3. Draw Cartoon Anime Martial Arts Warriors
    drawCartoonFighter(player);
    drawCartoonFighter(enemy);

    // 5. Draw Impact Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 6. Start Screen Banner
    if (gameState === STATES.MENU) {
      const isPortrait = ch > cw || cw < 600;
      const theme = getActiveTheme();
      ctx.save();
      ctx.textAlign = 'center';
      
      const titleSize = isPortrait ? Math.min(22, Math.max(16, cw * 0.055)) : 38;
      ctx.font = `900 ${titleSize}px 'Orbitron', monospace`;
      ctx.fillStyle = '#f5b942';
      ctx.shadowColor = 'rgba(245, 185, 66, 0.8)';
      ctx.shadowBlur = 24;
      ctx.fillText(`SHADOW FIGHT: ${theme.name}`, cw / 2, ch * 0.38);

      ctx.font = `600 ${isPortrait ? 11 : 14}px 'Orbitron', monospace`;
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 0;
      ctx.fillText(`${theme.badge} • 2D 1v1 ANIME DUEL`, cw / 2, ch * 0.45);

      const pulse = 0.6 + 0.4 * Math.sin(ts * 0.005);
      ctx.font = `600 ${isPortrait ? 13 : 15}px 'Inter', sans-serif`;
      ctx.fillStyle = `rgba(238, 241, 245, ${pulse})`;
      ctx.fillText('Tap / Click or Space to Enter Arena', cw / 2, ch * 0.58);

      if (!isPortrait) {
        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.fillStyle = '#8893a7';
        ctx.fillText('A/D: Move • W: Jump • S: Crouch • J: Punch • K: Kick • L/Space: Weapon • T: Theme • Shift: Roll', cw / 2, ch * 0.72);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // ── Sidebar Master Ladder Rendering ────────────────────────────────────────
  function renderSidebarMasters() {
    if (!elSidebarLevelsList) return;
    elSidebarLevelsList.innerHTML = '';

    const theme = getActiveTheme();
    const masters = theme.masters;

    if (elSidebarUnlockedPill) {
      elSidebarUnlockedPill.textContent = `${unlockedMasterLevel}/5`;
    }

    masters.forEach((m, idx) => {
      const isUnlocked = m.level <= unlockedMasterLevel;
      const isCurrent = !isEndlessDojo && m.level === currentMasterIdx + 1;

      const btn = document.createElement('button');
      btn.className = `master-tile-btn ${isCurrent ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`;

      let actionHtml = '';
      if (isCurrent) {
        actionHtml = '<span class="master-action active">DUEL</span>';
      } else if (isUnlocked) {
        actionHtml = '<span class="master-action play">FIGHT</span>';
      } else {
        actionHtml = '<span class="master-action locked">🔒</span>';
      }

      btn.innerHTML = `
        <div class="master-num">0${m.level}</div>
        <div class="master-info">
          <span class="master-title">${m.name}</span>
          <span class="master-sub">◆ ${m.title}</span>
        </div>
        ${actionHtml}
      `;

      if (isUnlocked && !isCurrent) {
        btn.addEventListener('click', () => {
          isEndlessDojo = false;
          currentMasterIdx = idx;
          startMatch();
        });
      }

      elSidebarLevelsList.appendChild(btn);
    });
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

  // ── Sizing and Resize ──────────────────────────────────────────────────────
  function resize() {
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    cw = rect.width;
    ch = rect.height;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.scale(dpr, dpr);

    const isPortrait = ch > cw || cw < 600;
    const groundY = isPortrait ? ch - 190 : ch - 160;
    if (player) {
      player.groundY = groundY;
      if (player.isGrounded) player.y = groundY;
    }
    if (enemy) {
      enemy.groundY = groundY;
      if (enemy.isGrounded) enemy.y = groundY;
    }
  }
  window.addEventListener('resize', resize);

  function togglePause(forceState) {
    if (gameState === STATES.MENU || gameState === STATES.MATCH_OVER) return;
    if (forceState !== undefined) {
      gameState = forceState ? STATES.PAUSED : STATES.FIGHTING;
    } else {
      gameState = gameState === STATES.PAUSED ? STATES.FIGHTING : STATES.PAUSED;
    }
    if (elPauseModal) {
      if (gameState === STATES.PAUSED) elPauseModal.classList.add('active');
      else elPauseModal.classList.remove('active');
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (gameWrapper.requestFullscreen) gameWrapper.requestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    setTimeout(resize, 100);
  }

  // ── Ignition ───────────────────────────────────────────────────────────────
  setupInput();
  initAmbientParticles();
  resize();
  setUniverseTheme(currentThemeKey);
  updateHUD();
  updateWeaponUI();
  renderSidebarMasters();
  requestAnimationFrame(gameLoop);

})();
