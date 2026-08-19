// Aviso de arranque: comprueba que las variables sensibles no se hayan
// quedado en su valor de ejemplo. No detiene el servidor (solo avisa),
// porque un fallo aquí en producción dejaría la app caída sin más.
const KNOWN_PLACEHOLDER = 'change-this-secret-in-production';
const MIN_LENGTH = 24;

function checkSecrets() {
  const secret = process.env.JWT_SECRET || '';
  const looksDefault = secret === KNOWN_PLACEHOLDER;
  const looksWeak = secret.length > 0 && secret.length < MIN_LENGTH;

  if (!secret || looksDefault || looksWeak) {
    console.warn('');
    console.warn('⚠️  ⚠️  ⚠️  AVISO DE SEGURIDAD  ⚠️  ⚠️  ⚠️');
    console.warn('JWT_SECRET no está configurado correctamente:');
    if (!secret) console.warn('  - No hay ningún valor definido.');
    if (looksDefault) console.warn('  - Sigue siendo el valor de ejemplo del repositorio (público en GitHub).');
    if (looksWeak) console.warn(`  - Es demasiado corto (${secret.length} caracteres, mínimo recomendado ${MIN_LENGTH}).`);
    console.warn('Cualquiera que conozca este valor puede fabricar sesiones válidas,');
    console.warn('incluidas de administrador. Genera uno nuevo y ponlo en las');
    console.warn('variables de entorno de Railway (no en el código):');
    console.warn('  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"');
    console.warn('');
  }
}

module.exports = checkSecrets;
