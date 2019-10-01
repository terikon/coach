<template>
  <div>
    <p>{{ greeting }} World!</p>
    <p>{{ storeState.numbers }}</p>
    <input v-model="numberInput" type="number"/>
    <button @click="addNumber(numberInput)">Add</button>
  </div>
</template>

<script>
import {EventBus} from '../common/event-bus.js';
import {store} from '../common/store.js';

export default {
  data() {
    return {
      greeting: 'Hello',
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
      this.greeting += number;
    });
  }
}
</script>

<style scoped>
p {
  font-size: 2em;
  text-align: center;
}
</style>
