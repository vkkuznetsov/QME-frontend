import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

loadFonts()

// Импорт мока
if (process.env.NODE_ENV === 'development') {
  require('./mocks/axiosMock');
}

createApp(App)
  .use(router)
  .use(vuetify)
  .mount('#app')
