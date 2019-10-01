<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <aaa></aaa> -->
    <!-- <SelfCamera></SelfCamera> -->
    <StoreTest></StoreTest>
  </div>
</template>

<script>
import aaa from './components/aaa.vue'
import SelfCamera from './components/SelfCamera.vue'
import StoreTest from './components/StoreTest.vue'

export default {
  name: 'app',
  components: {
    aaa,
    SelfCamera,
    StoreTest,
  }
}
</script>

<style>
#app {
}
</style>
