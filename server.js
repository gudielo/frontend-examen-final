const express = require('express');
const path = require('path');
const sql = require('mssql');

const app = express();
app.use(express.json());

// CORS básico para entorno de desarrollo (ng serve en :4200 consumiendo API en :8080)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Servir archivos estáticos desde la carpeta dist
const distFolder = path.join(__dirname, 'dist/examen-final-backend/browser');
app.use(express.static(distFolder));

// Puerto desde variable de entorno o 8080 por defecto
const PORT = process.env.PORT || 8080;

// Configuración de SQL Server usando variables de entorno para mayor seguridad
const sqlConfig = {
  user: process.env.DB_USER || 'usr_DesaWebDevUMG',
  password: process.env.DB_PASSWORD || '!ngGuast@360',
  server: process.env.DB_SERVER || 'svr-sql-ctezo.southcentralus.cloudapp.azure.com',
  database: process.env.DB_NAME || 'db_DesaWebDevUMG',
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Validar que las variables de entorno críticas estén configuradas en producción
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_SERVER', 'DB_NAME'];
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('❌ ERROR: Faltan variables de entorno requeridas:', missing.join(', '));
    console.error('Por favor configura estas variables en el panel de Render.');
    process.exit(1);
  }
}

let poolPromise;
async function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(sqlConfig)
      .connect()
      .then(pool => {
        console.log('Conectado a SQL Server');
        return pool;
      })
      .catch(err => {
        console.error('Error conectando a SQL Server:', err);
        poolPromise = undefined;
        throw err;
      });
  }
  return poolPromise;
}

// Endpoint para obtener mensajes directamente desde SQL Server
app.get('/api/Mensajes', async (req, res) => {
  try {
    const pool = await getPool();
    // Selecciona un número razonable de mensajes; ajustar según necesidad
    const result = await pool
      .request()
      .query('SELECT TOP (200) * FROM [dbo].[Chat_Mensaje] ORDER BY [Fecha_Envio] DESC, [ID_Mensaje] DESC');

    res.json(result.recordset ?? []);
  } catch (err) {
    console.error('Error consultando mensajes:', err);
    res.status(500).json({ message: 'No se pudieron cargar los mensajes desde la base de datos.' });
  }
});

// Manejo de rutas - redirigir todas las peticiones al index.html (debe ir después de los endpoints API)
app.get('/*', (req, res) => {
  res.sendFile(path.join(distFolder, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Aplicación disponible en http://localhost:${PORT}`);
});
