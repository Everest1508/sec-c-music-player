<script setup>
import { computed, ref, onMounted } from 'vue'
import { eventBus } from '@/eventBus.js'
import { usePlaylistStore } from '@/stores/playlist.js'

const props = defineProps({
  title: String,
  artist: String,
  image: String,
  src: String
})

// Emit play event to parent instead of using eventBus
const emit = defineEmits(['play'])

const playlistStore = usePlaylistStore()
const showPlaylistMenu = ref(false)
const showCreatePlaylist = ref(false)
const newPlaylistName = ref('')

const getFormattedTitle = (title) => {
  return title ? title.split('-')[0].trim() : "Unknown Title"
}

// Compute formatted title for display
const formattedTitle = computed(() => getFormattedTitle(props.title))

// Get current song object
const currentSong = computed(() => ({
  title: formattedTitle.value,
  artist: props.artist,
  image: props.image,
  src: props.src
}))

// Play song without triggering global state change
const playSong = () => {
  emit('play', currentSong.value)
}

// Add to queue
const addToQueue = () => {
  eventBus.emit('addToQueue', currentSong.value)
}

// Add to playlist
const addToPlaylist = (playlistId) => {
  const success = playlistStore.addSongToPlaylist(playlistId, currentSong.value)
  if (success) {
    // Show success feedback
    showSuccessMessage('Added to playlist!')
  } else {
    // Show already exists feedback
    showSuccessMessage('Song already in playlist')
  }
  showPlaylistMenu.value = false
}

// Success message state
const successMessage = ref('')
const showSuccessTimeout = ref(null)

const showSuccessMessage = (message) => {
  successMessage.value = message
  if (showSuccessTimeout.value) {
    clearTimeout(showSuccessTimeout.value)
  }
  showSuccessTimeout.value = setTimeout(() => {
    successMessage.value = ''
  }, 2000)
}

// Create new playlist and add song
const createPlaylistAndAdd = () => {
  if (newPlaylistName.value.trim()) {
    const playlist = playlistStore.createPlaylist(newPlaylistName.value.trim())
    playlistStore.addSongToPlaylist(playlist.id, currentSong.value)
    showSuccessMessage(`Created "${playlist.name}" and added song!`)
    newPlaylistName.value = ''
    showCreatePlaylist.value = false
    showPlaylistMenu.value = false
  }
}

// Load playlists when component mounts
onMounted(() => {
  playlistStore.loadPlaylists()
})
</script>

<template>
  <div class="relative flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md w-full overflow-hidden">
    <img :src="image" alt="Song Cover" class="w-16 h-16 rounded-lg object-cover" />

    <div class="flex-1 px-4 overflow-hidden">
      <div class="relative w-full max-w-[200px] h-6 overflow-hidden">
        <p class="text-lg font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
          {{ formattedTitle }}
        </p>
      </div>
      <p class="text-sm text-gray-400">{{ artist }}</p>
    </div>

    <div class="flex items-center space-x-2">
      <!-- More Options Menu -->
      <div class="relative">
        <button 
          @click="showPlaylistMenu = !showPlaylistMenu"
          class="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <div v-if="showPlaylistMenu" class="relative right-0 bottom-full mb-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-700 z-50">
          <div class="p-2">
            <button 
              @click="addToQueue(); showPlaylistMenu = false"
              class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Add to Queue</span>
            </button>
            
            <hr class="border-gray-700 my-2">
            
            <div class="text-xs text-gray-400 px-3 py-1">Add to Playlist</div>
            
            <div v-if="playlistStore.playlists.length === 0" class="px-3 py-2 text-sm text-gray-500">
              No playlists yet
            </div>
            
            <button 
              v-for="playlist in playlistStore.playlists" 
              :key="playlist.id"
              @click="addToPlaylist(playlist.id)"
              class="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded truncate"
            >
              {{ playlist.name }}
            </button>
            
            <button 
              @click="showCreatePlaylist = true"
              class="w-full text-left px-3 py-2 text-sm text-blue-400 hover:bg-gray-700 rounded flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span>Create New Playlist</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Play Button -->
      <button @click="playSong" class="p-3 bg-blue-500 rounded-3xl text-white hover:bg-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.95l6.518-3.76a1 1 0 000-1.764z"/>
        </svg>
      </button>
    </div>

    <!-- Create Playlist Modal -->
    <div v-if="showCreatePlaylist" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
      <div class="bg-gray-800 rounded-lg p-6 w-80 max-w-sm mx-4">
        <h3 class="text-lg font-semibold mb-4">Create New Playlist</h3>
        <input 
          v-model="newPlaylistName"
          type="text" 
          placeholder="Playlist name"
          class="w-full p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 mb-4"
          @keyup.enter="createPlaylistAndAdd"
        />
        <div class="flex space-x-3">
          <button 
            @click="showCreatePlaylist = false; showPlaylistMenu = false"
            class="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button 
            @click="createPlaylistAndAdd"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            :disabled="!newPlaylistName.trim()"
          >
            Create
          </button>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm z-[10001] animate-fade-in">
      {{ successMessage }}
    </div>

    <!-- Click outside to close menu -->
    <div v-if="showPlaylistMenu" @click="showPlaylistMenu = false" class="fixed inset-0 z-[9998]"></div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
