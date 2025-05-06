import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import '@/router/interceptors.js'
import '@/utils/flexible.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(ElementPlus)

// 懒加载

app.use(createPinia())

app.use(router)

app.mount('#app')
