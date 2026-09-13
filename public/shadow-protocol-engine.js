/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SHADOW FIGHT: ARENA OF SHADOWS — 2D 1v1 Procedural Silhouette Combat Engine
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
  const elHudEnemyName = document.getElementById('hud-enemy-name');
  const elHudPlayerWeapon = document.getElementById('hud-player-weapon');
  const elHudEnemyWeapon = document.getElementById('hud-enemy-weapon');
  const elPlayerRoundDots = document.getElementById('player-round-dots');
  const elEnemyRoundDots = document.getElementById('enemy-round-dots');
  const elAnnouncer = document.getElementById('fight-announcer');

  // Sidebar elements
  const elSidebarLevelsList = document.getElementById('sidebar-levels-list');
  const btnSidebarEndless = document.getElementById('btn-sidebar-endless');
  const elSidebarUnlockedPill = document.getElementById('sidebar-unlocked-pill');
  const elSidebarWeaponActive = document.getElementById('sidebar-weapon-active');
  const weaponSelectorGrid = document.getElementById('weapon-selector-grid');

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

  // ── Weapons Definition ─────────────────────────────────────────────────────
  const WEAPONS = {
    katana: {
      id: 'katana',
      name: 'SHADOW KATANA',
      shortName: 'KATANA',
      damage: 18,
      range: 85,
      speed: 1.15,
      trailColor: '#00ff9d',
      desc: 'Precision Slashes & Lunges'
    },
    kusarigama: {
      id: 'kusarigama',
      name: 'DUAL KUSARIGAMA',
      shortName: 'KUSARIGAMA',
      damage: 16,
      range: 120,
      speed: 1.0,
      trailColor: '#00f0ff',
      desc: 'Wide Whirling Chain Sweeps'
    },
    nunchaku: {
      id: 'nunchaku',
      name: 'TWIN NUNCHAKU',
      shortName: 'NUNCHAKU',
      damage: 12,
      range: 65,
      speed: 1.45,
      trailColor: '#ff0055',
      desc: 'Ultra Rapid Multi-Hit Flurries'
    },
    staff: {
      id: 'staff',
      name: 'BLOOD NAGINATA',
      shortName: 'NAGINATA',
      damage: 22,
      range: 135,
      speed: 0.9,
      trailColor: '#f5b942',
      desc: 'Long Polearm Thrusts & Vaults'
    },
    sai: {
      id: 'sai',
      name: 'TWIN CRIMSON SAI',
      shortName: 'DUAL SAI',
      damage: 14,
      range: 70,
      speed: 1.5,
      trailColor: '#ff2a85',
      desc: 'High Speed Dual Stabs & Parries'
    },
    hammer: {
      id: 'hammer',
      name: 'ONI WAR CLUB',
      shortName: 'WAR HAMMER',
      damage: 28,
      range: 110,
      speed: 0.75,
      trailColor: '#b55fe6',
      desc: 'Crushing Heavy Impact & Earth Shakes'
    }
  };

  const WEAPON_KEYS = ['katana', 'kusarigama', 'nunchaku', 'staff', 'sai', 'hammer'];
  let selectedWeaponKey = 'katana';

  // ── Shadow Masters Ladder ──────────────────────────────────────────────────
  const MASTERS = [
    {
      level: 1,
      name: 'SHINOBI',
      title: 'Apprentice of the Blade',
      weaponKey: 'katana',
      maxHp: 100,
      aiAggro: 0.45,
      color: '#00f0ff',
      bgTheme: 'fuji_sakura'
    },
    {
      level: 2,
      name: 'RONIN',
      title: 'Exiled Naginata Master',
      weaponKey: 'staff',
      maxHp: 130,
      aiAggro: 0.6,
      color: '#f5b942',
      bgTheme: 'arashiyama_bamboo'
    },
    {
      level: 3,
      name: 'KUNOICHI',
      title: 'Shadow Lotus Duelist',
      weaponKey: 'nunchaku',
      maxHp: 150,
      aiAggro: 0.75,
      color: '#ff0055',
      bgTheme: 'kyoto_autumn'
    },
    {
      level: 4,
      name: 'WARLORD',
      title: 'Chained Reaper of Shadows',
      weaponKey: 'kusarigama',
      maxHp: 180,
      aiAggro: 0.88,
      color: '#bd00ff',
      bgTheme: 'thunder_castle'
    },
    {
      level: 5,
      name: 'TITAN SHADOW',
      title: 'Supreme Gatekeeper of Darkness',
      weaponKey: 'katana',
      maxHp: 240,
      aiAggro: 0.98,
      color: '#ffd700',
      bgTheme: 'moonlit_waterfall'
    }
  ];

  let currentMasterIdx = 0;
  let unlockedMasterLevel = Number(localStorage.getItem('shadow-fight-unlocked')) || 1;
  let isEndlessDojo = false;
  let endlessWins = 0;
  let currentLandscapeKey = 'fuji_sakura';

  // ── Web Audio Synthesizer (Martial Arts SFX & Taiko Synth BGM) ──────────────
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

      // Oriental Taiko & Synthwave Battle sequence (136 BPM)
      const taikoFreqs = [70, 70, 110, 70, 85, 70, 140, 70];
      const melodyFreqs = [220, 261.63, 293.66, 349.23, 392.00, 440.00];
      const stepDuration = 0.11;

      const step = () => {
        if (!this.isPlayingBGM || !this.ctx) return;
        try {
          const now = this.ctx.currentTime;
          const s = this.bgmStep;

          // Taiko Drum
          const drumOsc = this.ctx.createOscillator();
          const drumGain = this.ctx.createGain();
          drumOsc.type = 'triangle';
          drumOsc.frequency.setValueAtTime(taikoFreqs[s % taikoFreqs.length], now);
          drumOsc.frequency.exponentialRampToValueAtTime(30, now + stepDuration * 0.9);

          drumGain.gain.setValueAtTime(0.25, now);
          drumGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 0.9);

          drumOsc.connect(drumGain);
          drumGain.connect(this.bgm);
          drumOsc.start(now);
          drumOsc.stop(now + stepDuration);

          // Bamboo Flute synth melody
          if (s % 2 === 0) {
            const fluteOsc = this.ctx.createOscillator();
            const fluteGain = this.ctx.createGain();
            fluteOsc.type = 'sine';
            const mIndex = Math.floor(s / 2) % melodyFreqs.length;
            fluteOsc.frequency.setValueAtTime(melodyFreqs[mIndex], now);

            fluteGain.gain.setValueAtTime(0.09, now);
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

  // ── Particles, Sparks & Petals ─────────────────────────────────────────────
  const particles = [];
  const ambientPetals = [];

  for (let i = 0; i < 40; i++) {
    ambientPetals.push({
      x: Math.random() * 1280,
      y: Math.random() * 720,
      vx: 30 + Math.random() * 40,
      vy: 20 + Math.random() * 30,
      size: 2.5 + Math.random() * 3,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 2,
      color: Math.random() < 0.5 ? 'rgba(255, 100, 150, 0.7)' : 'rgba(245, 185, 66, 0.6)'
    });
  }

  // ── Fighter Object Factory ─────────────────────────────────────────────────
  function createFighter(isPlayer, startX, weaponKey) {
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
      weapon: WEAPONS[weaponKey] || WEAPONS.katana,
      state: 'IDLE', // IDLE, WALK_FWD, WALK_BWD, JUMP, CROUCH, PUNCH, KICK, WEAPON, BLOCK, ROLL, HIT, KNOCKED
      stateTimer: 0,
      stateDuration: 0,
      isGrounded: true,
      isBlocking: false,
      isInvincible: false,
      attackPhase: 0, // 0 = startup, 1 = active hitbox, 2 = recovery
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
    // Unlocked if player reached Level 3+ on the ladder, or in Round 3 of a match, or in Endless survival
    return unlockedMasterLevel >= 3 || currentMasterIdx >= 2 || currentRound >= 3 || isEndlessDojo || totalRoundsCompleted >= 2;
  }

  function updateWeaponUI() {
    const unlocked = isWeaponSwitchUnlocked();
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

    if (weaponSelectorGrid) {
      const btns = weaponSelectorGrid.querySelectorAll('.weapon-btn');
      btns.forEach(b => {
        const wKey = b.dataset.weapon;
        const isCurrent = wKey === selectedWeaponKey;
        b.classList.toggle('active', isCurrent);
        b.classList.toggle('locked-weapon', !unlocked && !isCurrent);

        const descEl = b.querySelector('.weapon-desc');
        if (descEl) {
          if (!unlocked && !isCurrent) {
            descEl.innerHTML = '<span style="color:#ff3366;">🔒 Unlocks Lvl 3</span>';
          } else {
            const keyNum = WEAPON_KEYS.indexOf(wKey) + 1;
            descEl.textContent = `${WEAPONS[wKey].desc.split(' ')[0]} [${keyNum}]`;
          }
        }
      });
    }
  }

  function setPlayerWeapon(key, force = false) {
    if (!WEAPONS[key]) return;
    if (!force && !isWeaponSwitchUnlocked() && key !== selectedWeaponKey) {
      audio.playLockDenied();
      showAnnouncer('🔒 UNLOCKS AT LEVEL 3!', 'red', 1000);
      return;
    }

    selectedWeaponKey = key;
    player.weapon = WEAPONS[key];
    updateWeaponUI();

    createHitSparks(player.x, player.y - 40, player.weapon.trailColor, 12);
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

    // Touch Buttons
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
        if (isEndlessDojo) {
          endlessWins++;
          currentMasterIdx = (endlessWins) % MASTERS.length;
          startMatch();
        } else if (currentMasterIdx < MASTERS.length - 1) {
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

    const masterConfig = MASTERS[currentMasterIdx];
    currentLandscapeKey = masterConfig.bgTheme || 'fuji_sakura';
    player = createFighter(true, 420, selectedWeaponKey);
    enemy = createFighter(false, 860, masterConfig.weaponKey);
    enemy.hp = masterConfig.maxHp;
    enemy.maxHp = masterConfig.maxHp;

    if (elHudEnemyName) elHudEnemyName.textContent = masterConfig.name;
    if (elHudEnemyWeapon) elHudEnemyWeapon.textContent = `[${enemy.weapon.shortName}]`;
    if (elHudPlayerWeapon) elHudPlayerWeapon.textContent = `[${player.weapon.shortName}]`;

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
    player.x = 420;
    player.y = 540;
    player.hp = player.maxHp;
    player.state = 'IDLE';

    const masterConfig = MASTERS[currentMasterIdx];
    enemy.x = 860;
    enemy.y = 540;
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
    const facingDefender = (attacker.facing === 1 && defender.x > attacker.x) || (attacker.facing === -1 && defender.x < attacker.x);

    if (facingDefender && dist <= attackReach + 30) {
      attacker.hitConnected = true;

      // Check if defender is blocking (holding backward away from attacker)
      const isDefending = (defender.state === 'BLOCK') || (defender.facing === 1 && keys['KeyA']) || (defender.facing === -1 && keys['KeyD']);

      if (isDefending && hitType !== 'KICK') {
        // Blocked!
        const blockedDamage = Math.max(2, Math.floor(baseDamage * 0.15));
        defender.hp -= blockedDamage;
        audio.playBlock();
        spawnSparkBurst((attacker.x + defender.x) / 2, defender.y - 45, '#fff', 8);
        screenShake = 0.4;
      } else {
        // Clean Hit!
        defender.hp -= baseDamage;
        if (hitType === 'WEAPON') audio.playBladeClash();
        else if (hitType === 'KICK') audio.playHitKick();
        else audio.playHitPunch();

        // Blood / Ink Spark Burst
        const sparkColor = attacker.isPlayer ? attacker.weapon.trailColor : '#ff0055';
        spawnSparkBurst(defender.x, defender.y - 50, sparkColor, 18);

        // Hit Stun / Knockdown
        defender.state = baseDamage >= 18 ? 'KNOCKED' : 'HIT';
        defender.stateTimer = 0;
        defender.stateDuration = baseDamage >= 18 ? 0.55 : 0.26;
        defender.vx = attacker.facing * (baseDamage >= 18 ? 260 : 120);

        // Hit-stop impact freeze
        hitStopTimer = 0.045;
        screenShake = baseDamage >= 18 ? 1.4 : 0.8;

        if (attacker.isPlayer) {
          currentCombo++;
          maxComboThisMatch = Math.max(maxComboThisMatch, currentCombo);
        }
      }

      updateHUD();

      // Check K.O.
      if (defender.hp <= 0) {
        defender.hp = 0;
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
    slowMoTimer = 1.2; // Dramatic slow-mo finish
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

    if (currentMasterIdx + 1 >= unlockedMasterLevel) {
      unlockedMasterLevel = Math.min(5, currentMasterIdx + 2);
      localStorage.setItem('shadow-fight-unlocked', unlockedMasterLevel);
    }

    if (elLcTitle) elLcTitle.textContent = 'VICTORY!';
    if (elLcSubtitle) elLcSubtitle.textContent = `${MASTERS[currentMasterIdx].name} Defeated. Honor Maintained.`;
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
    if (elLcSubtitle) elLcSubtitle.textContent = 'You have fallen in the shadows. Train and challenge again.';
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
    const master = MASTERS[currentMasterIdx];

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
      // Fast reaction cooldown based on master rank
      enemy.aiActionTimer = (0.45 - master.aiAggro * 0.28) + Math.random() * 0.25;

      if (dist > 105) {
        // Aggressively march forward towards player
        enemy.state = 'WALK_FWD';
        enemy.stateDuration = 0.5;
        enemy.stateTimer = 0;
        enemy.vx = enemy.facing * (160 + master.aiAggro * 60);
      } else if (dist <= 65 && Math.random() < 0.25) {
        // Quick backstep
        enemy.state = 'WALK_BWD';
        enemy.stateDuration = 0.3;
        enemy.stateTimer = 0;
        enemy.vx = -enemy.facing * 140;
      } else {
        // Strike with weapon or martial arts combo!
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

    // Sustain movement during walk state
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

      // Only damp deceleration if not actively walking or rolling
      if (f.state !== 'WALK_FWD' && f.state !== 'WALK_BWD' && f.state !== 'ROLL') {
        f.vx *= Math.pow(0.005, effectiveDt);
      }

      // Clamp inside arena walls
      f.x = Math.max(120, Math.min(cw - 120, f.x));

      // State Timer & Attack Phases
      f.stateTimer += effectiveDt;
      if (f.state === 'PUNCH' || f.state === 'KICK' || f.state === 'WEAPON') {
        const p = f.stateTimer / f.stateDuration;
        if (p < 0.25) f.attackPhase = 0;
        else if (p < 0.65) f.attackPhase = 1; // Active hitbox!
        else f.attackPhase = 2;
      }

      if (f.stateTimer >= f.stateDuration && f.state !== 'IDLE' && f.state !== 'JUMP') {
        f.state = 'IDLE';
        f.isInvincible = false;
        f.hitConnected = false;
      }

      animateFighterJoints(f, effectiveDt);
    });

    // 5. Check Hitboxes
    if (gameState === STATES.FIGHTING) {
      checkAttackHit(player, enemy);
      checkAttackHit(enemy, player);
    }

    // 6. Round Timer
    if (gameState === STATES.FIGHTING) {
      roundTime -= effectiveDt * 0.7;
      if (roundTime <= 0) {
        roundTime = 0;
        triggerRoundEnd(player.hp >= enemy.hp ? 'PLAYER' : 'ENEMY');
      }
      if (elFightTimer) elFightTimer.textContent = String(Math.ceil(roundTime));
    }

    // 7. Update Particles & Ambient Petals
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * effectiveDt;
      p.y += p.vy * effectiveDt;
      p.life -= effectiveDt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    ambientPetals.forEach(pt => {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.angle += pt.spin * dt;
      if (pt.x > cw + 20) pt.x = -20;
      if (pt.y > ch + 20) pt.y = -20;
    });

    screenShake = Math.max(0, screenShake - dt * 4);
  }

  function updateHUD() {
    if (elPlayerHpBar) elPlayerHpBar.style.width = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100)) + '%';
    if (elEnemyHpBar) elEnemyHpBar.style.width = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100)) + '%';
  }

  // ── Cartoon Martial Arts Warrior & Unique Master Outfits Renderer ───────────
  function drawCartoonFighter(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.facing, 1); // Face opponent

    const j = f.joints;
    const isPlayer = f.isPlayer;
    const master = isPlayer ? null : MASTERS[currentMasterIdx];
    const lvl = isPlayer ? 0 : master.level;

    // Palette Configuration per Fighter / Master
    let skinTone = '#ffd5aa';
    let giColor = '#0b1b38';      // Deep Rich Navy Blue Gi
    let accentColor = '#2563eb';  // Royal Navy Blue Lapels & Wrist Wraps
    let beltColor = '#1d4ed8';    // Navy Blue Sash Belt
    let hairColor = '#070f22';    // Midnight Navy Hair
    let eyeColor = '#38bdf8';     // Luminous Cyan/Ice Blue Eyes

    if (!isPlayer) {
      if (lvl === 1) { // 01 SHINOBI - Stealth Shadow Ninja
        skinTone = '#f3cfad';
        giColor = '#0f172a';
        accentColor = '#00f0ff';
        beltColor = '#0284c7';
        hairColor = '#090a0f';
        eyeColor = '#38bdf8';
      } else if (lvl === 2) { // 02 RONIN - Wandering Monk & Bamboo Master
        skinTone = '#eec59a';
        giColor = '#1e3a2b';
        accentColor = '#f59e0b';
        beltColor = '#78350f';
        hairColor = '#451a03';
        eyeColor = '#fbbf24';
      } else if (lvl === 3) { // 03 KUNOICHI - Crimson Lotus Assassin
        skinTone = '#ffe5d0';
        giColor = '#881337';
        accentColor = '#f43f5e';
        beltColor = '#fb7185';
        hairColor = '#be123c';
        eyeColor = '#ff007f';
      } else if (lvl === 4) { // 04 WARLORD - Armored Samurai Daimyo
        skinTone = '#d6b89c';
        giColor = '#18181b';
        accentColor = '#a855f7';
        beltColor = '#7c3aed';
        hairColor = '#27272a';
        eyeColor = '#c084fc';
      } else if (lvl === 5) { // 05 TITAN SHADOW - Celestial Oni Demigod
        skinTone = '#cbd5e1';
        giColor = '#030712';
        accentColor = '#fbbf24';
        beltColor = '#f59e0b';
        hairColor = '#ffd700';
        eyeColor = '#facc15';
      }
    }

    // Level 5 Titan Demonic Golden Aura
    if (!isPlayer && lvl === 5) {
      ctx.save();
      const auraPulse = Math.sin(Date.now() * 0.008) * 6;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 18 + auraPulse;
      ctx.beginPath();
      ctx.arc(0, -45, 42 + auraPulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 1. Back Arm (Under Torso)
    ctx.save();
    ctx.translate(-5, -68);
    ctx.rotate(j.lArmUpper);

    // Upper Arm (Gi Sleeve / Armor Pauldron)
    ctx.fillStyle = giColor;
    ctx.fillRect(-4, 0, 9, 14);
    if (!isPlayer && (lvl === 4 || lvl === 5)) {
      // Armored Shoulder Guard (Sode)
      ctx.fillStyle = lvl === 5 ? '#ffd700' : '#3f3f46';
      ctx.fillRect(-7, -2, 14, 8);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-7, -2, 14, 8);
    }
    ctx.fillStyle = skinTone;
    ctx.fillRect(-3.5, 14, 8, 12);

    // Forearm & Hand
    ctx.translate(0, 24);
    ctx.rotate(j.lArmLower);
    ctx.fillStyle = accentColor;
    ctx.fillRect(-3, 0, 7, 16); // Wrist wraps / Bracers
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(0, 19, 5.5, 0, Math.PI * 2); // Fist
    ctx.fill();
    ctx.restore();

    // 2. Back Leg (Under Hips)
    ctx.save();
    ctx.translate(-7, -32);
    ctx.rotate(j.lLegUpper);
    // Thigh
    ctx.fillStyle = giColor;
    ctx.fillRect(-5, 0, 10, 30);
    // Shin & Boots
    ctx.translate(0, 28);
    ctx.rotate(j.lLegLower);
    ctx.fillStyle = !isPlayer && lvl === 2 ? '#78350f' : '#0a0d18';
    ctx.fillRect(-4, 0, 8, 26);
    ctx.fillStyle = accentColor;
    ctx.fillRect(-4, 20, 11, 8); // Tabi / Sandal
    ctx.restore();

    // 3. Torso, Clothing Layers & Chest
    ctx.save();
    ctx.translate(0, -52);
    ctx.rotate(j.torsoAng);

    // Base Combat Gi / Armor
    ctx.fillStyle = giColor;
    ctx.beginPath();
    ctx.moveTo(-13, -28);
    ctx.lineTo(13, -28);
    ctx.lineTo(9, 20);
    ctx.lineTo(-9, 20);
    ctx.closePath();
    ctx.fill();

    // Custom Chest Clothing / Armor Overlays
    if (lvl === 2) {
      // Ronin: Exposed chest with prayer bead necklace
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.moveTo(-10, -28);
      ctx.lineTo(10, -28);
      ctx.lineTo(0, -6);
      ctx.closePath();
      ctx.fill();
      // Prayer beads (Juzu)
      ctx.fillStyle = '#78350f';
      for (let b = -8; b <= 8; b += 4) {
        ctx.beginPath();
        ctx.arc(b, -20 + Math.abs(b) * 0.8, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (lvl === 3) {
      // Kunoichi: Fitted combat kimono wrap with gold floral trim
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-13, -28);
      ctx.lineTo(4, 5);
      ctx.lineTo(-9, 20);
      ctx.stroke();
      ctx.fillStyle = '#ff7185';
      ctx.fillRect(-6, 2, 12, 10);
    } else if (lvl === 4) {
      // Warlord: Segmented iron chestplate (Do)
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-11, -26, 22, 28);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.strokeRect(-11, -26, 22, 28);
      // Segmented plating lines
      ctx.strokeStyle = '#52525b';
      [-16, -6, 4].forEach(py => {
        ctx.beginPath();
        ctx.moveTo(-11, py);
        ctx.lineTo(11, py);
        ctx.stroke();
      });
    } else if (lvl === 5) {
      // Titan Shadow: Celestial Golden Dragon Breastplate
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-12, -26, 24, 28);
      ctx.strokeStyle = '#fffbeb';
      ctx.lineWidth = 2;
      ctx.strokeRect(-12, -26, 24, 28);
      // Demonic red jewel core
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -12, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Shinobi / Player: Gi Lapel Collar
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-13, -28);
      ctx.lineTo(3, 10);
      ctx.lineTo(-9, 20);
      ctx.stroke();
      // Exposed V-Neck
      ctx.fillStyle = skinTone;
      ctx.beginPath();
      ctx.moveTo(-7, -28);
      ctx.lineTo(7, -28);
      ctx.lineTo(0, -10);
      ctx.closePath();
      ctx.fill();
    }

    // Belt Sash & Knot
    ctx.fillStyle = beltColor;
    ctx.fillRect(-10, 12, 20, 6);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-2, 11, 4, 8); // Belt buckle

    // Hanging sash ribbons
    ctx.fillStyle = beltColor;
    ctx.fillRect(4, 18, 4, 16);
    ctx.fillRect(9, 18, 3.5, 12);

    // ── Head, Unique Hats, Helmets & Masks ──
    ctx.save();
    ctx.translate(0, -38);
    ctx.rotate(j.headAng);

    // Head Base
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Distinct Headwear per Master
    if (lvl === 2) {
      // Ronin: Conical Bamboo Straw Hat (Kasa)
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-28, -2);
      ctx.lineTo(0, -22);
      ctx.lineTo(28, -2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Hat chin cord
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-12, -2);
      ctx.lineTo(0, 10);
      ctx.lineTo(12, -2);
      ctx.stroke();
      // Wild brown samurai sideburns
      ctx.fillStyle = hairColor;
      ctx.fillRect(-13, 0, 4, 12);
    } else if (lvl === 3) {
      // Kunoichi: High Crimson Ponytail with Golden Comb & Kitsune Face Mask
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.moveTo(-12, -6);
      ctx.lineTo(-24, -28);
      ctx.quadraticCurveTo(-15, -34, -4, -20);
      ctx.lineTo(12, -6);
      ctx.closePath();
      ctx.fill();
      // Golden Hairpin
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-18, -26, 12, 3);
      // Kitsune half-mask on cheek
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(7, 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(5, 0, 4, 2);
    } else if (lvl === 4) {
      // Warlord: Horned Samurai Kabuto Battle Helmet & Crescent Moon Crest
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(0, -4, 14, Math.PI, 0);
      ctx.lineTo(14, 4);
      ctx.lineTo(-14, 4);
      ctx.closePath();
      ctx.fill();
      // Golden Crescent Moon Crest (Maedate)
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, -18, 12, Math.PI * 1.2, Math.PI * 1.8);
      ctx.lineTo(0, -12);
      ctx.closePath();
      ctx.fill();
      // Iron Menpo Face Mask
      ctx.fillStyle = '#27272a';
      ctx.beginPath();
      ctx.arc(0, 3, 11, 0, Math.PI);
      ctx.fill();
    } else if (lvl === 5) {
      // Titan Shadow: Demonic Golden Oni Horns & Blazing Crown
      ctx.fillStyle = '#ffd700';
      // Left Horn
      ctx.beginPath();
      ctx.moveTo(-8, -10);
      ctx.quadraticCurveTo(-20, -22, -18, -32);
      ctx.lineTo(-12, -28);
      ctx.quadraticCurveTo(-6, -18, -4, -10);
      ctx.closePath();
      ctx.fill();
      // Right Horn
      ctx.beginPath();
      ctx.moveTo(8, -10);
      ctx.quadraticCurveTo(20, -22, 18, -32);
      ctx.lineTo(12, -28);
      ctx.quadraticCurveTo(6, -18, 4, -10);
      ctx.closePath();
      ctx.fill();
      // Spiky Golden Flame Hair
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-12, -6);
      ctx.lineTo(-16, -18);
      ctx.lineTo(-8, -14);
      ctx.lineTo(0, -26);
      ctx.lineTo(8, -14);
      ctx.lineTo(16, -18);
      ctx.lineTo(12, -6);
      ctx.closePath();
      ctx.fill();
    } else {
      // Shinobi / Player: Spiky Anime Hair & Fluttering Headband
      ctx.fillStyle = giColor;
      ctx.beginPath();
      ctx.arc(0, 2, 11, 0, Math.PI); // Half mask
      ctx.fill();

      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.moveTo(-13, -4);
      ctx.lineTo(-18, -14);
      ctx.lineTo(-9, -16);
      ctx.lineTo(-11, -26);
      ctx.lineTo(-2, -20);
      ctx.lineTo(4, -28);
      ctx.lineTo(8, -18);
      ctx.lineTo(16, -20);
      ctx.lineTo(13, -6);
      ctx.closePath();
      ctx.fill();

      // Headband
      ctx.fillStyle = accentColor;
      ctx.fillRect(-12, -8, 24, 5);

      // Fluttering Ribbons
      const ribbonWave = Math.sin(Date.now() * 0.015) * 4;
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(-12, -6);
      ctx.quadraticCurveTo(-24, -8 + ribbonWave, -36, -2 + ribbonWave);
      ctx.lineTo(-34, 2 + ribbonWave);
      ctx.quadraticCurveTo(-22, -3 + ribbonWave, -12, -3);
      ctx.closePath();
      ctx.fill();
    }

    // Glowing Anime Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(3, -5, 6, 3.5);
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 6;
    ctx.fillRect(5, -5, 3.5, 3.5); // Iris
    ctx.fillStyle = '#000000';
    ctx.fillRect(6, -4.5, 2, 2.5); // Pupil
    ctx.shadowBlur = 0;

    // Eyebrow
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(2, -7);
    ctx.lineTo(10, -5);
    ctx.stroke();

    ctx.restore(); // Restore Head
    ctx.restore(); // Restore Torso

    // 4. Front Leg (Over Torso)
    ctx.save();
    ctx.translate(6, -32);
    ctx.rotate(j.rLegUpper);
    // Thigh
    ctx.fillStyle = giColor;
    ctx.fillRect(-5, 0, 11, 30);
    // Shin & Boot
    ctx.translate(0, 28);
    ctx.rotate(j.rLegLower);
    ctx.fillStyle = !isPlayer && lvl === 2 ? '#78350f' : (!isPlayer && (lvl === 4 || lvl === 5) ? '#27272a' : '#0a0d18');
    ctx.fillRect(-4.5, 0, 9, 26);
    ctx.fillStyle = accentColor;
    ctx.fillRect(-4.5, 20, 13, 8); // Tabi / Boot
    ctx.restore();

    // 5. Front Arm & Handheld Weapon
    ctx.save();
    ctx.translate(7, -68);
    ctx.rotate(j.rArmUpper);
    // Upper Arm
    ctx.fillStyle = giColor;
    ctx.fillRect(-4, 0, 9, 14);
    if (!isPlayer && (lvl === 4 || lvl === 5)) {
      // Front Armored Shoulder Plate
      ctx.fillStyle = lvl === 5 ? '#ffd700' : '#3f3f46';
      ctx.fillRect(-6, -2, 13, 8);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-6, -2, 13, 8);
    }
    ctx.fillStyle = skinTone;
    ctx.fillRect(-3.5, 14, 8, 12);
    // Forearm & Hand
    ctx.translate(0, 24);
    ctx.rotate(j.rArmLower);
    ctx.fillStyle = accentColor;
    ctx.fillRect(-3.5, 0, 8, 16); // Wrist wrap
    ctx.fillStyle = skinTone;
    ctx.beginPath();
    ctx.arc(0, 19, 6, 0, Math.PI * 2); // Hand holding weapon
    ctx.fill();

    // Render Handheld Weapon
    ctx.translate(0, 19);
    ctx.rotate(j.weaponAng);
    drawCartoonWeapon(f.weapon, isPlayer, accentColor);

    ctx.restore(); // Restore arm

    ctx.restore(); // Restore fighter
  }

  // ── High-Detail Cartoon Weapons Renderer ───────────────────────────────────
  function drawCartoonWeapon(w, isPlayer, accentColor) {
    ctx.save();
    const glowColor = isPlayer ? w.trailColor : '#ff0055';

    if (w.id === 'katana') {
      // Golden Tsuba Crossguard
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-5, -2, 10, 4);

      // Wrapped Tsuka Hilt
      ctx.fillStyle = '#182038';
      ctx.fillRect(-2.5, 2, 5, 18);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-2, 18, 4, 3); // Pommel

      // Curved Silver Blade with Neon Edge & Hamon
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.quadraticCurveTo(8, -45, 16, -88);
      ctx.stroke();

      // Glowing Neon Cutting Edge
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(1.5, -2);
      ctx.quadraticCurveTo(9.5, -45, 17.5, -88);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (w.id === 'kusarigama') {
      // Kama Sickle Handle
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-3, -12, 6, 26);

      // Curved Steel Sickle Blade
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.quadraticCurveTo(18, -26, 32, -18);
      ctx.lineTo(26, -10);
      ctx.quadraticCurveTo(14, -16, 0, -6);
      ctx.closePath();
      ctx.fill();

      // Glowing Blade Edge
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Iron Chain Links & Weighted Ball
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.lineTo(-12, 28);
      ctx.lineTo(-6, 42);
      ctx.stroke();
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(-6, 46, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (w.id === 'nunchaku') {
      // First Lacquered Wood Stick
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-3, -32, 6, 32);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-3.5, -32, 7, 4);
      ctx.fillRect(-3.5, -4, 7, 4);

      // Steel Chain Connector
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.quadraticCurveTo(8, -44, 16, -34);
      ctx.stroke();

      // Second Stick Spinning
      ctx.save();
      ctx.translate(16, -34);
      ctx.rotate(0.6 + Math.sin(Date.now() * 0.02) * 0.4);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-3, 0, 6, 30);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-3.5, 0, 7, 4);
      ctx.fillRect(-3.5, 26, 7, 4);
      ctx.restore();
    } else if (w.id === 'staff') {
      // Long Mahogany Polearm Shaft
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-2.5, -60, 5, 130);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(-3.5, -60, 7, 6);
      ctx.fillRect(-3.5, 64, 7, 6);

      // Curved Naginata Blade
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.quadraticCurveTo(8, -90, 16, -115);
      ctx.lineTo(10, -112);
      ctx.quadraticCurveTo(4, -85, 0, -60);
      ctx.closePath();
      ctx.fill();

      // Glowing Naginata Edge
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Red Silk Tassel Ribbon
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-4, -54, 8, 14);
    } else if (w.id === 'sai') {
      // Twin Sai Daggers
      // Handle
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-2.5, 0, 5, 16);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, 16, 4, 3);

      // Curved Side Prongs
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-9, -14);
      ctx.quadraticCurveTo(-10, 0, 0, 0);
      ctx.quadraticCurveTo(10, 0, 9, -14);
      ctx.stroke();

      // Main Pointed Blade
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(0, -42);
      ctx.lineTo(3, 0);
      ctx.closePath();
      ctx.fill();

      // Glowing Blade Aura
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -42);
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (w.id === 'hammer') {
      // Heavy War Club / Kanabo
      // Sturdy Handle
      ctx.fillStyle = '#3f1d0b';
      ctx.fillRect(-3, 0, 6, 26);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-3.5, 26, 7, 4);

      // Heavy Studded Mallet Head
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-14, -56, 28, 56);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-14, -56, 28, 56);

      // Golden Spikes & Studs
      ctx.fillStyle = '#f59e0b';
      [-46, -30, -14].forEach(yPos => {
        ctx.fillRect(-17, yPos, 3, 5);
        ctx.fillRect(14, yPos, 3, 5);
      });

      // Cracking Energy Glow
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(0, 0);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();
  }

  // ── Traditional Japanese Landscapes System ─────────────────────────────────
  const LANDSCAPES = {
    fuji_sakura: {
      id: 'fuji_sakura',
      name: 'MT. FUJI & SAKURA PAGODA',
      skyGradient: ['#120417', '#340a28', '#68172c', '#d35400', '#f39c12', '#fad390'],
      sunColor: '#fff5eb',
      sunGlow: 'rgba(255, 180, 100, 0.45)',
      sunRadius: 85,
      sunY: 200
    },
    arashiyama_bamboo: {
      id: 'arashiyama_bamboo',
      name: 'ARASHIYAMA BAMBOO GROVE',
      skyGradient: ['#020b14', '#051d24', '#0a3632', '#082a24', '#031210'],
      sunColor: '#e0f7fa',
      sunGlow: 'rgba(0, 240, 255, 0.35)',
      sunRadius: 75,
      sunY: 170
    },
    kyoto_autumn: {
      id: 'kyoto_autumn',
      name: 'KYOTO MOMIJI AUTUMN SHRINE',
      skyGradient: ['#150311', '#3b0a1a', '#78141e', '#c0392b', '#e67e22', '#f1c40f'],
      sunColor: '#ff7675',
      sunGlow: 'rgba(255, 80, 80, 0.5)',
      sunRadius: 95,
      sunY: 210
    },
    thunder_castle: {
      id: 'thunder_castle',
      name: 'FEUDAL CASTLE TENSHU',
      skyGradient: ['#07030e', '#140822', '#240b36', '#3b124d', '#180726', '#09020f'],
      sunColor: '#e056fd',
      sunGlow: 'rgba(224, 86, 253, 0.35)',
      sunRadius: 80,
      sunY: 190
    },
    moonlit_waterfall: {
      id: 'moonlit_waterfall',
      name: 'SACRED CELESTIAL WATERFALL',
      skyGradient: ['#01040f', '#060f26', '#102244', '#1e3a60', '#0a152e'],
      sunColor: '#ffffff',
      sunGlow: 'rgba(255, 255, 255, 0.65)',
      sunRadius: 90,
      sunY: 160
    }
  };

  const LANDSCAPE_KEYS = ['fuji_sakura', 'arashiyama_bamboo', 'kyoto_autumn', 'thunder_castle', 'moonlit_waterfall'];

  function cycleLandscape(direction = 1) {
    const idx = LANDSCAPE_KEYS.indexOf(currentLandscapeKey);
    const nextIdx = (idx + direction + LANDSCAPE_KEYS.length) % LANDSCAPE_KEYS.length;
    currentLandscapeKey = LANDSCAPE_KEYS[nextIdx];
    showAnnouncer(`SCENERY: ${LANDSCAPES[currentLandscapeKey].name}`, 'gold', 1000);
  }

  // ── Landmark Rendering Subroutines ─────────────────────────────────────────

  function drawMountFuji(ctx, cw, ch) {
    const fujiX = cw * 0.48;
    const fujiBaseY = 540;
    const peakY = 220;
    const halfWidth = 340;

    // Distant soft blue mountain foothills
    ctx.fillStyle = '#1c0e2a';
    ctx.beginPath();
    ctx.moveTo(0, 540);
    ctx.quadraticCurveTo(cw * 0.25, 420, cw * 0.5, 490);
    ctx.quadraticCurveTo(cw * 0.75, 430, cw, 540);
    ctx.fill();

    // Mt. Fuji Volcano Body
    const fujiGrad = ctx.createLinearGradient(fujiX, peakY, fujiX, fujiBaseY);
    fujiGrad.addColorStop(0, '#2e153e');
    fujiGrad.addColorStop(0.5, '#220e30');
    fujiGrad.addColorStop(1, '#0e0516');

    ctx.fillStyle = fujiGrad;
    ctx.beginPath();
    ctx.moveTo(fujiX - 45, peakY);
    ctx.quadraticCurveTo(fujiX - 120, 360, fujiX - halfWidth, fujiBaseY);
    ctx.lineTo(fujiX + halfWidth, fujiBaseY);
    ctx.quadraticCurveTo(fujiX + 120, 360, fujiX + 45, peakY);
    ctx.closePath();
    ctx.fill();

    // Mt. Fuji Snow Cap with Jagged Tongues
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(fujiX - 45, peakY);
    ctx.quadraticCurveTo(fujiX - 60, 275, fujiX - 80, 310);
    ctx.lineTo(fujiX - 55, 300);
    ctx.lineTo(fujiX - 30, 325);
    ctx.lineTo(fujiX - 10, 295);
    ctx.lineTo(fujiX + 15, 330);
    ctx.lineTo(fujiX + 35, 300);
    ctx.lineTo(fujiX + 60, 320);
    ctx.quadraticCurveTo(fujiX + 55, 275, fujiX + 45, peakY);
    ctx.closePath();
    ctx.fill();

    // Rose sunset tint on snow peak edge
    ctx.fillStyle = 'rgba(255, 180, 200, 0.4)';
    ctx.beginPath();
    ctx.moveTo(fujiX, peakY);
    ctx.lineTo(fujiX + 45, peakY);
    ctx.lineTo(fujiX + 60, 320);
    ctx.lineTo(fujiX + 15, 330);
    ctx.closePath();
    ctx.fill();

    // Floating Mist Bands Across Fuji
    ctx.fillStyle = 'rgba(255, 230, 240, 0.18)';
    [340, 420].forEach(yPos => {
      ctx.beginPath();
      ctx.ellipse(fujiX - 40, yPos, 220, 18, -0.05, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawPagoda(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Stone Foundation
    ctx.fillStyle = '#1e1a29';
    ctx.fillRect(-34, -14, 68, 14);

    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const tierY = -14 - i * 42;
      const tierW = 54 - i * 6;
      const roofW = 76 - i * 8;

      // Wooden Chamber Body
      ctx.fillStyle = '#b71540';
      ctx.fillRect(-tierW / 2, tierY - 24, tierW, 24);

      // Black Timber Columns & Window Lattice
      ctx.fillStyle = '#0a0512';
      ctx.fillRect(-tierW / 2, tierY - 24, 4, 24);
      ctx.fillRect(tierW / 2 - 4, tierY - 24, 4, 24);
      ctx.fillRect(-6, tierY - 18, 12, 18); // Center door/window

      // Balcony Railing
      ctx.fillStyle = '#d63031';
      ctx.fillRect(-tierW / 2 - 4, tierY - 4, tierW + 8, 4);

      // Flared Upturned Eaved Ceramic Roof
      ctx.fillStyle = '#0a0d18';
      ctx.beginPath();
      ctx.moveTo(-roofW / 2 - 12, tierY - 24);
      ctx.quadraticCurveTo(-roofW / 2, tierY - 28, 0, tierY - 38);
      ctx.quadraticCurveTo(roofW / 2, tierY - 28, roofW / 2 + 12, tierY - 24);
      ctx.lineTo(roofW / 2, tierY - 24);
      ctx.quadraticCurveTo(0, tierY - 34, -roofW / 2, tierY - 24);
      ctx.closePath();
      ctx.fill();

      // Gold Roof Ridge Accent
      ctx.strokeStyle = '#f5b942';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-roofW / 2 - 12, tierY - 24);
      ctx.quadraticCurveTo(0, tierY - 38, roofW / 2 + 12, tierY - 24);
      ctx.stroke();
    }

    // Pagoda Bronze Spire (Sorin)
    const topY = -14 - tiers * 42 - 10;
    ctx.strokeStyle = '#f5b942';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(0, topY - 48);
    ctx.stroke();

    // Sacred Rings on Spire
    for (let r = 0; r < 5; r++) {
      ctx.fillStyle = '#f5b942';
      ctx.beginPath();
      ctx.arc(0, topY - 12 - r * 6, 4 - r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sacred Jewel (Hoju) on top
    ctx.fillStyle = '#fffa65';
    ctx.beginPath();
    ctx.arc(0, topY - 50, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawToriiGate(ctx, x, y, scale = 1, color = '#d63031') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const w = 110;
    const h = 135;

    // Stone Pillar Footings (Kamebara)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-w / 2 - 5, -8, 14, 8);
    ctx.fillRect(w / 2 - 9, -8, 14, 8);

    // Sturdy Vertical Posts (Hashira) - slight inward taper
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 3, -8);
    ctx.lineTo(-w / 2 + 2, -h);
    ctx.lineTo(-w / 2 + 10, -h);
    ctx.lineTo(-w / 2 + 7, -8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w / 2 + 3, -8);
    ctx.lineTo(w / 2 - 2, -h);
    ctx.lineTo(w / 2 - 10, -h);
    ctx.lineTo(w / 2 - 7, -8);
    ctx.closePath();
    ctx.fill();

    // Lower Crossbeam (Nuki) with protruding wedges
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2 - 18, -h + 30, w + 36, 9);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w / 2 - 20, -h + 29, 4, 11);
    ctx.fillRect(w / 2 + 16, -h + 29, 4, 11);

    // Central Plaque (Gakuzuka)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, -h + 8, 16, 22);
    ctx.fillStyle = '#f5b942';
    ctx.fillRect(-6, -h + 10, 12, 18);

    // Upper Main Beam (Kasagi) with Upward Curves
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 28, -h - 6);
    ctx.quadraticCurveTo(0, -h - 2, w / 2 + 28, -h - 6);
    ctx.lineTo(w / 2 + 26, -h + 8);
    ctx.quadraticCurveTo(0, -h + 10, -w / 2 - 26, -h + 8);
    ctx.closePath();
    ctx.fill();

    // Black Top Lintel Roof Cap
    ctx.fillStyle = '#0a0d18';
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 34, -h - 12);
    ctx.quadraticCurveTo(0, -h - 8, w / 2 + 34, -h - 12);
    ctx.lineTo(w / 2 + 28, -h - 5);
    ctx.quadraticCurveTo(0, -h - 2, -w / 2 - 28, -h - 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawCherryBlossomTree(ctx, x, y, ts) {
    ctx.save();
    ctx.translate(x, y);

    const sway = Math.sin(ts * 0.0015) * 4;

    // Gnarled Wooden Trunk
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

    // Side Branches
    ctx.beginPath();
    ctx.moveTo(-40, -140);
    ctx.quadraticCurveTo(-8, -180, 30 + sway, -210);
    ctx.lineTo(35 + sway, -205);
    ctx.quadraticCurveTo(0, -170, -32, -135);
    ctx.fill();

    // Lush Pink Cherry Blossom Cloud Clusters
    const blossoms = [
      { bx: -120 + sway, by: -290, r: 42, c: '#ff76a6' },
      { bx: -85 + sway, by: -315, r: 48, c: '#ff9ebb' },
      { bx: -45 + sway, by: -270, r: 44, c: '#ff76a6' },
      { bx: 25 + sway, by: -220, r: 38, c: '#ffb8d1' },
      { bx: -15 + sway, by: -250, r: 40, c: '#ffffff' },
      { bx: -70 + sway, by: -255, r: 36, c: '#ff4d88' }
    ];

    blossoms.forEach(b => {
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.arc(b.bx, b.by, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawBambooGrove(ctx, cw, ch, ts) {
    const stalkCount = 14;
    for (let i = 0; i < stalkCount; i++) {
      const bx = (cw / stalkCount) * i + ((i % 3) * 12);
      const sway = Math.sin(ts * 0.0018 + i * 0.8) * 6;
      const isForeground = i % 2 === 0;

      // Bamboo Culm
      ctx.fillStyle = isForeground ? '#08332c' : '#041f1a';
      const stalkWidth = isForeground ? 11 : 7;
      ctx.fillRect(bx - stalkWidth / 2 + sway * 0.4, 60, stalkWidth, 480);

      // Bamboo Joint Rings
      ctx.fillStyle = isForeground ? '#00f0ff' : '#0a4f44';
      for (let j = 90; j < 540; j += 48) {
        ctx.fillRect(bx - stalkWidth / 2 - 2 + sway * 0.4, j, stalkWidth + 4, 3);
      }

      // Fan Leaf Clusters
      ctx.fillStyle = isForeground ? '#0d5c4f' : '#06382f';
      for (let j = 120; j < 480; j += 85) {
        const leafSide = (i + j) % 2 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(bx + sway * 0.4, j);
        ctx.quadraticCurveTo(bx + leafSide * 24 + sway, j - 12, bx + leafSide * 36 + sway, j - 6);
        ctx.lineTo(bx + leafSide * 20 + sway, j + 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Glowing Emerald Fireflies
    for (let f = 0; f < 8; f++) {
      const fx = (cw * 0.1) + ((f * 137 + ts * 0.03) % (cw * 0.8));
      const fy = 200 + Math.sin(ts * 0.002 + f * 2) * 120;
      ctx.fillStyle = '#00ffcc';
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawJapaneseBridge(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const span = 130;
    const archH = 45;

    // Red Arched Wood Bridge Deck
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, archH * 1.6, span, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    // Top Handrail
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, archH * 1.6, span + 18, Math.PI * 1.25, Math.PI * 1.75);
    ctx.stroke();

    // Bronze Post Finials (Giboshi)
    [-55, -20, 20, 55].forEach(px => {
      const py = -Math.sqrt(Math.max(0, 3600 - px * px)) * 0.35;
      ctx.fillStyle = '#f5b942';
      ctx.beginPath();
      ctx.arc(px, py - 18, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawMapleTree(ctx, x, y, ts) {
    ctx.save();
    ctx.translate(x, y);

    const sway = Math.sin(ts * 0.002) * 5;

    // Twisted Ancient Pine/Maple Trunk
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

    // Fiery Momiji Foliage Clouds
    const maplePuffs = [
      { mx: -100 + sway, my: -270, r: 42, c: '#c0392b' },
      { mx: -65 + sway, my: -295, r: 46, c: '#e67e22' },
      { mx: -25 + sway, my: -250, r: 40, c: '#d35400' },
      { mx: 35 + sway, my: -210, r: 35, c: '#f39c12' },
      { mx: -55 + sway, my: -235, r: 38, c: '#b71540' }
    ];

    maplePuffs.forEach(m => {
      ctx.fillStyle = m.c;
      ctx.beginPath();
      ctx.arc(m.mx, m.my, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Hanging Red Paper Lanterns (Chochin)
    [-80 + sway, 15 + sway].forEach((lx, i) => {
      const ly = i === 0 ? -240 : -190;
      const lanSway = Math.sin(ts * 0.003 + i) * 0.12;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(lanSway);

      // Black cord
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 16);
      ctx.stroke();

      // Glowing Red Paper Body
      ctx.fillStyle = '#e74c3c';
      ctx.shadowColor = 'rgba(231, 76, 60, 0.8)';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.ellipse(0, 26, 10, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Black Top & Bottom Rings
      ctx.fillStyle = '#111';
      ctx.fillRect(-7, 12, 14, 3);
      ctx.fillRect(-7, 37, 14, 3);

      ctx.restore();
    });

    ctx.restore();
  }

  function drawKyotoShrine(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Stone Steps & Platform
    ctx.fillStyle = '#1e1a24';
    ctx.fillRect(-80, -18, 160, 18);

    // Red Veranda Columns
    ctx.fillStyle = '#c0392b';
    for (let c = -60; c <= 60; c += 30) {
      ctx.fillRect(c - 3, -110, 6, 92);
    }

    // Gold Shrine Altar Inside
    ctx.fillStyle = '#f5b942';
    ctx.fillRect(-18, -75, 36, 40);

    // Curved Shrine Roof
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

    // Sloping Stone Base (Ishigaki)
    ctx.fillStyle = '#181124';
    ctx.beginPath();
    ctx.moveTo(-90, 0);
    ctx.lineTo(-65, -80);
    ctx.lineTo(65, -80);
    ctx.lineTo(90, 0);
    ctx.closePath();
    ctx.fill();

    // 3 Tiers of White Plaster Fortress Walls
    for (let t = 0; t < 3; t++) {
      const ty = -80 - t * 65;
      const tw = 110 - t * 24;
      const rw = 140 - t * 24;

      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-tw / 2, ty - 45, tw, 45);

      // Dark Timber Lattice Windows
      ctx.fillStyle = '#0a0512';
      ctx.fillRect(-tw / 2 + 6, ty - 35, 12, 18);
      ctx.fillRect(tw / 2 - 18, ty - 35, 12, 18);

      // Sweeping Curved Eaves
      ctx.fillStyle = '#0a0d18';
      ctx.beginPath();
      ctx.moveTo(-rw / 2 - 14, ty - 45);
      ctx.quadraticCurveTo(0, ty - 60, rw / 2 + 14, ty - 45);
      ctx.lineTo(rw / 2, ty - 45);
      ctx.quadraticCurveTo(0, ty - 54, -rw / 2, ty - 45);
      ctx.closePath();
      ctx.fill();
    }

    // Golden Shachihoko (Mythical Carp-Dragon Finials on roof crest)
    const roofTopY = -80 - 3 * 65 - 10;
    [-24, 24].forEach(sx => {
      ctx.fillStyle = '#f5b942';
      ctx.beginPath();
      ctx.arc(sx, roofTopY, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawWaterfallCliff(ctx, x, y, ts) {
    ctx.save();
    ctx.translate(x, y);

    // Towering Mountain Cliff Face
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-75, 0);
    ctx.lineTo(-65, -280);
    ctx.lineTo(65, -280);
    ctx.lineTo(75, 0);
    ctx.closePath();
    ctx.fill();

    // Cascading Waterfall Ribbon
    const flowOffset = (ts * 0.25) % 40;
    const fallGrad = ctx.createLinearGradient(0, -280, 0, 0);
    fallGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    fallGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.8)');
    fallGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

    ctx.fillStyle = fallGrad;
    ctx.fillRect(-22, -280, 44, 280);

    // Waterfall Streaks
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    for (let s = -16; s <= 16; s += 8) {
      ctx.beginPath();
      ctx.moveTo(s, -280 + flowOffset);
      ctx.lineTo(s, -40);
      ctx.stroke();
    }

    // Frothing Bottom Mist & Foam Cloud
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(0, -10, 48, 0, Math.PI * 2);
    ctx.arc(-26, -6, 32, 0, Math.PI * 2);
    ctx.arc(26, -6, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawBonsaiPine(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);

    // Crooked Pine Trunk
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

    // Flat Needle Cloud Plates (Matsuba)
    const pads = [
      { px: 25, py: -230, rx: 42, ry: 14 },
      { px: -35, py: -180, rx: 38, ry: 13 },
      { px: 30, py: -130, rx: 35, ry: 12 }
    ];

    pads.forEach(p => {
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.ellipse(p.px, p.py, p.rx, p.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(p.px, p.py - 3, p.rx * 0.75, p.ry * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawStoneLantern(ctx, x, y, scale = 1, glowColor = '#f5b942') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Base Pedestal
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-14, -8, 28, 8);
    ctx.fillRect(-7, -32, 14, 24); // Pillar shaft
    ctx.fillRect(-16, -38, 32, 6);  // Middle platform

    // Glowing Fire Chamber (Hibukuro)
    ctx.fillStyle = glowColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 16;
    ctx.fillRect(-10, -54, 20, 16);
    ctx.shadowBlur = 0;

    // Chamber Lattice Grille
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -54, 4, 16);
    ctx.fillRect(-10, -47, 20, 3);

    // Hexagonal Curved Roof Cap (Kasa)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-22, -54);
    ctx.lineTo(0, -68);
    ctx.lineTo(22, -54);
    ctx.closePath();
    ctx.fill();

    // Jewel Finial (Hoju)
    ctx.fillStyle = '#f5b942';
    ctx.beginPath();
    ctx.arc(0, -71, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawBrazier(ctx, x, y, ts) {
    ctx.save();
    ctx.translate(x, y);

    // Iron Tripod Stand
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(0, -45);
    ctx.lineTo(16, 0);
    ctx.stroke();

    // Fire Bowl
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -48, 16, 0, Math.PI);
    ctx.fill();

    // Dancing Fire Flame
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

    ctx.fillStyle = '#fff200';
    ctx.beginPath();
    ctx.arc(0, -54, 6, 0, Math.PI * 2);
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
    // Occasional dramatic lightning flash
    if (Math.sin(ts * 0.004) > 0.96) {
      ctx.fillStyle = 'rgba(230, 200, 255, 0.25)';
      ctx.fillRect(0, 0, cw, ch);

      // Jagged Lightning Bolt
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

  function drawDojoFloor(ctx, cw, ch, theme) {
    // Dojo Ground Floor (y = 540 to ch)
    const floorGrad = ctx.createLinearGradient(0, 540, 0, ch);
    floorGrad.addColorStop(0, '#090d18');
    floorGrad.addColorStop(0.3, '#05070c');
    floorGrad.addColorStop(1, '#020306');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 540, cw, ch - 540);

    // Polished Lacquer Ground Line
    ctx.strokeStyle = theme.sunGlow || 'rgba(245, 185, 66, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 540);
    ctx.lineTo(cw, 540);
    ctx.stroke();

    // Wood Plank Seam Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let px = 80; px < cw; px += 120) {
      ctx.beginPath();
      ctx.moveTo(px, 540);
      ctx.lineTo(px - 30, ch);
      ctx.stroke();
    }
  }

  function drawJapaneseLandscape(landscapeKey, ts) {
    const theme = LANDSCAPES[landscapeKey] || LANDSCAPES.fuji_sakura;

    // 1. Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, 540);
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
    ctx.arc(cw / 2, theme.sunY, theme.sunRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.sunColor;
    ctx.shadowColor = theme.sunGlow;
    ctx.shadowBlur = 35;
    ctx.beginPath();
    ctx.arc(cw / 2, theme.sunY, theme.sunRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Render Landmark Layers
    if (landscapeKey === 'fuji_sakura') {
      drawMountFuji(ctx, cw, ch);
      drawPagoda(ctx, cw * 0.16, 540, 1.05);
      drawToriiGate(ctx, cw * 0.82, 540, 0.95, '#d63031');
      drawCherryBlossomTree(ctx, cw * 0.88, 540, ts);
      drawStoneLantern(ctx, cw * 0.32, 540, 0.85);
    } else if (landscapeKey === 'arashiyama_bamboo') {
      drawBambooGrove(ctx, cw, ch, ts);
      drawJapaneseBridge(ctx, cw * 0.22, 540, 1.0);
      drawToriiGate(ctx, cw * 0.78, 540, 0.85, '#1e293b');
      drawStoneLantern(ctx, cw * 0.84, 540, 0.9, '#00ffcc');
    } else if (landscapeKey === 'kyoto_autumn') {
      drawKyotoShrine(ctx, cw * 0.18, 540, 0.95);
      drawMapleTree(ctx, cw * 0.82, 540, ts);
      drawStoneLantern(ctx, cw * 0.65, 540, 0.85, '#ff7675');
    } else if (landscapeKey === 'thunder_castle') {
      drawStormLightning(ctx, cw, ch, ts);
      drawCastleFortress(ctx, cw * 0.76, 540, 1.1);
      drawBrazier(ctx, 80, 540, ts);
      drawBrazier(ctx, cw - 80, 540, ts);
    } else if (landscapeKey === 'moonlit_waterfall') {
      drawStars(ctx, cw, ch);
      drawWaterfallCliff(ctx, cw * 0.22, 540, ts);
      drawBonsaiPine(ctx, cw * 0.78, 540);
      drawToriiGate(ctx, cw * 0.28, 320, 0.6, '#d63031');
      drawStoneLantern(ctx, cw * 0.86, 540, 0.9, '#00f0ff');
    }

    // 4. Dojo Floor Ground
    drawDojoFloor(ctx, cw, ch, theme);
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

    // 1. Traditional Japanese Landscape Arena Background
    drawJapaneseLandscape(currentLandscapeKey, ts);

    // 2. Ambient Sakura / Leaf / Spark Petals
    ambientPetals.forEach(pt => {
      ctx.save();
      ctx.translate(pt.x, pt.y);
      ctx.rotate(pt.angle);
      ctx.fillStyle = pt.color;
      ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size * 1.6);
      ctx.restore();
    });

    // 3. Draw Cartoon Martial Arts Warriors
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
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = "900 38px 'Orbitron', monospace";
      ctx.fillStyle = '#f5b942';
      ctx.shadowColor = 'rgba(245, 185, 66, 0.8)';
      ctx.shadowBlur = 24;
      ctx.fillText('SHADOW FIGHT: ARENA OF SHADOWS', cw / 2, ch * 0.38);

      ctx.font = "600 14px 'Orbitron', monospace";
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 0;
      ctx.fillText('2D 1v1 MARTIAL ARTS DUEL', cw / 2, ch * 0.46);

      const pulse = 0.6 + 0.4 * Math.sin(ts * 0.005);
      ctx.font = "600 15px 'Inter', sans-serif";
      ctx.fillStyle = `rgba(238, 241, 245, ${pulse})`;
      ctx.fillText('Click or Press Space to Enter Arena', cw / 2, ch * 0.62);

      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillStyle = '#8893a7';
      ctx.fillText('A/D: Move • W: Jump • S: Crouch • J: Punch • K: Kick • L/Space: Weapon • Shift: Roll', cw / 2, ch * 0.72);
      ctx.restore();
    }

    ctx.restore();
  }

  // ── Sidebar Master Ladder Rendering ────────────────────────────────────────
  function renderSidebarMasters() {
    if (!elSidebarLevelsList) return;
    elSidebarLevelsList.innerHTML = '';

    if (elSidebarUnlockedPill) {
      elSidebarUnlockedPill.textContent = `${unlockedMasterLevel}/5`;
    }

    MASTERS.forEach((m, idx) => {
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
    player.groundY = ch - 180;
    enemy.groundY = ch - 180;
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
  resize();
  updateHUD();
  updateWeaponUI();
  renderSidebarMasters();
  requestAnimationFrame(gameLoop);

})();
