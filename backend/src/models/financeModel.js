const db = require('../config/database');

const getAllDonaciones = async () => {
    try {
        const query = `
            SELECT d.*, u.nombre as usuario_nombre, u.email as usuario_email 
            FROM donaciones d 
            LEFT JOIN users u ON d.usuario_id = u.id 
            ORDER BY d.fecha DESC
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        if (error.code === '42P01') { 
            console.warn('Tabla donaciones no existe, devolviendo arreglo vacío.');
            return [];
        }
        throw error;
    }
};

const getDonacionesByUser = async (usuario_id) => {
    try {
        const query = 'SELECT * FROM donaciones WHERE usuario_id = $1 ORDER BY fecha DESC';
        const result = await db.query(query, [usuario_id]);
        return result.rows;
    } catch (error) {
        if (error.code === '42P01') { 
            return [];
        }
        throw error;
    }
};

const createDonacion = async (usuario_id, monto) => {
    try {
        const query = `
            INSERT INTO donaciones (usuario_id, monto, fecha) 
            VALUES ($1, $2, NOW()) 
            RETURNING *
        `;
        const result = await db.query(query, [usuario_id, monto]);
        return result.rows[0];
    } catch (error) {
        if (error.code === '42P01') {
            console.warn('Creando tabla donaciones al vuelo...');
            await db.query(`
                CREATE TABLE donaciones (
                    id SERIAL PRIMARY KEY,
                    usuario_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    monto DECIMAL(10,2) NOT NULL,
                    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            const retry = await db.query(`
                INSERT INTO donaciones (usuario_id, monto, fecha) 
                VALUES ($1, $2, NOW()) 
                RETURNING *
            `, [usuario_id, monto]);
            return retry.rows[0];
        }
        throw error;
    }
};

const getAllGastos = async () => {
    try {
        const query = 'SELECT * FROM gastos ORDER BY fecha DESC';
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        if (error.code === '42P01') {
            console.warn('Tabla gastos no existe, devolviendo arreglo vacío.');
            return [];
        }
        throw error;
    }
};

const createGasto = async (concepto, monto) => {
    try {
        const query = `
            INSERT INTO gastos (concepto, monto, fecha) 
            VALUES ($1, $2, NOW()) 
            RETURNING *
        `;
        const result = await db.query(query, [concepto, monto]);
        return result.rows[0];
    } catch (error) {
        if (error.code === '42P01') {
            console.warn('Creando tabla gastos al vuelo...');
            await db.query(`
                CREATE TABLE gastos (
                    id SERIAL PRIMARY KEY,
                    concepto VARCHAR(255) NOT NULL,
                    monto DECIMAL(10,2) NOT NULL,
                    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            const retry = await db.query(`
                INSERT INTO gastos (concepto, monto, fecha) 
                VALUES ($1, $2, NOW()) 
                RETURNING *
            `, [concepto, monto]);
            return retry.rows[0];
        }
        throw error;
    }
};

const getMetaFinanciera = async () => {
    try {
        // Obtenemos el total recaudado global
        const sumQuery = 'SELECT SUM(monto) as recaudado FROM donaciones';
        const sumResult = await db.query(sumQuery);
        const recaudado = sumResult.rows[0].recaudado ? parseFloat(sumResult.rows[0].recaudado) : 0;

        // Obtenemos el top 5 de donadores
        const topQuery = `
            SELECT u.nombre as usuario_nombre, u.email as usuario_email, SUM(d.monto) as monto
            FROM donaciones d
            LEFT JOIN users u ON d.usuario_id = u.id
            GROUP BY u.id, u.nombre, u.email
            ORDER BY monto DESC
            LIMIT 5
        `;
        const topResult = await db.query(topQuery);

        return {
            recaudado: recaudado,
            meta: 10000, // Meta fija por ahora, o podría estar en la BD
            topDonadores: topResult.rows
        };
    } catch (error) {
        if (error.code === '42P01') {
            return { recaudado: 0, meta: 10000, topDonadores: [] };
        }
        throw error;
    }
};

module.exports = {
    getAllDonaciones,
    getDonacionesByUser,
    createDonacion,
    getAllGastos,
    createGasto,
    getMetaFinanciera
};
