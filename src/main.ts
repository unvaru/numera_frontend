import './assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

// Material Symbols
import '@fontsource/material-symbols-outlined'

// Axios
import axios from 'axios'
import VueAxios from 'vue-axios'

// Vue Click Outside
import vClickOutside from 'v-click-outside'

// Configure Vuetify
const vuetify = createVuetify({
  components,
  directives,
})

// Configure Font Awesome
library.add(fas)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(VueAxios, axios)
app.use(vClickOutside)

// Register Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
