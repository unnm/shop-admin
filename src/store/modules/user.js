import { login, logout, getInfo } from '@/api/acl/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { allAsyncRoutes, constantRoutes, anyRoute, resetRouter } from '@/router'
import router from '@/router'
import cloneDeep from 'lodash/cloneDeep'

const getDefaultState = () => {
  return {
    token: getToken(), // 用户登录成功的token
    name: '', // 获取用户信息，保存用户信息的名称
    avatar: '', // 获取用户信息，保存用户信息的头像

    // 权限相关的数据
    // 权限数据一：和按钮权限相关的权限数据
    //   1)用户拿到的按钮权限数据，是相关的按钮权限标识字符串数组，可以实现按钮权限操作
    //   2)这个数组决定了该用户能看到的路由页面信息的按钮
    buttons: [],
    // 权限数据二：和用户角色相关的权限数据
    //   1)用户拿到的角色权限数据，是相关的角色的名称，是为了后面分配权限用的
    roles: [],

    routes: [], // 最终路由。即和用户相关的所有路由配置数组，这个数组是后期用户形成的最终路由数组，里面是路由对象，不是字符串数据
    asyncRoutes: [] // 和用户相关的所有异步路由数组，这个数组里面也是路由对象，不是字符串数据
  }
}

const state = getDefaultState()

// const state = {
//   token: getToken(),
//   name: '',
//   avatar: ''
// }

// 权限数据三：用户拿到的路由权限数据，是相关的路由name字符串数组，可以实现路由权限操作
//   1)这个数组决定了这个用户能看到的路由页面，路由器当中注册了哪些路由，用户就能看到哪些菜单页面
//   2)例如数组中有Product、Attr，用户才能看到商品管理和属性管理的组件页面
//   3)代表用户信息决定了路由器当中注册了这些路由
// 用户返回的路由信息routes决定了路由器当中注册了哪些路由，进而决定用户能看到哪些路由页面

// 这个函数专门根据用户返回的routes字符串数组（该字符串对应命名路由的name值）过滤出用户真正的异步路由数组
function filterMyAsyncRoutes(allAsyncRoutes, routeNames) {
  const myAsyncRoutes = allAsyncRoutes.filter((item) => {
    // 判断一级路由
    if (routeNames.indexOf(item.name) !== -1) {
      // 判断二级路由，使用递归去操作
      if (item.children && item.children.length) {
        // 递归查找符合条件的二级路由，然后把二级路由整体改为符合条件的二级路由
        item.children = filterMyAsyncRoutes(item.children, routeNames)
      }
      return true
    }
  })
  return myAsyncRoutes
}

