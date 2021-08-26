import store from '@/store'

// 这个函数是用来检测用户是否有某种按钮级别的权限
export function hasBtnPermission(btnName) {
  let buttons = store.getters.buttons // 获取到用户返回的所有按钮级别权限数据的字符串数组
  return buttons.indexOf(btnName) !== -1
}

// 按钮级别权限的添加 和 按钮权限的校验操作
// 1）为用户分配角色和权限（按钮级别权限是从属于菜单级别权限的）
// 2）定义一个对按钮进行权限校验的工具函数
// 3）在组件当中进行按钮权限的校验
