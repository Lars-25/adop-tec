function tiempoTranscurrido(fechaBD) {
    const fecha = new Date(fechaBD);
    const ahora = new Date();
    const segundos = Math.floor((ahora - fecha) / 1000);

    if (segundos < 60) return "hace unos segundos";
    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    const dias = Math.floor(horas / 24);
    if (dias < 30) return `hace ${dias} día${dias !== 1 ? 's' : ''}`;
    const meses = Math.floor(dias / 30);
    if (meses < 12) return `hace ${meses} mes${meses !== 1 ? 'es' : ''}`;
    const anios = Math.floor(meses / 12);
    return `hace ${anios} año${anios !== 1 ? 's' : ''}`;
}

const { createApp } = Vue;

if (document.getElementById('appFeed')) {
    createApp({
        data() {
            return {
                filtro: 'todos',
                mascotas: []
            }
        },
        async mounted() {
            // Cargar datos desde el backend en vez del mock local
            await this.cargarMascotas();

            // Eventos filtros
            document.getElementById("filtroTodos").onclick = () => { this.filtro = 'todos'; this.renderUI(); };
            document.getElementById("filtroPerro").onclick = () => { this.filtro = 'perro'; this.renderUI(); };
            document.getElementById("filtroGato").onclick = () => { this.filtro = 'gato'; this.renderUI(); };
            document.getElementById("filtroUrgente").onclick = () => { this.filtro = 'urgente'; this.renderUI(); };

            // Cerrar modal
            document.getElementById("cerrarModal").onclick = () => {
                document.getElementById("modal").style.display = "none";
            };

            // CAMPANA DE NOTIFICACIONES
            const btnNotif = document.getElementById("btnNotificaciones");
            if (btnNotif) {
                btnNotif.addEventListener("click", () => {
                    Swal.fire({
                        icon: 'info',
                        title: 'Sin notificaciones',
                        text: 'No tienes alertas nuevas en este momento.',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                });
            }
        },
        computed: {
            mascotasFiltradas() {
                let filtradas =
                    this.filtro === 'todos' ? this.mascotas :
                    this.filtro === 'urgente' ? this.mascotas.filter(m => m.estado === 'urgente' || m.urgente) :
                    this.mascotas.filter(m => m.especie && m.especie.toLowerCase() === this.filtro);

                return filtradas.map(m => ({
                    ...m,
                    tiempoFormat: tiempoTranscurrido(m.fecha_reporte || m.fecha || new Date().toISOString())
                }));
            }
        },
        methods: {
            async cargarMascotas() {
                try {
                    const response = await fetch('https://localhost:3000/api/pets');
                    const data = await response.json();
                    
                    if (data.status === 'success') {
                        this.mascotas = data.data;
                        this.renderUI(); // Renderizamos una vez que llegan los datos
                    }
                } catch (error) {
                    console.error('Error al cargar las mascotas:', error);
                    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
                }
            },
            abrirDetalles(perro) {
                document.getElementById("modal").style.display = "flex";
                document.getElementById("modalImg").src = perro.imagen_url || perro.img || 'https://placehold.co/400x300?text=Sin+Imagen';
                document.getElementById("modalImg").alt = "Foto de " + perro.nombre;
                document.getElementById("modalNombre").textContent = perro.nombre;
                
                // Si la ubicación no viene explícita (ya que está en descripción), la indicamos
                let domUbicacion = document.getElementById("modalUbicacion");
                if (domUbicacion) {
                    domUbicacion.textContent = perro.ubicacion || 'Revisar descripción';
                }
                
                document.getElementById("modalDescripcion").textContent = perro.descripcion;
            },
            renderUI() {
                const container = document.getElementById("feedContainer");
                container.innerHTML = "";

                // Resaltado visual de filtros activos
                const botones = ["filtroTodos", "filtroPerro", "filtroGato", "filtroUrgente"];
                botones.forEach(btn => document.getElementById(btn).classList.remove("chip--active"));
                
                let btnId = this.filtro === 'todos' ? 'filtroTodos' : 
                            this.filtro === 'perro' ? 'filtroPerro' : 
                            this.filtro === 'gato' ? 'filtroGato' : 'filtroUrgente';
                document.getElementById(btnId).classList.add("chip--active");

                this.mascotasFiltradas.forEach(perrito => {
                    const card = document.createElement("pet-card");
                    card.className = "pet-card";

                    const imagen = perrito.imagen_url || perrito.img || 'https://placehold.co/400x300?text=Sin+Imagen';

                    // Pasamos la data a través de atributos al Web Component
                    card.setAttribute("data-nombre", perrito.nombre);
                    card.setAttribute("data-img", imagen);
                    card.setAttribute("data-ubicacion", perrito.ubicacion || 'Local');
                    card.setAttribute("data-tiempo", perrito.tiempoFormat || '');

                    // Primero lo inyectamos al DOM (esto dispara connectedCallback en components.js)
                    container.appendChild(card);

                    // Ahora que el componente dibujó el botón interno, agregamos el evento
                    const btn = card.querySelector("button");
                    if (btn) {
                        btn.onclick = () => {
                            this.abrirDetalles(perrito);
                        };
                    }
                });
            }
        }
    }).mount('#appFeed');
}