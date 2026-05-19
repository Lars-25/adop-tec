const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Endpoint para progreso global (No requiere autenticación obligatoria)
router.get('/meta', financeController.getMeta);

// Endpoint para consultar donaciones globales (Protegido Admin)
router.get('/donaciones', authMiddleware, financeController.getDonaciones);

// Endpoint para consultar las donaciones propias (Protegido Usuario)
router.get('/donaciones/me', authMiddleware, financeController.getMyDonaciones);

// Endpoint para registrar donación (Protegido Usuario)
router.post('/donaciones', authMiddleware, financeController.createDonacion);

// Endpoint para consultar gastos (Protegido Admin)
router.get('/gastos', authMiddleware, financeController.getGastos);

// Endpoint para registrar gasto (Protegido Admin)
router.post('/gastos', authMiddleware, financeController.createGasto);

module.exports = router;
