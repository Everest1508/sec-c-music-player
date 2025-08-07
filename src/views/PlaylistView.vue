<script setup>
import { onMounted } from 'vue'
import { usePlaylistStore } from '@/stores/playlist.js'
import { eventBus } from '@/eventBus.js'
import MusicBox from '@/components/MusicBox.vue'

const playlistStore = usePlaylistStore()

onMounted(() => {
  playlistStore.loadPlaylists()
})

// Function to handle play event from MusicBox
const playNewSong = (song) => {
  eventBus.emit('playSong', song)
}

// Delete playlist
const deletePlaylist = (playlistId) => {
  if (confirm('Are you sure you want to delete this playlist?')) {
    playlistStore.deletePlaylist(playlistId)
  }
}

// Remove song from playlist
const removeSongFromPlaylist = (playlistId, songSrc) => {
  playlistStore.removeSongFromPlaylist(playlistId, songSrc)
}

// Play entire playlist
const playPlaylist = (playlist) => {
  if (playlist.songs.length > 0) {
    // Clear current queue and add all songs
    eventBus.emit('playPlaylist', playlist.songs)
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">My Playlists</h1>
      <div class="text-sm text-gray-400">
        {{ playlistStore.playlistCount }} playlist{{ playlistStore.playlistCount !== 1 ? 's' : '' }}
      </div>
    </div>

    <div v-if="playlistStore.playlists.length === 0" class="text-center py-12">
      <div class="text-gray-400 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
        </svg>
        <p class="text-lg">No playlists yet</p>
        <p class="text-sm">Create your first playlist by adding songs from search results</p>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div v-for="playlist in playlistStore.playlists" :key="playlist.id" class="bg-gray-800 rounded-lg p-6">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h2 class="text-xl font-semibold mb-2">{{ playlist.name }}</h2>
            <p v-if="playlist.description" class="text-gray-400 text-sm mb-2">{{ playlist.description }}</p>
            <div class="text-sm text-gray-500">
              {{ playlist.songs.length }} song{{ playlist.songs.length !== 1 ? 's' : '' }} • 
              Created {{ new Date(playlist.createdAt).toLocaleDateString() }}
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              v-if="playlist.songs.length > 0"
              @click="playPlaylist(playlist)"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.95l6.518-3.76a1 1 0 000-1.764z"/>
              </svg>
              <span>Play All</span>
            </button>
            
            <button 
              @click="deletePlaylist(playlist.id)"
              class="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="playlist.songs.length === 0" class="text-gray-500 text-center py-8">
          This playlist is empty. Add some songs to get started!
        </div>

        <div v-else class="space-y-3">
          <div v-for="(song, index) in playlist.songs" :key="index" class="relative">
            <MusicBox
              :title="song.title"
              :image="song.image"
              :artist="song.artist"
              :src="song.src"
              @play="playNewSong"
            />
            
            <!-- Remove from playlist button -->
            <button 
              @click="removeSongFromPlaylist(playlist.id, song.src)"
              class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
              title="Remove from playlist"
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
</template>