const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateShort(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatDateRange(startIso, endIso) {
  if (!startIso || !endIso) return '';
  return `${formatDateShort(startIso)} – ${formatDateShort(endIso)}`;
}

export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export function formatDuration(hours) {
  const n = Number(hours) || 0;
  return Number.isInteger(n) ? `${n}h` : `${n.toFixed(1)}h`;
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return new Date(`${aStart}T00:00:00`) <= new Date(`${bEnd}T00:00:00`)
    && new Date(`${bStart}T00:00:00`) <= new Date(`${aEnd}T00:00:00`);
}
