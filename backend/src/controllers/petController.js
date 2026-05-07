const petModel = require('../models/petModel');

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
    // Extraer datos del body (Mapeando la "ubicación" solicitada al campo "descripcion" 
    // o usando "raza" / "edad" que fueron definidos en nuestra tabla base).
    const { nombre, especie, raza = '', edad = '', descripcion = '', ubicacion, imagen_url = '' } = req.body;
    
    // Extraer el usuario autenticado que viene inyectado desde authMiddleware
    const usuario_id = req.user.id;

    // Validación básica de campos requeridos
    if (!nombre || !especie) {
      return res.status(400).json({ error: 'Los campos nombre y especie son obligatorios' });
    }

    // Si se envía 'ubicacion', podemos concatenarla a la descripción para no perder el dato,
    // dado que 'ubicacion' no está en la tabla SQL original del init.sql
    let finalDescription = descripcion;
    if (ubicacion) {
      finalDescription += `\nUbicación: ${ubicacion}`;
    }

    // Guardar en la base de datos
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

module.exports = {
  getAll,
  create
};
