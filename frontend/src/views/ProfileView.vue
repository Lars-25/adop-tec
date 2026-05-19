<template>
  <main class="profile container" style="margin-top: 2rem; margin-bottom: 3rem; text-align: center; max-width: 600px;">
    <!-- CABECERA PERFIL -->
    <header class="profile-header mb-4">
      <div class="profile-header__avatar mb-3" style="position: relative; overflow: hidden; display: flex; justify-content: center; align-items: center; margin: 0 auto; width: 80px; height: 80px; border-radius: 50%; border: 2px solid var(--border-color, #e2e8f0); background: #f8fafc;">
        <img v-if="authStore.user?.avatar_url" :src="authStore.user.avatar_url" style="width: 100%; height: 100%; object-fit: cover;">
        <i v-else class='bx bx-user' style="font-size: 2.5rem; color: #94a3b8;"></i>
      </div>
      
      <h2 class="profile-header__name" style="font-size: 1.3rem; font-weight: 600; color: var(--text-color);">{{ authStore.user?.nombre || 'Usuario' }}</h2>
      <p class="text-muted" style="font-size: 0.85rem; margin-top: -5px;">{{ authStore.user?.rol === 'admin' ? $t('profile.adminTitle') : $t('profile.studentTitle') }}</p>
      
      <input type="file" ref="avatarInputRef" accept="image/*" style="display: none" @change="onAvatarChange">
      <button class="btn btn--outline mt-2" @click="triggerAvatarUpload" style="padding: 4px 16px; font-size: 0.85rem; border-radius: 20px;">
        <i class='bx bx-pencil'></i> {{ $t('profile.editProfile') }}
      </button>
    </header>

    <!-- ESTADÍSTICAS -->
    <div class="stats mb-4" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--card-bg, #ffffff); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div>
        <span class="stats__number" style="font-size: 1.8rem; font-weight: 700; color: var(--primary-color, #7A1E38); display: block;">{{ misDonaciones.length }}</span>
        <span class="stats__label" style="font-size: 0.8rem; color: var(--text-muted);">{{ $t('profile.contributions') }}</span>
      </div>
      <div>
        <span class="stats__number" style="font-size: 1.8rem; font-weight: 700; color: var(--primary-color, #7A1E38); display: block;">${{ totalDonado }}</span>
        <span class="stats__label" style="font-size: 0.8rem; color: var(--text-muted);">{{ $t('profile.totalDonated') }}</span>
      </div>
    </div>

    <!-- MENÚ DE LISTA -->
    <div class="profile-menu" style="text-align: left; background: var(--card-bg, #ffffff); border: 1px solid var(--border-color); border-radius: 12px; padding: 0.5rem 1rem; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <a href="#" @click.prevent="verHistorial" class="profile-menu__link" style="display: flex; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--border-color); text-decoration: none; color: var(--text-color);">
        <i class='bx bx-heart' style="margin-right: 10px; font-size: 1.2rem; color: var(--primary-color, #7A1E38);"></i> 
        <span class="menu-text" style="font-size: 0.95rem; font-weight: 500; color: inherit;">{{ $t('profile.historial') }}</span>
      </a>

      <div class="profile-menu__link" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color); color: var(--text-color);">
        <div style="display: flex; align-items: center;">
            <i class='bx bx-moon' style="margin-right: 10px; font-size: 1.2rem; color: var(--primary-color, #7A1E38);"></i> 
            <span class="menu-text" style="font-size: 0.95rem; font-weight: 500; color: inherit;">{{ $t('profile.modoOscuro') }}</span>
        </div>
        <label class="switch">
            <input type="checkbox" v-model="isDarkToggle">
            <span class="slider round"></span>
        </label>
      </div>

      <div class="profile-menu__link" style="display: flex; align-items: center; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--border-color); color: var(--text-color);">
        <div style="display: flex; align-items: center;">
            <i class='bx bx-world' style="margin-right: 10px; font-size: 1.2rem; color: var(--primary-color, #7A1E38);"></i> 
            <span class="menu-text" style="font-size: 0.95rem; font-weight: 500; color: inherit;">{{ $t('profile.idioma') }}</span>
        </div>
        <select v-model="$i18n.locale" class="form-input" style="width: auto; padding: 4px 10px; min-height: 30px; font-size: 0.85rem; border-radius: 6px;">
            <option value="es">Español</option>
            <option value="en">English</option>
        </select>
      </div>

      <a href="#" @click.prevent="logout" class="profile-menu__link profile-menu__link--danger" style="display: flex; align-items: center; padding: 1rem 0; text-decoration: none; color: #ef4444;">
        <i class='bx bx-log-out' style="margin-right: 10px; font-size: 1.2rem;"></i> 
        <span style="font-size: 0.95rem; font-weight: 500; color: inherit;">{{ $t('profile.cerrarSesion') }}</span>
      </a>
    </div>

    <!-- PANEL DE ADMINISTRADOR -->
    <div v-if="authStore.user?.rol === 'admin'" class="admin-panel mt-4 text-left" style="background: var(--card-bg); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 2rem;">
        <h3 style="margin-bottom: 1rem; color: var(--text-color);"><i class='bx bx-shield-quarter text-primary'></i> {{ $t('profile.adminPanel') }}</h3>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">
                <h4 style="margin-bottom: 10px; color: var(--text-color);"><i class='bx bx-wallet'></i> {{ $t('profile.finances') }}</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">{{ $t('profile.financesDesc') }}</p>
                <div v-if="!showExpenseForm && !showFinanceReport" style="display: flex; gap: 10px;">
                    <button class="btn btn--primary" style="flex: 1; font-size: 0.85rem;" @click="showExpenseForm = true">{{ $t('profile.addExpense') }}</button>
                    <button class="btn btn--outline" style="flex: 1; font-size: 0.85rem;" @click="cargarReporteFinanciero">{{ $t('profile.viewReport') }}</button>
                </div>
                
                <!-- Formulario de Gasto Nativo -->
                <div v-if="showExpenseForm" style="background: var(--bg-color, #f8fafc); padding: 1rem; border-radius: 8px; margin-top: 10px;">
                    <h5 style="margin-bottom: 10px; color: var(--text-color);">{{ $t('admin.newExpense') }}</h5>
                    <input v-model="nuevoGasto.concepto" type="text" class="form-input mb-2" :placeholder="$t('admin.conceptPlaceholder')">
                    <input v-model="nuevoGasto.monto" type="number" class="form-input mb-3" :placeholder="$t('admin.amountPlaceholder')">
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn--primary w-100" @click="registrarGastoNativo" :disabled="!nuevoGasto.concepto || !nuevoGasto.monto">{{ $t('admin.save') }}</button>
                        <button class="btn btn--outline w-100" @click="showExpenseForm = false">{{ $t('admin.cancel') }}</button>
                    </div>
                </div>

                <!-- Reporte Financiero Nativo -->
                <div v-if="showFinanceReport" style="background: var(--bg-color, #f8fafc); padding: 1rem; border-radius: 8px; margin-top: 10px;">
                    <h5 style="margin-bottom: 10px; color: var(--text-color);">{{ $t('admin.financeReport') }}</h5>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>{{ $t('admin.collected') }}</span> <strong>${{ reporteFinanzas.recaudado }}</strong></div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span>{{ $t('admin.expenses') }}</span> <strong>${{ reporteFinanzas.gastado }}</strong></div>
                    <hr style="margin: 10px 0; border-top: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;"><span>{{ $t('admin.balance') }}</span> <strong :style="{color: reporteFinanzas.balance >= 0 ? '#10b981' : '#ef4444'}">${{ reporteFinanzas.balance }}</strong></div>
                    
                    <h6 style="color: var(--text-color); margin-bottom: 5px;">{{ $t('admin.latestDonations') }}</h6>
                    <div class="data-table-container" style="margin-bottom: 1.5rem;">
                        <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 0.8rem; color: var(--text-color);">
                            <thead>
                                <tr>
                                    <th style="padding: 0.5rem;">{{ $t('admin.date') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.user') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.amount') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="d in donacionesList" :key="d.id" style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 0.5rem;">{{ new Date(d.fecha || d.created_at || Date.now()).toLocaleDateString() }}</td>
                                    <td style="padding: 0.5rem;">{{ d.usuario_nombre || d.usuario_email || 'Usuario' }}</td>
                                    <td style="padding: 0.5rem; color: #10b981;">+${{ d.monto }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h6 style="color: var(--text-color); margin-bottom: 5px;">{{ $t('admin.expenseLog') }}</h6>
                    <div class="data-table-container">
                        <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 0.8rem; color: var(--text-color);">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <th style="padding: 0.5rem;">{{ $t('admin.date') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.concept') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.amount') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="g in gastosList" :key="g.id" style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 0.5rem;">{{ new Date(g.fecha || g.created_at || Date.now()).toLocaleDateString() }}</td>
                                    <td style="padding: 0.5rem;">{{ g.concepto }}</td>
                                    <td style="padding: 0.5rem; color: #ef4444;">-${{ g.monto }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <button class="btn btn--outline w-100 mt-3" @click="showFinanceReport = false">{{ $t('admin.closeReport') }}</button>
                </div>
            </div>
            
            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">
                <h4 style="margin-bottom: 10px; color: var(--text-color);"><i class='bx bx-group'></i> {{ $t('profile.userManagement') }}</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">{{ $t('profile.userDesc') }}</p>
                <button v-if="!showUsers" class="btn btn--outline w-100" style="font-size: 0.85rem;" @click="cargarUsuarios">{{ $t('profile.manageUsers') }}</button>
                <div v-else>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                        <button class="btn btn--primary" style="font-size: 0.85rem; flex: 1;" @click="showAddUserForm = true">{{ $t('admin.createNewUser') }}</button>
                        <button class="btn btn--outline" style="font-size: 0.85rem; flex: 1;" @click="showUsers = false">{{ $t('admin.hide') }}</button>
                    </div>

                    <div v-if="showAddUserForm" style="background: var(--bg-color, #f8fafc); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <h5 style="margin-bottom: 10px; color: var(--text-color);">{{ $t('admin.newUser') }}</h5>
                        <input v-model="nuevoUsuario.nombre" type="text" class="form-input mb-2" :placeholder="$t('admin.name')">
                        <input v-model="nuevoUsuario.email" type="email" class="form-input mb-2" :placeholder="$t('admin.email')">
                        <input v-model="nuevoUsuario.password" type="password" class="form-input mb-2" :placeholder="$t('admin.password')">
                        <select v-model="nuevoUsuario.rol" class="form-input mb-3">
                            <option value="user">{{ $t('admin.userRole') }}</option>
                            <option value="admin">{{ $t('admin.adminRole') }}</option>
                        </select>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn--primary w-100" @click="crearUsuarioNativo" :disabled="!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.password">{{ $t('admin.save') }}</button>
                            <button class="btn btn--outline w-100" @click="showAddUserForm = false">{{ $t('admin.cancel') }}</button>
                        </div>
                    </div>

                    <div class="data-table-container">
                        <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 0.85rem; color: var(--text-color);">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <th style="padding: 0.5rem;">{{ $t('admin.id') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.name') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.email') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.role') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.actions') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="u in usersList" :key="u.id" style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 0.5rem;" :title="u.id">#{{ u.id.substring(0, 8) }}...</td>
                                    <td style="padding: 0.5rem;">
                                        <span v-if="editingUserId !== u.id">{{ u.nombre }}</span>
                                        <input v-else v-model="u.nombre" class="form-input" style="padding: 2px 5px; height: auto; min-height: 25px; font-size: 0.8rem;">
                                    </td>
                                    <td style="padding: 0.5rem;">
                                        <span v-if="editingUserId !== u.id">{{ u.email }}</span>
                                        <input v-else v-model="u.email" type="email" class="form-input" style="padding: 2px 5px; height: auto; min-height: 25px; font-size: 0.8rem;">
                                    </td>
                                    <td style="padding: 0.5rem;">
                                        <span v-if="editingUserId !== u.id">{{ u.rol }}</span>
                                        <select v-else v-model="u.rol" class="form-input" style="padding: 2px 5px; height: auto; min-height: 25px; font-size: 0.8rem;">
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style="padding: 0.5rem; display: flex; gap: 5px;">
                                        <template v-if="editingUserId !== u.id">
                                            <button class="btn btn--outline" style="padding: 2px 8px;" @click="editingUserId = u.id"><i class='bx bx-edit'></i></button>
                                            <button class="btn btn--outline" style="color: #ef4444; border-color: #ef4444; padding: 2px 8px;" @click="eliminarUsuario(u.id)"><i class='bx bx-trash'></i></button>
                                        </template>
                                        <template v-else>
                                            <button class="btn btn--outline" style="color: #10b981; border-color: #10b981; padding: 2px 8px;" @click="guardarUsuario(u)">{{ $t('admin.save') }}</button>
                                            <button class="btn btn--outline" style="padding: 2px 8px;" @click="editingUserId = null; cargarUsuarios()">{{ $t('admin.cancel') }}</button>
                                        </template>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div style="border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem;">
                <h4 style="margin-bottom: 10px; color: var(--text-color);"><i class='bx bx-paw'></i> {{ $t('profile.petManagement') }}</h4>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">{{ $t('profile.petDesc') }}</p>
                <button v-if="!showPets" class="btn btn--outline w-100" style="font-size: 0.85rem;" @click="cargarMascotas">{{ $t('profile.managePets') }}</button>
                <div v-else>
                    <button class="btn btn--outline mb-3" style="font-size: 0.85rem;" @click="showPets = false">{{ $t('admin.hide') }}</button>
                    <div class="data-table-container">
                        <table style="width: 100%; text-align: left; border-collapse: collapse; font-size: 0.85rem; color: var(--text-color);">
                            <thead>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <th style="padding: 0.5rem;">{{ $t('admin.photo') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.name') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.species') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.location') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.status') }}</th>
                                    <th style="padding: 0.5rem;">{{ $t('admin.actions') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="p in petsList" :key="p.id" style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 0.5rem;">
                                        <img :src="p.imagen_url || 'https://placehold.co/50x50?text=Foto'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                                    </td>
                                    <td style="padding: 0.5rem;">
                                        <span v-if="editingPetId !== p.id">{{ p.nombre }}</span>
                                        <input v-else v-model="p.nombre" class="form-input" style="padding: 2px 5px; height: auto; min-height: 25px; font-size: 0.8rem;">
                                    </td>
                                    <td style="padding: 0.5rem; text-transform: capitalize;">
                                        <span v-if="editingPetId !== p.id">{{ p.especie }}</span>
                                        <select v-else v-model="p.especie" class="form-input" style="padding: 2px 5px; height: auto; min-height: 25px; font-size: 0.8rem;">
                                            <option value="perro">Perro</option>
                                            <option value="gato">Gato</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                    </td>
                                    <td style="padding: 0.5rem;">
                                        <span v-if="editingPetId !== p.id">{{ p.ubicacion || 'N/A' }}</span>
                                        <input v-else v-model="p.ubicacion" class="form-input" style="padding: 2px 5px; height: auto; min-height: 25px; font-size: 0.8rem;">
                                    </td>
                                    <td style="padding: 0.5rem;">
                                        <span v-if="editingPetId !== p.id">{{ p.estado }}</span>
                                        <select v-else v-model="p.estado" class="form-input" style="padding: 2px 5px; height: auto; min-height: 25px; font-size: 0.8rem;">
                                            <option value="En adopcion">En adopción</option>
                                            <option value="Urgente">Urgente</option>
                                            <option value="Adoptado">Adoptado</option>
                                        </select>
                                    </td>
                                    <td style="padding: 0.5rem; display: flex; gap: 5px;">
                                        <template v-if="editingPetId !== p.id">
                                            <button class="btn btn--outline" style="padding: 2px 8px;" @click="editingPetId = p.id"><i class='bx bx-edit'></i></button>
                                            <button class="btn btn--outline" style="color: #ef4444; border-color: #ef4444; padding: 2px 8px;" @click="eliminarMascota(p.id)"><i class='bx bx-trash'></i></button>
                                        </template>
                                        <template v-else>
                                            <button class="btn btn--outline" style="color: #10b981; border-color: #10b981; padding: 2px 8px;" @click="guardarMascota(p)">{{ $t('admin.save') }}</button>
                                            <button class="btn btn--outline" style="padding: 2px 8px;" @click="editingPetId = null; cargarMascotas()">{{ $t('admin.cancel') }}</button>
                                        </template>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- BOTÓN FLOTANTE/INFERIOR -->
    <router-link to="/formulario" class="btn btn--primary" style="border-radius: 50px; padding: 12px 24px; font-weight: 600; box-shadow: 0 4px 10px rgba(122, 30, 56, 0.3);">
        <i class='bx bx-plus-circle' style="margin-right: 5px; font-size: 1.1rem;"></i> {{ $t('profile.btnPublish') }}
    </router-link>

  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { useDark, useToggle } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import api from '../services/api';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const isDark = useDark({
  selector: 'body',
  attribute: 'class',
  valueDark: 'dark-theme',
  valueLight: '',
});
const toggleDark = useToggle(isDark);

const isDarkToggle = computed({
    get: () => isDark.value,
    set: () => toggleDark()
});

const showUsers = ref(false);
const showPets = ref(false);
const usersList = ref([]);
const petsList = ref([]);
const editingUserId = ref(null);
const editingPetId = ref(null);

// Modulo de finanzas
const showExpenseForm = ref(false);
const showFinanceReport = ref(false);
const nuevoGasto = ref({ concepto: '', monto: '' });
const reporteFinanzas = ref({ recaudado: 0, gastado: 0, balance: 0 });
const donacionesList = ref([]);
const gastosList = ref([]);

// Modulo de usuarios (creacion)
const showAddUserForm = ref(false);
const nuevoUsuario = ref({ nombre: '', email: '', password: '', rol: 'user' });

const misDonaciones = ref([]);
const totalDonado = computed(() => misDonaciones.value.reduce((acc, d) => acc + Number(d.monto), 0));

onMounted(async () => {
  try {
    const response = await api.get('/finanzas/donaciones/me');
    if (response.data.status === 'success') {
      misDonaciones.value = response.data.data;
    }
  } catch (error) {
    console.error('Error cargando donaciones:', error);
  }
});

const verHistorial = () => {
  if (misDonaciones.value.length === 0) {
    Swal.fire(t('alerts.info'), t('alerts.historyEmpty'), 'info');
    return;
  }
  let htmlLista = '<ul style="text-align:left;">';
  misDonaciones.value.forEach(d => {
    htmlLista += `<li><b>$${d.monto}</b> - <small>${new Date(d.fecha).toLocaleDateString()}</small></li>`;
  });
  htmlLista += '</ul>';
  Swal.fire({ title: t('alerts.historyTitle'), html: htmlLista, icon: 'success' });
};

const logout = () => {
  authStore.logout();
  router.push('/');
};

// Admin panel native functions
const registrarGastoNativo = async () => {
    try {
        await api.post('/finanzas/gastos', { 
            concepto: nuevoGasto.value.concepto, 
            monto: parseFloat(nuevoGasto.value.monto) 
        });
        Swal.fire({ icon: 'success', title: 'Gasto registrado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        nuevoGasto.value = { concepto: '', monto: '' };
        showExpenseForm.value = false;
        if (showFinanceReport.value) await cargarReporteFinanciero();
    } catch (error) {
        Swal.fire(t('alerts.error'), error.response?.data?.error || 'No se pudo registrar el gasto', 'error');
    }
};

const cargarReporteFinanciero = async () => {
    try {
        const [donacionesRes, gastosRes] = await Promise.all([
            api.get('/finanzas/donaciones'),
            api.get('/finanzas/gastos')
        ]);
        
        let recaudado = 0;
        let gastado = 0;
        
        if (donacionesRes.data?.data) {
            donacionesList.value = donacionesRes.data.data;
            recaudado = donacionesList.value.reduce((acc, d) => acc + Number(d.monto), 0);
        }
        if (gastosRes.data?.data) {
            gastosList.value = gastosRes.data.data;
            gastado = gastosList.value.reduce((acc, g) => acc + Number(g.monto), 0);
        }
        
        reporteFinanzas.value = {
            recaudado: recaudado.toFixed(2),
            gastado: gastado.toFixed(2),
            balance: (recaudado - gastado).toFixed(2)
        };
        showFinanceReport.value = true;
    } catch (error) {
        Swal.fire(t('alerts.error'), 'No se pudo cargar el reporte', 'error');
    }
};

const crearUsuarioNativo = async () => {
    try {
        await api.post('/users', nuevoUsuario.value);
        Swal.fire({ icon: 'success', title: 'Usuario creado exitosamente', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        showAddUserForm.value = false;
        nuevoUsuario.value = { nombre: '', email: '', password: '', rol: 'user' };
        await cargarUsuarios();
    } catch (error) {
        Swal.fire(t('alerts.error'), error.response?.data?.error || 'No se pudo crear el usuario', 'error');
    }
};

const cargarUsuarios = async () => {
  try {
    const res = await api.get('/users');
    usersList.value = res.data.data || res.data;
    showUsers.value = true;
  } catch (error) {
    Swal.fire(t('alerts.error'), 'No se pudo cargar la lista de usuarios', 'error');
  }
};

const eliminarUsuario = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (isConfirmed) {
    try {
      await api.delete(`/users/${id}`);
      Swal.fire({ icon: 'success', title: 'Usuario eliminado exitosamente', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      await cargarUsuarios();
    } catch (error) {
      Swal.fire(t('alerts.error'), error.response?.data?.error || 'No se pudo eliminar', 'error');
    }
  }
};

const guardarUsuario = async (user) => {
    try {
        await api.put(`/users/${user.id}`, user);
        editingUserId.value = null;
        Swal.fire({ icon: 'success', title: 'Usuario actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        await cargarUsuarios();
    } catch (error) {
        Swal.fire(t('alerts.error'), 'No se pudo actualizar el usuario', 'error');
    }
};

const cargarMascotas = async () => {
  try {
    const res = await api.get('/pets');
    const mascotas = res.data.data || res.data;
    petsList.value = mascotas.map(p => ({
        ...p,
        estado: p.estado || (p.urgente ? 'Urgente' : 'En adopcion')
    }));
    showPets.value = true;
  } catch (error) {
    Swal.fire(t('alerts.error'), 'No se pudo cargar la lista de mascotas', 'error');
  }
};

const eliminarMascota = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (isConfirmed) {
    try {
      await api.delete(`/pets/${id}`);
      Swal.fire({ icon: 'success', title: 'Reporte eliminado correctamente', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
      await cargarMascotas();
    } catch (error) {
      Swal.fire(t('alerts.error'), error.response?.data?.error || 'No se pudo eliminar', 'error');
    }
  }
};

const guardarMascota = async (pet) => {
    try {
        pet.urgente = (pet.estado === 'Urgente');
        await api.put(`/pets/${pet.id}`, pet);
        editingPetId.value = null;
        Swal.fire({ icon: 'success', title: 'Mascota actualizada', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
        await cargarMascotas();
    } catch (error) {
        Swal.fire(t('alerts.error'), 'Error al actualizar mascota', 'error');
        await cargarMascotas();
    }
};

// Avatar Upload
const avatarInputRef = ref(null);
const triggerAvatarUpload = () => {
  avatarInputRef.value.click();
};
const onAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const base64String = evt.target.result;
    try {
      await api.put(`/users/${authStore.user.id}`, { avatar_url: base64String });
      
      authStore.user.avatar_url = base64String;
      localStorage.setItem('adoptec_user', JSON.stringify(authStore.user));
      
      Swal.fire({ icon: 'success', title: 'Perfil actualizado', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (error) {
      Swal.fire(t('alerts.error'), 'No se pudo actualizar el perfil', 'error');
    }
  };
  reader.readAsDataURL(file);
};
</script>

<style scoped>
/* Las clases .switch y .slider.round son manejadas globalmente */
:global(.dark-theme) .profile-menu__link,
:global(.dark-theme) p,
:global(.dark-theme) span,
:global(.dark-theme) label,
:global(.dark-theme) .menu-text,
:global(.dark-theme) h2 {
  color: var(--text-color, #fff) !important;
}
:global(.dark-theme) select {
  color: var(--text-color) !important;
  background-color: var(--card-bg, #1e293b) !important;
  border-color: var(--border-color) !important;
}
:global(.dark-theme) .stats,
:global(.dark-theme) .profile-menu {
  background: var(--card-bg, #1e293b) !important;
  border-color: var(--border-color) !important;
}
:global(.dark-theme) .profile-menu__link {
  border-color: var(--border-color) !important;
}

.admin-panel {
  max-width: 100%;
  overflow: hidden; /* Contención de contenedor padre */
}

.admin-panel > div {
  min-width: 0; /* Hack de flex/grid para evitar expansión infinita */
  width: 100%;
}

.admin-panel > div > div {
  min-width: 0;
  max-width: 100%;
  overflow: hidden; /* Aislamiento de tarjetas */
}

.data-table-container {
  width: 100%;
  max-width: 100%;
  overflow-x: auto; /* Aislamiento del scroll horizontal */
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: collapse;
  white-space: nowrap; 
  table-layout: fixed; /* Algoritmo fijo para respetar el width: 100% */
}

td, th {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn--primary {
  background-color: var(--primary-color) !important;
  color: #ffffff !important;
  border: none;
  font-weight: bold;
}
.btn--primary:hover {
  background-color: var(--primary-hover) !important;
}
</style>
