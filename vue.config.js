const { defineConfig } = require('@vue/cli-service')
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
  pluginOptions: {
    electronBuilder: {
      preload: "src/preload.js"
    }
  }
})
