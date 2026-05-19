const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// ==========================================
// Función para Registrar Usuario
// ==========================================
const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios: nombre, email, password' });
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await userModel.createUser(nombre, email, passwordHash);

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

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas (usuario no encontrado)' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas (contraseña incorrecta)' });
    }

    const payload = {
      id: user.id,
      rol: user.rol
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

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

// ===========================
// Validación AJAX de Email
// ==========================
const checkEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userModel.findByEmail(email);
    // Retorna true si ya existe, false si está disponible
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar disponibilidad de email' });
  }
};

const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await userModel.findByNombre(username);
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar disponibilidad de nombre de usuario' });
  }
};

module.exports = {
  register,
  login,
  checkEmail,
  checkUsername
};