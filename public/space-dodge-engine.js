// ============================================================
//  Space Dodge — Polished Ship Engine  (vanilla JS, no deps)
// ============================================================

const canvas  = document.getElementById('gameCanvas');
const ctx     = canvas.getContext('2d');
let   cw, ch; // logical width/height (post-DPI)

// ── DPI-aware resize ─────────────────────────────────────────
function resizeCanvas() {
  const dpr  = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  cw = rect.width;
  ch = rect.height;
  canvas.width  = Math.round(cw * dpr);
  canvas.height = Math.round(ch * dpr);
  ctx.scale(dpr, dpr);
  // regenerate stars on resize
  stars.length = 0;
  for (let i = 0; i < 120; i++) spawnStar(true);
}
window.addEventListener('resize', () => { resizeCanvas(); resetAsteroids(); });

// ── Colours ───────────────────────────────────────────────────
const C = {
  bg      : '#04060d',
  surface : '#0b0e1a',
  accent  : '#4dd9f0',   // ship / UI glow accent
  brand   : '#f2b84b',   // engine flame highlights
  text    : '#eef1f5',
  muted   : '#8b93a1',
  red     : '#ff4757',
};

// ── Difficulty ────────────────────────────────────────────────
const DIFF = {
  easy   : { thrust: 420, gravity: 180, gap: 90,  rockW: [50, 90],  label:'🟢 Easy'   },
  medium : { thrust: 520, gravity: 220, gap: 65,  rockW: [60, 110], label:'🟡 Medium' },
  hard   : { thrust: 640, gravity: 260, gap: 45,  rockW: [70, 130], label:'🔴 Hard'   },
};
let difficulty = 'medium';

// ── State machine ─────────────────────────────────────────────
const S = { MENU:0, PLAYING:1, HIT:2, GAMEOVER:3 };
let state = S.MENU;

// ── Player ship ───────────────────────────────────────────────
const SHIP_W = 26, SHIP_H = 38;
const player = { x:0, y:0, vx:0, vy:0, invincible:0, flash:0, fireCd:0 };
const MAX_VY = 500;

// ── Stars (parallax layers) ───────────────────────────────────
const stars = [];
function spawnStar(initial=false) {
  const layer = Math.random() < 0.5 ? 0 : Math.random() < 0.6 ? 1 : 2;
  stars.push({
    x     : Math.random() * (cw || 800),
    y     : initial ? Math.random() * (ch || 450) : -(Math.random() * 4 + 1),
    r     : [0.6, 1.1, 1.7][layer],
    speed : [0.3, 0.7, 1.3][layer],
    alpha : 0.4 + Math.random() * 0.6,
    layer,
  });
}

// ── Asteroid field ────────────────────────────────────────────
const asteroids = [];
const ASTER_H   = 18;   // big rock height
const SMALL_H   = 12;   // shootable small rock height
const BIG_HP    = 3;    // laser hits to destroy a big rock
let   asteroidTop = -DIFF.medium.gap; // y of the highest generated row
let   destroyedCount = 0;

function spawnAsteroidRow() {
  const cfg = DIFF[difficulty];
  const [mn, mx] = cfg.rockW;
  const small = Math.random() < 0.4;
  const w = small ? 14 + Math.random() * 12 : mn + Math.random() * (mx - mn);
  const x = 8 + Math.random() * ((cw || 700) - w - 16);
  asteroids.push({
    x, y: asteroidTop, w,
    h: small ? SMALL_H : ASTER_H,
    small,
    hp: small ? 1 : BIG_HP,
    maxHp: small ? 1 : BIG_HP,
    seed: Math.random() * 1000,
  });
}

function resetAsteroids() {
  asteroids.length = 0;
  asteroidTop = Math.max(0, player.y) - DIFF[difficulty].gap;
}

