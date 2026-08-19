require('dotenv').config();
const app = require('./app');
const checkSecrets = require('./utils/checkSecrets');

checkSecrets();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
