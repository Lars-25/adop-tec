const db = require('../config/database');


//Buscar un usuario por su correo electrónico.

const findByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await db.query(query, [email]);
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
const updateUser = async (id, nombre, email) => {
  const query = `
    UPDATE users 
    SET nombre = $1, email = $2 
    WHERE id = $3 
    RETURNING id, nombre, email, rol
  `;
  const result = await db.query(query, [nombre, email, id]);
  return result.rows[0];
};

//Eliminar un usuario de la base de datos por su ID.

const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rowCount > 0; // Retorna true si se eliminó algo
};

module.exports = {
  findByEmail,
  createUser,
  updateUser,
  deleteUser
};
