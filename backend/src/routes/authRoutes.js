const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ==========================================
// Rutas de Autenticación (/api/auth)
// ==========================================

// Endpoint para registrar un nuevo usuario
// POST /api/auth/register
router.post('/register', authController.register);

// Endpoint para iniciar sesión
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
