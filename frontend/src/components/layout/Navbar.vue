<template>
  <header class="header">
    <div class="header__logo">
      <router-link to="/" style="display: flex; align-items: center; text-decoration: none; color: inherit;">
        <img src="/img/logo.jpg" alt="Logo AdopTec" class="logo-img">
        <span class="header__title" style="margin-left: 10px;">AdopTec</span>
      </router-link>
    </div>
    <nav class="header__nav">
      <ul class="nav__list">
        <li class="nav__item" style="display: flex; align-items: center; cursor: pointer; position: relative;">
          <i class='bx bx-bell text-primary' @click="showNotifications = !showNotifications" style="font-size: 1.4rem;"></i>
          <div v-show="showNotifications" class="dropdown-menu" style="position: absolute; top: 100%; right: 0px; background: var(--bg-color, #ffffff); border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 250px; z-index: 1000; padding: 1rem; margin-top: 10px;">
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted); text-align: center;">{{ $t('notifications.empty', 'No tienes notificaciones nuevas.') }}</p>
          </div>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue';

const showNotifications = ref(false);
</script>

<style scoped>
/* Estilos globales */
</style>
