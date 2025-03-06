<script setup>
import { ref } from 'vue'

const searchQuery = ref('')
const emit = defineEmits(['update-results'])

// Function to fetch search results from API
const fetchResults = async () => {
  if (!searchQuery.value) return

  try {
    const response = await fetch(`https://song-scraper.riteshmahale15.workers.dev/search?q=${searchQuery.value}`)
    const data = await response.json()
    console.log('Search Results:', data)

    emit('update-results', data.results)
  } catch (error) {
    console.error('Error fetching search results:', error)
  }
}

// Trigger search on Enter key press
const handleKeyPress = (event) => {
  if (event.key === 'Enter') {
    fetchResults()
  }
}
</script>

<template>
  <div class="p-2 z-40 nav-bar">
    <h1 class="text-3xl font-[400] font-stretch-extra-condensed">Music</h1>
    <div class="relative w-full max-w-md py-2">
      <!-- Clickable Search Icon -->
      <button 
        @click="fetchResults"
        class="absolute left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"/>
        </svg>
      </button>

      <!-- Search Input -->
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search"
        @keypress="handleKeyPress"
        class="font-stretch-extra-condensed w-full pl-10 pr-4 py-2 text-gray-100 bg-gray-800 border border-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-none"
      />
    </div>
  </div>
</template>

<style scoped>
.nav-bar {
  z-index: 10;
}
</style>
