export const THEMES = [
  { id: 'dark', label: 'Dark', icon: '🌑', description: 'Deep navy industrial' },
  { id: 'light', label: 'Light', icon: '☀️', description: 'Clean & bright' },
  { id: 'oled', label: 'OLED Black', icon: '⬛', description: 'True black for OLED' },
  { id: 'sepia', label: 'Sepia', icon: '📖', description: 'Warm reading mode' },
  { id: 'high-contrast', label: 'High Contrast', icon: '🔲', description: 'Maximum accessibility' },
  { id: 'system', label: 'System / Auto', icon: '🖥️', description: 'Follows your OS' },
];

export const STORAGE_KEY = 'pulpchain-theme';

export const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const applyTheme = (themeId) => {
  const resolved = themeId === 'system' ? getSystemTheme() : themeId;
  document.documentElement.setAttribute('data-theme', resolved);
};
