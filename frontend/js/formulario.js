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
                imagenBase64: 'https://placehold.co/400x300?text=Nueva+Mascota',
                sesionIniciada: false //Estado de sesión
            }
        },
        mounted() {
            // VERIFICACIÓN DE SESIÓN
            const token = localStorage.getItem('adoptec_token');
            if (token) {
                this.sesionIniciada = true;
                console.log("Sesión recuperada del navegador");
            }

            document.getElementById("formReporte").addEventListener("submit", (e) => {
                e.preventDefault();
                // Sincronizamos datos antes de enviar
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

            // VALIDACIÓN AJAX 
            const inputNombre = document.getElementById("nombre");
            if (inputNombre) {
                inputNombre.addEventListener("blur", async () => {
                    if (this.nombre.length < 3) return;
                    try {
                        // Simulación de validación AJAX al servidor
                        console.log("Validando nombre vía AJAX...");
                       
                    } catch (e) {
                        console.error("Error en validación AJAX");
                    }
                });
            }
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
                    
                    
                    if (response.ok) {
                        Swal.fire('Publicado', 'Tu reporte ya está en el feed', 'success')
                            .then(() => window.location.href = 'feed.html');
                    }
                } catch (error) {
                    console.error('Error AJAX:', error);
                    Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error');
                }
            }
        }
    }).mount('#appForm');
}