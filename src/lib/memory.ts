/**
 * Pure Game Logic for Memory Match Cards
 * All functions are deterministic, side-effect free (except safe localStorage helpers),
 * and strictly typed.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  rows: number;
  cols: number;
  totalCards: number;
  pairs: number;
}

export interface Card {
  id: number;
  pairId: number;
  emoji: string;
  name: string;
}

export interface BestScore {
  moves: number;
  timeSeconds: number;
}

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy (3×4)',
    rows: 3,
    cols: 4,
    totalCards: 12,
    pairs: 6,
  },
  medium: {
    id: 'medium',
    label: 'Medium (4×4)',
    rows: 4,
    cols: 4,
    totalCards: 16,
    pairs: 8,
  },
  hard: {
    id: 'hard',
    label: 'Hard (6×6)',
    rows: 6,
    cols: 6,
    totalCards: 36,
    pairs: 18,
  },
};

export const EMOJI_POOL: Array<{ emoji: string; name: string }> = [
  { emoji: '👾', name: 'Alien Invader' },
  { emoji: '🚀', name: 'Rocket' },
  { emoji: '💎', name: 'Diamond Gem' },
  { emoji: '⚡', name: 'Lightning Bolt' },
  { emoji: '🎮', name: 'Game Controller' },
  { emoji: '🪐', name: 'Ringed Planet' },
  { emoji: '🔮', name: 'Crystal Orb' },
  { emoji: '⭐', name: 'Golden Star' },
  { emoji: '🔥', name: 'Arcade Fire' },
  { emoji: '🎯', name: 'Bullseye Target' },
  { emoji: '🏆', name: 'Victory Trophy' },
  { emoji: '🧩', name: 'Puzzle Piece' },
  { emoji: '🛸', name: 'Flying Saucer' },
  { emoji: '🧬', name: 'DNA Helix' },
  { emoji: '🛡️', name: 'Energy Shield' },
  { emoji: '👑', name: 'Crown' },
  { emoji: '🌈', name: 'Neon Rainbow' },
  { emoji: '🎲', name: 'Lucky Dice' },
];

/**
 * Modern Fisher-Yates (Knuth) Shuffle algorithm.
 * Guarantees unbiased O(n) permutation. Never uses Math.random() - 0.5.
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Builds a fresh, randomized deck of paired cards for the selected difficulty.
 */
export function buildDeck(difficulty: Difficulty): Card[] {
  const config = DIFFICULTIES[difficulty];
  const selectedEmojis = EMOJI_POOL.slice(0, config.pairs);

  const rawCards: Card[] = [];
  let cardId = 0;

  for (let pairIdx = 0; pairIdx < selectedEmojis.length; pairIdx++) {
    const item = selectedEmojis[pairIdx];
    // First card of pair
    rawCards.push({
      id: cardId++,
      pairId: pairIdx,
      emoji: item.emoji,
      name: item.name,
    });
    // Second card of pair
    rawCards.push({
      id: cardId++,
      pairId: pairIdx,
      emoji: item.emoji,
      name: item.name,
    });
  }

  return shuffle(rawCards);
}

/**
 * Checks if two cards match.
 */
export function checkMatch(card1: Card, card2: Card): boolean {
  return card1.pairId === card2.pairId;
}

/**
 * Compares two scores. A score is strictly better if it has fewer moves,
 * or equal moves with fewer elapsed seconds.
 */
export function isBetterScore(candidate: BestScore, current: BestScore | null): boolean {
  if (!current) return true;
  if (candidate.moves < current.moves) return true;
  if (candidate.moves === current.moves && candidate.timeSeconds < current.timeSeconds) return true;
  return false;
}

const STORAGE_PREFIX = 'arcadelab_memory_best_v1_';

/**
 * Safely reads the best score for a difficulty from localStorage.
 */
export function getBestScore(difficulty: Difficulty): BestScore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${difficulty}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.moves === 'number' &&
      typeof parsed.timeSeconds === 'number' &&
      parsed.moves > 0 &&
      parsed.timeSeconds >= 0
    ) {
      return { moves: parsed.moves, timeSeconds: parsed.timeSeconds };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Safely saves the score to localStorage if it's a new personal best.
 * Returns true if a new personal best was established, false otherwise.
 */
export function saveBestScore(difficulty: Difficulty, candidate: BestScore): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getBestScore(difficulty);
    if (isBetterScore(candidate, current)) {
      window.localStorage.setItem(`${STORAGE_PREFIX}${difficulty}`, JSON.stringify(candidate));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Formats a duration in seconds to a human-readable mm:ss string.
 */
export function formatTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
