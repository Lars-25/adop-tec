<script setup>
import { ref, computed } from 'vue';
import { store } from '../store.js'; // Importamos tu store con Bolillo y cía. (Nótese el ../)
import Swal from 'sweetalert2';

// Variables locales del formulario
const montoDonacion = ref(null);
const conceptoGasto = ref('Medicamentos');

// Computed: Usamos los datos que ya están en el store
const datos = computed(() => store.state.donaciones);
const rol = computed(() => store.state.sesionActiva?.rol || 'usuario');

const porcentaje = computed(() => {
    return Math.min((datos.value.recaudado / datos.value.meta) * 100, 100);
});

const topDonadores = computed(() => {
    const agrupados = {};
    store.state.historialDonaciones.forEach(d => {
        if (!agrupados[d.email]) agrupados[d.email] = 0;
        agrupados[d.email] += d.monto;
    });
    return Object.keys(agrupados)
        .map(email => ({ nombre: email.split('@')[0], monto: agrupados[email] }))
        .sort((a, b) => b.monto - a.monto)
        .slice(0, 5);
});

// Método para donar
const donar = () => {
    if (montoDonacion.value > 0) {
        // Modificamos directamente el store reactivo
        store.state.donaciones.recaudado += montoDonacion.value;
        
        store.state.historialDonaciones.push({
            email: store.state.sesionActiva ? store.state.sesionActiva.email : 'Anónimo',
            monto: montoDonacion.value,
            fecha: new Date().toISOString()
        });

        store.save(); // Guardamos en LocalStorage usando la función de tu store
        
        Swal.fire('¡Gracias!', `Donación de $${montoDonacion.value} registrada.`, 'success');
        montoDonacion.value = null;
    }
};
</script>

<template>
    <main class="container">
        <section class="card">
            <h2 class="card__title">Estado de la Meta</h2>
            <div class="progress-wrapper mb-3" style="background: #eee; height: 20px; border-radius: 10px;">
                <div :style="{ width: porcentaje + '%', background: 'var(--accent)', height: '100%', borderRadius: '10px', transition: 'width 0.5s ease' }"></div>
            </div>
            <p><b>${{ datos.recaudado }}</b> de ${{ datos.meta }}</p>
            
            <form @submit.prevent="donar" style="margin-top: 1rem;">
                <input type="number" v-model="montoDonacion" class="form-input mb-3" placeholder="Monto a donar ($)" required>
                <button type="submit" class="btn btn--primary">Registrar mi donación</button>
            </form>
        </section>

        <section class="card mb-4">
            <h2 class="card__title mb-3">Mayores Donadores</h2>
            <ul style="list-style: none; padding: 0;">
                <li v-for="(donador, index) in topDonadores" :key="index" style="display: flex; justify-content: space-between; padding: 0.8rem 0;">
                    <span>#{{ index + 1 }} {{ donador.nombre }}</span>
                    <span class="text-primary" style="font-weight: 700;">${{ donador.monto }}</span>
                </li>
            </ul>
        </section>
    </main>
</template>