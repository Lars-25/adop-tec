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
        },
        computed: {
            mascotasFiltradas() {
                let filtradas =
                    this.filtro === 'todos' ? this.mascotas :
                    this.filtro === 'urgente' ? this.mascotas.filter(m => m.estado === 'urgente' || m.urgente) :
                    this.mascotas.filter(m => m.especie && m.especie.toLowerCase() === this.filtro);

                return filtradas.map(m => ({
                    ...m,
                    tiempoFormat: calcularTiempo(m.fecha_reporte || m.fecha || new Date().toISOString())
                }));
            }
        },
        methods: {
            async cargarMascotas() {
                try {
                    const response = await fetch('http://localhost:3000/api/pets');
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
                    const card = document.createElement("article");
                    card.className = "pet-card";

                    const imagen = perrito.imagen_url || perrito.img || 'https://placehold.co/400x300?text=Sin+Imagen';

                    card.innerHTML = `
                        <img src="${imagen}" alt="Mascota" class="pet-card__img">
                        <div class="pet-card__body">
                            <h3 class="pet-card__title">${perrito.nombre}</h3>
                            <div class="pet-card__meta">
                                <i class='bx bx-map'></i> ${perrito.ubicacion || 'Local'}
                            </div>
                            <div class="pet-card__meta">
                                <i class='bx bx-time'></i> ${perrito.tiempoFormat}
                            </div>
                            <button class="pet-card__btn">Ver detalles</button>
                        </div>
                    `;

                    card.querySelector("button").onclick = () => {
                        this.abrirDetalles(perrito);
                    };

                    container.appendChild(card);
                });
            }
        }
    }).mount('#appFeed');
}