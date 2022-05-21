import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'
import vuex from  '@/store'
import ColorPicker from 'colorpicker-v3'  // 注册组件
import 'colorpicker-v3/style.css' // 引入样式文件
// import 'element-plus/theme-chalk/el-message.css'; // 需要单独引入

createApp(App).use(vuex).use(ColorPicker).mount('#app')
