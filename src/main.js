import Vue from 'vue'
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTwitter, faDiscord, faDiscourse } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faTwitter, faDiscord, faDiscourse)
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.use(BootstrapVue)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
