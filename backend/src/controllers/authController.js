const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// ==========================================
// Función para Registrar Usuario
// ==========================================
const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // 1. Validación básica
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios: nombre, email, password' });
    }

    // 2. Verificar si el usuario ya existe
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // 3. Cifrar la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Guardar en la base de datos
    const newUser = await userModel.createUser(nombre, email, passwordHash);

    // 5. Responder
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('Error en el registro (authController):', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar' });
  }
};


// ==========================================
// Función para Hacer Login
// ==========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validación básica
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // 2. Buscar usuario en BD
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas (usuario no encontrado)' });
    }

    // 3. Verificar que la contraseña coincida con el hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas (contraseña incorrecta)' });
    }

    // 4. Generar el JWT
    const payload = {
      id: user.id,
      rol: user.rol
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    // 5. Responder con el token y datos públicos del usuario
    res.json({
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en el login (authController):', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
  }
};

module.exports = {
  register,
  login
};
