import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'
import BudgetView from '../views/BudgetView.vue'
import RevenusView from '../views/RevenusView.vue'
import RepartitionView from '../views/RepartitionView.vue'
import ImportExportView from '../views/ImportExportView.vue'
import ParametresView from '../views/ParametresView.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { title: 'Tableau de bord' }
  },
  {
    path: '/budget',
    name: 'budget',
    component: BudgetView,
    meta: { title: 'Budget' }
  },
  {
    path: '/revenus',
    name: 'revenus',
    component: RevenusView,
    meta: { title: 'Revenus' }
  },
  {
    path: '/repartition',
    name: 'repartition',
    component: RepartitionView,
    meta: { title: 'Répartition' }
  },
  {
    path: '/import-export',
    name: 'import-export',
    component: ImportExportView,
    meta: { title: 'Import / Export' }
  },
  {
    path: '/parametres',
    name: 'parametres',
    component: ParametresView,
    meta: { title: 'Paramètres' }
  }
]

const router = createRouter({
  history: createWebHistory('/zenfinity/'),
  routes
})

export default router
