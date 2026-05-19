<template>
  <div class="pet-card">
    <img :src="pet.imagen_url || pet.img || 'https://placehold.co/400x300?text=Sin+Imagen'" :alt="pet.nombre" class="pet-card__img">
    <div class="pet-card__body">
      <h3 class="pet-card__title">{{ pet.nombre }}</h3>
      <div class="pet-card__meta">
        <i class='bx bx-map'></i> {{ pet.ubicacion || 'Revisar descripción' }}
      </div>
      <div class="pet-card__meta" v-if="pet.tiempoFormat">
        <i class='bx bx-time'></i> {{ pet.tiempoFormat }}
      </div>
      <button class="pet-card__btn" @click="$emit('details', pet)">{{ $t('feed.btnDetails') }}</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pet: {
    type: Object,
    required: true
  }
});

defineEmits(['details']);
</script>

<style scoped>
/* Los estilos de .pet-card están manejados por el global styles.css */
:global(.dark-theme) .pet-card {
  background-color: var(--card-bg, #1e293b);
  border-color: var(--border-color, #334155);
}
.pet-card__btn {
  background-color: var(--card-bg);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
.pet-card__btn:hover {
  opacity: 0.8;
}
</style>