// endlessly generate rows ahead of the ship + recycle rows that fell behind
function ensureAsteroids() {
  const lookAhead = Math.max(ch * 1.5, 600);
  while (asteroidTop > player.y - lookAhead) {
    asteroidTop -= DIFF[difficulty].gap;
    spawnAsteroidRow();
  }
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    if (a.y - player.y + ch / 2 > ch + 150) asteroids.splice(i, 1);
  }
}

// ── Particles ─────────────────────────────────────────────────
const particles = [];
function emitThrust(px, py) {
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: px, y: py + SHIP_H,
      vx: (Math.random() - 0.5) * 30,
      vy: 20 + Math.random() * 40,
      life: 0.4 + Math.random() * 0.3,
      maxLife: 0.6,
      r: 3 + Math.random() * 3,
      color: Math.random() < 0.5 ? '#ff8c42' : '#f2b84b',
      type: 'thrust',
    });
  }
}
function emitExplosion(px, py) {
  for (let i = 0; i < 28; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = 40 + Math.random() * 120;
    particles.push({
      x: px, y: py,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 0.5 + Math.random() * 0.6,
      maxLife: 1.1,
      r: 2 + Math.random() * 5,
      color: ['#ff8c42','#ff4500','#f2b84b','#fff','#4dd9f0'][Math.floor(Math.random()*5)],
      type: 'explosion',
    });
  }
}

// ── Lasers ────────────────────────────────────────────────────
const lasers = [];
const LASER_W = 4, LASER_H = 16;
const FIRE_COOLDOWN = 0.22;

function emitSpark(px, py) {
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd   = 30 + Math.random() * 90;
    particles.push({
      x: px, y: py,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      life: 0.2 + Math.random() * 0.2,
      maxLife: 0.4,
      r: 1.5 + Math.random() * 2,
      color: '#4dd9f0',
      type: 'spark',
    });
  }
}

// ── Screen shake ──────────────────────────────────────────────
let shake = 0;

