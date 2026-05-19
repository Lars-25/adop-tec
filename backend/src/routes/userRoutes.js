const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// logeo
router.get('/', authMiddleware, userController.getAllUsers);
router.put('/:id', authMiddleware, userController.updateUser);
router.put('/admin/:id', authMiddleware, userController.updateUserByAdmin);
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;