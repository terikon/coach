import moment from 'moment';
import Vue from 'vue'
import App from './App.vue'

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')

import './aaa.js';

const app = new Vue({
  el: '#app',
  components: {
    'aaa-component': 'url:aaa.vue',
  }
});
