const { createApp } = Vue;
if (document.getElementById('appForm')) {
    createApp({
        data() { return { nombre: '', especie: 'perro', ubicacion: '', descripcion: '', imagenBase64: 'https://placehold.co/400x300?text=Nueva+Mascota' } },
        methods: {
            procesarImagen(event) {
                const archivo = event.target.files[0];
                if (archivo) {
                    const reader = new FileReader();
                    reader.onload = (e) => { this.imagenBase64 = e.target.result; };
                    reader.readAsDataURL(archivo);
                }
            },
            publicar() {
                if(this.ubicacion.trim() === '' || this.descripcion.trim() === '') {
                    Swal.fire('Atención', 'La ubicación y descripción son obligatorias', 'warning'); return;
                }
                const { getDB, saveDB } = useStore();
                let db = getDB();
                db.mascotas.unshift({
                    id: Date.now(),
                    autor: db.sesionActiva ? db.sesionActiva.nombre : 'Anónimo',
                    nombre: this.nombre || 'Sin nombre',
                    tipo: this.especie.toLowerCase(),
                    urgente: false,
                    ubicacion: this.ubicacion,
                    fecha: new Date().toISOString(),
                    img: this.imagenBase64,
                    descripcion: this.descripcion
                });
                saveDB(db);
                Swal.fire('Publicado', 'Tu reporte ya está en el feed', 'success').then(() => { window.location.href = 'feed.html'; });
            }
        }
    }).mount('#appForm');
}