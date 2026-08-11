// `dateStr` es "YYYY-MM-DD". Se guarda/compara como medianoche UTC de ese día.

function parseDateOnly(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

module.exports = { parseDateOnly, formatDate };
