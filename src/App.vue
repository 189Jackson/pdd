<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="caches">
      <component :is="Component"/>
    </keep-alive>
  </router-view> 
</template>

<script setup>
  import { ref } from 'vue';
  import allRoutes from '@/router/index';

  const caches = ref([])
  const routes = allRoutes.options.routes

  const getKeepLiveRoutes = (routes) => {
    const res = []
    routes.forEach(item => {
      if (item.meta && item.meta.keepAlive) {
        res.push(item.name)
      }
      if (item.children && item.children.length) {
        res.push(...getKeepLiveRoutes(item.children))
      }
    })
    return res
  }

  caches.value = getKeepLiveRoutes(routes)

</script>

<style scoped>
</style>
