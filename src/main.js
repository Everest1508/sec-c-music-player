import './assets/main.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons'

library.add(faPlay, faPause, faStop)


import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
app.component('font-awesome-icon', FontAwesomeIcon)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log("Service Worker Registered!", reg))
        .catch(err => console.error("Service Worker Registration Failed!", err));
    });
  }
  