const { createApp } = Vue;

if (document.getElementById('appNosotros')) {
    createApp({
        data() {
            return {
                nombre: '',
                especie: 'perro',
                descripcion: '',
                imagenBase64: null
            }
        },
        mounted() {
            // Manejar vista previa de la imagen Drag&Drop
            const inputImagen = document.getElementById("imagen");
            const labelPreview = document.getElementById("imagenPreviewLabel");
            const textoPreview = document.getElementById("imagenTexto");

            if (inputImagen) {
                inputImagen.addEventListener("change", (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        textoPreview.textContent = file.name;
                        if (file.type.startsWith('image/')) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                                this.imagenBase64 = evt.target.result;
                                labelPreview.style.backgroundImage = `url('${this.imagenBase64}')`;
                                labelPreview.style.backgroundColor = 'rgba(0,0,0,0.6)';
                                labelPreview.style.backgroundBlendMode = 'overlay';
                                textoPreview.style.color = '#fff';
                            };
                            reader.readAsDataURL(file);
                        }
                    } else {
                        this.imagenBase64 = null;
                        textoPreview.textContent = "Haz clic para subir fotografía";
                        labelPreview.style.backgroundImage = 'none';
                        labelPreview.style.backgroundColor = '#f8fafc';
                        textoPreview.style.color = '#475569';
                    }
                });
            }

            // Manejar envío del formulario
            document.getElementById("formReporteNosotros").addEventListener("submit", async (e) => {
                e.preventDefault();
                this.nombre = document.getElementById("nombreMascota").value.trim() || 'Desconocido';
                this.especie = document.getElementById("especieMascota").value;
                this.descripcion = document.getElementById("descripcionMascota").value.trim();

                if (!this.imagenBase64) {
                    Swal.fire('Falta fotografía', 'Por favor sube una imagen de la mascota.', 'warning');
                    return;
                }

                // Necesitamos el token del usuario actual para reportar
                const token = localStorage.getItem('adoptec_token');
                if (!token) {
                    Swal.fire('Inicia sesión', 'Debes estar registrado para reportar una mascota.', 'warning');
                    return;
                }

                const btn = document.getElementById("btnReportar");
                btn.disabled = true;
                btn.textContent = "Enviando...";

                try {
                    const payload = {
                        nombre: this.nombre,
                        especie: this.especie,
                        estado: 'perdido', // o 'disponible', o cualquier default que manejen
                        descripcion: this.descripcion,
                        imagen_url: this.imagenBase64
                    };

                    const response = await fetch('https://localhost:3000/api/pets', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(payload)
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        Swal.fire('Error', data.error || 'No se pudo enviar el reporte', 'error');
                        btn.disabled = false;
                        btn.textContent = "Enviar Reporte";
                        return;
                    }

                    Swal.fire('¡Reporte Enviado!', 'Gracias por ayudar a esta mascota.', 'success').then(() => {
                        document.getElementById("formReporteNosotros").reset();
                        this.imagenBase64 = null;
                        textoPreview.textContent = "Haz clic para subir fotografía";
                        labelPreview.style.backgroundImage = 'none';
                        labelPreview.style.backgroundColor = '#f8fafc';
                        textoPreview.style.color = '#475569';
                        btn.disabled = false;
                        btn.textContent = "Enviar Reporte";
                    });

                } catch (error) {
                    console.error('Error al reportar mascota:', error);
                    Swal.fire('Error de red', 'No se pudo conectar con el servidor', 'error');
                    btn.disabled = false;
                    btn.textContent = "Enviar Reporte";
                }
            });
        }
    }).mount('#appNosotros');
}
