const { createApp } = Vue;
if (document.getElementById('appFeed')) {
    createApp({
        data() { return { filtro: 'todos', perritoSeleccionado: null, mascotas: [] } },
        mounted() {
            const { getDB } = useStore();
            this.mascotas = getDB().mascotas;
        },
        computed: {
            mascotasFiltradas() {
                let filtradas = this.filtro === 'todos' ? this.mascotas :
                                this.filtro === 'urgente' ? this.mascotas.filter(m => m.urgente) :
                                this.mascotas.filter(m => m.tipo === this.filtro);
                return filtradas.map(m => ({ ...m, tiempoFormat: calcularTiempo(m.fecha) }));
            }
        },
        methods: { abrirDetalles(perro) { this.perritoSeleccionado = perro; } }
    }).mount('#appFeed');
}