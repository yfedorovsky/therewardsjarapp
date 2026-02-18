export const KID_COLORS = [
  '#4F8EF7', // blue
  '#F76FAB', // pink
  '#34D399', // green
  '#FBBF24', // yellow
  '#A78BFA', // purple
  '#FB923C', // orange
] as const;

export const TASK_CATEGORIES = ['household', 'personal'] as const;

export const DEFAULT_HOUSEHOLD_NAME = 'Home';

export const STICKER_SETS = {
  stars: ['\u2B50', '\u{1F31F}', '\u2728', '\u{1F4AB}'],
  animals: ['\u{1F436}', '\u{1F431}', '\u{1F430}', '\u{1F98A}', '\u{1F43C}'],
  nature: ['\u{1F338}', '\u{1F33A}', '\u{1F33B}', '\u{1F340}', '\u{1F308}'],
  food: ['\u{1F34E}', '\u{1F36A}', '\u{1F9C1}', '\u{1F355}', '\u{1F369}'],
} as const;

export const NAV_TABS = [
  { id: 'jar', label: 'Home' },
  { id: 'household', label: 'Family' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'rewards', label: 'Rewards' },
  { id: 'settings', label: 'Settings' },
] as const;

export type TabId = (typeof NAV_TABS)[number]['id'];
