const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const authMiddleware = require('../middlewares/authMiddleware');

// ==========================================
// Rutas de Mascotas (/api/pets)
// ==========================================

// Endpoint para obtener todas las mascotas (Público)
// GET /api/pets
router.get('/', petController.getAll);

// Endpoint para registrar un reporte de mascota (Protegido)
// POST /api/pets
// Inyectamos el authMiddleware antes del controlador
router.post('/', authMiddleware, petController.create);

// Endpoint para actualizar un reporte de mascota (Protegido)
// PUT /api/pets/:id
router.put('/:id', authMiddleware, petController.updatePet);

// Endpoint para eliminar un reporte de mascota (Protegido)
// DELETE /api/pets/:id
router.delete('/:id', authMiddleware, petController.deletePet);

module.exports = router;
