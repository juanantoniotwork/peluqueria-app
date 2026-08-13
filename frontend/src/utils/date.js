import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';

export function toISODate(date) {
  return format(date, 'yyyy-MM-dd');
}

export function fromISODate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getWeekDays(date) {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getMonthGrid(date) {
  const gridStart = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function isInMonth(date, referenceDate) {
  return isSameMonth(date, referenceDate);
}

export function isWeekendDay(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function isPastAppointment(isoDate, time, now) {
  const [hours, minutes] = time.split(':').map(Number);
  const apptDateTime = fromISODate(isoDate);
  apptDateTime.setHours(hours, minutes, 0, 0);
  return apptDateTime.getTime() < now.getTime();
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatDayLabel(date) {
  return format(date, "EEE d 'de' MMM", { locale: es });
}

export function formatLongDate(date) {
  return capitalizeFirst(format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es }));
}

export function formatMonthLabel(date) {
  return capitalizeFirst(format(date, 'MMMM yyyy', { locale: es }));
}

export function formatWeekRangeLabel(date) {
  const days = getWeekDays(date);
  const monday = days[0];
  const sunday = days[6];
  return `${format(monday, 'd')} – ${format(sunday, 'd')} de ${format(sunday, 'MMMM', { locale: es })} ${format(sunday, 'yyyy')}`;
}

export function formatDayNumber(date) {
  return format(date, 'd');
}

export function formatShortDate(date) {
  return format(date, "d 'de' MMM", { locale: es });
}
