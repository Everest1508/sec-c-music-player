<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const showOfflineMessage = ref(false)

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine
  if (!isOnline.value) {
    showOfflineMessage.value = true
  } else {
    // Hide offline message after a delay when back online
    setTimeout(() => {
      showOfflineMessage.value = false
    }, 3000)
  }
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<template>
  <Transition name="slide-down">
    <div v-if="showOfflineMessage" class="fixed top-16 left-4 right-4 z-50">
      <div 
        class="mx-auto max-w-sm rounded-lg shadow-lg p-4 text-center"
        :class="isOnline ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'"
      >
        <div class="flex items-center justify-center space-x-2">
          <svg v-if="!isOnline" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M12 12h.01"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="text-sm font-medium">
            {{ isOnline ? 'Back online!' : 'You\'re offline' }}
          </span>
        </div>
        <p v-if="!isOnline" class="text-xs mt-1 opacity-90">
          Cached songs will still play
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
