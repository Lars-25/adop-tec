<template>
  <main class="container">
    <div class="main-layout">
        <div class="layout-image">
            <img src="/img/alumno.png" alt="Tec alumno" class="img-principal">
        </div>
        <div class="layout-text">
            <section class="hero">
                <h1 class="hero__title">Adopta un amigo en el Tec</h1>
                <p class="hero__subtitle">Comunidad oficial del ITM para rescate y adopción responsable.</p>
                <div class="hero__actions">
                    <router-link to="/login" class="btn btn--primary">
                        <i class='bx bx-log-in-circle'></i> Iniciar Sesión
                    </router-link>
                    <router-link to="/nosotros" class="btn btn--outline">
                        Conocer Proyecto
                    </router-link>
                </div>
            </section>
        </div>
    </div>
  </main>
  <FooterBadges />
</template>

<script setup>
import FooterBadges from '@/components/layout/FooterBadges.vue'
</script>

<style scoped>
/* Los estilos globales en styles.css ya manejan las clases .main-layout, .hero, etc. */
</style>
