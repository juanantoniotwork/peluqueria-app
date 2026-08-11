// Festivos oficiales de San Vicente del Raspeig (Alicante) para 2026: nacionales,
// autonómicos (Comunitat Valenciana, Decreto 100/2025) y locales (aprobados por el
// Ayuntamiento el 8/9/2025). Hay que actualizar esta lista cada año.
const HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'Año Nuevo' },
  { date: '2026-01-06', name: 'Epifanía del Señor' },
  { date: '2026-03-19', name: 'San José' },
  { date: '2026-04-03', name: 'Viernes Santo' },
  { date: '2026-04-06', name: 'Lunes de Pascua' },
  { date: '2026-04-13', name: 'Festivo local' },
  { date: '2026-04-14', name: 'Moros y Cristianos' },
  { date: '2026-05-01', name: 'Día del Trabajador' },
  { date: '2026-06-24', name: 'San Juan' },
  { date: '2026-08-15', name: 'Asunción de la Virgen' },
  { date: '2026-10-09', name: 'Día de la Comunitat Valenciana' },
  { date: '2026-10-12', name: 'Fiesta Nacional de España' },
  { date: '2026-12-08', name: 'Inmaculada Concepción' },
  { date: '2026-12-25', name: 'Navidad' },
];

const HOLIDAYS_BY_DATE = new Map(HOLIDAYS_2026.map((h) => [h.date, h.name]));

export function getHolidayName(isoDate) {
  return HOLIDAYS_BY_DATE.get(isoDate) || null;
}

export function isHoliday(isoDate) {
  return HOLIDAYS_BY_DATE.has(isoDate);
}
