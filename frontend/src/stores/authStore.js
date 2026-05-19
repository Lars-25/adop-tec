import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('adoptec_user')) || null,
    token: localStorage.getItem('adoptec_token') || null
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/auth/login', credentials);
        this.token = response.data.token;
        this.user = response.data.user;
        
        localStorage.setItem('adoptec_token', this.token);
        localStorage.setItem('adoptec_user', JSON.stringify(this.user));
        
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.error || 'Credenciales inválidas o error de red' 
        };
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('adoptec_token');
      localStorage.removeItem('adoptec_user');
    }
  }
});
