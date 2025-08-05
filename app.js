const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('¡Backend Express funcionando!');
});

// Ruta de ejemplo para registrar asistencia
app.post('/asistencia', (req, res) => {
  const data = req.body;
  console.log('Entrada de asistencia:', data);
  res.json({ status: 'ok', recibido: data });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