const mutations = {
  RESET_STATE: (state) => {
    // Object.assign 方法用于合并后面的对象的属性到前面的对象当中
    Object.assign(state, getDefaultState())
    // state
    // {
    //   token: getToken(),  //用户登录成功的token
    //   name: 'admin', //获取用户信息保存用户信息的名称
    //   avatar: 'xxx' //获取用户信息保存用户信息的头像
    // }

    // getDefaultState()
    // {
    //   token: getToken(),  //用户登录成功的token
    //   name: '', //获取用户信息保存用户信息的名称
    //   avatar: '' //获取用户信息保存用户信息的头像
    // }

    // state:{
    //   token: getToken(),  //用户登录成功的token
    //   name: '', //获取用户信息保存用户信息的名称
    //   avatar: '' //获取用户信息保存用户信息的头像
    // }

    // 退出登录后把state中的token和用户信息清空，上面一行代码相当于如下操作
    // state.token = ''
    // state.name = ''
    // state.avatar = ''
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // SET_NAME: (state, name) => {
  //   state.name = name
  // },
  // SET_AVATAR: (state, avatar) => {
  //   state.avatar = avatar
  // },
  SET_USERINFO(state, userInfo) {
    state.name = userInfo.name
    state.avatar = userInfo.avatar
    state.buttons = userInfo.buttons
    state.roles = userInfo.roles
  },
  SET_ROUTES(state, myAsyncRoutes) {
    state.asyncRoutes = myAsyncRoutes // 把过滤出来的和自己相关的异步路由保存起来
    // 最终路由 = 异步路由 + 常量路由 + 任意路由
    // 使用常量路由拼接自己的异步路由和任意路由，形成自己最终的所有路由数组
    state.routes = constantRoutes.concat(myAsyncRoutes, anyRoute)
    // 目前路由器中只配置了常量路由，我们需要将路由器当中配的路由，动态的改变成用户最终的路由
    // 动态往路由器注册添加新的路由
    // 目前的路由配置当中已经有了常量路由，我们需要动态添加用户自己的异步路由和任意路由
    router.addRoutes([...myAsyncRoutes, anyRoute]) // 动态的把用户的异步路由和任意路由添加到路由器当中
  }
}

const actions = {
  // user login
  // 我们的前台项目用的是async、await语法，它没有用，而直接用的.then和.catch
  // login({ commit }, userInfo) {
  //   const { username, password } = userInfo
  //   return new Promise((resolve, reject) => {
  //     login({ username: username.trim(), password: password })
  //       .then((response) => {
  //         const { data } = response
  //         commit('SET_TOKEN', data.token)
  //         setToken(data.token) // 我们前台项目中是把获取到的token保存在localStorage，而这里是保存在cookies当中
  //         resolve()
  //       })
  //       .catch((error) => {
  //         reject(error)
  //       })
  //   })
  // },

  // 将上面的login的Promise写法改成异步函数写法 【墙裂推荐】
  async login({ commit }, userInfo) {
    const result = await login(userInfo)
    if (result.code === 20000) {
      commit('SET_TOKEN', result.data.token)
      setToken(result.data.token)
      return 'ok'
    } else {
      return Promise.reject(new Error('failed'))
    }
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then((response) => {
          const { data } = response
          if (!data) {
            return reject('Verification failed, please Login again.')
          }
          // const { name, avatar } = data
          // commit('SET_NAME', name)
          // commit('SET_AVATAR', avatar)
          commit('SET_USERINFO', data)

          // 还要去根据用户信息返回来的routes（和路由name相关的字符串数组），从所有的异步路由数组当中过滤出用户自己的所有异步路由数组
          // data.routes  它是字符串数组，其中的字符串都是路由的name值组成的，例如：['Trademark', 'Attr']

          // cloneDeep(allAsyncRoutes) 我们最终要改为这样
          // 因为过滤的时候如果是在数据本身上去过滤，那么过滤完成后，数据的二级路由就改变了
          // 数据本身之前的二级路由会被过滤后的二级路由覆盖，想找到就不行了
          // 体现在：先登录其它只有某个二级路由的用户，然后退出去登录admin，那么admin也只有那一个二级路由
          commit(
            'SET_ROUTES',
            filterMyAsyncRoutes(cloneDeep(allAsyncRoutes), data.routes)
          )
          resolve(data)
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          removeToken() // must remove token first 清除cookies中保存的token
          resetRouter() // 退出之后重置路由器
          commit('RESET_STATE') // 清空state
          resolve()
        })
        .catch((error) => {
          reject(error)
        })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  // 命名空间：可以让所有的模块在写mutation、action 及 getters的时候可以重名，即避免发生冲突
  // 如果没有命名空间
  // user模块当中写了一个action  叫getInfo
  // app模块当中也写了一个action 也叫getInfo
  // 这两个getInfo最终都会合并到总的store的actions当中，那么必须发生冲突，就会覆盖

  // 如果有了命名空间
  // user模块当中写了一个action  叫getInfo 但是用的时候必须写成 user/getInfo
  // app模块当中也写了一个action 也叫getInfo 用的时候必须写成 app/getInFo
  // 这两个action在总的actions当中就不会有冲突了
  // 在vue当中 要dispatch就得写为  this.$store.dispatch('user/getInfo')
  state,
  mutations,
  actions
}
