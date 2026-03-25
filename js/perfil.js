const { createApp } = Vue;
if (document.getElementById('appPerfil')) {
    createApp({
        data() { return { usuario: { nombre: '', email: '', rol: '' }, misDonaciones: [] } },
        mounted() {
            const { getDB } = useStore();
            const db = getDB();
            if(!db.sesionActiva) { window.location.href = 'login.html'; } 
            else { 
                this.usuario = db.sesionActiva; 
                if(db.historialDonaciones) {
                    this.misDonaciones = db.historialDonaciones.filter(d => d.email === this.usuario.email);
                }
            }
        },
        computed: {
            totalDonado() { return this.misDonaciones.reduce((suma, donacion) => suma + donacion.monto, 0); },
            cantidadDonaciones() { return this.misDonaciones.length; }
        },
        methods: {
            verHistorial() {
                if (this.cantidadDonaciones === 0) {
                    Swal.fire('Sin donaciones', 'Aún no tienes donaciones. ¡Anímate a apoyar!', 'info'); return;
                }
                let htmlLista = '<ul style="text-align: left; font-size: 1.1rem; max-height: 200px; overflow-y: auto;">';
                this.misDonaciones.forEach(d => {
                    htmlLista += `<li> <b>$${d.monto}</b> - <small>${new Date(d.fecha).toLocaleDateString()}</small></li>`;
                });
                htmlLista += '</ul>';
                Swal.fire({ title: 'Mis Aportaciones', html: htmlLista, icon: 'success' });
            },
            cerrarSesion() {
                const { getDB, saveDB } = useStore();
                let db = getDB();
                db.sesionActiva = null;
                saveDB(db);
                window.location.href = '../index.html';
            }
        }
    }).mount('#appPerfil');
}