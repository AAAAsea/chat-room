const { defineConfig } = require('@vue/cli-service')
// webpack.config.js
const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')
module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  devServer: {
    
    proxy: {  //配置跨域
      '/socket.io': {
        target: process.env.VUE_APP_SERVER_URL, //代理的服务地址
        changeOrigin: true, // needed for virtual hosted sites
      },
      '/api': {
        target: 'https://api.dzzui.com', //代理的服务地址
        changeOrigin: true, // needed for virtual hosted sites
      },
      '/upload': {
        target: process.env.VUE_APP_SERVER_URL, //代理的服务地址
        changeOrigin: true, // needed for virtual hosted sites
      }
    }
  },
  configureWebpack: {
    plugins: [
        AutoImport({
        resolvers: [ElementPlusResolver()],
        }),
        Components({
        resolvers: [ElementPlusResolver()],
        }),
    ],
},
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js"
    }
  }
})
