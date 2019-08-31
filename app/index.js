import './aaa.js';
//import './aaa.vue';

const app = new Vue({
  el: '#app',
  components: {
    'aaa-component': window.httpVueLoader('aaa.vue'),
  }
});
