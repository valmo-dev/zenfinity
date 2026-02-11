import { createRouter, createWebHistory } from 'vue-router'

import DashboardView from '../views/DashboardView.vue'

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
    component: () => import('../views/BudgetView.vue'),
    meta: { title: 'Budget' }
  },
  {
    path: '/revenus',
    name: 'revenus',
    component: () => import('../views/RevenusView.vue'),
    meta: { title: 'Revenus' }
  },
  {
    path: '/repartition',
    name: 'repartition',
    component: () => import('../views/RepartitionView.vue'),
    meta: { title: 'Répartition' }
  },
  {
    path: '/import-export',
    name: 'import-export',
    component: () => import('../views/ImportExportView.vue'),
    meta: { title: 'Import / Export' }
  },
  {
    path: '/parametres',
    name: 'parametres',
    component: () => import('../views/ParametresView.vue'),
    meta: { title: 'Paramètres' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory('/zenfinity/'),
  routes
})

export default router
