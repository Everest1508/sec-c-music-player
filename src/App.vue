<script setup>
import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/searchResults.js'
import SearchBar from '@/components/SearchBar.vue'
import AudioPlayer from './components/AudioPlayer.vue'
import { ref } from 'vue'

const router = useRouter()
const searchStore = useSearchStore()
const audioPlayer = ref(null)

// Handle search results
const updateResults = (results) => {
  searchStore.setResults(results);
  router.push('/search') ;
}

// Trigger playback in the global player
const playSong = (song) => {
  if (audioPlayer.value) {
    audioPlayer.value.playNewSong(song)
  } 
}
</script>

<script setup>

</script>


<template>
  <div class="flex flex-col min-h-screen bg-gray-900 text-white">
    <div class="sticky top-0 left-0 bg-gray-900 pt-2 nav-bar">
      <SearchBar @update-results="updateResults" />
    </div>

    <main class="font-stretch-extra-condensed flex-1 container mx-auto p-4 content-body">
      <RouterView />
    </main>
    <AudioPlayer ref="audioPlayer"/>
  </div>
</template>

<style scoped>
  .nav-bar{
    z-index: 50;
  }
  .content-body{
    z-index: 10;
  }
</style>
