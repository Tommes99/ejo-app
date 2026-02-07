import dayjs from 'dayjs'
import 'dayjs/locale/de'

dayjs.locale('de')

export function formatDate(date: string | Date): string {
  return dayjs(date).format('DD.MM.YYYY')
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('DD.MM.YYYY HH:mm')
}

export function formatRelative(date: string | Date): string {
  const now = dayjs()
  const d = dayjs(date)
  const diffMinutes = now.diff(d, 'minute')
  const diffHours = now.diff(d, 'hour')
  const diffDays = now.diff(d, 'day')

  if (diffMinutes < 1) return 'Gerade eben'
  if (diffMinutes < 60) return `vor ${diffMinutes} Min.`
  if (diffHours < 24) return `vor ${diffHours} Std.`
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  return formatDate(date)
}

export function isValidDay(month: number, day: number, year?: number): boolean {
  const y = year || new Date().getFullYear()
  const daysInMonth = new Date(y, month, 0).getDate()
  return day <= daysInMonth
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
