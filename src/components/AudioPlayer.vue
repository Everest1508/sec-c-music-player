<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { eventBus } from '@/eventBus.js'

// Create reactive audio object
const audio = ref(new Audio())

// Reactive properties
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

// Compute formatted title for display
const formattedTitle = computed(() => getFormattedTitle(currentSong.value.title))

// Function to fetch song URL and play
const playNewSong = async (song) => {
  if (currentSong.value.src !== song.src) {
    isLoading.value = true
    try {
      // Fetch the song source URL from API
      const res = await fetch(`https://song-scraper.riteshmahale15.workers.dev/song?slug=${song.src}`)
      const data = await res.json()

      if (data.audioSrc) {
        // Assign the new audio source
        audio.value.src = data.audioSrc
        currentSong.value = { ...song, src: data.audioSrc }

        // Ensure metadata is loaded before playing
        audio.value.onloadedmetadata = () => {
          duration.value = audio.value.duration
          audio.value.play()
          isPlaying.value = true
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
  if (audio.value.paused) {
    audio.value.play()
    isPlaying.value = true
  } else {
    audio.value.pause()
    isPlaying.value = false
  }
}

// Stop the song
const stopAudio = () => {
  audio.value.pause()
  audio.value.currentTime = 0
  isPlaying.value = false
}

// Seek audio
const seekAudio = (event) => {
  if (audio.value) {
    audio.value.currentTime = event.target.value
  }
}

// Listen for global play events
onMounted(() => {
  // Attach event listeners to update UI
  audio.value.ontimeupdate = () => {
    currentTime.value = audio.value.currentTime
  }

  audio.value.onended = () => {
    isPlaying.value = false
  }

  // Listen for play event from global eventBus
  eventBus.on('playSong', (song) => {
    playNewSong(song)
  })
})
</script>

<template>
  <div class="audio-player fixed bottom-0 left-0 w-full bg-gray-800 text-white p-4 flex items-center">
    <!-- Song Cover -->
    <img :src="currentSong.image" alt="Cover" class="w-12 h-12 rounded-lg object-cover mr-4" />

    <!-- Song Info -->
    <div class="flex-1">
      <h3 class="text-lg font-semibold truncate">
        {{ formattedTitle }}
      </h3>
      <p class="text-sm text-gray-400">
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
    <button @click="togglePlay" class="p-2 mx-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600">
      <font-awesome-icon :icon="isPlaying ? 'pause' : 'play'" size="lg" />
    </button>

    <!-- Stop Button -->
    <button @click="stopAudio" class="p-2 mx-2 bg-red-500 rounded-lg text-white hover:bg-red-600">
      <font-awesome-icon icon="stop" size="lg" />
    </button>
  </div>
</template>

<style scoped>
.audio-player {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
</style>