// ── Input ─────────────────────────────────────────────────────
const input = { x: 0, held: false };
function pointerX(e) {
  const rect = canvas.getBoundingClientRect();
  return e.clientX - rect.left;
}
canvas.addEventListener('mousemove', e => { input.x = pointerX(e); });
canvas.addEventListener('mousedown', e => {
  input.held = true; input.x = pointerX(e);
  canvas.focus();
});
canvas.addEventListener('mouseup',   () => { input.held = false; });
canvas.addEventListener('touchstart', e => {
  input.held = true; input.x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  canvas.focus();
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  input.x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend',  () => { input.held = false; });

// keyboard fire — Space / W / ↑
// Ignore when a form control (e.g. the difficulty <select>) has focus,
// otherwise the browser hijacks the key to operate that control.
document.addEventListener('keydown', e => {
  if (e.repeat) return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return;
  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
    e.preventDefault();
    fireLaser();
  }
});

function fireLaser() {
  if (state !== S.PLAYING || player.fireCd > 0) return;
  player.fireCd = FIRE_COOLDOWN;
  lasers.push({
    x: player.x + SHIP_W / 2 - LASER_W / 2,
    y: ch / 2 - SHIP_H / 2 - LASER_H,
    vy: -640,
  });
}

document.getElementById('ui-difficulty').addEventListener('change', e => {
  difficulty = e.target.value;
  resetAsteroids();
  e.target.blur();           // release focus so Space/W stay with the game
  canvas.focus();
});

// ── Score & lives ─────────────────────────────────────────────
let dist = 0, highDist = Number(localStorage.getItem('space-dodge-hi')) || 0;
let lives = 5;
const MAX_LIVES = 5;
const elScore = document.getElementById('ui-score');
const elHigh  = document.getElementById('ui-high');
const elLives = document.getElementById('ui-lives');
const elDestroyed = document.getElementById('ui-destroyed');
elHigh.textContent = highDist;
elDestroyed.textContent = 0;

function renderLives() {
  elLives.innerHTML = '';
  for (let i = 0; i < MAX_LIVES; i++) {
    const s = document.createElement('span');
    s.textContent = i < lives ? '❤️' : '🖤';
    s.style.fontSize = '13px';
    elLives.appendChild(s);
  }
}
renderLives();

function tickScore() {
  elScore.textContent = dist;
  if (dist > highDist) {
    highDist = dist;
    elHigh.textContent = highDist;
    localStorage.setItem('space-dodge-hi', highDist);
  }
}

// ── Update ─────────────────────────────────────────────────────
const INVINC_TIME = 1.2; // seconds invincible after hit

function update(dt) {
  dt = Math.min(dt, 0.05); // cap dt to avoid spiral of death
  shake = Math.max(0, shake - dt * 8);

  // update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // update stars (tied to ascent speed while flying into space)
  const scrollSpeed = state === S.PLAYING
    ? Math.abs(player.vy) * dt * 0.35
    : 0.3 * dt * 60;
  for (const s of stars) {
    s.y += s.speed * scrollSpeed;
    if (s.y > ch + 4) { s.y = -2; s.x = Math.random() * cw; }
  }

  if (state === S.MENU) {
    if (input.held) startGame();
    return;
  }
  if (state === S.GAMEOVER) {
    if (input.held) { state = S.MENU; }
    return;
  }
  if (state === S.HIT) {
    player.invincible -= dt;
    player.flash       = 1 - (player.invincible / INVINC_TIME);
    if (player.invincible <= 0) {
      state = lives > 0 ? S.PLAYING : S.GAMEOVER;
      player.invincible = 0;
    }
    return;
  }

  // PLAYING
  const targetX = input.x - SHIP_W / 2;
  player.x += (targetX - player.x) * Math.min(1, dt * 12); // smooth follow
  player.x = Math.max(0, Math.min(cw - SHIP_W, player.x));

  // keep the belt populated endlessly ahead of the ship
  ensureAsteroids();

  const cfg = DIFF[difficulty];
  // gravity always pulls down (increases vy)
  player.vy += cfg.gravity * dt;
  // thrust pushes UP (decreases vy) when held
  if (input.held) {
    player.vy -= cfg.thrust * dt;
    emitThrust(player.x + SHIP_W / 2, ch / 2 + SHIP_H / 2);
  }
  player.vy = Math.max(-MAX_VY, Math.min(MAX_VY, player.vy));
  player.y += player.vy * dt;
  // clamp: can't fall below the bottom boundary
  if (player.y > 0) { player.y = 0; player.vy = 0; }

  dist = Math.max(0, Math.floor(-player.y)); // distance = how far UP we've gone
  tickScore();

  // lasers — move, then test against rocks
  player.fireCd -= dt;
  for (let i = lasers.length - 1; i >= 0; i--) {
    const l = lasers[i];
    l.y += l.vy * dt;
    if (l.y < -30) { lasers.splice(i, 1); continue; }
    let hit = false;
    for (let j = 0; j < asteroids.length; j++) {
      const ast = asteroids[j];
      const ay = ast.y - player.y + ch / 2;
      if (l.x < ast.x + ast.w && l.x + l.w > ast.x &&
          l.y < ay + ast.h && l.y + l.h > ay) {
        hit = true;
        ast.hp--;
        emitSpark(l.x + LASER_W / 2, l.y);
        if (ast.hp <= 0) {
          emitExplosion(ast.x + ast.w / 2, ay + ast.h / 2);
          destroyedCount++;
          elDestroyed.textContent = destroyedCount;
          asteroids.splice(j, 1);
        }
        break;
      }
    }
    if (hit) lasers.splice(i, 1);
  }

  // collision
  if (player.invincible <= 0) {
    for (const ast of asteroids) {
      const sy = ast.y - player.y + ch / 2;   // asteroid screen Y
      const shipScreenY = ch / 2 - SHIP_H / 2;
      if (sy < shipScreenY + SHIP_H - 4 && sy + ast.h > shipScreenY + 4 &&
          ast.x < player.x + SHIP_W - 4 && ast.x + ast.w > player.x + 4) {
        emitExplosion(player.x + SHIP_W / 2, ch / 2);
        shake = 1;
        lives--;
        renderLives();
        player.invincible = INVINC_TIME;
        player.flash = 0;
        state = S.HIT;
        break;
      }
    }
  }
}

function startGame() {
  player.x = cw / 2 - SHIP_W / 2;
  player.y = 0;
  player.vy = 0;
  player.invincible = 0;
  dist = 0;
  lives = MAX_LIVES;
  lasers.length = 0;
  destroyedCount = 0;
  elDestroyed.textContent = 0;
  player.fireCd = 0;
  renderLives();
  tickScore();
  particles.length = 0;
  resetAsteroids();
  state = S.PLAYING;
}

// ── Draw helpers ──────────────────────────────────────────────
function drawShip(x, y, thrusting, flash) {
  ctx.save();
  ctx.translate(x + SHIP_W / 2, y + SHIP_H / 2);
  if (flash > 0 && Math.sin(flash * 30) > 0) {
    ctx.globalAlpha = 0.4;
  }

  // engine glow
  const glow = ctx.createRadialGradient(0, SHIP_H / 2 - 2, 2, 0, SHIP_H / 2 - 2, 32);
  glow.addColorStop(0, 'rgba(77,217,240,0.35)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, SHIP_H / 2 - 2, 32, 0, Math.PI * 2); ctx.fill();

  const hw = SHIP_W / 2, hh = SHIP_H / 2;

  // hull (arrow-shaped, pointing up)
  const hull = ctx.createLinearGradient(-hw, -hh, hw, hh);
  hull.addColorStop(0, '#e8ebf6');
  hull.addColorStop(0.45, '#b9c2dd');
  hull.addColorStop(1, '#69748f');
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(0, -hh - 2);
  ctx.bezierCurveTo(hw * 0.7, -hh * 0.2, hw * 0.45, hh * 0.4, 0, hh);
  ctx.bezierCurveTo(-hw * 0.45, hh * 0.4, -hw * 0.7, -hh * 0.2, 0, -hh - 2);
  ctx.closePath();
  ctx.fill();

  // cockpit window
  const cock = ctx.createRadialGradient(-1, -hh * 0.18, 0.5, 0, -hh * 0.18, 7);
  cock.addColorStop(0, '#d8faff');
  cock.addColorStop(1, '#2aa6c9');
  ctx.fillStyle = cock;
  ctx.beginPath(); ctx.ellipse(0, -hh * 0.18, 5.5, 7, 0, 0, Math.PI * 2); ctx.fill();

  // left wing
  ctx.fillStyle = C.accent;
  ctx.beginPath();
  ctx.moveTo(-hw * 0.4, hh * 0.05);
  ctx.lineTo(-hw * 1.15, hh * 0.85);
  ctx.lineTo(-hw * 0.4, hh);
  ctx.closePath(); ctx.fill();

  // right wing
  ctx.beginPath();
  ctx.moveTo(hw * 0.4, hh * 0.05);
  ctx.lineTo(hw * 1.15, hh * 0.85);
  ctx.lineTo(hw * 0.4, hh);
  ctx.closePath(); ctx.fill();

  // engine nozzle
  ctx.fillStyle = '#3a4358';
  ctx.fillRect(-6, hh - 4, 12, 7);

  // engine flame
  if (thrusting) {
    const fl = 10 + Math.random() * 8;
    const fg = ctx.createLinearGradient(0, hh - 3, 0, hh + fl + 8);
    fg.addColorStop(0, 'rgba(242,184,75,0.95)');
    fg.addColorStop(0.5, 'rgba(255,140,66,0.75)');
    fg.addColorStop(1, 'rgba(255,140,66,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(-4, hh - 3);
    ctx.lineTo(0, hh + fl);
    ctx.lineTo(4, hh - 3);
    ctx.closePath(); ctx.fill();
  }

  ctx.restore();
}

function wiggle(seed, offset) {
  return Math.sin(seed * 12.9898 + offset) * 3;
}

function drawAsteroid(ast, screenY) {
  ctx.save();
  const { x, w, h, seed } = ast;
  const r = Math.min(6, w * 0.35);
  const rg = ctx.createLinearGradient(x, screenY, x + w, screenY + h);
  rg.addColorStop(0, '#93949c');
  rg.addColorStop(0.5, '#5a5a64');
  rg.addColorStop(1, '#2b2b35');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(x + r, screenY + wiggle(seed, 0));
  ctx.lineTo(x + w - r, screenY - wiggle(seed, 3));
  ctx.quadraticCurveTo(x + w, screenY, x + w, screenY + r);
  ctx.lineTo(x + w, screenY + h - r);
  ctx.quadraticCurveTo(x + w, screenY + h, x + w - r, screenY + h);
  ctx.lineTo(x + r, screenY + h);
  ctx.quadraticCurveTo(x, screenY + h, x, screenY + h - r);
  ctx.lineTo(x, screenY + r);
  ctx.quadraticCurveTo(x, screenY, x + r, screenY + wiggle(seed, 0));
  ctx.fill();

  // craters (fewer on small rocks)
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.arc(x + w * 0.3,  screenY + h * 0.3,  w * 0.2,  0, Math.PI * 2); ctx.fill();
  if (!ast.small) {
    ctx.beginPath(); ctx.arc(x + w * 0.68, screenY + h * 0.62, w * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w * 0.5,  screenY + h * 0.42, w * 0.08, 0, Math.PI * 2); ctx.fill();
  }

  // damage cracks on big rocks that have been lasered
  if (!ast.small && ast.hp < ast.maxHp) {
    ctx.strokeStyle = `rgba(240,90,60,${0.5 + (1 - ast.hp / ast.maxHp) * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.25, screenY + h * 0.15);
    ctx.lineTo(x + w * 0.45, screenY + h * 0.55);
    ctx.lineTo(x + w * 0.35, screenY + h * 0.85);
    ctx.moveTo(x + w * 0.7, screenY + h * 0.2);
    ctx.lineTo(x + w * 0.55, screenY + h * 0.45);
    ctx.stroke();
  }

  // rim highlight
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(x + 5, screenY + 2, w - 10, Math.min(3.5, h - 4));
  ctx.restore();
}

// ── Main render ───────────────────────────────────────────────
let menuPulse = 0;
function render(ts) {
  menuPulse = ts * 0.002;

  // screen shake offset
  const sx = shake > 0 ? (Math.random() - 0.5) * shake * 12 : 0;
  const sy = shake > 0 ? (Math.random() - 0.5) * shake * 12 : 0;
  ctx.save();
  ctx.translate(sx, sy);

  // nebula background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, ch);
  bg.addColorStop(0, '#02030a');
  bg.addColorStop(0.55, '#0a0e1e');
  bg.addColorStop(1, '#131a33');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cw, ch);

  // faint nebula wisps
  ctx.globalAlpha = 0.05;
  const nb = ctx.createRadialGradient(cw * 0.8, ch * 0.25, 10, cw * 0.8, ch * 0.25, ch * 0.5);
  nb.addColorStop(0, C.accent);
  nb.addColorStop(1, 'transparent');
  ctx.fillStyle = nb;
  ctx.fillRect(0, 0, cw, ch);
  ctx.globalAlpha = 1;

  // stars
  for (const s of stars) {
    ctx.globalAlpha = s.alpha * (0.7 + 0.3 * Math.sin(menuPulse * 2 + s.x));
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (state === S.MENU) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `bold 32px 'Space Grotesk', sans-serif`;
    const grad = ctx.createLinearGradient(cw/2-100, 0, cw/2+100, 0);
    grad.addColorStop(0, '#f2b84b');
    grad.addColorStop(1, '#4dd9f0');
    ctx.fillStyle = grad;
    ctx.fillText('🚀 SPACE DODGE', cw / 2, ch * 0.38);
    ctx.font = `15px 'Inter', sans-serif`;
    ctx.fillStyle = `rgba(238,241,245,${0.6 + 0.4 * Math.sin(menuPulse * 3)})`;
    ctx.fillText('Hold to thrust — dodge the asteroid belt', cw / 2, ch * 0.52);
    ctx.fillText('Steer with your mouse or finger 👆', cw / 2, ch * 0.60);
    ctx.font = `13px 'JetBrains Mono', monospace`;
    ctx.fillStyle = `rgba(77,217,240,${0.6 + 0.4 * Math.sin(menuPulse * 3)})`;
    ctx.fillText('Space / W — blast the rocks 💥', cw / 2, ch * 0.66);
    ctx.fillStyle = C.muted;
    ctx.fillText(`Best distance: ${highDist}m`, cw / 2, ch * 0.74);
    ctx.restore();
    ctx.restore();
    return;
  }

  // asteroid field
  for (const ast of asteroids) {
    const sy2 = ast.y - player.y + ch / 2;
    if (sy2 > -ASTER_H - 20 && sy2 < ch + 20) drawAsteroid(ast, sy2);
  }

  // lasers
  for (const l of lasers) {
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = C.accent;
    ctx.fillRect(l.x - 2, l.y - 1, LASER_W + 4, l.h + 2);
    ctx.globalAlpha = 1;
    const lg = ctx.createLinearGradient(l.x, l.y, l.x, l.y + l.h);
    lg.addColorStop(0, 'rgba(232,251,255,0.95)');
    lg.addColorStop(1, 'rgba(77,217,240,0.3)');
    ctx.fillStyle = lg;
    ctx.fillRect(l.x, l.y, LASER_W, l.h);
  }

  // particles
  for (const p of particles) {
    const t = 1 - p.life / p.maxLife;
    ctx.globalAlpha = p.life / p.maxLife;
    ctx.fillStyle = p.color;
    const r = p.type === 'thrust' ? p.r * (1 - t * 0.5) : p.r * (1 - t);
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(0.5, r), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ship (only when not in HIT-flash-invisible frame)
  if (state !== S.HIT || Math.sin(player.invincible * 25) > 0) {
    drawShip(player.x, ch / 2 - SHIP_H / 2, input.held, state === S.HIT ? player.flash : 0);
  }

  if (state === S.GAMEOVER) {
    ctx.fillStyle = 'rgba(2,3,10,0.75)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.textAlign = 'center';
    ctx.font = `bold 32px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = C.red;
    ctx.fillText('💥 SHIP DESTROYED', cw / 2, ch * 0.38);
    ctx.font = `17px 'Inter', sans-serif`;
    ctx.fillStyle = C.text;
    ctx.fillText(`Distance reached: ${dist}m`, cw / 2, ch * 0.50);
    ctx.fillStyle = C.brand;
    ctx.fillText(`Best: ${highDist}m`, cw / 2, ch * 0.58);
    ctx.font = `14px 'Inter', sans-serif`;
    ctx.fillStyle = C.accent;
    ctx.fillText(`Rocks destroyed: ${destroyedCount}`, cw / 2, ch * 0.66);
    ctx.font = `14px 'Inter', sans-serif`;
    ctx.fillStyle = `rgba(238,241,245,${0.5 + 0.5 * Math.sin(menuPulse * 4)})`;
    ctx.fillText('Tap / Click to play again', cw / 2, ch * 0.70);
  }

  ctx.restore();
}

// ── Game loop ─────────────────────────────────────────────────
let last = 0;
function loop(ts) {
  const dt = (ts - last) / 1000;
  last = ts;
  update(dt);
  render(ts);
  requestAnimationFrame(loop);
}

// ── Boot ──────────────────────────────────────────────────────
resizeCanvas();
resetAsteroids();
for (let i = 0; i < 120; i++) spawnStar(true);
input.x = cw / 2;
requestAnimationFrame(loop);