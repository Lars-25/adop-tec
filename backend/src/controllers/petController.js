const petModel = require('../models/petModel');
const db = require('../config/database'); 

// ==========================================
// Obtener todas las mascotas (GET /api/pets)
// ==========================================
const getAll = async (req, res) => {
  try {
    const pets = await petModel.getAll();
    res.json({
      status: 'success',
      count: pets.length,
      data: pets
    });
  } catch (error) {
    console.error('Error en petController.getAll:', error);
    res.status(500).json({ error: 'Error interno al obtener el catálogo de mascotas' });
  }
};

// ==========================================
// Crear reporte de mascota (POST /api/pets)
// ==========================================
const create = async (req, res) => {
  try {
    const { nombre, especie, raza = '', edad = '', descripcion = '', ubicacion, imagen_url = '' } = req.body;
    const usuario_id = req.user.id;

    if (!nombre || !especie) {
      return res.status(400).json({ error: 'Los campos nombre y especie son obligatorios' });
    }

    let finalDescription = descripcion;
    if (ubicacion) {
      finalDescription += `\nUbicación: ${ubicacion}`;
    }

    const newPet = await petModel.create(
      nombre, 
      especie, 
      raza, 
      edad, 
      finalDescription, 
      imagen_url, 
      usuario_id
    );

    res.status(201).json({
      status: 'success',
      message: 'Mascota reportada exitosamente',
      data: newPet
    });
  } catch (error) {
    console.error('Error en petController.create:', error);
    res.status(500).json({ error: 'Error interno al crear el reporte de mascota' });
  }
};

// ==========================================
// Actualizar reporte (PUT /api/pets/:id) 
// =========================================
const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, especie, raza, edad, descripcion, estado } = req.body;

    // 1. Validar autoría del reporte
    const petQuery = await db.query('SELECT usuario_id FROM pets WHERE id = $1', [id]);
    const pet = petQuery.rows[0];

    if (!pet) return res.status(404).json({ error: 'Mascota no encontrada' });

    if (pet.usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar este reporte.' });
    }

    // 2. Ejecutar actualización
    const updated = await petModel.updatePet(id, { 
      nombre, especie, raza, edad, descripcion, estado 
    });

    res.json({
      status: 'success',
      message: 'Reporte actualizado correctamente',
      data: updated
    });
  } catch (error) {
    console.error('Error en petController.updatePet:', error);
    res.status(500).json({ error: 'Error interno al actualizar mascota' });
  }
};

module.exports = {
  getAll,
  create,
  updatePet
};