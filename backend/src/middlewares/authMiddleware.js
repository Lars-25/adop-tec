const jwt = require('jsonwebtoken');

/**
 * Middleware para proteger rutas usando JSON Web Tokens (JWT).
 * Extrae el token del header Authorization (Bearer token) y lo valida.
 */
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Verificar que el header existe y comienza con "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Acceso denegado: Se requiere un token Bearer en el header Authorization' 
      });
    }

    // Extraer el token
    const token = authHeader.split(' ')[1];
    
    // Verificar token contra la firma secreta
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inyectar la información decodificada del usuario en req.user
    // Esto hace que req.user.id y req.user.rol estén disponibles en los controladores subsiguientes
    req.user = decoded;
    
    // Continuar con la siguiente función (controlador)
    next();
  } catch (error) {
    console.error('Error de verificación JWT:', error.message);
    return res.status(403).json({ 
      error: 'Acceso prohibido: Token inválido o ha expirado' 
    });
  }
};

module.exports = verifyToken;
