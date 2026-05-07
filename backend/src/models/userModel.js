const db = require('../config/database');

/**
 * Busca un usuario por su correo electrónico.
 * Útil para Login y para verificar si un email ya está registrado en Register.
 * 
 * @param {string} email - El correo del usuario a buscar.
 * @returns {Object|null} El usuario encontrado o null.
 */
const findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0]; // Retorna el objeto usuario o undefined
};

/**
 * Inserta un nuevo usuario en la base de datos.
 * 
 * @param {string} nombre - Nombre del usuario.
 * @param {string} email - Correo del usuario.
 * @param {string} passwordHash - Contraseña ya cifrada con bcrypt.
 * @param {string} rol - Rol del usuario (por defecto 'user').
 * @returns {Object} El usuario recién creado (sin el password_hash).
 */
const createUser = async (nombre, email, passwordHash, rol = 'user') => {
  const query = `
    INSERT INTO users (nombre, email, password_hash, rol)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, email, rol, fecha_registro
  `;
  const result = await db.query(query, [nombre, email, passwordHash, rol]);
  return result.rows[0];
};

module.exports = {
  findByEmail,
  createUser
};
