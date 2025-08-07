<script setup>
import { useSearchStore } from '@/stores/searchResults.js'
import { usePlaylistStore } from '@/stores/playlist.js'
import MusicBox from '@/components/MusicBox.vue'
import { eventBus } from '@/eventBus.js'
import { onMounted } from 'vue'

const searchStore = useSearchStore()
const playlistStore = usePlaylistStore()

// Function to handle play event from MusicBox
const playNewSong = (song) => {
  eventBus.emit('playSong', song) // Sends song data to global player
}

onMounted(() => {
  // Load playlists for the MusicBox dropdown
  playlistStore.loadPlaylists()
})
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold">Search Results</h2>
    <ul v-if="searchStore.results.length">
      <li class="p-2" v-for="(song, index) in searchStore.results" :key="index">
        <MusicBox
          :title="song.title"
          :image="song.img"
          :artist="song.artist"
          :src="song.slug"
          @play="playNewSong"
        />
      </li>
    </ul>
    <p v-else class="text-gray-400">No results found.</p>
  </div>
</template>
