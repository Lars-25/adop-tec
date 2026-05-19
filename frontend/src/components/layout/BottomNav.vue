<template>
  <nav class="bottom-nav">
    <router-link to="/feed" class="nav-item" active-class="nav-item--active">
        <i class='bx bx-home-alt-2'></i> <span>{{ $t('nav.inicio') }}</span>
    </router-link>
    <router-link to="/donaciones" class="nav-item" active-class="nav-item--active">
        <i class='bx bx-donate-heart'></i> <span>{{ $t('nav.donar') }}</span>
    </router-link>
    <router-link to="/perfil" class="nav-item" active-class="nav-item--active">
        <i class='bx bx-user'></i> <span>{{ $t('nav.perfil') }}</span>
    </router-link>
  </nav>
</template>

<script setup>
</script>

<style scoped>
/* Las clases .bottom-nav, .nav-item y .nav-item--active ya están definidas en el styles.css global de la arquitectura original. */
</style>
