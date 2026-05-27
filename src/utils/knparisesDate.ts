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

export function defaultPaymentDateRange(): {date_from: string; date_upto: string} {
  const upto = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    date_from: formatKnparisesDate(from),
    date_upto: formatKnparisesDate(upto),
  };
}
