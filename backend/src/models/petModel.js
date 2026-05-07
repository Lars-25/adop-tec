const db = require('../config/database');

/**
 * Obtiene todas las mascotas ordenadas de forma descendente por fecha de reporte
 */
const getAll = async () => {
  const query = 'SELECT * FROM pets ORDER BY fecha_reporte DESC';
  const result = await db.query(query);
  return result.rows;
};

/**
 * Inserta un nuevo reporte de mascota
 */
const create = async (nombre, especie, raza, edad, descripcion, imagen_url, usuario_id) => {
  const query = `
    INSERT INTO pets (nombre, especie, raza, edad, descripcion, imagen_url, usuario_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const result = await db.query(query, [
    nombre, 
    especie, 
    raza, 
    edad, 
    descripcion, 
    imagen_url, 
    usuario_id
  ]);
  return result.rows[0];
};

module.exports = {
  getAll,
  create
};
