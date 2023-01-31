// webpack.base.js
const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development' // 是否是开发模式

// 这篇文章只是配置，如果想学好webpack，还需要学习webpack的构建原理以及loader和plugin的实现机制。

// 除了上面的配置外，webpack还提供了其他的一些优化方式,本次搭建没有使用到，所以只简单罗列下
// externals: 外包拓展，打包时会忽略配置的依赖，会从上下文中寻找对应变量
// module.noParse: 匹配到设置的模块,将不进行依赖解析，适合jquery, boostrap这类不依赖外部模块的包
// ignorePlugin: 可以使用正则忽略一部分文件，常在使用多语言的包时可以把非中文语言包过滤掉

// hash：跟整个项目的构建相关,只要项目里有文件更改,整个项目构建的hash值都会更改,并且全部文件都共用相同的hash值
// chunkHash：不同的入口文件进行依赖文件解析、构建对应的chunk,生成对应的哈希值,文件本身修改或者依赖文件修改,chunkHash值会变化
// contenthash：每个文件自己单独的 hash 值,文件的改动只会影响自身的 hash 值

// 因为js在生产环境里会把一些公共库和程序入口文件区分开,单独打包构建,采用chunkhash的方式生成哈希值,
// 那么只要我们不改动公共库的代码,就可以保证其哈希值不会受影响,可以继续使用浏览器缓存,所以js适合使用chunkhash。

// css和图片资源媒体资源一般都是单独存在的,可以采用contenthash,只有文件本身变化后会生成新hash值

module.exports = {
    entry: path.join(__dirname, '../src/index.tsx'), // 入口文件

   // 打包文件出口
    output: { 
        filename: 'js/[name].[chunkhash:8].js', // // 加上[chunkhash:8]
        path: path.join(__dirname, '../dist'), // 打包结果输出路径
        clean: true, // webpack4需要配置clean-webpack-plugin来删除dist文件,webpack5内置了
        publicPath: '/' // 打包后文件的公共前缀路径
    },

    cache: {
        type: 'filesystem', // 使用文件缓存
    },

    module: {
        rules: [
        {
            // 减少loader处理文件的数量: ts里面是不能写jsx语法的，所以可以尽可能避免使用 @babel/preset-react对 .ts 文件语法做处理
            
            // 只对项目src文件的ts,tsx进行loader解析
            include: [path.resolve(__dirname, '../src')], 

            test: /.(ts|tsx)$/, // 匹配.ts, tsx文件

            // 由于thread-loader不支持抽离css插件MiniCssExtractPlugin.loader
            // 所以这里只配置了多进程解析js,开启多线程也是需要启动时间,大约600ms左右,所以适合规模比较大的项目
            use: ['thread-loader', 'babel-loader'] 
        },
        {
            test: /.css$/, //匹配所有的 css 文件
            include: [path.resolve(__dirname, '../src')],
            use: [
                // 开发环境使用style-loader,打包模式抽离css
                isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 
                'css-loader',
                'postcss-loader'
              ]
        },

        // 避免让less-loader再去解析css文件 所有less与css的处理分开
        {
            test: /.less$/, //匹配所有的 less 文件
            include: [path.resolve(__dirname, '../src')],
            use: [
                // 开发环境使用style-loader,打包模式抽离css
                isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 
                'css-loader',
                'postcss-loader',
                'less-loader'
              ]
        },
        {
            test:/.(png|jpg|jpeg|gif|svg)$/, // 匹配图片文件
            type: "asset", // type选择asset
            parser: {
                dataUrlCondition: {
                    maxSize: 10 * 1024, // 小于10kb转base64位
                }
            },
            generator:{ 
                filename:'images/[name].[contenthash:8][ext]' // 加上[contenthash:8]
            },
        },
        {
            test:/.(woff2?|eot|ttf|otf)$/, // 匹配字体图标文件
            type: "asset", // type选择asset
            parser: {
                dataUrlCondition: {
                    maxSize: 10 * 1024, // 小于10kb转base64位
                }
            },
            generator:{ 
                filename:'fonts/[name].[contenthash:8][ext]', // 加上[contenthash:8]
            },
        },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'), // 模板取定义root节点的模板
            inject: true, // 自动注入静态资源
        }),
        new webpack.DefinePlugin({
            'process.env.BASE_ENV': JSON.stringify(process.env.BASE_ENV)
        })
    ],
    resolve: {
        extensions: ['.js', '.tsx', '.ts'],
        alias: {
            '@': path.join(__dirname, '../src')
        },

        // 缩小搜索模块范围，查找第三方模块只在本项目的node_modules中查找
        modules: [path.resolve(__dirname, '../node_modules')], 
    }
}