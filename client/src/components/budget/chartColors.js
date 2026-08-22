// Wanderers Harmonious Chart Palette
const WANDERERS_PALETTE = [
  '#F5B800', // Gold Primary
  '#1E232A', // Charcoal Accent
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#F97316', // Vibrant Amber
  '#06B6D4', // Cyan
  '#EC4899', // Pink
];

export function chartPalette(count) {
  return Array.from({ length: count }, (_, i) => WANDERERS_PALETTE[i % WANDERERS_PALETTE.length]);
}
