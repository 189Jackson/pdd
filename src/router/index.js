import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default.vue'),
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: 'Index',
        redirect: '/calc',
        meta: {
          title: '首页',
          isNotAuth: true,
          keepAlive: true
        },
        component: () => import('@/views/home/index.vue')
      }
    ]
  },
  {
    path: '/excel',
    name: 'Excel',
    meta: {
      title: 'Excel',
      isNotAuth: true
    },
    component: () => import('@/views/excel/index.vue')
  },
  {
    path: '/money',
    name: 'Money',
    meta: {
      title: 'Money',
      isNotAuth: true
    },
    component: () => import('@/views/money/index.vue')
  },
  {
    path: '/calc',
    name: 'Calc',
    meta: {
      title: '算账',
      isNotAuth: true
    },
    component: () => import('@/views/calc/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
