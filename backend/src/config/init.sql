-- Archivo: backend/src/config/init.sql
-- Este script se puede ejecutar directamente en la consola SQL de Neon.tech para crear las tablas.

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
  -- Usamos gen_random_uuid() nativo de Postgres 13+
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'user',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Mascotas
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  especie VARCHAR(50) NOT NULL,
  raza VARCHAR(100),
  edad VARCHAR(50),
  estado VARCHAR(50) DEFAULT 'En adopción',
  descripcion TEXT,
  ubicacion VARCHAR(255),
  urgente BOOLEAN DEFAULT false,
  imagen_url VARCHAR(255),
  usuario_id UUID REFERENCES users(id) ON DELETE SET NULL,
  fecha_reporte TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
