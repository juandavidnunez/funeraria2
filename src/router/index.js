import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import DepartamentosViews from '../views/DepartamentosViews.vue'
import CiudadesViews from '../views/CiudadesViews.vue'
import SedesViews from '../views/SedesViews.vue'
import SalasViews from '../views/SalasViews.vue'


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
  },
  {
  path: '/sedes/:ciudadId',
  component: SedesViews
},
  {
  path: '/salas/:sedeId',
  component:  SalasViews
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
