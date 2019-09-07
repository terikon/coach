<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <!-- <aaa></aaa> -->
    <SelfCamera></SelfCamera>
  </div>
</template>

<script>
import aaa from './components/aaa.vue'
import SelfCamera from './components/SelfCamera.vue'

export default {
  name: 'app',
  components: {
    aaa,
    SelfCamera
  }
}
</script>

<style>
#app {
}
</style>
