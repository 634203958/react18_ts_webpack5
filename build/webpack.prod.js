// webpack.prod.js
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const globAll = require('glob-all');
const { PurgeCSSPlugin } = require('purgecss-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// 开启gzip
const glob = require('glob')
const CompressionPlugin  = require('compression-webpack-plugin')

const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base.js');


// TODO: css和图片等资源不管设置prefetch还是preload都不能触发

// Tree Shaking的意思就是摇树,伴随着摇树这个动作,树上的枯叶都会被摇晃下来,
// 这里的tree-shaking在代码中摇掉的是未使用到的代码,也就是未引用的代码,最早是在rollup库中出现的,webpack在2版本之后也开始支持。
// 模式mode为production时就会默认开启tree-shaking功能以此来标记未引入代码然后移除掉,测试一下。

// 资源预加载
// link rel的属性值
// preload是告诉浏览器页面必定需要的资源,浏览器一定会加载这些资源。
// prefetch是告诉浏览器页面可能需要的资源,浏览器不一定会加载这些资源,会在空闲时加载。

// webpack v4.6.0+ 增加了对预获取和预加载的支持,使用方式也比较简单,在import引入动态资源时使用webpack的魔法注释
// 单个目标
// import(
//   /* webpackChunkName: "my-chunk-name" */ // 资源打包后的文件chunkname
//   /* webpackPrefetch: true */ // 开启prefetch预获取
//   /* webpackPreload: true */ // 开启preload预获取
//   './module'
// );

// 前端代码在浏览器运行,需要从服务器把html,css,js资源下载执行,下载的资源体积越小,
// 页面加载速度就会越快。一般会采用gzip压缩,现在大部分浏览器和服务器都支持gzip,可以有效减少静态资源文件大小,压缩率在 70% 左右。
// nginx可以配置gzip: on来开启压缩,但是只在nginx层面开启,会在每次请求资源时都对资源进行压缩,
// 压缩文件会需要时间和占用服务器cpu资源，更好的方式是前端在打包的时候直接生成gzip资源,服务器接收到请求,
// 可以直接把对应压缩好的gzip文件返回给浏览器,节省时间和cpu


module.exports = merge(baseConfig, {
    mode: 'production', // 生产模式,会开启tree-shaking和压缩代码,以及其他优化
    optimization: {
        minimizer: [
            // 压缩css
            new CssMinimizerPlugin(), 

            // 压缩js
            new TerserPlugin({ 
                // 开启多线程压缩
                parallel: true, 
                terserOptions: {
                    compress: {
                        pure_funcs: ["console.log"] // 删除console.log
                    }
                }
            }),
        ],
        splitChunks: { // 分隔代码
            cacheGroups: {
                vendors: { // 提取node_modules代码
                    test: /node_modules/, // 只匹配node_modules里面的模块
                    name: 'vendors', // 提取文件命名为vendors,js后缀和chunkhash会自动加
                    minChunks: 1, // 只要使用一次就提取出来
                    chunks: 'initial', // 只提取初始化就能获取到的模块,不管异步的
                    minSize: 0, // 提取代码体积大于0就提取出来
                    priority: 1, // 提取优先级为1
                },
                commons: { // 提取页面公共代码
                    name: 'commons', // 提取文件命名为commons
                    minChunks: 2, // 只要使用两次就提取出来
                    chunks: 'initial', // 只提取初始化就能获取到的模块,不管异步的
                    minSize: 0, // 提取代码体积大于0就提取出来
                }
            }
        }
    },
    plugins: [
        // 复制文件插件
        new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, '../public'), // 复制public下文件
                    to: path.resolve(__dirname, '../dist'), // 复制到dist目录中
                    filter: source => {
                        return !source.includes('index.html') // 忽略index.html
                    }
                },
            ],
        }),

        // 抽离css插件
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash:8].css' // 加上[contenthash:8]
        }),

        // 清理无用css
        // purgecss-webpack-plugin插件不是全能的,由于项目业务代码的复杂,插件不能百分百识别哪些样式用到了,哪些没用到,
        // 所以请不要寄希望于它能够百分百完美解决你的问题,这个是不现实的
        new PurgeCSSPlugin({
            // 检测src下所有tsx文件和public下index.html中使用的类名和id和标签名称
            // 只打包这些文件中用到的样式
            paths: globAll.sync([
                `${path.join(__dirname, '../src')}/**/*.tsx`,
                path.join(__dirname, '../public/index.html')
            ]),

            // 插件本身也提供了一些白名单safelist属性,符合配置规则选择器都不会被删除掉,比如使用了组件库antd, 
            // purgecss-webpack-plugin插件检测src文件下tsx文件中使用的类名和id时,是检测不到在src中使用antd组件的类名的,
            // 打包的时候就会把antd的类名都给过滤掉,可以配置一下安全选择列表,避免删除antd组件库的前缀ant
            safelist: {
                standard: [/^ant-/], // 过滤以ant-开头的类名，哪怕没用到也不删除
            }
        }),

        new CompressionPlugin({
            test: /.(js|css)$/, // 只生成css,js压缩文件
            filename: '[path][base].gz', // 文件命名
            algorithm: 'gzip', // 压缩格式,默认是gzip
            test: /.(js|css)$/, // 只生成css,js压缩文件
            threshold: 10240, // 只有大小大于该值的资源会被处理。默认值是 10k
            minRatio: 0.8 // 压缩率,默认值是 0.8
        })
    ]
})