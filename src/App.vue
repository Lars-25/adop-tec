<script setup>
// Importamos el componente de Donaciones (asegúrate de que el archivo exista en src/views/)
import Donaciones from './views/Donaciones.vue';

// Aquí podrías importar un Navbar o Footer si los haces componentes después
</script>

<template>
  <div id="adoptec-app">
    
    <header class="header-camp">
      <h1>AdopTec</h1>
    </header>

    <main>
      <Donaciones />
    </main>

    <nav class="bottom-nav">
       </nav>
    
  </div>
</template>

<style>

</style>