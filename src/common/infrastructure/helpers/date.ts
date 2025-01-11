import { format as tempo } from '@formkit/tempo';

export function formatDate(date: string | Date, format = 'YYYY-MM-DD HH:mm:ss'): string {
  return tempo({
    date,
    format,
    tz: 'America/Lima',
  });
}

export function getToday(format = 'YYYY-MM-DD'): string {
  return formatDate(new Date(), format);
}
