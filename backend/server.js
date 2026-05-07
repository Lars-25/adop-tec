const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middlewares Globales
// ==========================================
// Permitir CORS abierto para el frontend local (en producción se debe limitar)
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parseo de body a JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ==========================================
// Rutas de la API
// ==========================================

// Rutas de Autenticación
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rutas de Mascotas
const petRoutes = require('./src/routes/petRoutes');
app.use('/api/pets', petRoutes);

// Ruta de prueba (Health Check)
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() AS hora_actual');
    res.json({
      status: 'success',
      message: '🚀 API conectada correctamente a PostgreSQL (Neon)',
      db_time: result.rows[0].hora_actual
    });
  } catch (error) {
    console.error('Error en /api/health:', error);
    res.status(500).json({ 
      status: 'error', 
      message: '❌ Fallo en la conexión a la base de datos',
      error: error.message 
    });
  }
});


// ==========================================
// Configuración de Servidor (HTTPS / HTTP)
// ==========================================
let server;

try {
  // Intentar leer los certificados HTTPS
  const options = {
    key: fs.readFileSync(path.join(__dirname, 'cert', 'server.key')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'server.crt'))
  };
  
  server = https.createServer(options, app);
  console.log('🔒 Certificados HTTPS cargados correctamente.');
} catch (error) {
  console.warn('⚠️ No se encontraron certificados HTTPS en backend/cert. El servidor arrancará en HTTP puro (No recomendado para MercadoPago).');
  // Caída a HTTP si no hay certificados
  server = http.createServer(app);
}

// Iniciar servidor
server.listen(PORT, () => {
  const protocol = server instanceof https.Server ? 'https' : 'http';
  console.log(`\n======================================================`);
  console.log(`✅ Servidor backend inicializado exitosamente`);
  console.log(`🌐 Escuchando en: ${protocol}://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
