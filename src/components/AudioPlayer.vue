<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { eventBus } from '@/eventBus.js'
import { useMusicPlayerStore } from '@/stores/musicPlayer.js'
import { musicService } from '@/services/musicService.js'

// Store
const playerStore = useMusicPlayerStore()

// Reactive audio object
const audio = ref(new Audio())

// UI State
const isExpanded = ref(false)
const showQueue = ref(false)

// Function to format the title
const getFormattedTitle = (title) => {
  return title ? title.split('-')[0].trim() : "Unknown Title"
}

// Computed formatted title
const formattedTitle = computed(() => 
  playerStore.currentSong ? getFormattedTitle(playerStore.currentSong.title) : "No Song"
)

// Toggle expanded view
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
  if (!isExpanded.value) {
    showQueue.value = false
  }
}

// Function to fetch and play a new song
const playNewSong = async (song, addToQueue = true) => {
  if (!song) return
  
  try {
    playerStore.setLoading(true)
    
    // Add to queue if not already playing from queue
    if (addToQueue) {
      playerStore.addToQueue(song)
      playerStore.playFromQueue(playerStore.queue.length - 1)
    }
    
    // Fetch song data using service
    const data = await musicService.fetchSongData(song.src)
    
    if (data.audioSrc) {
      // Update store
      const fullSong = { ...song, audioSrc: data.audioSrc }
      playerStore.setCurrentSong(fullSong)
      
      // Set audio source
      audio.value.src = data.audioSrc
      
      // Ensure metadata is loaded before playing
      audio.value.onloadedmetadata = () => {
        playerStore.setDuration(audio.value.duration)
        audio.value.play()
        updateMediaSession()
      }
    } else {
      console.error("Invalid song source received")
    }
  } catch (error) {
    console.error("Error fetching song source:", error)
  } finally {
    playerStore.setLoading(false)
  }
}

// Toggle play/pause
const togglePlay = () => {
  if (!audio.value || !playerStore.currentSong) return

  if (audio.value.paused) {
    audio.value.play()
  } else {
    audio.value.pause()
  }
}

// Play next song
const playNext = () => {
  const nextSong = playerStore.playNext()
  if (nextSong) {
    playNewSong(nextSong, false)
  }
}

// Play previous song
const playPrevious = () => {
  const prevSong = playerStore.playPrevious()
  if (prevSong) {
    playNewSong(prevSong, false)
  }
}

// Seeking state
const isSeeking = ref(false)
const seekValue = ref(0)

// Handle seek start (when user starts dragging)
const handleSeekStart = () => {
  isSeeking.value = true
}

// Handle seek input (while dragging)
const handleSeekInput = (event) => {
  if (!audio.value) return
  seekValue.value = parseFloat(event.target.value)
  // Update store with the seek value while dragging
  playerStore.setCurrentTime(seekValue.value)
}

// Handle seek end (when user releases)
const handleSeekEnd = (event) => {
  if (!audio.value) return
  const newTime = parseFloat(event.target.value)
  audio.value.currentTime = newTime
  playerStore.setCurrentTime(newTime)
  isSeeking.value = false
}

// Toggle repeat mode
const toggleRepeat = () => {
  const modes = ['none', 'one', 'all']
  const currentIndex = modes.indexOf(playerStore.repeatMode)
  const nextMode = modes[(currentIndex + 1) % modes.length]
  playerStore.setRepeatMode(nextMode)
}

// Toggle shuffle
const toggleShuffle = () => {
  playerStore.toggleShuffle()
}

// Remove song from queue
const removeFromQueue = (index) => {
  playerStore.removeFromQueue(index)
}

// Play song from queue
const playFromQueue = (index) => {
  const song = playerStore.playFromQueue(index)
  if (song) {
    playNewSong(song, false)
  }
}

// Media Session API
const updateMediaSession = () => {
  if ('mediaSession' in navigator && playerStore.currentSong) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: playerStore.currentSong.title,
      artist: playerStore.currentSong.artist || "Unknown Artist",
      album: "Now Playing",
      artwork: [
        { src: playerStore.currentSong.image, sizes: "512x512", type: "image/png" }
      ]
    })
    
    navigator.mediaSession.setPositionState({
      duration: audio.value.duration || 0,
      playbackRate: audio.value.playbackRate,
      position: audio.value.currentTime
    })
    
    // Set action handlers
    navigator.mediaSession.setActionHandler('play', () => togglePlay())
    navigator.mediaSession.setActionHandler('pause', () => togglePlay())
    navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious())
    navigator.mediaSession.setActionHandler('nexttrack', () => playNext())
  }
}

