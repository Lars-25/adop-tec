// Activa el Modo Oscuro automáticamente al navegar
if(localStorage.getItem('darkMode') === 'true') { document.body.classList.add('dark-theme'); }

const DB_INICIAL = {
    sesionActiva: null, 
    mascotas: [
        { id: 1, autor: 'admin', nombre: 'Bolillo', tipo: 'perro', urgente: false, ubicacion: 'Edificio K', fecha: new Date(Date.now() - 7200000).toISOString(), img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400', descripcion: 'Bolillo es un perro rescatado muy alegre, le encanta correr cerca del edificio K.' },
        { id: 2, autor: 'admin', nombre: 'Michi Mecanico', tipo: 'gato', urgente: false, ubicacion: 'Cafetería', fecha: new Date(Date.now() - 18000000).toISOString(), img: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400', descripcion: 'Se la pasa en la cafeteria y los estudiantes le dan de comer.' },
        { id: 3, autor: 'admin', nombre: 'El Inge', tipo: 'perro', urgente: true, ubicacion: 'Cafeteria roja', fecha: new Date(Date.now() - 28800000).toISOString(), img: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=400', descripcion: 'El Inge es serio pero muy leal. Necesita un hogar pronto porque es un caso urgente ya que es un perrito ya grande de edad.' },
        { id: 4, autor: 'admin', nombre: 'Tecla', tipo: 'gato', urgente: false, ubicacion: 'Edificio I', fecha: new Date(Date.now() - 43200000).toISOString(), img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', descripcion: 'Una gatita experta en sistemas. Siempre la verás merodeando el edificio I.' },
        { id: 5, autor: 'admin', nombre: 'Pony', tipo: 'perro', urgente: false, ubicacion: 'Biblioteca', fecha: new Date(Date.now() - 86400000).toISOString(), img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400', descripcion: 'Es pequeño y silencioso, perfecto para estar en la biblioteca pero necesita un hogar, al ser tranquilo no te molestara y te acompañara estudiando.' },
        { id: 6, autor: 'admin', nombre: 'Gruñonsito', tipo: 'gato', urgente: true, ubicacion: 'Edificio O', fecha: new Date(Date.now() - 172800000).toISOString(), img: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?w=400', descripcion: 'No te dejes engañar por su nombre, es muy cariñoso una vez que te conoce y le das confianza.' },
        { id: 7, autor: 'admin', nombre: 'Coronel', tipo: 'perro', urgente: false, ubicacion: 'Plaza pony', fecha: new Date(Date.now() - 18000000).toISOString(), img: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=400', descripcion: 'Un perro con porte militar que vigila la Plaza Pony.' },
        { id: 8, autor: 'admin', nombre: 'El admin', tipo: 'gato', urgente: false, ubicacion: 'Baños del F', fecha: new Date(Date.now() - 32400000).toISOString(), img: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400', descripcion: 'Ayudalo a encontrar un hogar o a estar mas comodo o alimentado dentro del tec' }
    ],
    donaciones: { meta: 15000, recaudado: 5000, pendiente: 0, gastos: [] },
    historialDonaciones: [
        { email: 'admin@morelia.tecnm.mx', monto: 2000, fecha: new Date(Date.now() - 86400000).toISOString() },
        { email: 'sistemas@morelia.tecnm.mx', monto: 1500, fecha: new Date(Date.now() - 43200000).toISOString() },
        { email: 'pony@morelia.tecnm.mx', monto: 500, fecha: new Date(Date.now() - 172800000).toISOString() }
    ]
};

function useStore() {
    if (!localStorage.getItem('adoptecDB')) {
        localStorage.setItem('adoptecDB', JSON.stringify(DB_INICIAL));
    }
    const getDB = () => JSON.parse(localStorage.getItem('adoptecDB'));
    const saveDB = (db) => localStorage.setItem('adoptecDB', JSON.stringify(db));
    return { getDB, saveDB };
}

function calcularTiempo(fechaISO) {
    const horas = Math.floor((new Date() - new Date(fechaISO)) / (1000 * 60 * 60));
    if (horas < 1) return 'Hace un momento';
    if (horas < 24) return `Hace ${horas}h`;
    return `Hace ${Math.floor(horas / 24)} días`;
}