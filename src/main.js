import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css  使用全局的css样式

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon  引入所有的svg图片
import '@/permission' // permission control  引入token校验以及权限相关
import '@/plugins/vcharts' // 引入vcharts相关配置

// 全局注册的组件
import CategorySelector from '@/components/CategorySelector'
import HintButton from '@/components/HintButton'
Vue.component('CategorySelector', CategorySelector)
Vue.component('HintButton', HintButton)

// import { default as trademark } from '@/api/product/tardemark'
// import trademark from '@/api/product/tardemark'
// Vue.prototype.$API = trademark
// this.$API.addOrUpdate()
// 这样的方式，只能把trademark相关的api拿到，也就是说$API就只有trademark的接口
// 后期我们还要写attr相关的api，$API内部就没有attr相关的接口

import * as API from '@/api'

Vue.prototype.$API = API
// {
//   trademark,
//   attr
// }
// this.$API.trademark.addOrUPdate

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
// if (process.env.NODE_ENV === 'production') {
//   const { mockXHR } = require('../mock')
//   mockXHR()
// }

// set ElementUI lang to EN
Vue.use(ElementUI, { locale })
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App)
})
