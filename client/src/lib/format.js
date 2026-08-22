const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDateShort(val) {
  if (!val) return '';
  try {
    const d = typeof val === 'string' && val.length === 10 ? new Date(`${val}T00:00:00`) : new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  } catch (e) {
    return String(val);
  }
}

export function formatDateRange(startVal, endVal) {
  if (!startVal && !endVal) return '';
  if (!startVal) return formatDateShort(endVal);
  if (!endVal) return formatDateShort(startVal);
  return `${formatDateShort(startVal)} – ${formatDateShort(endVal)}`;
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
  try {
    const aS = typeof aStart === 'string' && aStart.length === 10 ? new Date(`${aStart}T00:00:00`) : new Date(aStart);
    const aE = typeof aEnd === 'string' && aEnd.length === 10 ? new Date(`${aEnd}T00:00:00`) : new Date(aEnd);
    const bS = typeof bStart === 'string' && bStart.length === 10 ? new Date(`${bStart}T00:00:00`) : new Date(bStart);
    const bE = typeof bEnd === 'string' && bEnd.length === 10 ? new Date(`${bEnd}T00:00:00`) : new Date(bEnd);
    return aS <= bE && bS <= aE;
  } catch (e) {
    return false;
  }
}
