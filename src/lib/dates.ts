export function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  if (dateStr.includes('-')) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  return new Date();
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';

  const date = parseDate(dateStr);
  if (isNaN(date.getTime())) return '';

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatDateFull(dateStr: string): string {
  const date = parseDate(dateStr);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
