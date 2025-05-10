import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// routes
import router from './router'


createApp(App).use(router).mount('#app')
