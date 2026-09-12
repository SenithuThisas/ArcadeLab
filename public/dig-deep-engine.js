// ============================================================
//  Dig Deep — Polished Rocket Engine  (vanilla JS, no deps)
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
window.addEventListener('resize', () => { resizeCanvas(); resetTerrain(); });

// ── Colours ───────────────────────────────────────────────────
const C = {
  bg      : '#0a0c12',
  surface : '#12161f',
  accent  : '#ff8c42',
  brand   : '#f2b84b',
  text    : '#eef1f5',
  muted   : '#8b93a1',
  red     : '#ff4757',
  cyan    : '#4dd9f0',
  purple  : '#a855f7',
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

// ── Player ────────────────────────────────────────────────────
const ROCKET_W = 26, ROCKET_H = 38;
const player = { x:0, y:0, vx:0, vy:0, invincible:0, flash:0 };
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

// ── Obstacles (asteroids) ─────────────────────────────────────
const terrain  = [];
const ROCK_H   = 18;
function resetTerrain() {
  terrain.length = 0;
  const cfg = DIFF[difficulty];
  const maxAlt = 8000; // how many px upward to generate rocks
  for (let y = -cfg.gap; y > -maxAlt; y -= cfg.gap) {
    const [mn, mx] = cfg.rockW;
    const w = mn + Math.random() * (mx - mn);
    const x = 8 + Math.random() * ((cw || 700) - w - 16);
    const hue = 20 + Math.random() * 30;
    terrain.push({ x, y, w, h: ROCK_H, hue, bump: Math.random() * 4 - 2 });
  }
}

// ── Particles ─────────────────────────────────────────────────
const particles = [];
function emitThrust(px, py) {
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: px, y: py + ROCKET_H,
      vx: (Math.random() - 0.5) * 30,
      vy: 20 + Math.random() * 40,
      life: 0.4 + Math.random() * 0.3,
      maxLife: 0.6,
      r: 3 + Math.random() * 3,
      color: Math.random() < 0.5 ? '#ff8c42' : '#ff4500',
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
      color: ['#ff8c42','#ff4500','#f2b84b','#fff','#ff4757'][Math.floor(Math.random()*5)],
      type: 'explosion',
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
canvas.addEventListener('mousedown', e => { input.held = true; input.x = pointerX(e); });
canvas.addEventListener('mouseup',   () => { input.held = false; });
canvas.addEventListener('touchstart', e => {
  input.held = true; input.x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  input.x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
  e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend',  () => { input.held = false; });

document.getElementById('ui-difficulty').addEventListener('change', e => {
  difficulty = e.target.value;
  resetTerrain();
});

// ── Score & lives ─────────────────────────────────────────────
let depth = 0, highDepth = Number(localStorage.getItem('dig-deep-hi')) || 0;
let lives = 5;
const MAX_LIVES = 5;
const elScore = document.getElementById('ui-score');
const elHigh  = document.getElementById('ui-high');
const elLives = document.getElementById('ui-lives');
elHigh.textContent = highDepth;

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
  elScore.textContent = depth;
  if (depth > highDepth) {
    highDepth = depth;
    elHigh.textContent = highDepth;
    localStorage.setItem('dig-deep-hi', highDepth);
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

  // update stars
  const scrollSpeed = state === S.PLAYING ? DIFF[difficulty].speedBase * dt * 0.15 : 0.3 * dt * 60;
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
  const targetX = input.x - ROCKET_W / 2;
  player.x += (targetX - player.x) * Math.min(1, dt * 12); // smooth follow
  player.x = Math.max(0, Math.min(cw - ROCKET_W, player.x));

  const cfg = DIFF[difficulty];
  // gravity always pulls down (increases vy)
  player.vy += cfg.gravity * dt;
  // thrust pushes UP (decreases vy) when held
  if (input.held) {
    player.vy -= cfg.thrust * dt;
    emitThrust(player.x + ROCKET_W / 2, ch / 2 + ROCKET_H / 2);
  }
  player.vy = Math.max(-MAX_VY, Math.min(MAX_VY, player.vy));
  player.y += player.vy * dt;
  // clamp: can't fall below starting position
  if (player.y > 0) { player.y = 0; player.vy = 0; }

  depth = Math.max(0, Math.floor(-player.y)); // altitude = how far UP we've gone
  tickScore();

  // collision
  if (player.invincible <= 0) {
    for (const rock of terrain) {
      const sy = rock.y - player.y + ch / 2;  // rock screen Y
      const rocketScreenY = ch / 2 - ROCKET_H / 2;
      if (sy < rocketScreenY + ROCKET_H - 4 && sy + rock.h > rocketScreenY + 4 &&
          rock.x < player.x + ROCKET_W - 4 && rock.x + rock.w > player.x + 4) {
        emitExplosion(player.x + ROCKET_W / 2, ch / 2);
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
  player.x = cw / 2 - ROCKET_W / 2;
  player.y = 0;
  player.vy = 0;
  player.invincible = 0;
  depth = 0;
  lives = MAX_LIVES;
  renderLives();
  tickScore();
  particles.length = 0;
  resetTerrain();
  state = S.PLAYING;
}

// ── Draw helpers ──────────────────────────────────────────────
function drawRocket(x, y, thrusting, flash) {
  ctx.save();
  ctx.translate(x + ROCKET_W / 2, y + ROCKET_H / 2);
  if (flash > 0 && Math.sin(flash * 30) > 0) {
    ctx.globalAlpha = 0.4;
  }

  // glow
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 28);
  glow.addColorStop(0, 'rgba(255,140,66,0.35)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fill();

  const hw = ROCKET_W / 2, hh = ROCKET_H / 2;

  // body gradient
  const bg = ctx.createLinearGradient(-hw, -hh, hw, hh);
  bg.addColorStop(0, '#e0e8ff');
  bg.addColorStop(0.4, '#c0cce8');
  bg.addColorStop(1, '#8090b0');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(0, -hh);           // nose
  ctx.bezierCurveTo(hw*0.6, -hh*0.3, hw*0.8, hh*0.3, hw*0.5, hh); // right side
  ctx.lineTo(-hw*0.5, hh);
  ctx.bezierCurveTo(-hw*0.8, hh*0.3, -hw*0.6, -hh*0.3, 0, -hh);
  ctx.closePath();
  ctx.fill();

  // cockpit window
  const win = ctx.createRadialGradient(-2, -hh*0.15, 1, 0, -hh*0.2, 7);
  win.addColorStop(0, '#a8f0ff');
  win.addColorStop(1, '#2060a0');
  ctx.fillStyle = win;
  ctx.beginPath(); ctx.ellipse(0, -hh*0.2, 6, 7, 0, 0, Math.PI*2); ctx.fill();

  // left fin
  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.moveTo(-hw*0.5, hh*0.4);
  ctx.lineTo(-hw*1.1, hh*1.0);
  ctx.lineTo(-hw*0.4, hh);
  ctx.closePath(); ctx.fill();

  // right fin
  ctx.beginPath();
  ctx.moveTo(hw*0.5, hh*0.4);
  ctx.lineTo(hw*1.1, hh*1.0);
  ctx.lineTo(hw*0.4, hh);
  ctx.closePath(); ctx.fill();

  // engine nozzle
  ctx.fillStyle = '#555';
  ctx.fillRect(-6, hh - 4, 12, 7);

  ctx.restore();
}

function drawRock(rock, screenY) {
  ctx.save();
  const { x, w, h, hue, bump } = rock;
  const rg = ctx.createLinearGradient(x, screenY, x + w, screenY + h);
  rg.addColorStop(0, `hsl(${hue},70%,55%)`);
  rg.addColorStop(0.5, `hsl(${hue},60%,38%)`);
  rg.addColorStop(1, `hsl(${hue},50%,22%)`);
  ctx.fillStyle = rg;
  // rounded rect with slight warp
  const r = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, screenY + bump);
  ctx.lineTo(x + w - r, screenY - bump);
  ctx.quadraticCurveTo(x + w, screenY, x + w, screenY + r);
  ctx.lineTo(x + w, screenY + h - r);
  ctx.quadraticCurveTo(x + w, screenY + h, x + w - r, screenY + h);
  ctx.lineTo(x + r, screenY + h);
  ctx.quadraticCurveTo(x, screenY + h, x, screenY + h - r);
  ctx.lineTo(x, screenY + r);
  ctx.quadraticCurveTo(x, screenY, x + r, screenY + bump);
  ctx.fill();
  // highlight strip
  ctx.fillStyle = `rgba(255,255,255,0.18)`;
  ctx.fillRect(x + 6, screenY + 2, w - 12, 4);
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

  // background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, ch);
  bg.addColorStop(0, '#050710');
  bg.addColorStop(1, '#0d0f1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cw, ch);

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
    // animated title
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `bold 32px 'Space Grotesk', sans-serif`;
    const grad = ctx.createLinearGradient(cw/2-100, 0, cw/2+100, 0);
    grad.addColorStop(0, '#f2b84b');
    grad.addColorStop(1, '#ff8c42');
    ctx.fillStyle = grad;
    ctx.fillText('🚀 DIG DEEP', cw / 2, ch * 0.38);
    ctx.font = `16px 'Inter', sans-serif`;
    ctx.fillStyle = `rgba(238,241,245,${0.6 + 0.4 * Math.sin(menuPulse * 3)})`;
    ctx.fillText('Tap / Click & Hold to thrust downward', cw / 2, ch * 0.52);
    ctx.fillText('Steer with your mouse or finger 👆', cw / 2, ch * 0.60);
    ctx.font = `13px 'JetBrains Mono', monospace`;
    ctx.fillStyle = C.muted;
    ctx.fillText(`Best altitude: ${highDepth}m`, cw / 2, ch * 0.72);
    ctx.restore();
    ctx.restore();
    return;
  }

  // terrain
  for (const rock of terrain) {
    const sy2 = rock.y - player.y + ch / 2;
    if (sy2 > -ROCK_H - 20 && sy2 < ch + 20) drawRock(rock, sy2);
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

  // rocket (only when not in HIT-flash-invisible frame)
  if (state !== S.HIT || Math.sin(player.invincible * 25) > 0) {
    drawRocket(player.x, ch / 2 - ROCKET_H / 2, input.held, state === S.HIT ? player.flash : 0);
  }

  if (state === S.GAMEOVER) {
    ctx.fillStyle = 'rgba(5,7,16,0.75)';
    ctx.fillRect(0, 0, cw, ch);
    ctx.textAlign = 'center';
    ctx.font = `bold 34px 'Space Grotesk', sans-serif`;
    ctx.fillStyle = C.red;
    ctx.fillText('💥 GAME OVER', cw / 2, ch * 0.38);
    ctx.font = `18px 'Inter', sans-serif`;
    ctx.fillStyle = C.text;
    ctx.fillText(`Altitude reached: ${depth}m`, cw / 2, ch * 0.50);
    ctx.fillStyle = C.brand;
    ctx.fillText(`Best: ${highDepth}m`, cw / 2, ch * 0.58);
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
resetTerrain();
for (let i = 0; i < 120; i++) spawnStar(true);
input.x = cw / 2;
requestAnimationFrame(loop);
