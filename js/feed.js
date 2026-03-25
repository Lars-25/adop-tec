const { createApp } = Vue;

if (document.getElementById('appFeed')) {
    createApp({
        data() {
            return {
                filtro: 'todos',
                mascotas: []
            }
        },
        mounted() {
            const { getDB } = useStore();
            this.mascotas = getDB().mascotas;

            // Eventos filtros
            document.getElementById("filtroTodos").onclick = () => { this.filtro = 'todos'; this.renderUI(); };
            document.getElementById("filtroPerro").onclick = () => { this.filtro = 'perro'; this.renderUI(); };
            document.getElementById("filtroGato").onclick = () => { this.filtro = 'gato'; this.renderUI(); };
            document.getElementById("filtroUrgente").onclick = () => { this.filtro = 'urgente'; this.renderUI(); };

            // Cerrar modal
            document.getElementById("cerrarModal").onclick = () => {
                document.getElementById("modal").style.display = "none";
            };

            this.renderUI();
        },
        computed: {
            mascotasFiltradas() {
                let filtradas =
                    this.filtro === 'todos' ? this.mascotas :
                    this.filtro === 'urgente' ? this.mascotas.filter(m => m.urgente) :
                    this.mascotas.filter(m => m.tipo === this.filtro);

                return filtradas.map(m => ({
                    ...m,
                    tiempoFormat: calcularTiempo(m.fecha)
                }));
            }
        },
        methods: {
            abrirDetalles(perro) {
                document.getElementById("modal").style.display = "flex";
                document.getElementById("modalImg").src = perro.img;
                document.getElementById("modalImg").alt = "Foto de " + perro.nombre;
                document.getElementById("modalNombre").textContent = perro.nombre;
                document.getElementById("modalUbicacion").textContent = perro.ubicacion;
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

                    card.innerHTML = `
                        <img src="${perrito.img}" alt="Mascota" class="pet-card__img">
                        <div class="pet-card__body">
                            <h3 class="pet-card__title">${perrito.nombre}</h3>
                            <div class="pet-card__meta">
                                <i class='bx bx-map'></i> ${perrito.ubicacion}
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