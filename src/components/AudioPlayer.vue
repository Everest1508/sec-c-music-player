<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { eventBus } from '@/eventBus.js'

// Reactive audio object
const audio = ref(new Audio())

// Reactive states
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const isLoading = ref(false)

// Track the current song
const currentSong = ref({
  title: '',
  artist: '',
  image: '',
  src: ''
})

// Function to format the title
const getFormattedTitle = (title) => {
  return title ? title.split('-')[0].trim() : "Unknown Title"
}

// Computed formatted title
const formattedTitle = computed(() => getFormattedTitle(currentSong.value.title))

// References for text elements
const titleRef = ref(null)
const artistRef = ref(null)
const isTitleOverflowing = ref(false)
const isArtistOverflowing = ref(false)

// Function to check if text overflows
const checkOverflow = () => {
  if (titleRef.value) {
    isTitleOverflowing.value = titleRef.value.scrollWidth > titleRef.value.clientWidth
  }
  if (artistRef.value) {
    isArtistOverflowing.value = artistRef.value.scrollWidth > artistRef.value.clientWidth
  }
}

// Function to fetch and play a new song
const playNewSong = async (song) => {
  if (currentSong.value.src !== song.src) {
    isLoading.value = true
    try {
      const res = await fetch(`https://song-scraper.riteshmahale15.workers.dev/song?slug=${song.src}`)
      const data = await res.json()

      if (data.audioSrc) {
        // Assign new audio source
        audio.value.src = data.audioSrc
        currentSong.value = { ...song, src: data.audioSrc }

        // Ensure metadata is loaded before playing
        audio.value.onloadedmetadata = () => {
          duration.value = audio.value.duration
          audio.value.play()
          isPlaying.value = true
          checkOverflow() // Recalculate overflow
          updateMediaSession() // 🔥 Update Media Metadata
        }
      } else {
        console.error("Invalid song source received")
      }
    } catch (error) {
      console.error("Error fetching song source:", error)
    } finally {
      isLoading.value = false
    }
  }
}

// Toggle play/pause
const togglePlay = () => {
  if (!audio.value) return

  if (audio.value.paused) {
    audio.value.play()
  } else {
    audio.value.pause()
  }

  isPlaying.value = !audio.value.paused
}

// Stop the song
const stopAudio = () => {
  if (!audio.value) return

  audio.value.pause()
  audio.value.currentTime = 0
  isPlaying.value = false
}

// Seek audio position
const seekAudio = (event) => {
  if (!audio.value) return

  audio.value.currentTime = event.target.value
  currentTime.value = audio.value.currentTime
}

// 🔥 Media Session API - Updates song metadata in notification & lock screen
const updateMediaSession = () => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.value.title,
      artist: currentSong.value.artist || "Unknown Artist",
      album: "Now Playing",
      artwork: [
        { src: currentSong.value.image, sizes: "512x512", type: "image/png" }
      ]
    })
  }
}

// Event listeners for audio updates
onMounted(() => {
  audio.value.ontimeupdate = () => {
    currentTime.value = audio.value.currentTime
  }

  audio.value.onended = () => {
    isPlaying.value = false
  }

  audio.value.onpause = () => {
    isPlaying.value = false
  }

  audio.value.onplay = () => {
    isPlaying.value = true
    updateMediaSession() // 🔥 Ensure metadata updates on play
  }

  // Listen for play event from eventBus
  eventBus.on('playSong', (song) => {
    playNewSong(song)
  })

  // Check overflow when mounted
  checkOverflow()
  window.addEventListener('resize', checkOverflow)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkOverflow)
})
</script>

<template>
  <div class="audio-player fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 flex items-center">
    <!-- Song Cover -->
    <img :src="currentSong.image" alt="Cover" class="w-12 h-12 rounded-lg object-cover mr-4" />

    <!-- Song Info -->
    <div class="flex-1 overflow-hidden">
      <h3
        class="text-lg font-semibold"
        :class="{ 'marquee': isTitleOverflowing }"
        ref="titleRef"
      >
        {{ formattedTitle }}
      </h3>
      <p
        class="text-sm text-gray-400"
        :class="{ 'marquee': isArtistOverflowing }"
        ref="artistRef"
      >
        {{ currentSong.artist || "Unknown Artist" }}
      </p>

      <!-- Progress Bar -->
      <input
        type="range"
        min="0"
        :max="duration"
        :value="currentTime"
        @input="seekAudio"
        class="w-full mt-2"
      />
    </div>

    <!-- Play/Pause Button -->
    <button @click="togglePlay" class="p-2 mx-2 bg-blue-500 rounded-full text-white hover:bg-blue-600">
      <!-- Play Icon -->
      <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.95l6.518-3.76a1 1 0 000-1.764z"/>
      </svg>

      <!-- Pause Icon (⏸️ Two Vertical Bars) -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 5H6v14h4V5zm8 0h-4v14h4V5z"/>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.audio-player {
  position: fixed;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

/* Marquee Effect */
@keyframes marquee {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

.marquee {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}

.marquee span {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 5s linear infinite;
}
</style>
