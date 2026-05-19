import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

// Importamos el CSS global copiado desde el proyecto antiguo
import './assets/styles.css'

const i18n = createI18n({
  legacy: false,
  locale: 'es', // idioma por defecto
  fallbackLocale: 'es',
  messages: {
    es,
    en
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
