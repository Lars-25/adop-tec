const { createApp } = Vue;

createApp({
    data() {
        return {
            filtro: 'todos',
            perritoSeleccionado: null, 
            mascotas: [
                { id: 1, nombre: 'Bolillo', tipo: 'perro', urgente: false, ubicacion: 'Edificio K', tiempo: 'Hace 2h', img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400', descripcion: 'Bolillo es un perro rescatado muy alegre, le encanta correr cerca del edificio K.' },
                { id: 2, nombre: 'Michi Mecanico', tipo: 'perro', urgente: false, ubicacion: 'Cafetería', tiempo: 'Hace 5h', img: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400', descripcion: 'Se la pasa en la cafeteria y los estudiantes le dan de comer.' },
                { id: 3, nombre: 'El Inge', tipo: 'perro', urgente: true, ubicacion: 'Cafeteria roja', tiempo: 'Hace 8h', img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400', descripcion: 'El Inge es serio pero muy leal. Necesita un hogar pronto porque es un caso urgente ya que es un perrito ya grande de edad.' },
                { id: 4, nombre: 'Tecla', tipo: 'gato', urgente: false, ubicacion: 'Edificio I', tiempo: 'Hace 12h', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', descripcion: 'Una gatita experta en sistemas. Siempre la verás merodeando el edificio I.' },
                { id: 5, nombre: 'Pony', tipo: 'perro', urgente: false, ubicacion: 'Biblioteca', tiempo: 'Hace 1d', img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400', descripcion: 'Es pequeño y silencioso, perfecto para estar en la biblioteca pero necesita un hogar, al ser tranquilo no te molestara y te acompañara estudiando.' },
                { id: 6, nombre: 'Gruñonsito', tipo: 'gato', urgente: true, ubicacion: 'Edificio O', tiempo: 'Hace 2d', img: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400', descripcion: 'No te dejes engañar por su nombre, es muy cariñoso una vez que te conoce y le das confianza.' },
                { id: 7, nombre: 'Coronel', tipo: 'perro', urgente: false, ubicacion: 'Plaza pony', tiempo: 'Hace 5h', img: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400', descripcion: 'Un perro con porte militar que vigila la Plaza Pony.' },
                { id: 8, nombre: 'El admin', tipo: 'gato', urgente: false, ubicacion: 'Baños del F', tiempo: 'Hace 9h', img: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', descripcion: 'Ayudalo a encontrar un hogar o a estar mas comodo o alimentado dentro del tec' }
            ]
        }
    },
    computed: {
        mascotasFiltradas() {
            if (this.filtro === 'todos') return this.mascotas;
            if (this.filtro === 'urgente') return this.mascotas.filter(m => m.urgente);
            return this.mascotas.filter(m => m.tipo === this.filtro);
        }
    },
    methods: {
        abrirDetalles(perro) {
            this.perritoSeleccionado = perro;
        }
    }
}).mount('#app');