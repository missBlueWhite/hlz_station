const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  publicPath: './',
  assetsDir: './static',
  productionSourceMap: false,
  lintOnSave: false, // 是否开启eslint
  devServer: {
    headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin'
      },
    // proxy: {
    //   // 两种写法都可以
    //   // 代理请求， 匹配所有以/uums开头的请求
    //   "/uums": {
    //     // 目标服务器，所有以/uums开头的请求接口代理到目标服务器
    //     target: "http://hyzc-gateway-dev.apps.bjdev.ocpx.cnooc", //代理的地址(ip+端口号)
    //     ws: true,
    //     changeOrigin: true,//是否跨域
    //     // 重写路径，此时用于匹配反向代理的/uums可以替换为空 也可以理解为（ “/uums”代替target里面的地址，后面组件中我们调接口是直接用uums代替）
    //     // {比如我要调用 ‘http://hyzc-gateway-dev.apps.bjdev.ocpx.cnooc/user/info’  直接写成 ‘/uums/user/info’}
    //     pathRewrite: {
    //       "^/uums": ""
    //     },
    //   },
    //   '/uds/': {
    //     target: 'http://10.11.8.118:8080/uds/',
    //     changeOrigin: true,
    //     pathRewrite: {
    //       '^/uds/': ''
    //     }
    //   }
    // }
  },
  configureWebpack: config => {
    const cwp = new CopyWebpackPlugin([
      {
        from: './node_modules/cesium/Build/Cesium', // 调试时，将Cesium换成CesiumUnminified
        to: 'js/Cesium',
        toType: 'dir'
      },
    ]);
    config.plugins.push(cwp);

    config.externals = config.externals || {};
    config.externals.cesium = 'Cesium';
  }
}