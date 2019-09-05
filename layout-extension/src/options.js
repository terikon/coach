import Vue from 'vue'
import options from './options.vue'

const app = new Vue({
  render: function (h) { return h(options) },
}).$mount('#app')

/** @type HTMLLabelElement */ const switchMode = document.getElementById('switchMode');
/** @type HTMLInputElement */ const labelMode = document.getElementById('labelMode');

chrome.storage.sync.get('mode', data => {
  const mode = data.mode || 'student';
  labelMode.innerHTML = mode;
  switchMode.checked = mode === 'teacher';
});

switchMode.addEventListener('change', function () {
  const mode = this.checked ? 'teacher' : 'student';
  chrome.storage.sync.set({ mode: mode }, () => {
    labelMode.innerHTML = mode;
  });
});
