const express = require('express');
const path = require('path');

const app = express();

// Servir archivos estáticos desde la carpeta dist
const distFolder = path.join(__dirname, 'dist/examen-final-backend/browser');
app.use(express.static(distFolder));

// Manejo de rutas - redirigir todas las peticiones al index.html
app.get('/*', (req, res) => {
  res.sendFile(path.join(distFolder, 'index.html'));
});

// Puerto desde variable de entorno o 8080 por defecto
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Aplicación disponible en http://localhost:${PORT}`);
});
