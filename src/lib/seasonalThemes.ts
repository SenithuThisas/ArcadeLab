export interface SeasonalTheme {
  id: string;
  month: number; // 0 to 11
  name: string;
  badge: string;
  subtitle: string;
  icon: string;
  fontHeading: string;
  headlineGradient: string;
  colors: {
    brand: string;
    accent: string;
    glowStart: string;
    glowMid: string;
    glowEnd: string;
    surfaceTint: string;
    particlePalette: string[];
  };
  visualTheme: 'frost' | 'hearts' | 'sakura' | 'emerald' | 'solar' | 'synthwave' | 'abyss' | 'meteor' | 'autumn' | 'halloween' | 'harvest' | 'holiday';
}

export const SEASONAL_THEMES: Record<string, SeasonalTheme> = {
  jan: {
    id: 'jan',
    month: 0,
    name: 'Neon Frost',
    badge: '❄️ Cyber Winter Edition',
    subtitle: 'Crisp ice crystal geometry & deep frost twilight',
    icon: '❄️',
    fontHeading: "'Orbitron', 'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 35%, #38dbf5 70%, #c4b5fd 100%)',
    colors: {
      brand: '#38dbf5',
      accent: '#8b9dfa',
      glowStart: 'rgba(56, 219, 245, 0.25)',
      glowMid: 'rgba(139, 157, 250, 0.18)',
      glowEnd: 'rgba(100, 220, 255, 0.12)',
      surfaceTint: 'rgba(15, 23, 42, 0.65)',
      particlePalette: ['#ffffff', '#a5f3fc', '#38dbf5', '#c4b5fd', '#e0e7ff'],
    },
    visualTheme: 'frost',
  },
  feb: {
    id: 'feb',
    month: 1,
    name: 'Nebula Love',
    badge: '💖 Cyber Valentine Edition',
    subtitle: 'Cosmic heart pulses & shimmering magenta stardust',
    icon: '💖',
    fontHeading: "'Outfit', 'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #ff94b8 35%, #ff5e8a 70%, #c084fc 100%)',
    colors: {
      brand: '#ff5e8a',
      accent: '#9d8df1',
      glowStart: 'rgba(255, 94, 138, 0.25)',
      glowMid: 'rgba(157, 141, 241, 0.18)',
      glowEnd: 'rgba(251, 113, 133, 0.12)',
      surfaceTint: 'rgba(28, 12, 28, 0.65)',
      particlePalette: ['#ff5e8a', '#ff94b8', '#9d8df1', '#f472b6', '#ffffff'],
    },
    visualTheme: 'hearts',
  },
  mar: {
    id: 'mar',
    month: 2,
    name: 'Sakura Bloom',
    badge: '🌸 Hanami Spring Edition',
    subtitle: 'Floating cherry blossom petals, spring breeze & Suzume theme melody',
    icon: '🌸',
    fontHeading: "'Outfit', 'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #ffafb0 35%, #ff85a2 70%, #fed7aa 100%)',
    colors: {
      brand: '#ff85a2',
      accent: '#f7d070',
      glowStart: 'rgba(255, 133, 162, 0.25)',
      glowMid: 'rgba(247, 208, 112, 0.18)',
      glowEnd: 'rgba(255, 175, 176, 0.12)',
      surfaceTint: 'rgba(26, 16, 24, 0.65)',
      particlePalette: ['#ff85a2', '#ffafb0', '#fed7aa', '#fbcfe8', '#ffffff'],
    },
    visualTheme: 'sakura',
  },
  apr: {
    id: 'apr',
    month: 3,
    name: 'Emerald Awakening',
    badge: '🌱 Earth & Sprout Edition',
    subtitle: 'Bioluminescent plant spores & fresh spring aurora',
    icon: '🌱',
    fontHeading: "'Outfit', 'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #6ee7b7 35%, #10b981 70%, #38dbf5 100%)',
    colors: {
      brand: '#10b981',
      accent: '#38dbf5',
      glowStart: 'rgba(16, 185, 129, 0.25)',
      glowMid: 'rgba(56, 219, 245, 0.18)',
      glowEnd: 'rgba(52, 211, 153, 0.12)',
      surfaceTint: 'rgba(10, 24, 20, 0.65)',
      particlePalette: ['#10b981', '#34d399', '#6ee7b7', '#38dbf5', '#a7f3d0'],
    },
    visualTheme: 'emerald',
  },
  may: {
    id: 'may',
    month: 4,
    name: 'Vesak Festival',
    badge: '🪔 Vesak Festival of Lights Edition',
    subtitle: 'Luminous Vesak lanterns, floating lotus candles, and serene moonlight',
    icon: '🪔',
    fontHeading: "'Outfit', 'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fde047 30%, #fb923c 65%, #f43f5e 100%)',
    colors: {
      brand: '#fbbf24',
      accent: '#f43f5e',
      glowStart: 'rgba(251, 191, 36, 0.26)',
      glowMid: 'rgba(244, 63, 94, 0.18)',
      glowEnd: 'rgba(253, 224, 71, 0.12)',
      surfaceTint: 'rgba(18, 12, 28, 0.70)',
      particlePalette: ['#fde047', '#fbbf24', '#f43f5e', '#fb7185', '#fed7aa', '#fef08a', '#ffffff'],
    },
    visualTheme: 'vesak',
  },
  jun: {
    id: 'jun',
    month: 5,
    name: 'Retro Cyberwave',
    badge: '🌴 Summer Solstice Edition',
    subtitle: 'Neon synthwave sunsets & electric arcade grid glow',
    icon: '🌴',
    fontHeading: "'Orbitron', 'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #f472b6 30%, #ec4899 65%, #06b6d4 100%)',
    colors: {
      brand: '#ec4899',
      accent: '#06b6d4',
      glowStart: 'rgba(236, 72, 153, 0.28)',
      glowMid: 'rgba(6, 182, 212, 0.20)',
      glowEnd: 'rgba(249, 115, 22, 0.14)',
      surfaceTint: 'rgba(28, 10, 26, 0.65)',
      particlePalette: ['#ec4899', '#f43f5e', '#06b6d4', '#a855f7', '#fbbf24'],
    },
    visualTheme: 'synthwave',
  },
  jul: {
    id: 'jul',
    month: 6,
    name: 'Abyssal Ocean',
    badge: '🌊 Deep Aqua Edition',
    subtitle: 'Bioluminescent bubbles & serene deep-sea waves',
    icon: '🌊',
    fontHeading: "'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 35%, #00f2fe 70%, #4facfe 100%)',
    colors: {
      brand: '#00f2fe',
      accent: '#4facfe',
      glowStart: 'rgba(0, 242, 254, 0.26)',
      glowMid: 'rgba(79, 172, 254, 0.18)',
      glowEnd: 'rgba(110, 231, 183, 0.12)',
      surfaceTint: 'rgba(8, 22, 34, 0.65)',
      particlePalette: ['#00f2fe', '#4facfe', '#6ee7b7', '#38bdf8', '#e0f2fe'],
    },
    visualTheme: 'abyss',
  },
  aug: {
    id: 'aug',
    month: 7,
    name: 'Perseid Meteor',
    badge: '🌠 Meteor Shower Edition',
    subtitle: 'Shooting starlight streaks, cosmic dust & Hymn For The Weekend melody',
    icon: '🌠',
    fontHeading: "'Orbitron', 'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fef08a 35%, #fcd34d 70%, #818cf8 100%)',
    colors: {
      brand: '#fcd34d',
      accent: '#6366f1',
      glowStart: 'rgba(252, 211, 77, 0.25)',
      glowMid: 'rgba(99, 102, 241, 0.20)',
      glowEnd: 'rgba(45, 212, 191, 0.12)',
      surfaceTint: 'rgba(16, 14, 36, 0.65)',
      particlePalette: ['#ffffff', '#fcd34d', '#818cf8', '#2dd4bf', '#fde047'],
    },
    visualTheme: 'meteor',
  },
  sep: {
    id: 'sep',
    month: 8,
    name: 'Autumn Equinox',
    badge: '🍂 Hogwarts & Autumn Harvest Edition',
    subtitle: 'Golden autumn maple canopy with the silhouetted Hogwarts castle on the horizon',
    icon: '🍂',
    fontHeading: "'Cinzel', 'Space Grotesk', serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fde68a 30%, #f2b84b 60%, #ff8c42 85%, #ef4444 100%)',
    colors: {
      brand: '#f2b84b',
      accent: '#ff8c42',
      glowStart: 'rgba(242, 184, 75, 0.28)',
      glowMid: 'rgba(255, 140, 66, 0.20)',
      glowEnd: 'rgba(239, 68, 68, 0.12)',
      surfaceTint: 'rgba(28, 18, 12, 0.65)',
      particlePalette: ['#f2b84b', '#ff8c42', '#ef4444', '#d97706', '#fde68a'],
    },
    visualTheme: 'autumn',
  },
  oct: {
    id: 'oct',
    month: 9,
    name: 'Spooky Haunt',
    badge: '🎃 Halloween Haunt Edition',
    subtitle: 'Ethereal ghostly wisps, glowing pumpkins & This Is Halloween melody',
    icon: '🎃',
    fontHeading: "'Cinzel', 'Space Grotesk', serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fb923c 30%, #f97316 60%, #c084fc 85%, #a855f7 100%)',
    colors: {
      brand: '#f97316',
      accent: '#a855f7',
      glowStart: 'rgba(249, 115, 22, 0.30)',
      glowMid: 'rgba(168, 85, 247, 0.22)',
      glowEnd: 'rgba(132, 204, 22, 0.14)',
      surfaceTint: 'rgba(24, 12, 32, 0.65)',
      particlePalette: ['#f97316', '#fb923c', '#c084fc', '#a855f7', '#a3e635'],
    },
    visualTheme: 'halloween',
  },
  nov: {
    id: 'nov',
    month: 10,
    name: 'Cosmic Harvest',
    badge: '✨ Twilight Constellation Edition',
    subtitle: 'Celestial twilight auroras & warm golden star clusters',
    icon: '✨',
    fontHeading: "'Outfit', 'Space Grotesk', sans-serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fef08a 35%, #eab308 70%, #d97706 100%)',
    colors: {
      brand: '#eab308',
      accent: '#d97706',
      glowStart: 'rgba(234, 179, 8, 0.25)',
      glowMid: 'rgba(217, 119, 6, 0.18)',
      glowEnd: 'rgba(180, 83, 9, 0.12)',
      surfaceTint: 'rgba(26, 20, 10, 0.65)',
      particlePalette: ['#eab308', '#facc15', '#fb923c', '#d97706', '#fef08a'],
    },
    visualTheme: 'harvest',
  },
  dec: {
    id: 'dec',
    month: 11,
    name: 'Holiday Wonderland',
    badge: '🎄 Winter Holiday Edition',
    subtitle: 'Sparkling festive ornaments, crisp snow & Jingle Bell Rock holiday melody',
    icon: '🎄',
    fontHeading: "'Cinzel', 'Space Grotesk', serif",
    headlineGradient: 'linear-gradient(135deg, #ffffff 0%, #fecdd3 30%, #f43f5e 60%, #fbbf24 85%, #10b981 100%)',
    colors: {
      brand: '#f43f5e',
      accent: '#10b981',
      glowStart: 'rgba(244, 63, 94, 0.28)',
      glowMid: 'rgba(16, 185, 129, 0.20)',
      glowEnd: 'rgba(251, 191, 36, 0.14)',
      surfaceTint: 'rgba(24, 14, 18, 0.65)',
      particlePalette: ['#ffffff', '#f43f5e', '#10b981', '#fbbf24', '#fecdd3'],
    },
    visualTheme: 'holiday',
  },
};

export const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function getCurrentMonthKey(): string {
  const monthIndex = new Date().getMonth();
  return MONTH_KEYS[monthIndex] || 'sep';
}

export function getAutoThemeKey(): string {
  return getCurrentMonthKey();
}

export function getCurrentTheme(): SeasonalTheme {
  const key = getCurrentMonthKey();
  return SEASONAL_THEMES[key] || SEASONAL_THEMES['sep'];
}
