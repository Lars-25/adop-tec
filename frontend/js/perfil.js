const { createApp } = Vue;

if (document.getElementById('appPerfil')) {
    createApp({
        data() {
            return {
                usuario: { nombre: '', email: '', rol: '' },
                misDonaciones: [] // Se conectará al backend en la fase MercadoPago
            }
        },
        mounted() {
            // Leer desde localStorage
            const token = localStorage.getItem('adoptec_token');
            const userStr = localStorage.getItem('adoptec_user');

            if (!token || !userStr) {
                window.location.href = 'login.html';
                return;
            }

            this.usuario = JSON.parse(userStr);

            // TODO: Las donaciones se cargarán por fetch en la siguiente fase
            this.misDonaciones = [];

            this.renderUI();

            document.getElementById("btnHistorial").addEventListener("click", (e) => {
                e.preventDefault();
                this.verHistorial();
            });

            document.getElementById("btnLogout").addEventListener("click", (e) => {
                e.preventDefault();
                this.cerrarSesion();
            });
        },
        computed: {
            totalDonado() {
                return this.misDonaciones.reduce((suma, d) => suma + Number(d.monto), 0);
            },
            cantidadDonaciones() {
                return this.misDonaciones.length;
            }
        },
        methods: {
            renderUI() {
                document.getElementById("nombreUsuario").textContent = this.usuario.nombre;
                document.getElementById("rolUsuario").textContent = this.usuario.rol === 'admin' ? 'Administrador' : 'Estudiante ITM';
                document.getElementById("cantidadDonaciones").textContent = this.cantidadDonaciones;
                document.getElementById("totalDonado").textContent = `$${this.totalDonado}`;
            },
            verHistorial() {
                if (this.cantidadDonaciones === 0) {
                    Swal.fire('Sin donaciones', 'Aún no tienes donaciones registradas.', 'info');
                    return;
                }

                let htmlLista = '<ul style="text-align:left;">';
                this.misDonaciones.forEach(d => {
                    htmlLista += `<li><b>$${d.monto}</b> - <small>${new Date(d.fecha).toLocaleDateString()}</small></li>`;
                });
                htmlLista += '</ul>';

                Swal.fire({
                    title: 'Mis Aportaciones',
                    html: htmlLista,
                    icon: 'success'
                });
            },
            cerrarSesion() {
                // Eliminar token y datos de localStorage
                localStorage.removeItem('adoptec_token');
                localStorage.removeItem('adoptec_user');
                window.location.href = '../index.html'; // Redirige a la portada
            }
        }
    }).mount('#appPerfil');
}