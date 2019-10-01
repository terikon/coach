<template>
<div>
  <p>EventBus: {{numbers}}</p>
  <p>storeState: {{storeState.numbers}}</p>
  <input v-model="numberInput" type="number">
  <button @click="addNumber(numberInput)">Add</button>
</div>
</template>
<script>
import {EventBus} from '../common/event-bus.js';
import {store} from '../common/store.js';
export default {
  data() {
    return {
      numbers: [1,2,3],
      numberInput: 0,
      storeState: store.state,
    }
  },
  methods: {
    addNumber(number) {
      EventBus.$emit('numberAdded', Number(number));
      store.addNumber(Number(number));
    }
  },
  created() {
    EventBus.$on('numberAdded', number => {
      this.numbers.push(number);
    });
  }
}
</script>
<style>

</style>
