import DefaultTheme from 'vitepress/theme'
import './style.css'
import Tip from './components/Tip.vue'
import Warn from './components/Warn.vue'

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Tip', Tip)
    app.component('Warn', Warn)
  }
}