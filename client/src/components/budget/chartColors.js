// Base chart palette is route-blue + ochre only, per frontend-design.md
// Section 9 — stamp-red is reserved for the over-budget indicator alone,
// never part of the base chart palette.
const ROUTE_BLUE = '#2C5F7C';
const OCHRE = '#B8823A';

export function chartPalette(count) {
  const base = [ROUTE_BLUE, OCHRE];
  const opacities = [1, 1, 0.65, 0.65, 0.4, 0.4];
  return Array.from({ length: count }, (_, i) => {
    const hex = base[i % 2];
    const opacity = opacities[i] ?? 0.4;
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${hex}${alpha}`;
  });
}
