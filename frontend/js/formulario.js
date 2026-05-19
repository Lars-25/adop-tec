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

            const formReporte = document.getElementById("formReporte");
            if (formReporte) {
                formReporte.addEventListener("submit", (e) => {
                    e.preventDefault();
                    console.log("Formulario submit interceptado");
                    // Sincronizamos datos antes de enviar
                    this.nombre = document.getElementById("nombre").value || '';
                    this.especie = document.getElementById("especie").value || 'perro';
                    this.ubicacion = document.getElementById("ubicacion").value || '';
                    this.descripcion = document.getElementById("descripcion").value || '';
                    const cbUrgente = document.getElementById("urgente");
                    this.urgente = cbUrgente ? cbUrgente.checked : false;
                    this.publicar();
                });
            }

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
                const labelPreview = document.getElementById("imagenPreviewLabel");
                const textoPreview = document.getElementById("imagenTexto");

                if (archivo) {
                    textoPreview.textContent = archivo.name;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.imagenBase64 = e.target.result;
                        if (labelPreview) {
                            labelPreview.style.backgroundImage = `url('${e.target.result}')`;
                            labelPreview.style.backgroundColor = 'rgba(0,0,0,0.6)';
                            labelPreview.style.backgroundBlendMode = 'overlay';
                            textoPreview.style.color = '#fff';
                        }
                    };
                    reader.readAsDataURL(archivo);
                } else {
                    if (labelPreview) {
                        textoPreview.textContent = "Haz clic para subir fotografía";
                        labelPreview.style.backgroundImage = 'none';
                        labelPreview.style.backgroundColor = '#f8fafc';
                        textoPreview.style.color = '#475569';
                    }
                }
            },
            async publicar() {
                
                if (this.ubicacion.trim() === '' || this.descripcion.trim() === '') {
                    Swal.fire('Atención', 'La ubicación y descripción son obligatorias', 'warning');
                    return;
                }

                const token = localStorage.getItem('adoptec_token');

                
                try {
                    const response = await fetch('https://localhost:3000/api/pets', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            nombre: this.nombre || 'Sin nombre',
                            especie: this.especie.toLowerCase(),
                            raza: '',
                            edad: '',
                            descripcion: this.descripcion,
                            ubicacion: this.ubicacion,
                            urgente: Boolean(this.urgente),
                            imagen_url: this.imagenBase64
                        })
                    });
                    
                    
                    if (response.ok) {
                        Swal.fire('Publicado', 'Tu reporte ya está en el feed', 'success')
                            .then(() => window.location.href = 'feed.html');
                    } else {
                        const errData = await response.json().catch(() => ({}));
                        Swal.fire('Error', errData.msg || 'Error al publicar', 'error');
                    }
                } catch (error) {
                    console.error('Error AJAX:', error);
                    Swal.fire('Error', 'No se pudo comunicar con el servidor', 'error');
                }
            }
        }
    }).mount('#appForm');
}