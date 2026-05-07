const { createApp } = Vue;

if (document.getElementById('appForm')) {
    createApp({
        data() {
            return {
                nombre: '',
                especie: 'perro',
                ubicacion: '',
                descripcion: '',
                urgente: false,
                imagenBase64: 'https://placehold.co/400x300?text=Nueva+Mascota'
            }
        },
        mounted() {
            document.getElementById("formReporte").addEventListener("submit", (e) => {
                e.preventDefault();
                this.nombre = document.getElementById("nombre").value;
                this.especie = document.getElementById("especie").value;
                this.ubicacion = document.getElementById("ubicacion").value;
                this.descripcion = document.getElementById("descripcion").value;
                this.urgente = document.getElementById("urgente").checked;
                this.publicar();
            });

            document.getElementById("imagen").addEventListener("change", (e) => {
                this.procesarImagen(e);
            });
        },
        methods: {
            procesarImagen(event) {
                const archivo = event.target.files[0];
                if (archivo) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.imagenBase64 = e.target.result;
                    };
                    reader.readAsDataURL(archivo);
                }
            },
            async publicar() {
                if (this.ubicacion.trim() === '' || this.descripcion.trim() === '') {
                    Swal.fire('Atención', 'La ubicación y descripción son obligatorias', 'warning');
                    return;
                }

                const token = localStorage.getItem('adoptec_token');
                if (!token) {
                    Swal.fire('No autenticado', 'Debes iniciar sesión para publicar', 'warning')
                        .then(() => window.location.href = 'login.html');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3000/api/pets', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            nombre: this.nombre || 'Sin nombre',
                            especie: this.especie.toLowerCase(),
                            ubicacion: this.ubicacion,
                            descripcion: this.descripcion,
                            imagen_url: this.imagenBase64
                        })
                    });

                    // Manejo de expiración o token inválido
                    if (response.status === 401 || response.status === 403) {
                        Swal.fire('Sesión Expirada', 'Tu sesión ha expirado o no es válida. Vuelve a ingresar.', 'error')
                            .then(() => {
                                localStorage.removeItem('adoptec_token');
                                localStorage.removeItem('adoptec_user');
                                window.location.href = 'login.html';
                            });
                        return;
                    }

                    if (!response.ok) {
                        throw new Error('Error al publicar el reporte en el servidor');
                    }

                    Swal.fire('Publicado', 'Tu reporte ya está en el feed', 'success')
                        .then(() => {
                            window.location.href = 'feed.html';
                        });

                } catch (error) {
                    console.error('Error al enviar el formulario:', error);
                    Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error');
                }
            }
        }
    }).mount('#appForm');
}