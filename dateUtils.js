export function getDaysLeft(expiryDateStr) {
  if (!expiryDateStr) return { days: 0, text: 'No date', badgeClass: 'bg-slate-800 text-slate-400 border border-slate-700', dotClass: 'bg-slate-500' };
  
  const now = new Date();
  const [y,m,d] = expiryDateStr.split('-').map(Number);
  const diffDays = Math.round((Date.UTC(y,m-1,d)-Date.UTC(now.getFullYear(),now.getMonth(),now.getDate()))/86400000);
  
  // Exact user thresholds:
  // 30 to 23: Green
  // 22 to 15: Yellow
  // < 15: Red
  if (diffDays < 0) {
    return {
      days: diffDays,
      text: 'Expired',
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold',
      dotClass: 'bg-rose-400'
    };
  } else if (diffDays === 0) {
    return {
      days: 0,
      text: 'Expires Today',
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold',
      dotClass: 'bg-rose-400'
    };
  } else if (diffDays < 15) {
    // Under 15 days: RED (clean, no blinking)
    return {
      days: diffDays,
      text: `${diffDays}d left`,
      badgeClass: 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold',
      dotClass: 'bg-rose-400'
    };
  } else if (diffDays >= 15 && diffDays <= 22) {
    // 22 to 15 days: YELLOW (clean, no blinking)
    return {
      days: diffDays,
      text: `${diffDays}d left`,
      badgeClass: 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold',
      dotClass: 'bg-amber-400'
    };
  } else {
    // 23+ days: GREEN (clean, no blinking)
    return {
      days: diffDays,
      text: `${diffDays}d left`,
      badgeClass: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold',
      dotClass: 'bg-emerald-400'
    };
  }
}

// Sort accounts by remaining days left ascending (Lowest remaining days at the TOP)
export function sortAccountsByExpiry(accountsList) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return [...accountsList].sort((a, b) => {
    const expA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
    const expB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
    return expA - expB;
  });
}

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function calculateExpiry(startDateStr, durationDays = 30) {
  const days = Number(durationDays);
  if (!startDateStr || !Number.isFinite(days) || days < 1 || days > 10000) return '';
  const [y,m,d] = startDateStr.split('-').map(Number);
  const expiry = new Date(Date.UTC(y,m-1,d+days));
  return Number.isNaN(expiry.getTime()) ? '' : expiry.toISOString().slice(0,10);
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? new Date(dateStr+'T12:00:00') : new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}
