import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import vuex from  '@/store'
// import 'element-plus/theme-chalk/el-message.css'; // 需要单独引入

createApp(App).use(vuex).mount('#app')
