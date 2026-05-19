const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido para conexiones a Neon.tech y la mayoría de nubes PostgreSQL
    }
});

pool.on('connect', () => {
    console.log('Conectado exitosamente al pool de PostgreSQL (Neon)');
});

pool.on('error', (err) => {
    console.error('Error inesperado en el cliente de la base de datos', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
