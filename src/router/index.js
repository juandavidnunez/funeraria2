import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'

import Departamentos from '../views/DepartamentosViews.vue'

const routes = [
    { path: '/', component: Departamentos },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router