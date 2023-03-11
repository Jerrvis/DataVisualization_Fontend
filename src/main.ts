import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import * as Echarts from 'echarts'
import chalk from '@/assets/theme/chalk.json'
import vintage from '@/assets/theme/vintage.json'
import './style.css'
import './assets/font/iconfont.css'
import SocketService from '@/utils/socket'
import { createPinia } from 'pinia'

const socket = SocketService.Instance
socket.connect()
axios.defaults.baseURL = import.meta.env.VITE_HTTP_Url

Echarts.registerTheme('chalk', chalk)
Echarts.registerTheme('vintage', vintage)

const pinia = createPinia()

const app = createApp(App)

app.config.globalProperties.$echarts = Echarts
app.config.globalProperties.$http = axios
app.config.globalProperties.$socket = socket

app.use(router)
app.use(pinia)
app.mount('#app')
