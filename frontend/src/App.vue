<template>
  <div id="app-container">
    <Navbar />
    
    <!-- Renderizado dinámico de la vista actual -->
    <main style="padding-bottom: 70px;">
      <router-view />
    </main>
    
    <BottomNav v-if="authStore.user" />
  </div>
</template>

<script setup>
import Navbar from './components/layout/Navbar.vue'
import BottomNav from './components/layout/BottomNav.vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<style>
/* Los estilos globales se importan en main.js */
#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#app-container > main {
  flex: 1; /* Permite que el main crezca y empuje el footer hacia abajo */
}
</style>
