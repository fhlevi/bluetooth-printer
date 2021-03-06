import Vue from 'vue'
import App from './App.vue';
import {replace} from './helper/languages';

Vue.config.productionTip = false

Vue.prototype.$replace = replace

new Vue({
  render: h => h(App),
}).$mount('#app')
