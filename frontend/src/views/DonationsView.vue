<template>
  <div id="appDonaciones" style="padding-bottom: 2rem;">
    <header class="header-camp">
        <i class='bx bx-first-aid' style="font-size: 3rem;"></i>
        <h1 class="header-camp__title">{{ $t('donations.title') }}</h1>
        <p id="mesActual" style="text-transform: capitalize;">{{ $t('donations.subtitle') }}</p>
    </header>

    <main class="container" style="margin-top: 2rem;">
        <section class="card mb-4 text-center">
            <h2 class="card__title">{{ $t('donations.support') }}</h2>
            <p class="text-muted mb-3" style="font-size: 0.9rem;">{{ $t('donations.desc') }}</p>
            <p v-if="route.query.nombre" style="color: var(--primary-color); font-weight: bold; margin-bottom: 10px;">Estás apoyando a {{ route.query.nombre }}</p>
            
            <div class="mb-4">
                <p id="metaTexto" class="text-center mb-2" style="font-size: 0.9rem;">
                    <strong>${{ datos.recaudado }}</strong> de ${{ datos.meta }}
                </p>
                <div style="background-color: #e9ecef; border-radius: 8px; height: 12px; overflow: hidden;">
                    <div id="barraProgreso" :style="{ width: porcentaje + '%', background: '#F2A900', transition: 'width 0.5s ease', height: '100%' }"></div>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 1.5rem;">
                <button class="btn btn--outline" @click="setMonto(50)" style="flex: 1;">$50</button>
                <button class="btn btn--outline" @click="setMonto(100)" style="flex: 1;">$100</button>
                <button class="btn btn--outline" @click="setMonto(500)" style="flex: 1;">$500</button>
            </div>
            
            <form @submit.prevent="donar">
                <input type="number" v-model="montoDonacion" class="form-input mb-3" :placeholder="$t('donations.otherAmount')" min="10" required>
                
                <button type="button" @click="mercadoPagoInfo" class="btn w-100 mb-3" style="background-color: #009EE3; color: white; border:none; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class='bx bxs-credit-card'></i> {{ $t('donations.btnMercadoPago') }}
                </button>
                
                <button type="submit" class="btn w-100 mb-3" :disabled="cargando" style="background-color: #28a745; color: white; border:none; display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class='bx bx-check-double'></i> {{ cargando ? '...' : $t('donations.btnDemo') }}
                </button>
                
                <button type="button" @click="transferenciaInfo" class="btn btn--outline w-100" style="display:flex; align-items:center; justify-content:center; gap:8px;">
                    <i class='bx bx-transfer'></i> {{ $t('donations.btnTransfer') }}
                </button>
            </form>
        </section>

        <section class="card mb-4">
            <h2 class="card__title mb-3" style="display: flex; align-items: center; gap: 0.5rem;">
                <i class='bx bxs-trophy' style="color: #F2A900;"></i> {{ $t('donations.topDonors') }}
            </h2>
            <ul style="list-style: none; padding: 0;">
                <li v-for="(donador, index) in topDonadoresList" :key="index" style="display: flex; justify-content: space-between; padding: 0.8rem 0; border-bottom: 1px solid #E9ECEF;">
                    <span style="font-weight: 500; text-transform: capitalize;">
                        <span style="color: #6C757D; margin-right: 0.5rem;">#{{ index + 1 }}</span>
                        {{ donador.nombre }}
                    </span>
                    <span style="font-weight: 700; color: #7A1E38;">
                        ${{ donador.monto }}
                    </span>
                </li>
            </ul>
        </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import Swal from 'sweetalert2';

const route = useRoute();
const authStore = useAuthStore();
const datos = ref({ recaudado: 0, meta: 10000 });
const historial = ref([]);
const montoDonacion = ref(null);
const cargando = ref(false);

const mesActual = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

const porcentaje = computed(() => {
    return Math.min((datos.value.recaudado / datos.value.meta) * 100, 100);
});

const topDonadoresList = computed(() => {
    return historial.value.map(d => ({
        nombre: d.usuario_nombre || (d.usuario_email ? d.usuario_email.split('@')[0] : 'Anónimo'),
        monto: Number(d.monto)
    }));
});

const setMonto = (monto) => {
    montoDonacion.value = monto;
};

const cargarMeta = async () => {
    try {
        const res = await api.get('/finanzas/meta');
        if (res.data.status === 'success') {
            datos.value.recaudado = res.data.data.recaudado;
            datos.value.meta = res.data.data.meta;
            historial.value = res.data.data.topDonadores;
        }
    } catch (err) {
        console.error("Error obteniendo meta:", err);
    }
};

onMounted(() => {
    cargarMeta();
});

const donar = async () => {
    if (!montoDonacion.value || montoDonacion.value < 10) {
        Swal.fire('Atención', 'Ingresa un monto válido (mínimo $10)', 'warning');
        return;
    }
    
    if (!authStore.token) {
        Swal.fire('Inicia sesión', 'Debes iniciar sesión para registrar una donación.', 'warning');
        return;
    }

    cargando.value = true;
    try {
        const payload = { monto: Number(montoDonacion.value) };
        if (route.query.mascota_id) {
            payload.mascota_id = route.query.mascota_id;
        }
        await api.post('/finanzas/donaciones', payload);
        Swal.fire('¡Gracias!', `Donación de $${montoDonacion.value} registrada exitosamente.`, 'success');
        
        await cargarMeta();
        montoDonacion.value = null;
    } catch (error) {
        Swal.fire('Error', error.response?.data?.error || 'No se pudo registrar la donación.', 'error');
    } finally {
        cargando.value = false;
    }
};

const mercadoPagoInfo = () => {
    Swal.fire({
        title: 'Integración en proceso',
        text: 'La pasarela de Mercado Pago estará disponible pronto.',
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#009EE3'
    });
};

const transferenciaInfo = () => {
    Swal.fire({
        title: 'Transferencia o Efectivo',
        html: `
            <div style="text-align: left;">
                <p><strong>Banco:</strong> ITM Bank</p>
                <p><strong>CLABE:</strong> 123456789012345678</p>
                <p><strong>Cuenta:</strong> 987654321</p>
                <p><strong>Titular:</strong> Clínica Veterinaria ITM</p>
                <hr style="margin: 1rem 0; border: 0; border-top: 1px solid #e2e8f0;">
                <p><strong>Efectivo:</strong><br>
                Entrega tu donativo en el edificio de la Clínica (Campus Principal), de Lunes a Viernes de 9:00 a 14:00 hrs.</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6'
    });
};
</script>

<style scoped>
.header-camp {
    background-color: var(--primary-color, #7A1E38);
    color: white;
    padding: 2rem 1rem;
    text-align: center;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
}
.header-camp__title {
    font-size: 1.8rem;
    margin: 0.5rem 0;
    font-weight: 700;
}
</style>
