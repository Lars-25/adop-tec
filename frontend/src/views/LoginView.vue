<template>
  <main class="container" style="width: 100%; max-width: 400px; margin-top: 2rem;">
    <div class="auth-card text-center">
      <div class="auth-card__header mb-4">
        <i class='bx bx-user-circle text-primary' style="font-size: 4rem;"></i>
        <h1 class="auth-card__title" style="justify-content: center;">Bienvenido</h1>
        <p class="text-muted">Sistema de Autenticación ITM</p>
      </div>
      <form @submit.prevent="handleLogin">
        <div class="input-group">
          <label class="input-group__label">Correo Institucional</label>
          <div class="input-group__wrapper">
            <i class='bx bx-envelope input-group__icon'></i>
            <input v-model.trim="email" @blur="checkEmail" type="email" class="input-group__field" placeholder="ejemplo@morelia.tecnm.mx" required>
          </div>
        </div>
        <div class="input-group mb-4">
          <label class="input-group__label">Contraseña</label>
          <div class="input-group__wrapper">
            <i class='bx bx-lock-alt input-group__icon'></i>
            <input v-model="password" type="password" class="input-group__field" placeholder="••••••••" required>
          </div>
        </div>
        <button type="submit" class="btn btn--primary w-100" :disabled="isSubmitDisabled">
          {{ cargando ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
      <p style="margin-top: 1.5rem;">¿No tienes cuenta? <router-link to="/signup" class="text-primary" style="font-weight: 600;">Regístrate</router-link></p>
      <p style="margin-top: 0.5rem;"><router-link to="/" class="text-muted"><i class='bx bx-arrow-back'></i> Volver al inicio</router-link></p>
    </div>
  </main>
  <FooterBadges />
</template>

<script setup>
import FooterBadges from '@/components/layout/FooterBadges.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import Swal from 'sweetalert2';

const { t } = useI18n();

const email = ref('');
const password = ref('');
const cargando = ref(false);

const router = useRouter();
const authStore = useAuthStore();

const checkEmail = async () => {
  if (!email.value) return;
  try {
    const response = await api.get(`/auth/check-email/${encodeURIComponent(email.value)}`);
    if (!response.data.exists) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        timer: 3000,
        title: 'Este correo no está registrado',
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error('Error al verificar email:', error);
  }
};

const isSubmitDisabled = computed(() => cargando.value);

const handleLogin = async () => {
  if (!email.value.includes('@morelia.tecnm.mx')) {
    Swal.fire(t('alerts.error'), 'Usa tu correo institucional @morelia.tecnm.mx', 'error');
    return;
  }
  if (password.value.length < 6) {
    Swal.fire(t('alerts.error'), 'Contraseña mínima de 6 caracteres', 'warning');
    return;
  }

  cargando.value = true;
  const result = await authStore.login({
    email: email.value,
    password: password.value
  });
  cargando.value = false;

  if (result.success) {
    Swal.fire({
      title: '¡Bienvenido!',
      text: t('alerts.loginOk'),
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      router.push('/feed');
    });
  } else {
    Swal.fire(t('alerts.error'), result.error, 'error');
  }
};
</script>

<style scoped>
/* Estilos globales manejan el diseño base de auth-card */
</style>
