import Vue from 'vue'
import App from './App.vue';
import './helper/languages';

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
