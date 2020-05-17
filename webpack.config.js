const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const distPath = path.resolve(__dirname, 'dist');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    output: {
        filename: 'index.js',
        path: distPath
    },
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, './src/components'),
            '@constants': path.resolve(__dirname, './src/constants'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@img': path.resolve(__dirname, './src/img'),
            '@shaders': path.resolve(__dirname, './src/shaders'),
            '@assets': path.resolve(__dirname, './src/assets')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(png|jpg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        emitFile: true
                    }
                }
            },
            {
                test: /\.gltf$/,
                use: {
                    loader: 'gltf-webpack-loader',
                    options: {
                        emitFile: true
                    }
                }
            },
            {
                test: /\.glsl$/,
                use: {
                    loader: 'raw-loader',
                    options: {
                        esModule: false
                    }
                }
            },
            {
                test: /\.bin$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        emitFile: true
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: './src/index.html',
            scriptLoading: 'defer'
        })
    ],
    devServer: {
        contentBase: distPath,
        compress: true,
        host: 'localhost',
        port: 8000,
        historyApiFallback: true,
        disableHostCheck: true,
        publicPath: '/'
    }
};