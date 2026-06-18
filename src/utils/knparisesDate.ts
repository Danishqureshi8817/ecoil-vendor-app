const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatKnparisesDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function parseKnparisesDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const monthIndex = MONTHS.findIndex(
    month => month.toLowerCase() === match[2].toLowerCase(),
  );
  if (monthIndex < 0) {
    return null;
  }
  const year = Number(match[3]);
  const date = new Date(year, monthIndex, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function defaultPaymentDateRange(): {date_from: string; date_upto: string} {
  const upto = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    date_from: formatKnparisesDate(from),
    date_upto: formatKnparisesDate(upto),
  };
}
