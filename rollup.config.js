import nodeResolve from '@rollup/plugin-node-resolve' // 帮助寻找node_modules里的包
import babel from '@rollup/plugin-babel' // rollup 的 babel 插件，ES6转ES5
import replace from '@rollup/plugin-replace' // 替换待打包文件里的一些变量，如process在浏览器端是不存在的，需要被替换
import commonjs from "@rollup/plugin-commonjs";// 编译源码中的模块引用默认只支持 ES6+的模块方式
import {terser} from 'rollup-plugin-terser' // 压缩包
import typescript from 'rollup-plugin-typescript2'; // ts
import pkg from './package.json';

const isProd = process.env.NODE_ENV === 'production';

const config = {
  input: 'src/index.ts',
  output: [
    { 
      dir: 'lib',  
      format: 'cjs', 
      name: 'lbgHooks', // 打包后的全局变量，如浏览器端 window.lbgHooks
      globals:{
        "react":"React",
        "antd":"Antd"
      },
    },
    { 
      dir: 'es',  
      format: 'esm',
    },
  ],
  external: ['react', 'antd'], 
  plugins: [
    typescript(),
    babel({
        exclude: 'node_modules/**'
      }),
    replace({
      preventAssignment:true,
      values:{
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }
    }),
    nodeResolve(),
    commonjs(),
    isProd && terser()
  ].filter(Boolean)
}

export default config