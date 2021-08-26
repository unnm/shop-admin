import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

// 路由的权限数据routes是需要控制路由当中配了哪些，路由配了哪些，哪些菜单就可以看到（因为菜单是根据路由动态生成的）
// 但是我们当前的路由，是写死的，导致任意用户登录，路由都是所有的，所以所有的菜单都可以看到
// 如果想要实现路由权限控制功能，那么我们的路由必须改变

// 用户请求返回的路由信息数据routes决定了路由器当中注册的哪些路由，进而决定用户能看到哪些菜单页面
// 如果要根据用户的权限数据来决定路由当中注册哪些路由，那么原先配置的路由就要改变
// 路由数组的组成，具体分为三种：常量路由、异步路由、任意路由
// 1.常量路由  任意用户都能操作的路由，即所有用户都能看到这个路由组件
// 2.异步路由  即权限路由，只有用户拥有这个路由对应的name信息，这个路由组件才能被用户操作，路由页面才能被用户看到
// 3.任意路由  随意的不合法的路由，全部转向404组件页面，配置路由映射的时候，必须最后一个注册
// 注意：路由器里面，不能所有的路由都直接使用常量路由注册，否则所有用户都可以操作任何的菜单，没法实现路由权限操作

// 根据用户路由权限数据决定最后路由器里面注册的都是哪些路由
// 1.修改路由当中注册的路由为三种不同的路由：常量路由、异步路由、任意路由
// 2.创建路由器的时候只能注册常量路由
// 3.获取用户信息的时候，真正的根据用户权限数据信息决定路由当中有哪些异步路由
//    存储用户权限信息相关
//      1)存储用户的角色信息
//      2)存储用户的按钮权限信息
//      3)存储用户的异步路由数组，不是路由名称
//      4)存储用户最终的所有路由数组，不是路由名称
// 4.设置用户路由的时候可以使用动态添加路由，把异步路由和任意路由添加到路由器的路由当中
//    router.addRoutes([...routes, anyRoutes])
// 5.在生成菜单的时候，要根据我们最终的所有路由数组动态生成
//    把layout当中的sidebar组件内部用到的routes改成我们自己存储的routes

// #总结：路由（菜单）权限的控制#
//    实现路由权限控制功能，需要用到 全局路由导航守卫 和 动态添加路由
//      1）全局路由导航守卫当中获取用户的菜单权限数据信息
//      2）根据用户的菜单权限数据信息，从所有的异步路由当中过滤出当前用户自己的异步路由
//      3）调用router路由器提供的方法，将用户的异步路由和任意路由，动态添加到路由器当中
//      4）根据当前用户的所有路由动态生成侧边导航菜单

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
// 常量路由
// 不需要权限数据，就可以使用的路由，对应的菜单就可以操作，即任何用户都能操作
export const constantRoutes = [
  // 登录页
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  // 404
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  // 首页
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard', // 后面我们配的所有路由，都要加上name，并且name值以大写字母开头（命名路由）
        component: () => import('@/views/dashboard/index'),
        meta: { title: '首页', icon: 'dashboard' }
      }
    ]
  }

  // 404 page must be placed at the end !!!
  // { path: '*', redirect: '/404', hidden: true }
]

// 异步路由（动态路由）
// 存储的是所有需要权限数据来控制的路由，后期需要从这个里面根据用户权限数据过滤出用户需要的路由进行动态配置
export const allAsyncRoutes = [
  // 权限数据管理相关的路由
  {
    name: 'Acl',
    path: '/acl',
    component: Layout,
    redirect: '/acl/user/list',
    meta: {
      title: '权限管理',
      icon: 'el-icon-lock'
    },
    children: [
      {
        name: 'User',
        path: 'user/list',
        component: () => import('@/views/acl/user/list'),
        meta: {
          title: '用户管理'
        }
      },
      {
        name: 'Role',
        path: 'role/list',
        component: () => import('@/views/acl/role/list'),
        meta: {
          title: '角色管理'
        }
      },
      {
        name: 'RoleAuth',
        path: 'role/auth/:id',
        component: () => import('@/views/acl/role/roleAuth'),
        meta: {
          activeMenu: '/acl/role/list',
          title: '角色授权'
        },
        hidden: true
      },
      {
        name: 'Permission',
        path: 'permission/list',
        component: () => import('@/views/acl/permission/list'),
        meta: {
          title: '菜单管理'
        }
      }
    ]
  },
  // 商品管理相关的路由
  {
    path: '/product', // 一级路由组件只有两个要么是登录login组件  要么就是layout组件
    component: Layout, // 显示一级路由组件架子，并且立马重定向二级路由组件
    name: 'Product', // name必须写，而且必须写的是路径的首字母大写。因为后面权限要用
    redirect: '/product/trademark/list',
    meta: { title: '商品管理', icon: 'el-icon-s-shop' },
    children: [
      {
        path: 'trademark/list',
        component: () => import('@/views/product/trademark/List'),
        name: 'Trademark',
        meta: { title: '品牌管理' }
      },
      {
        path: 'attr/list',
        component: () => import('@/views/product/attr/List'),
        name: 'Attr',
        meta: { title: '平台属性管理' }
      },
      {
        path: 'spu/list',
        component: () => import('@/views/product/spu/List'),
        name: 'Spu',
        meta: { title: 'SPU管理' }
      },
      {
        path: 'sku/list',
        component: () => import('@/views/product/sku/List'),
        name: 'Sku',
        meta: { title: 'SKU管理' }
      },
      {
        path: 'category/list',
        component: () => import('@/views/product/category/List'),
        name: 'Category',
        meta: { title: '分类管理' }
      },
      {
        path: 'scoped/list',
        component: () => import('@/views/product/scoped/List'),
        name: 'Scoped',
        meta: { title: 'scoped测试' }
      }
    ]
  },
  // 自己添加的一个测试菜单路由
  {
    path: '/test', // 一级路由组件只有两个要么是登录login组件  要么就是layout组件
    component: Layout, // 显示一级路由组件架子，并且立马重定向二级路由组件
    name: 'Test', // name必须写，而且必须写的是路径的首字母大写。因为后面权限要用
    redirect: '/test/test111/list',
    meta: { title: '测试管理', icon: 'el-icon-s-tools' },
    children: [
      {
        path: 'test111/list',
        component: () => import('@/views/test/test111/List'),
        name: 'Test111',
        meta: { title: '测试1' }
      },
      {
        path: 'test222/list',
        component: () => import('@/views/test/test222/List'),
        name: 'Test222',
        meta: { title: '测试2' }
      }
    ]
  }
]

// 任意路由
// 当用户随意的输入一个路径（非法路径），应该显示404页面
// 注意：任意路由必须要注册在最后面
export const anyRoute = { path: '*', redirect: '/404', hidden: true }

const createRouter = () =>
  new Router({
    mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    // 一开始没做权限功能的时候，routes配置项中只有常量路由
    // 后面要做权限操作，就需要动态的往这个路由配置数组当中添加用户自己的异步路由和任意路由
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
