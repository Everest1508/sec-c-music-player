<script setup>
import { ref, onMounted } from 'vue'

const showInstallPrompt = ref(false)
const deferredPrompt = ref(null)

const handleInstallClick = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    console.log(`User response to the install prompt: ${outcome}`)
    deferredPrompt.value = null
    showInstallPrompt.value = false
  }
}

const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
}

onMounted(() => {
  // Check if user has already dismissed the prompt
  const dismissed = localStorage.getItem('pwa-install-dismissed')
  if (dismissed) return

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    showInstallPrompt.value = true
  })

  // Check if app is already installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    showInstallPrompt.value = false
  })
})
</script>

<template>
  <div v-if="showInstallPrompt" class="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
    <div class="flex items-start space-x-3">
      <div class="flex-shrink-0">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
      </div>
      <div class="flex-1">
        <h3 class="text-sm font-semibold">Install SecC Music</h3>
        <p class="text-xs text-blue-100 mt-1">Add to your home screen for a better experience!</p>
        <div class="flex space-x-2 mt-3">
          <button 
            @click="handleInstallClick"
            class="px-3 py-1 bg-white text-blue-600 text-xs font-medium rounded hover:bg-blue-50"
          >
            Install
          </button>
          <button 
            @click="dismissPrompt"
            class="px-3 py-1 text-blue-100 text-xs hover:text-white"
          >
            Not now
          </button>
        </div>
      </div>
      <button @click="dismissPrompt" class="flex-shrink-0 text-blue-200 hover:text-white">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
</template>