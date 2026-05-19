require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const DB_INICIAL = {
  mascotas: [
    { nombre: 'Bolillo', especie: 'perro', urgente: false, ubicacion: 'Edificio K', descripcion: 'Bolillo es un perro rescatado muy alegre, le encanta correr cerca del edificio K.', imagen_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400' },
    { nombre: 'Michi Mecanico', especie: 'gato', urgente: false, ubicacion: 'Cafetería', descripcion: 'Se la pasa en la cafeteria y los estudiantes le dan de comer.', imagen_url: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400' },
    { nombre: 'El Inge', especie: 'perro', urgente: true, ubicacion: 'Cafeteria roja', descripcion: 'El Inge es serio pero muy leal. Necesita un hogar pronto porque es un caso urgente.', imagen_url: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400' },
    { nombre: 'Tecla', especie: 'gato', urgente: false, ubicacion: 'Edificio I', descripcion: 'Una gatita experta en sistemas. Siempre la verás merodeando el edificio I.', imagen_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400' },
    { nombre: 'Pony', especie: 'perro', urgente: false, ubicacion: 'Biblioteca', descripcion: 'Es pequeño y silencioso, perfecto para estar en la biblioteca.', imagen_url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400' },
    { nombre: 'Gruñonsito', especie: 'gato', urgente: true, ubicacion: 'Edificio O', descripcion: 'No te dejes engañar por su nombre, es muy cariñoso.', imagen_url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400' },
    { nombre: 'Coronel', especie: 'perro', urgente: false, ubicacion: 'Plaza pony', descripcion: 'Un perro con porte militar que vigila la Plaza Pony.', imagen_url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400' },
    { nombre: 'El admin', especie: 'gato', urgente: false, ubicacion: 'Baños del F', descripcion: 'Ayudalo a encontrar un hogar o a estar mas comodo dentro del tec', imagen_url: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400' }
  ]
};

async function seedDatabase() {
  const client = await db.connect();
  
  try {
    console.log('🌱 Iniciando Database Seeding...');
    await client.query('BEGIN'); // Iniciar Transacción

    // 1. Crear Administrador por Defecto
    console.log('👤 Creando usuario administrador...');
    const emailAdmin = 'admin@morelia.tecnm.mx';
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Utilizamos ON CONFLICT para evitar errores si ya existe (requiere que email sea UNIQUE)
    const adminQuery = `
      INSERT INTO users (nombre, email, password_hash, rol)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET rol = 'admin'
      RETURNING id;
    `;
    const adminRes = await client.query(adminQuery, ['Administrador ITM', emailAdmin, passwordHash, 'admin']);
    const adminId = adminRes.rows[0].id;

    console.log(`✅ Admin creado/recuperado con ID: ${adminId}`);

    // 2. Limpiar tabla de mascotas (Opcional, para no duplicar en múltiples corridas)
    console.log('🧹 Limpiando tabla de mascotas antigua...');
    await client.query('DELETE FROM pets');

    // 3. Insertar Mascotas
    console.log('🐾 Insertando mascotas iniciales...');
    for (const pet of DB_INICIAL.mascotas) {
      const petQuery = `
        INSERT INTO pets (nombre, especie, ubicacion, descripcion, urgente, imagen_url, usuario_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(petQuery, [
        pet.nombre,
        pet.especie,
        pet.ubicacion,
        pet.descripcion,
        pet.urgente,
        pet.imagen_url,
        adminId
      ]);
    }

    await client.query('COMMIT'); // Guardar cambios
    console.log(`✅ ¡Seeding Completado! Se insertaron ${DB_INICIAL.mascotas.length} mascotas.`);

  } catch (error) {
    await client.query('ROLLBACK'); // Revertir si hay error
    console.error('❌ Error durante el Seeding:', error);
  } finally {
    client.release();
    db.end();
  }
}

seedDatabase();
