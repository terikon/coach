import Vue from 'vue'
import App from './App.vue'

window.app = new Vue({
  render: function (h) { return h(App) },
}).$mount('#app');
