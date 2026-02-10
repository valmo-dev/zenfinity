import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useBudgetStore } from './stores/budget'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)

// Initialize theme from store
const store = useBudgetStore()
store.initTheme()

app.mount('#app')
