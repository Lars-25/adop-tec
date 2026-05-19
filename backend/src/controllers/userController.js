const userModel = require('../models/userModel');

exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores pueden ver la lista de usuarios.' });
        }
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error("Error detallado en getAllUsers:", error);
        res.status(500).json({ msg: 'Error al obtener usuarios.', error: error.message || error });
    }
};

exports.updateUserByAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol } = req.body;

        if (req.user.rol !== 'admin') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores pueden modificar usuarios.' });
        }

        let userUpdated;
        
        // Si mandamos nombre o email, usamos updateUser primero
        if (nombre || email) {
            userUpdated = await userModel.updateUser(id, nombre, email);
        }
        
        // Si mandamos rol, actualizamos el rol
        if (rol) {
            userUpdated = await userModel.updateUserRole(id, rol);
        }

        if (!userUpdated) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        res.json({
            msg: 'Usuario actualizado con éxito',
            user: userUpdated
        });
    } catch (error) {
        console.error("Error detallado en updateUserByAdmin:", error);
        res.status(500).json({ msg: 'Error al actualizar usuario.', error: error.message || error });
    }
};


 //Actualizar los datos del perfil del usuario. Modificar usurios.
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, avatar_url } = req.body;

        // Verificacion de que el usuario autenticado sea el mismo que quiere editar o que tenga permisos suficientes.
        if (req.user.id !== id && req.user.rol !== 'admin') {
            return res.status(403).json({ 
                msg: 'No tienes permiso para modificar este perfil.' 
            });
        }

        const userUpdated = await userModel.updateUser(id, nombre, email, avatar_url);

        if (!userUpdated) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        res.json({
            msg: 'Perfil actualizado con éxito',
            user: userUpdated
        });
    } catch (error) {
        console.error("Error detallado en updateUser:", error);
        res.status(500).json({ msg: 'Error al actualizar el usuario en el servidor.', error: error.message || error });
    }
};


 //Elimina la cuenta de un usuario.

 
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación de seguridad: solo el dueño puede borrar su cuenta o un admin
        if (req.user.id !== id && req.user.rol !== 'admin') {
            return res.status(403).json({ 
                msg: 'Acción no autorizada.' 
            });
        }

        const deleted = await userModel.deleteUser(id);

        if (deleted) {
            res.json({ msg: 'Cuenta eliminada correctamente.' });
        } else {
            res.status(404).json({ msg: 'El usuario no existe.' });
        }
    } catch (error) {
        console.error("Error detallado en deleteUser:", error);
        res.status(500).json({ msg: 'Error al intentar eliminar el usuario.', error: error.message || error });
    }
};