<template>
<b-container fluid>
  <b-button>Button</b-button>
</b-container>
</template>
<script>
import {store} from '../common/store'
export default {
  data() {
    return {
      storeState: store.state,
    };
  }
}
</script>
<style scoped>

</style>
