Vue.use(window.httpVueLoader);

import './aaa.js';

const app = new Vue({
  el: '#app',
  components: {
    'aaa-component': 'url:aaa.vue',
  }
});
