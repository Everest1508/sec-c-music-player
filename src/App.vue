<script setup>
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/searchResults.js'
import { useMusicPlayerStore } from '@/stores/musicPlayer.js'
import { usePlaylistStore } from '@/stores/playlist.js'
import SearchBar from '@/components/SearchBar.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import PWAInstallPrompt from '@/components/PWAInstallPrompt.vue'
import OfflineIndicator from '@/components/OfflineIndicator.vue'
import { ref, onMounted } from 'vue'
import { eventBus } from '@/eventBus.js'

const router = useRouter()
const searchStore = useSearchStore()
const playerStore = useMusicPlayerStore()
const playlistStore = usePlaylistStore()
const audioPlayer = ref(null)

// Handle search results and navigate
const updateResults = (results) => {
  searchStore.setResults(results);
  router.push('/search');
}

// Trigger playback in the global player
const playSong = (song) => {
  if (audioPlayer.value && audioPlayer.value.playNewSong) {
    audioPlayer.value.playNewSong(song);
  } else {
    console.error("AudioPlayer component not properly referenced");
  }
}

// Handle playlist playback
const playPlaylist = (songs) => {
  if (songs.length > 0 && audioPlayer.value) {
    // Clear current queue
    playerStore.clearQueue()
    
    // Add all songs to queue
    songs.forEach(song => playerStore.addToQueue(song))
    
    // Play first song
    audioPlayer.value.playNewSong(songs[0], false)
  }
}

onMounted(() => {
  // Initialize stores
  playerStore.loadCacheFromStorage()
  playlistStore.loadPlaylists()
  
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  }
  
  // Listen for playlist play events
  eventBus.on('playPlaylist', playPlaylist)
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-900 text-white">
    <div class="sticky top-0 left-0 bg-gray-900 pt-2 nav-bar">
      <div class="container mx-auto px-4">
        <!-- Navigation -->
        <nav class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-6">
            <RouterLink to="/" class="text-xl font-bold text-blue-400">SecC</RouterLink>
            <div class="flex space-x-6">
              <RouterLink 
                to="/" 
                class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                :class="{ 'text-white font-semibold': $route.path === '/' }"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </RouterLink>
              <RouterLink 
                to="/playlists" 
                class="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                :class="{ 'text-white font-semibold': $route.path === '/playlists' }"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                </svg>
              </RouterLink>
            </div>
          </div>
        </nav>
        
        <SearchBar @update-results="updateResults" />
      </div>
    </div>

    <main class="font-stretch-extra-condensed flex-1 container mx-auto p-4 content-body pb-24">
      <RouterView />
    </main>

    <!-- Offline Indicator -->
    <OfflineIndicator />

    <!-- PWA Install Prompt -->
    <PWAInstallPrompt />

    <!-- Attach ref to access methods -->
    <AudioPlayer ref="audioPlayer" class="audio-player" />
  </div>
</template>

<style scoped>
  .nav-bar {
    z-index: 50;
  }
  .content-body {
    z-index: 10;
  }

  .audio-player {
    z-index: 100;
  }
</style>
