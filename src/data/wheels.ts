export interface WheelItem {
  id: string;
  label: string;
  weight: number;
  color?: string;
}

export interface WheelConfig {
  slug: string;
  category: 'decision' | 'food' | 'classroom' | 'party' | 'utility';
  palette: string[];
}

export const DEFAULT_PALETTE = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
];

export const WHEELS: WheelConfig[] = [
  { slug: 'yes-or-no', category: 'decision', palette: ['#10B981', '#EF4444'] },
  { slug: 'yes-no-maybe', category: 'decision', palette: ['#10B981', '#EF4444', '#F59E0B'] },
  { slug: 'what-to-eat', category: 'food', palette: DEFAULT_PALETTE },
  { slug: 'classroom-name-picker', category: 'classroom', palette: DEFAULT_PALETTE },
  { slug: 'random-team-generator', category: 'classroom', palette: DEFAULT_PALETTE },
  { slug: 'giveaway-winner-picker', category: 'utility', palette: DEFAULT_PALETTE },
  { slug: 'truth-or-dare', category: 'party', palette: ['#EC4899', '#8B5CF6', '#3B82F6', '#F59E0B'] },
  { slug: 'random-number-1-100', category: 'utility', palette: DEFAULT_PALETTE },
  { slug: 'random-number-1-10', category: 'utility', palette: DEFAULT_PALETTE },
  { slug: 'prize-wheel', category: 'party', palette: DEFAULT_PALETTE },
  { slug: 'decision-wheel', category: 'decision', palette: DEFAULT_PALETTE },
  { slug: 'movie-picker', category: 'party', palette: DEFAULT_PALETTE },
  { slug: 'chore-wheel', category: 'decision', palette: DEFAULT_PALETTE },
  { slug: 'random-letter-picker', category: 'classroom', palette: DEFAULT_PALETTE },
  { slug: 'workout-picker', category: 'utility', palette: DEFAULT_PALETTE },
];