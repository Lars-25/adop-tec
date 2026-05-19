<template>
  <main class="container" style="margin-top: 2rem;">
    <section class="card text-center mb-4">
      <div class="card__icon-wrapper mb-3">
        <i class='bx bx-target-lock text-accent' style="font-size: 2.5rem;"></i>
      </div>
      <h2 class="card__title" style="justify-content: center;">{{ $t('about.missionTitle') }}</h2>
      <p class="text-muted">{{ $t('about.missionDesc') }}</p>
    </section>

    <section class="card text-center mb-4">
      <div class="card__icon-wrapper mb-3">
        <i class='bx bx-show text-accent' style="font-size: 2.5rem;"></i>
      </div>
      <h2 class="card__title" style="justify-content: center;">{{ $t('about.visionTitle') }}</h2>
      <p class="text-muted">{{ $t('about.visionDesc') }}</p>
    </section>

    <section class="card mb-4">
      <h2 class="card__title text-center" style="justify-content: center;">
        <i class='bx bx-camera'></i> {{ $t('petForm.quickTitle') }}
      </h2>
      <p class="text-center text-muted mb-3">{{ $t('petForm.quickDesc') }}</p>
      
      <form @submit.prevent="enviarReporte" class="contact-form">
        <div class="form-group">
          <label class="form-label">{{ $t('petForm.name') }} (Opcional)</label>
          <input v-model.trim="nombre" type="text" class="form-input" :placeholder="$t('petForm.namePlaceholder')">
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ $t('petForm.species') }}</label>
          <select v-model="especie" class="form-input">
            <option value="perro">{{ $t('petForm.dog') }}</option>
            <option value="gato">{{ $t('petForm.cat') }}</option>
            <option value="otro">{{ $t('petForm.other') }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ $t('petForm.desc') }}</label>
          <textarea v-model.trim="descripcion" class="form-input" rows="3" :placeholder="$t('petForm.descPlaceholder')" required></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">{{ $t('petForm.photo') }}</label>
          <div class="file-upload-wrapper">
            <input @change="procesarImagen" id="imagen" type="file" accept="image/*" class="file-upload-input">
            <label for="imagen" class="file-upload-label" :style="previewStyle">
              <i class='bx bx-camera' style="font-size: 2rem; color: #a0aec0;" v-if="!imagenBase64"></i>
              <span :style="{ color: imagenBase64 ? '#fff' : '#475569', marginTop: '8px' }">{{ textoPreview }}</span>
            </label>
          </div>
        </div>
        
        <button type="submit" class="btn btn--primary w-100" :disabled="cargando">
          {{ cargando ? $t('petForm.submitting') : $t('petForm.btnSubmitQuick') }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import api from '../services/api';

const { t } = useI18n();

const nombre = ref('');
const especie = ref('perro');
const descripcion = ref('');
const imagenBase64 = ref(null);
const fileName = ref('');
const cargando = ref(false);

const textoPreview = computed(() => {
  return fileName.value ? fileName.value : t('petForm.uploadText');
});

const previewStyle = computed(() => {
  if (imagenBase64.value) {
    return {
      backgroundImage: `url('${imagenBase64.value}')`,
      backgroundColor: 'rgba(0,0,0,0.6)',
      backgroundBlendMode: 'overlay',
    };
  }
  return {
    backgroundImage: 'none',
    backgroundColor: '#f8fafc',
  };
});

const procesarImagen = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    fileName.value = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      imagenBase64.value = evt.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    resetImagen();
  }
};

const resetImagen = () => {
  imagenBase64.value = null;
  fileName.value = '';
};

const enviarReporte = async () => {
  if (!imagenBase64.value) {
    Swal.fire(t('alerts.warning'), t('alerts.noPhoto'), 'warning');
    return;
  }

  cargando.value = true;

  try {
    const payload = {
      nombre: nombre.value || 'Desconocido',
      especie: especie.value,
      estado: 'perdido',
      descripcion: descripcion.value,
      imagen_url: imagenBase64.value
    };

    // Usamos nuestra instancia de Axios (automáticamente inyectará el token si existe)
    await api.post('/pets', payload);

    Swal.fire(t('alerts.success'), t('alerts.quickReportOk'), 'success');
    
    // Resetear formulario
    nombre.value = '';
    especie.value = 'perro';
    descripcion.value = '';
    resetImagen();
    document.getElementById('imagen').value = ''; // Limpiar input file
    
  } catch (error) {
    console.error('Error al reportar mascota:', error);
    if (error.response && error.response.status === 401) {
      Swal.fire(t('alerts.warning'), t('alerts.unauthorized'), 'warning');
    } else {
      Swal.fire(t('alerts.error'), error.response?.data?.error || 'No se pudo enviar el reporte', 'error');
    }
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Estilos extraídos o ajustados temporalmente si es necesario */
</style>
