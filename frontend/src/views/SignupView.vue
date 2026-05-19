<template>
  <main class="container" style="width: 100%; max-width: 400px; margin-top: 2rem;">
    <div class="auth-card text-center">
      <div class="auth-card__header mb-4">
        <i class='bx bx-user-plus text-primary' style="font-size: 4rem;"></i>
        <h1 class="auth-card__title" style="justify-content: center;">Crea tu Cuenta</h1>
        <p class="text-muted">Únete a la comunidad ITM</p>
      </div>
      <form @submit.prevent="handleSignup">
        <div class="input-group">
          <label class="input-group__label">Nombre Completo</label>
          <div class="input-group__wrapper">
            <i class='bx bx-user input-group__icon'></i>
            <input v-model.trim="nombre" @blur="checkUsername" @input="usernameError = false" type="text" class="input-group__field" placeholder="Tu nombre" required>
          </div>
          <small v-if="usernameError" style="color: #e63946; display: block; text-align: left; margin-top: 5px; font-size: 0.8rem;">Este nombre de usuario ya está en uso.</small>
        </div>
        <div class="input-group">
          <label class="input-group__label">Correo Institucional</label>
          <div class="input-group__wrapper">
            <i class='bx bx-envelope input-group__icon'></i>
            <input v-model.trim="email" @blur="checkEmail" @input="emailError = false" type="email" class="input-group__field" placeholder="ejemplo@morelia.tecnm.mx" required>
          </div>
          <small v-if="emailError" style="color: #e63946; display: block; text-align: left; margin-top: 5px; font-size: 0.8rem;">Este correo ya está registrado.</small>
        </div>
        <div class="input-group mb-4">
          <label class="input-group__label">Contraseña</label>
          <div class="input-group__wrapper">
            <i class='bx bx-lock-alt input-group__icon'></i>
            <input v-model="password" type="password" class="input-group__field" placeholder="••••••••" required minlength="6">
          </div>
        </div>
        <button type="submit" class="btn btn--primary w-100" :disabled="isSubmitDisabled">
          {{ cargando ? 'Registrando...' : 'Registrarme' }}
        </button>
      </form>
      <div class="mt-4" style="margin-top: 1.5rem; font-size: 0.85rem;">
        <p>¿Ya tienes cuenta? <router-link to="/login" class="text-primary" style="font-weight: 600;">Acceder</router-link></p>
        <p style="margin-top: 0.5rem;"><router-link to="/" class="text-muted"><i class='bx bx-arrow-back'></i> Volver al inicio</router-link></p>
      </div>
    </div>
  </main>
  <FooterBadges />
</template>

<script setup>
import FooterBadges from '@/components/layout/FooterBadges.vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import Swal from 'sweetalert2';

const { t } = useI18n();

const nombre = ref('');
const email = ref('');
const password = ref('');

const usernameError = ref(false);
const emailError = ref(false);
const cargando = ref(false);

const router = useRouter();

const isSubmitDisabled = computed(() => {
  return usernameError.value || emailError.value || cargando.value;
});

const checkUsername = async () => {
  if (!nombre.value) {
    usernameError.value = false;
    return;
  }
  try {
    const response = await api.get(`/auth/check-username/${encodeURIComponent(nombre.value)}`);
    usernameError.value = response.data.exists;
  } catch (error) {
    console.error('Error al verificar username:', error);
  }
};

const checkEmail = async () => {
  if (!email.value) {
    emailError.value = false;
    return;
  }
  try {
    const response = await api.get(`/auth/check-email/${encodeURIComponent(email.value)}`);
    emailError.value = response.data.exists;
  } catch (error) {
    console.error('Error al verificar email:', error);
  }
};

const handleSignup = async () => {
  if (!email.value.includes('@morelia.tecnm.mx')) {
    Swal.fire(t('alerts.error'), 'Usa tu correo institucional @morelia.tecnm.mx', 'error');
    return;
  }
  if (password.value.length < 6) {
    Swal.fire(t('alerts.error'), 'Contraseña mínima de 6 caracteres', 'warning');
    return;
  }

  cargando.value = true;
  try {
    await api.post('/auth/register', {
      nombre: nombre.value,
      email: email.value,
      password: password.value
    });
    
    Swal.fire(t('alerts.success'), t('alerts.registerOk'), 'success').then(() => {
      router.push('/login');
    });
  } catch (error) {
    Swal.fire(t('alerts.error'), error.response?.data?.error || 'No se pudo registrar', 'error');
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Estilos globales manejan el diseño base */
</style>
