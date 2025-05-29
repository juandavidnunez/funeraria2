import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import DepartamentosViews from '../views/DepartamentosViews.vue'
import CiudadesViews from '../views/CiudadesViews.vue'
import SedesViews from '../views/SedesViews.vue'
import SalasViews from '../views/SalasViews.vue'
import CremacionViews from '../views/CremacionViews.vue'
import SepulturaViews from '../views/SepulturaViews.vue'

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
},
  {
    path: '/cremacion',
    component: CremacionViews
  },
  {
    path: '/sepultura',
    component: SepulturaViews
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
