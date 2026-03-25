const { createApp } = Vue;
if (document.getElementById('appDonaciones')) {
    createApp({
        data() { 
            return { 
                datos: {}, rol: 'usuario', montoDonacion: null, conceptoGasto: 'Medicamentos',
                mesActual: new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }),
                historial: []
            } 
        },
        mounted() {
            const { getDB } = useStore();
            const db = getDB();
            this.datos = db.donaciones;
            this.historial = db.historialDonaciones || [];
            if(db.sesionActiva) this.rol = db.sesionActiva.rol;
        },
        computed: { 
            porcentaje() { return Math.min((this.datos.recaudado / this.datos.meta) * 100, 100); },
            // MAGIA VUE: Calcula los mayores donadores en tiempo real
            topDonadores() {
                const agrupados = {};
                this.historial.forEach(d => {
                    if (!agrupados[d.email]) agrupados[d.email] = 0;
                    agrupados[d.email] += d.monto;
                });
                return Object.keys(agrupados)
                    .map(email => ({ nombre: email.split('@')[0], monto: agrupados[email] }))
                    .sort((a, b) => b.monto - a.monto) // Ordena de mayor a menor
                    .slice(0, 5); // Toma solo el Top 5
            }
        },
        methods: {
            donar() {
                if(this.montoDonacion > 0) {
                    const { getDB, saveDB } = useStore();
                    let db = getDB();
                    db.donaciones.recaudado += this.montoDonacion;
                    
                    if (!db.historialDonaciones) db.historialDonaciones = [];
                    db.historialDonaciones.push({
                        email: db.sesionActiva ? db.sesionActiva.email : 'Anónimo',
                        monto: this.montoDonacion,
                        fecha: new Date().toISOString()
                    });

                    saveDB(db);
                    this.datos.recaudado = db.donaciones.recaudado;
                    this.historial = db.historialDonaciones; // Actualiza la tabla en vivo
                    Swal.fire('¡Gracias!', `Donación de $${this.montoDonacion} registrada en tu cuenta.`, 'success');
                    this.montoDonacion = null;
                }
            },
            registrarGasto() { Swal.fire('Transparencia', 'Gasto registrado correctamente.', 'info'); }
        }
    }).mount('#appDonaciones');
}