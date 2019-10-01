<template>
<b-container fluid>
  <b-row><b-col><label>EventBus: {{numbers}}</label></b-col></b-row>
  <b-row><b-col><label>storeState: {{storeState.numbers}}</label></b-col></b-row>
  <b-row>
    <b-col sm="4">
      <b-form-input v-model="numberInput" type="number"></b-form-input>
    </b-col>
    <b-col sm="8">
      <b-button @click="addNumber(numberInput)">Add</b-button>
    </b-col>
  </b-row>
</b-container>
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
