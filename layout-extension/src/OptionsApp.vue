<template>
  <div id="app">
    <Options></Options>
  </div>
</template>

<script>
import moment from 'moment'
import Options from './components/Options.vue'
import HangoutsCaller from './components/HangoutsCaller.vue'

export default {
  name: 'app',
  components: {
    Options,
    HangoutsCaller,
  }
}

</script>

<style>
</style>
