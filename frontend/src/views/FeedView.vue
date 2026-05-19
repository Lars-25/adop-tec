<template>
  <main class="container" style="margin-top: 2rem;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2>{{ $t('feed.title') }}</h2>
    </div>

    <nav class="filters" style="margin-bottom: 1.5rem;">
      <button class="chip" :class="{ 'chip--active': filtro === 'todos' }" @click="filtro = 'todos'">{{ $t('feed.all') }}</button>
      <button class="chip" :class="{ 'chip--active': filtro === 'perro' }" @click="filtro = 'perro'"><i class='bx bx-dog'></i> {{ $t('feed.dogs') }}</button>
      <button class="chip" :class="{ 'chip--active': filtro === 'gato' }" @click="filtro = 'gato'"><i class='bx bx-cat'></i> {{ $t('feed.cats') }}</button>
      <button class="chip" :class="{ 'chip--active': filtro === 'urgente' }" @click="filtro = 'urgente'"><i class='bx bx-error-circle'></i> {{ $t('feed.urgent') }}</button>
    </nav>

    <div v-if="cargando" class="text-center" style="margin-top: 3rem;">
      <p class="text-muted"><i class='bx bx-loader-alt bx-spin' style="font-size: 1.5rem;"></i> {{ $t('feed.loading') }}</p>
    </div>
    <div v-else-if="mascotasFiltradas.length === 0" class="text-center" style="margin-top: 3rem;">
      <p class="text-muted">{{ $t('feed.empty') }}</p>
    </div>
    <div v-else class="feed-grid">
      <PetCard 
        v-for="pet in mascotasFiltradas" 
        :key="pet.id" 
        :pet="pet" 
        @details="abrirDetalles"
      />
    </div>

    <!-- Modal nativo extraído de feed.html -->
    <div v-if="mascotaSeleccionada" class="modal-overlay" style="display: flex;">
      <div class="modal-content" style="max-width: 400px; width: 90%; max-height: 85vh; display: flex; flex-direction: column; margin: auto; padding: 1.5rem;">
        <img :src="mascotaSeleccionada.imagen_url || mascotaSeleccionada.img || 'https://placehold.co/400x300?text=Sin+Imagen'" :alt="'Foto de ' + mascotaSeleccionada.nombre" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
        <div style="overflow-y: auto; margin-top: 1rem; flex-grow: 1; text-align: left;">
          <h2 class="text-primary">{{ mascotaSeleccionada.nombre }}</h2>
          <p style="margin-bottom: 1rem;"><strong><i class='bx bx-map'></i> {{ $t('feed.location') }}</strong> <span>{{ mascotaSeleccionada.ubicacion || $t('feed.checkDesc') }}</span></p>
          <p class="text-muted">{{ mascotaSeleccionada.descripcion }}</p>
        </div>
        <div style="margin-top: 1.5rem;">
          <button @click="$router.push({ path: '/donaciones', query: { mascota_id: mascotaSeleccionada.id, nombre: mascotaSeleccionada.nombre } })" class="btn btn--primary" style="margin-bottom: 0.5rem; display: block; text-align: center; width: 100%;">
            <i class='bx bx-donate-heart'></i> {{ $t('feed.btnDonate') }}
          </button>
          <button @click="mascotaSeleccionada = null" class="btn btn--outline w-100">{{ $t('feed.btnClose') }}</button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import PetCard from '../components/feed/PetCard.vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';

const { t } = useI18n();

const mascotas = ref([]);
const filtro = ref('todos');
const cargando = ref(true);
const mascotaSeleccionada = ref(null);

const cargarMascotas = async () => {
  try {
    const response = await api.get('/pets');
    if (response.data.status === 'success') {
      mascotas.value = response.data.data;
    }
  } catch (error) {
    console.error('Error al cargar mascotas:', error);
    Swal.fire(t('alerts.error'), 'No se pudo conectar con el servidor para cargar las mascotas', 'error');
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarMascotas();
});

const tiempoTranscurrido = (fechaBD) => {
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
};

const mascotasFiltradas = computed(() => {
  let filtradas = [];
  if (filtro.value === 'todos') {
    filtradas = mascotas.value;
  } else if (filtro.value === 'urgente') {
    filtradas = mascotas.value.filter(m => m.estado === 'urgente' || m.urgente);
  } else {
    filtradas = mascotas.value.filter(m => m.especie && m.especie.toLowerCase() === filtro.value);
  }

  return filtradas.map(m => ({
    ...m,
    tiempoFormat: tiempoTranscurrido(m.fecha_reporte || m.fecha || new Date().toISOString())
  }));
});

const abrirDetalles = (pet) => {
  mascotaSeleccionada.value = pet;
};

const verNotificaciones = () => {
  Swal.fire({
    icon: 'info',
    title: 'Sin notificaciones',
    text: 'No tienes alertas nuevas en este momento.',
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
  });
};
</script>
<style scoped>
.chip {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
.chip:hover {
  background-color: var(--border-color);
}
.chip--active {
  background-color: #f1f5f9;
  border: 2px solid var(--primary-color, #7A1E38) !important;
  color: #000000 !important;
  font-weight: 600;
}
:global(.dark-theme) .chip--active {
  background-color: var(--primary-color) !important;
  color: #ffffff !important;
  border-color: var(--primary-color) !important;
}
:global(.dark-theme) .modal-content {
  background-color: var(--card-bg, #1e293b);
  color: var(--text-color, #f8fafc);
  border: 1px solid var(--border-color, #334155);
}
</style>