// Format time
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Event listeners for audio updates
onMounted(() => {
  // Load cache from storage
  playerStore.loadCacheFromStorage()
  
  audio.value.ontimeupdate = () => {
    // Only update time if not currently seeking
    if (!isSeeking.value) {
      playerStore.setCurrentTime(audio.value.currentTime)
    }
  }

  audio.value.onended = () => {
    playerStore.setPlayingState(false)
    
    // Handle repeat and next song logic
    if (playerStore.repeatMode === 'one') {
      audio.value.currentTime = 0
      audio.value.play()
    } else {
      playNext()
    }
  }

  audio.value.onpause = () => {
    playerStore.setPlayingState(false)
  }

  audio.value.onplay = () => {
    playerStore.setPlayingState(true)
    updateMediaSession()
  }

  // Listen for play event from eventBus
  eventBus.on('playSong', (song) => {
    playNewSong(song)
  })

  eventBus.on('addToQueue', (song) => {
    playerStore.addToQueue(song)
  })

})

onUnmounted(() => {
  // Cleanup if needed
})

// Expose methods for parent components
defineExpose({
  playNewSong
})
</script>

<template>
  <div v-if="playerStore.currentSong" class="audio-player-container">
    <!-- Expanded Player Modal -->
    <div v-if="isExpanded" class="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-700">
        <button @click="toggleExpanded" class="text-gray-400 hover:text-white">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7-7m0 0l-7 7m7-7v18"/>
          </svg>
        </button>
        <h2 class="text-lg font-semibold">Now Playing</h2>
        <button 
          @click="showQueue = !showQueue" 
          class="text-gray-400 hover:text-white relative"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
          <span v-if="playerStore.queue.length > 0" class="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            {{ playerStore.queue.length }}
          </span>
        </button>
      </div>

      <!-- Queue Panel (when expanded) -->
      <div v-if="showQueue" class="flex-1 bg-gray-900 overflow-y-auto">
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-4">Queue ({{ playerStore.queue.length }})</h3>
          
          <div v-if="playerStore.queue.length === 0" class="text-gray-400 text-center py-8">
            No songs in queue
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="(song, index) in playerStore.queue" 
              :key="index"
              class="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
              :class="{ 'bg-gray-800 border border-blue-500': index === playerStore.currentIndex }"
            >
              <img :src="song.image" alt="Cover" class="w-12 h-12 rounded object-cover mr-3" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ getFormattedTitle(song.title) }}</p>
                <p class="text-xs text-gray-400 truncate">{{ song.artist }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <button 
                  @click="playFromQueue(index)"
                  class="p-2 text-gray-400 hover:text-white rounded-full"
                  :class="{ 'text-blue-400': index === playerStore.currentIndex }"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.95l6.518-3.76a1 1 0 000-1.764z"/>
                  </svg>
                </button>
                <button 
                  @click="removeFromQueue(index)"
                  class="p-2 text-gray-400 hover:text-red-400 rounded-full"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Expanded Player Content -->
      <div v-else class="flex-1 flex flex-col items-center justify-center p-8">
        <!-- Large Album Art -->
        <img 
          :src="playerStore.currentSong?.image || '/icons/web-app-manifest-192x192.png'" 
          alt="Cover" 
          class="w-80 h-80 max-w-full max-h-80 rounded-2xl object-cover shadow-2xl mb-8" 
        />

        <!-- Song Info -->
        <div class="text-center mb-8 max-w-md">
          <h1 class="text-2xl font-bold text-white mb-2">{{ formattedTitle }}</h1>
          <p class="text-lg text-gray-400">{{ playerStore.currentSong?.artist || "Unknown Artist" }}</p>
        </div>

        <!-- Progress Bar -->
        <div class="w-full max-w-md mb-8">
          <div class="flex items-center space-x-3 text-sm text-gray-400 mb-2">
            <span>{{ formatTime(playerStore.currentTime) }}</span>
            <input
              type="range"
              min="0"
              :max="playerStore.duration"
              :value="playerStore.currentTime"
              @mousedown="handleSeekStart"
              @touchstart="handleSeekStart"
              @input="handleSeekInput"
              @mouseup="handleSeekEnd"
              @touchend="handleSeekEnd"
              @change="handleSeekEnd"
              class="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <span>{{ formatTime(playerStore.duration) }}</span>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="flex items-center space-x-6">
          <!-- Shuffle -->
          <button 
            @click="toggleShuffle" 
            class="p-3 rounded-full transition-colors"
            :class="playerStore.isShuffled ? 'text-blue-400 bg-blue-400/20' : 'text-gray-400 hover:text-white'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h5l2 5h6l2-5h1a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/>
            </svg>
          </button>

          <!-- Previous -->
          <button 
            @click="playPrevious" 
            class="p-3 text-gray-400 hover:text-white transition-colors"
            :disabled="!playerStore.hasPrevious"
            :class="{ 'opacity-50': !playerStore.hasPrevious }"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Play/Pause -->
          <button 
            @click="togglePlay" 
            class="p-4 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
            :disabled="playerStore.isLoading"
          >
            <div v-if="playerStore.isLoading" class="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <svg v-else-if="!playerStore.isPlaying" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.95l6.518-3.76a1 1 0 000-1.764z"/>
            </svg>
            <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/>
            </svg>
          </button>

          <!-- Next -->
          <button 
            @click="playNext" 
            class="p-3 text-gray-400 hover:text-white transition-colors"
            :disabled="!playerStore.hasNext && playerStore.repeatMode !== 'all'"
            :class="{ 'opacity-50': !playerStore.hasNext && playerStore.repeatMode !== 'all' }"
          >
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          <!-- Repeat -->
          <button 
            @click="toggleRepeat" 
            class="p-3 rounded-full transition-colors relative"
            :class="playerStore.repeatMode !== 'none' ? 'text-blue-400 bg-blue-400/20' : 'text-gray-400 hover:text-white'"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span v-if="playerStore.repeatMode === 'one'" class="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">1</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Minimalist Bottom Player -->
    <div class="audio-player fixed bottom-0 left-0 w-full bg-gray-800 text-white border-t border-gray-700">
      <!-- Thin Progress Bar -->
      <div class="h-1 bg-gray-600 relative">
        <div 
          class="h-full bg-blue-500 transition-all duration-300"
          :style="{ width: playerStore.duration ? (playerStore.currentTime / playerStore.duration) * 100 + '%' : '0%' }"
        ></div>
      </div>

      <!-- Compact Player Controls -->
      <div class="flex items-center p-3 cursor-pointer" @click="toggleExpanded">
        <!-- Song Cover -->
        <img 
          :src="playerStore.currentSong?.image || '/icons/web-app-manifest-192x192.png'" 
          alt="Cover" 
          class="w-12 h-12 rounded-lg object-cover mr-3 flex-shrink-0" 
        />

        <!-- Song Info -->
        <div class="flex-1 min-w-0 mr-3">
          <h3 class="text-sm font-semibold truncate text-white">
            {{ formattedTitle }}
          </h3>
          <p class="text-xs text-gray-400 truncate">
            {{ playerStore.currentSong?.artist || "Unknown Artist" }}
          </p>
        </div>

        <!-- Play/Pause Button -->
        <button 
          @click.stop="togglePlay" 
          class="p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors flex-shrink-0"
          :disabled="playerStore.isLoading"
        >
          <div v-if="playerStore.isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <svg v-else-if="!playerStore.isPlaying" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.95l6.518-3.76a1 1 0 000-1.764z"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.audio-player-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.queue-panel {
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
}

.slider {
  background: linear-gradient(to right, #3b82f6 0%, #3b82f6 var(--progress, 0%), #4b5563 var(--progress, 0%), #4b5563 100%);
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Smooth transitions */
.audio-player button {
  transition: all 0.2s ease;
}

.audio-player button:hover {
  transform: scale(1.05);
}

.audio-player button:active {
  transform: scale(0.95);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Queue item hover effects */
.queue-panel .hover\:bg-gray-800:hover {
  background-color: rgba(31, 41, 55, 0.8);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .audio-player {
    padding: 12px 16px;
  }
  
  .audio-player .flex.items-center.space-x-2 {
    gap: 8px;
  }
  
  .queue-panel {
    max-height: 60vh;
  }
}
</style>
