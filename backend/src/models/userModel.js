const db = require('../config/database');


//Buscar un usuario por su correo electrónico.

const findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
  return result.rows[0]; 
};

//Buscar un usuario por su nombre de usuario.
const findByNombre = async (nombre) => {
  const query = 'SELECT * FROM users WHERE nombre = $1';
  const result = await db.query(query, [nombre]);
  return result.rows[0]; 
};

 //Insertar un nuevo usuario en la base de datos.

const createUser = async (nombre, email, passwordHash, rol = 'user') => {
  const query = `
    INSERT INTO users (nombre, email, password_hash, rol)
    VALUES ($1, $2, $3, $4)
    RETURNING id, nombre, email, rol, fecha_registro
  `;
  const result = await db.query(query, [nombre, email, passwordHash, rol]);
  return result.rows[0];
};

//Actualizar los datos 
const updateUser = async (id, nombre, email, avatar_url = null) => {
  const query = `
    UPDATE users 
    SET nombre = COALESCE($1, nombre), email = COALESCE($2, email), avatar_url = COALESCE($3, avatar_url) 
    WHERE id = $4 
    RETURNING id, nombre, email, rol, avatar_url
  `;
  const result = await db.query(query, [nombre, email, avatar_url, id]);
  return result.rows[0];
};

//Eliminar un usuario de la base de datos por su ID.

const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rowCount > 0; // Retorna true si se eliminó algo
};

const getAllUsers = async () => {
  const query = 'SELECT id, nombre, email, rol, fecha_registro, avatar_url FROM users ORDER BY id ASC';
  const result = await db.query(query);
  return result.rows;
};

const updateUserRole = async (id, rol) => {
  const query = `
    UPDATE users 
    SET rol = $1 
    WHERE id = $2 
    RETURNING id, nombre, email, rol
  `;
  const result = await db.query(query, [rol, id]);
  return result.rows[0];
};

module.exports = {
  findByEmail,
  findByNombre,
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
  updateUserRole
};
