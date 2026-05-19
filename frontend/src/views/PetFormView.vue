<template>
  <main class="container" style="max-width: 600px; padding-top: 2rem; padding-bottom: 5rem;">
    <div style="display: flex; align-items: center; margin-bottom: 1.5rem;">
      <router-link to="/perfil" class="btn btn--outline" style="display: flex; align-items: center; gap: 5px; padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; font-weight: 500;">
        <i class='bx bx-arrow-back'></i> {{ $t('petForm.back') }}
      </router-link>
    </div>

    <div class="card">
        <h2 class="card__title mb-4">
            <i class='bx bx-edit'></i> {{ $t('petForm.title') }}
        </h2>
        <form @submit.prevent="submitForm">
            <div class="form-group">
                <label class="form-label">{{ $t('petForm.name') }}</label>
                <input v-model="form.nombre" type="text" class="form-input" :placeholder="$t('petForm.namePlaceholder')">
            </div>
            <div class="form-group">
                <label class="form-label">{{ $t('petForm.species') }}</label>
                <select v-model="form.especie" class="form-input">
                    <option value="perro">{{ $t('petForm.dog') }}</option>
                    <option value="gato">{{ $t('petForm.cat') }}</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">{{ $t('petForm.location') }}</label>
                <input v-model="form.ubicacion" type="text" class="form-input" required>
            </div>
            <div class="form-group">
                <label class="form-label">{{ $t('petForm.desc') }}</label>
                <textarea v-model="form.descripcion" class="form-input" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">{{ $t('petForm.photo') }}</label>
                <div class="file-upload-wrapper">
                    <input id="imagen" type="file" accept="image/*" @change="onFileChange" class="file-upload-input">
                    <label for="imagen" class="file-upload-label" id="imagenPreviewLabel">
                        <img v-if="previewUrl" :src="previewUrl" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
                        <div v-else style="display: flex; flex-direction: column; align-items: center;">
                          <i class='bx bx-camera' style="font-size: 2rem; color: #a0aec0;"></i>
                          <span style="margin-top: 8px;">{{ $t('petForm.uploadPhoto') }}</span>
                        </div>
                    </label>
                </div>
            </div>
            
            <div class="form-group mb-4">
                <label class="form-label" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #e63946;">
                    <input type="checkbox" v-model="form.urgente" style="width: auto; transform: scale(1.2);"> {{ $t('petForm.urgent') }}
                </label>
            </div>

            <button type="submit" class="btn btn--primary w-100" :disabled="cargando">
                <i class='bx bx-check-circle'></i> {{ cargando ? $t('petForm.submitting') : $t('petForm.publish') }}
            </button>
        </form>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';
import api from '../services/api';

const router = useRouter();
const { t } = useI18n();

const form = ref({
  nombre: '',
  especie: 'perro',
  ubicacion: '',
  descripcion: '',
  urgente: false
});

const archivoImagen = ref(null);
const previewUrl = ref(null);
const cargando = ref(false);

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    archivoImagen.value = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewUrl.value = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const submitForm = async () => {
  cargando.value = true;
  try {
    const payload = {
      nombre: form.value.nombre || 'Sin nombre',
      especie: form.value.especie.toLowerCase(),
      ubicacion: form.value.ubicacion,
      descripcion: form.value.descripcion,
      urgente: Boolean(form.value.urgente),
      raza: '',
      edad: '',
      imagen_url: previewUrl.value || 'https://placehold.co/400x300?text=Nueva+Mascota'
    };

    await api.post('/pets', payload);

    Swal.fire({
      title: t('alerts.success'),
      text: t('alerts.reportOk'),
      icon: 'success'
    }).then(() => {
      router.push('/feed');
    });

  } catch (error) {
    Swal.fire(t('alerts.error'), error.response?.data?.error || 'No se pudo publicar el reporte', 'error');
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
.file-upload-wrapper {
  position: relative;
  width: 100%;
  height: 150px;
  border: 2px dashed var(--border-color, #cbd5e1);
  border-radius: 8px;
  background-color: var(--bg-color, #f8fafc);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

:global(.dark-theme) .file-upload-wrapper {
  background-color: var(--card-bg, #1e293b);
  border-color: var(--border-color, #334155);
}

.file-upload-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
  color: var(--text-muted, #64748b);
  width: 100%;
  height: 100%;
}
</style>
