/* 存储token推荐采用本地存储方案，这里存在了cookie中，了解即可 */
import Cookies from 'js-cookie' // 'js-cookie'包可以简化cookie的操作

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
