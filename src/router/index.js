import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import DepartamentosViews from '../views/DepartamentosViews.vue'
import CiudadesViews from '../views/CiudadesViews.vue'


const routes = [
  {
    path: '/',
    component: InicioView
  },
  {
    path: '/departamentos',
    component: DepartamentosViews
  },
   
  {
  path: '/ciudades/:departamentoId',
  component: CiudadesViews
},

  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
