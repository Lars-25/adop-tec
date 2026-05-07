const userModel = require('../models/userModel');


 //Actualizar los datos del perfil del usuario. Modificar usurios.
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email } = req.body;

        // Verificacion de que el usuario autenticado sea el mismo que quiere editaro que tenga permisos suficientes.
        if (req.user.id !== parseInt(id)) {
            return res.status(403).json({ 
                msg: 'No tienes permiso para modificar este perfil.' 
            });
        }

        const userUpdated = await userModel.updateUser(id, nombre, email);

        if (!userUpdated) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        res.json({
            msg: 'Perfil actualizado con éxito',
            user: userUpdated
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al actualizar el usuario en el servidor.' });
    }
};


 //Elimina la cuenta de un usuario.

 
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Validación de seguridad: solo el dueño puede borrar su cuenta
        if (req.user.id !== parseInt(id)) {
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
        console.error(error);
        res.status(500).json({ msg: 'Error al intentar eliminar el usuario.' });
    }
};