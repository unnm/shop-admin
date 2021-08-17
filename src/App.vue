<template>
  <div id="app">
    <!-- 三个一级路由组件的切换，分别是：login、404、layout -->
    <router-view />
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>
