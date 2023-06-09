import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/ScreenPage.vue')
  },
  {
    path: '/screenpage',
    component: () => import('@/views/ScreenPage.vue')
  },
  {
    path: '/sellerpage',
    component: () => import('@/views/SellerPage.vue')
  },
  {
    path: '/trendpage',
    component: () => import('@/views/TrendPage.vue')
  },
  {
    path: '/mappage',
    component: () => import('@/views/MapPage.vue')
  },
  {
    path: '/rankpage',
    component: () => import('@/views/RankPage.vue')
  },
  {
    path: '/hotpage',
    component: () => import('@/views/HotPage.vue')
  },

  {
    path: '/stockpage',
    component: () => import('@/views/StockPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
