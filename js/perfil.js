const { createApp } = Vue;

if (document.getElementById('appPerfil')) {
    createApp({

        data() {
            return {
                usuario: { nombre: '', email: '', rol: '' },
                misDonaciones: []
            }
        },

        mounted() {
            const { getDB } = useStore();
            const db = getDB();

            if (!db.sesionActiva) {
                window.location.href = 'login.html';
                return;
            }

            this.usuario = db.sesionActiva;

            if (db.historialDonaciones) {
                this.misDonaciones = db.historialDonaciones
                    .filter(d => d.email === this.usuario.email);
            }

            this.renderUI();

            // Eventos
            document.getElementById("btnHistorial")
                .addEventListener("click", (e) => {
                    e.preventDefault();
                    this.verHistorial();
                });

            document.getElementById("btnLogout")
                .addEventListener("click", (e) => {
                    e.preventDefault();
                    this.cerrarSesion();
                });
        },

        computed: {
            totalDonado() {
                return this.misDonaciones.reduce(
                    (suma, d) => suma + Number(d.monto), 0
                );
            },
            cantidadDonaciones() {
                return this.misDonaciones.length;
            }
        },

        methods: {

            renderUI() {
                document.getElementById("nombreUsuario").textContent =
                    this.usuario.nombre;

                document.getElementById("rolUsuario").textContent =
                    this.usuario.rol === 'admin'
                        ? 'Administrador'
                        : 'Estudiante ITM';

                document.getElementById("cantidadDonaciones").textContent =
                    this.cantidadDonaciones;

                document.getElementById("totalDonado").textContent =
                    `$${this.totalDonado}`;
            },

            verHistorial() {
                if (this.cantidadDonaciones === 0) {
                    Swal.fire('Sin donaciones',
                        'Aún no tienes donaciones.',
                        'info');
                    return;
                }

                let htmlLista = '<ul style="text-align:left;">';

                this.misDonaciones.forEach(d => {
                    htmlLista += `
                        <li>
                            <b>$${d.monto}</b> -
                            <small>${new Date(d.fecha).toLocaleDateString()}</small>
                        </li>`;
                });

                htmlLista += '</ul>';

                Swal.fire({
                    title: 'Mis Aportaciones',
                    html: htmlLista,
                    icon: 'success'
                });
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