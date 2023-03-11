// stores/counter.js
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => {
    return { state: 'chalk' }
  },
  // 也可以这样定义
  actions: {
    change() {
      if (this.state === 'chalk') {
        this.state = 'vintage'
      } else {
        this.state = 'chalk'
      }
    }
  }
})
