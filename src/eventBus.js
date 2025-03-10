import { reactive } from 'vue'

export const eventBus = reactive({
  emit(event, data) {
    if (this[event]) {
      this[event].forEach(callback => callback(data))
    }
  },
  on(event, callback) {
    if (!this[event]) {
      this[event] = []
    }
    this[event].push(callback)
  }
})
