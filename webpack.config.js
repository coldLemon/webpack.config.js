//webpack": "^4.35.2",
const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');  //打包vue
const HtmlWebpackPlugin = require('html-webpack-plugin');//打包html
const MiniCssExtractPlugin = require('mini-css-extract-plugin');//打包css
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')//压缩css
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); //清理dist下旧版本
const SpeedMesurePlugin = require('speed-measure-webpack-plugin'); //webpack速度
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer'); //打包体积分析
const webpack = require('webpack');
 
const smp = new SpeedMesurePlugin()
const webpackConfig = {
  mode:'production',
  // mode: 'development',
  entry: {
    index: "./src/index.js",
    vue:['vue','vue-router','vuex'],
    elementUI:['element-ui'],
    swaper:['vue-awesome-swiper']
  },
  output: {
    path: path.join(__dirname, '/dist'),
    filename: "[name].[hash:16].js"
  },
  module: {
    rules: [
      {     
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.(png|svg|jpe?g|gif|PNG|JPG)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              outputPath:'image/',
              limit:5 * 1024
            },
          },
          // 'file-loader'
        ]
      },
      {
        test: /\.(css|less|sass)$/,
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',  //官网tip: 该插件不能和style 一起用
          'cache-loader',
          'css-loader', 'less-loader'
        ],
        // exclude: /node_modules/   
      },
      {
        test: '/\.js$/',
        use:[
          'cache-loader', //缓存
          'babel-loader'
        ],
        // options:{
        //   cacheDirectory:true,//node_module 缓存，false为缓存
        //   cacheCompression: false //是否启用gzip 压缩
        // },
        exclude: /node_modules/
      },
      {
        test:/\.(eot|woff2|woff|ttf|svg|mp4|mp3|ogg|wav|aac)/,
        use:[
          {
            loader:'url-loader',
            options:{
              name:'[name][hash:5].min.[ext]',
              limit:5000,
              publicPath:'',
              outputPath:'text/',
              useRelativePath:true
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'gege',
      template: path.resolve(__dirname,'index.html'),///指定要打包的html路径和文件名
      filename: "index.html",//指定输出路径和文件名（相对js的路径）
      hash: true,
      minify: {
        //压缩HTML
        removeComments: true, // // 删除注释
        collapseWhitespace: true // 去除回车换行符以及多余空格
      },
      inject:'body',
      // dll:['dll/vue.dll.js'] //在html中引入分离打包的js 文件

    })
    ,
    new MiniCssExtractPlugin({
      // filename:'[name]_[contenthash:8].css'
      filename:'[name].css',
      chunkFilename:'[id].css',
    }),
    new VueLoaderPlugin(),
    new CleanWebpackPlugin(), 
    // new webpack.DllReferencePlugin({
    //   manifest: require(path.resolve(__dirname, 'dist', 'manifest.json')),
    //   // name  :"[name]_lib", //dll 暴露的地方的名称
    //   // manifest:包含 content 和 name 的对象，或者在编译时(compilation)的一个用于加载的 JSON manifest 绝对路径
      
    // }),
    new BundleAnalyzerPlugin.BundleAnalyzerPlugin(),
    new OptimizeCSSAssetsPlugin()//压缩css
  ],
  resolve:{
    extensions:['.js','.vue','.json'],//可以不加扩展名
    alias:{
      Components : path.resolve(__dirname,'src/components/'),
      Pages: path.resolve(__dirname,'src/pages/')
    }
  },
  optimization:{ //优化
    splitChunks: { //分割代码
      chunks: "all",          //async异步代码分割 initial同步代码分割 all同步异步分割都开启
      minSize: 30000,           //字节 引入的文件大于30kb才进行分割

      // maxSize: 0,               //尝试将大于size的文件拆分成n个size的文件
      maxAsyncRequests: 5,      //同时加载的模块数量最多是5个，只分割出同时引入的前5个文件
      maxInitialRequests: 10,    //首页加载的时候引入的文件最多几个
      automaticNameDelimiter: '~', //缓存组和生成文件名称之间的连接符
      name: true,                  //缓存组里面的filename生效，覆盖默认命名

      cacheGroups: { //缓存组，将所有加载模块放在缓存里面一起分割打包
        
        vendors: {  //自定义打包模块
          test: /[\\/]node_modules[\\/]/,
          priority: -10, //优先级，先打包到哪个组里面，值越大，优先级越高
          filename: '[name].vender.js',
          // enforce:true  // 忽略某一些配置的一些限制，一定会产出这个模块
          chunks:'all'
        },
        default: { //默认打包模块
          minChunks: 2,           //模块至少使用次数

          priority: -20,
          reuseExistingChunk: true, //模块嵌套引入时，判断是否复用已经被打包的模块
          filename: '[name].common.js'
        }
      }
    }
    
  }
}
module.exports =  smp.wrap(webpackConfig)
