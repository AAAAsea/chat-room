const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {  //配置跨域
      '/socket.io': {
        target: 'http://localhost:3000', //代理的服务地址
        changeOrigin: true, // needed for virtual hosted sites
      },
      '/api': {
        target: 'https://api.dzzui.com', //代理的服务地址
        changeOrigin: true, // needed for virtual hosted sites
      }
    }
  },
})
