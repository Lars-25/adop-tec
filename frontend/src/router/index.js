import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import LoginView from '../views/LoginView.vue';
import SignupView from '../views/SignupView.vue';
import FeedView from '../views/FeedView.vue';
import ProfileView from '../views/ProfileView.vue';
import DonationsView from '../views/DonationsView.vue';
import PetFormView from '../views/PetFormView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/nosotros',
      name: 'about',
      component: AboutView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView
    },
    {
      path: '/feed',
      name: 'feed',
      component: FeedView,
      meta: { requiresAuth: true }
    },
    {
      path: '/perfil',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/donaciones',
      name: 'donations',
      component: DonationsView
    },
    {
      path: '/formulario',
      name: 'formulario',
      component: PetFormView,
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation Guard Global Básico
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('adoptec_token');
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Redirigir si no está logueado
  } else if ((to.path === '/login' || to.path === '/signup') && isAuthenticated) {
    next('/feed'); // Evitar que el usuario logueado vuelva al login
  } else {
    next();
  }
});

export default router;
