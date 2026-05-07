const db = require('../config/database');


//mascotas ordenadas de forma descendente por fecha de reporte
 
const getAll = async () => {
  const query = 'SELECT * FROM pets ORDER BY fecha_reporte DESC';
  const result = await db.query(query);
  return result.rows;
};


 //Inserta un nuevo reporte de mascota

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


 //Actualizar reporte: modificar los datos de una mascota existente
 
const updatePet = async (id, data) => {
  const { nombre, especie, raza, edad, descripcion, estado } = data;
  const query = `
    UPDATE pets 
    SET nombre = $1, especie = $2, raza = $3, edad = $4, descripcion = $5, estado = $6
    WHERE id = $7 
    RETURNING *
  `;
  const result = await db.query(query, [
    nombre, 
    especie, 
    raza, 
    edad, 
    descripcion, 
    estado, 
    id
  ]);
  return result.rows[0];
};


//eliminar reporte
const deletePet = async (id) => {
  const query = 'DELETE FROM pets WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rowCount > 0;
};

module.exports = {
  getAll,
  create,
  updatePet,
  deletePet
};
