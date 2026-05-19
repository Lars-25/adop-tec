const financeModel = require('../models/financeModel');

exports.getDonaciones = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }
        const donaciones = await financeModel.getAllDonaciones();
        res.json({ status: 'success', data: donaciones });
    } catch (error) {
        console.error('Error en getDonaciones:', error);
        res.status(500).json({ error: 'Error interno al obtener donaciones' });
    }
};

exports.getMyDonaciones = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const donaciones = await financeModel.getDonacionesByUser(usuario_id);
        res.json({ status: 'success', data: donaciones });
    } catch (error) {
        console.error('Error en getMyDonaciones:', error);
        res.status(500).json({ error: 'Error interno al obtener donaciones' });
    }
};

exports.createDonacion = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const { monto } = req.body;
        
        if (!monto || isNaN(monto) || Number(monto) <= 0) {
            return res.status(400).json({ error: 'Monto inválido.' });
        }

        const nuevaDonacion = await financeModel.createDonacion(usuario_id, monto);
        res.status(201).json({ status: 'success', message: 'Donación registrada correctamente', data: nuevaDonacion });
    } catch (error) {
        console.error('Error en createDonacion:', error);
        res.status(500).json({ error: 'Error interno al registrar donación' });
    }
};

exports.getGastos = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }
        const gastos = await financeModel.getAllGastos();
        res.json({ status: 'success', data: gastos });
    } catch (error) {
        console.error('Error en getGastos:', error);
        res.status(500).json({ error: 'Error interno al obtener gastos' });
    }
};

exports.createGasto = async (req, res) => {
    try {
        if (req.user.rol !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }
        
        const { concepto, monto } = req.body;
        if (!concepto || !monto) {
            return res.status(400).json({ error: 'Concepto y monto son requeridos.' });
        }

        const nuevoGasto = await financeModel.createGasto(concepto, monto);
        res.status(201).json({ status: 'success', message: 'Gasto registrado correctamente', data: nuevoGasto });
    } catch (error) {
        console.error('Error en createGasto:', error);
        res.status(500).json({ error: 'Error interno al registrar gasto' });
    }
};

exports.getMeta = async (req, res) => {
    try {
        const metaData = await financeModel.getMetaFinanciera();
        res.json({ status: 'success', data: metaData });
    } catch (error) {
        console.error('Error en getMeta:', error);
        res.status(500).json({ error: 'Error interno al obtener meta financiera' });
    }
};
