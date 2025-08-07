<script setup>
import { usePlaylistStore } from '@/stores/playlist.js'
import { useMusicPlayerStore } from '@/stores/musicPlayer.js'
import { eventBus } from '@/eventBus.js'
import { onMounted, computed } from 'vue'

const playlistStore = usePlaylistStore()
const playerStore = useMusicPlayerStore()

const recentPlaylists = computed(() => 
  playlistStore.playlists
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 3)
)

const totalSongs = computed(() => 
  playlistStore.playlists.reduce((total, playlist) => total + playlist.songs.length, 0)
)

// Get cached songs from the music player store
const cachedSongs = computed(() => {
  const cache = playerStore.songCache
  if (!cache || cache.size === 0) return []
  
  // Convert Map to array and get song data
  const songs = []
  for (const [slug, data] of cache.entries()) {
    if (data.title && data.image) {
      songs.push({
        slug,
        title: data.title || 'Unknown Title',
        artist: data.artist || 'Unknown Artist',
        image: data.image || '/icons/web-app-manifest-192x192.png',
        src: slug,
        cachedAt: data.cachedAt
      })
    }
  }
  
  // Sort by most recently cached and limit to 12 songs
  return songs
    .sort((a, b) => (b.cachedAt || 0) - (a.cachedAt || 0))
    .slice(0, 12)
})

// Format title for display
const getFormattedTitle = (title) => {
  return title ? title.split('-')[0].trim() : "Unknown Title"
}

// Play cached song
const playCachedSong = (song) => {
  eventBus.emit('playSong', song)
}

// Get bento grid class for different tile sizes
const getBentoClass = (index) => {
  const patterns = [
    'bento-large',     // 0 - Large tile
    'bento-small',     // 1 - Small tile
    'bento-small',     // 2 - Small tile
    'bento-medium',    // 3 - Medium tile
    'bento-small',     // 4 - Small tile
    'bento-small',     // 5 - Small tile
    'bento-small',     // 6 - Small tile
    'bento-large',     // 7 - Large tile
    'bento-small',     // 8 - Small tile
    'bento-small',     // 9 - Small tile
    'bento-small',     // 10 - Small tile
    'bento-small'      // 11 - Small tile
  ]
  return patterns[index] || 'bento-small'
}

onMounted(() => {
  playlistStore.loadPlaylists()
  playerStore.loadCacheFromStorage()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="text-center py-12">
      <h1 class="text-4xl font-bold text-white mb-4">Welcome to SecC Music</h1>
      <p class="text-xl text-gray-400 mb-8">Your personal music streaming experience</p>
      
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="text-3xl font-bold text-blue-400">{{ playlistStore.playlistCount }}</div>
          <div class="text-gray-400">Playlists</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="text-3xl font-bold text-green-400">{{ totalSongs }}</div>
          <div class="text-gray-400">Songs</div>
        </div>
        <div class="bg-gray-800 rounded-lg p-6">
          <div class="text-3xl font-bold text-purple-400">{{ playerStore.queue.length }}</div>
          <div class="text-gray-400">In Queue</div>
        </div>
      </div>
    </div>

    <!-- Cached Songs Bento Grid -->
    <div v-if="cachedSongs.length > 0" class="mt-12">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">Recently Played</h2>
        <div class="flex items-center text-sm text-gray-400">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
          </svg>
          {{ cachedSongs.length }} cached songs
        </div>
      </div>
      
      <!-- Bento Grid Layout -->
      <div class="bento-grid">
        <div 
          v-for="(song, index) in cachedSongs" 
          :key="song.slug"
          :class="getBentoClass(index)"
          class="bento-item group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105"
          @click="playCachedSong(song)"
        >
          <!-- Background Image -->
          <div 
            class="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-300"
            :style="{ backgroundImage: `url(${song.image})` }"
          ></div>
          
          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          <!-- Content -->
          <div class="relative h-full flex flex-col justify-between p-4 md:p-6">
            <!-- Album Art (for larger tiles) -->
            <div v-if="index === 0 || index === 3 || index === 7" class="flex-1 flex items-center justify-center mb-4">
              <img 
                :src="song.image" 
                :alt="song.title"
                class="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-lg"
              />
            </div>
            
            <!-- Small album art for smaller tiles -->
            <div v-else class="mb-3">
              <img 
                :src="song.image" 
                :alt="song.title"
                class="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover shadow-md"
              />
            </div>
            
            <!-- Song Info -->
            <div class="space-y-1">
              <h3 
                class="font-semibold text-white text-sm md:text-base leading-tight"
                :class="{ 'text-lg md:text-xl': index === 0 || index === 3 || index === 7 }"
              >
                {{ getFormattedTitle(song.title) }}
              </h3>
              <p 
                class="text-gray-300 text-xs md:text-sm opacity-80"
                :class="{ 'text-sm md:text-base': index === 0 || index === 3 || index === 7 }"
              >
                {{ song.artist }}
              </p>
            </div>
            
            <!-- Play Button Overlay -->
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <svg class="w-5 h-5 text-white ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.95l6.518-3.76a1 1 0 000-1.764z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white">Search Music</h3>
        </div>
        <p class="text-gray-400">Find your favorite songs instantly with our powerful search feature.</p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white">Queue Management</h3>
        </div>
        <p class="text-gray-400">Build your perfect listening experience with smart queue management.</p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white">Local Playlists</h3>
        </div>
        <p class="text-gray-400">Create and manage your personal playlists stored locally on your device.</p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white">PWA Support</h3>
        </div>
        <p class="text-gray-400">Install as an app on your device for the best experience.</p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white">Smart Caching</h3>
        </div>
        <p class="text-gray-400">Enjoy your music offline with intelligent caching technology.</p>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.5 4H9v1H5.5a3 3 0 00-2.121.879l-.707-.707zM15 6h5.5A2.5 2.5 0 0123 8.5V12h-1V8.5A1.5 1.5 0 0020.5 7H15V6z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white">Media Controls</h3>
        </div>
        <p class="text-gray-400">Control playback from notifications and lock screen.</p>
      </div>
    </div>

    <!-- Recent Playlists -->
    <div v-if="recentPlaylists.length > 0" class="mt-12">
      <h2 class="text-2xl font-bold text-white mb-6">Recent Playlists</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RouterLink 
          v-for="playlist in recentPlaylists" 
          :key="playlist.id"
          to="/playlists"
          class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
        >
          <h3 class="text-lg font-semibold text-white mb-2">{{ playlist.name }}</h3>
          <p class="text-gray-400 text-sm mb-3">{{ playlist.songs.length }} songs</p>
          <p class="text-xs text-gray-500">Updated {{ new Date(playlist.updatedAt).toLocaleDateString() }}</p>
        </RouterLink>
      </div>
    </div>

    <!-- Getting Started -->
    <div v-else class="text-center py-8">
      <h2 class="text-2xl font-bold text-white mb-4">Get Started</h2>
      <p class="text-gray-400 mb-6">Search for your favorite songs and create your first playlist!</p>
      <div class="flex justify-center space-x-4">
        <RouterLink 
          to="/search" 
          class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Start Searching
        </RouterLink>
        <RouterLink 
          to="/playlists" 
          class="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          View Playlists
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Bento Grid Layout */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-auto-rows: 150px;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Large tiles - 2x2 */
.bento-large {
  grid-column: span 2;
  grid-row: span 2;
}

/* Medium tiles - 2x1 */
.bento-medium {
  grid-column: span 2;
  grid-row: span 1;
}

/* Small tiles - 1x1 */
.bento-small {
  grid-column: span 1;
  grid-row: span 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 120px;
    gap: 12px;
  }
  
  .bento-large {
    grid-column: span 2;
    grid-row: span 2;
  }
  
  .bento-medium {
    grid-column: span 2;
    grid-row: span 1;
  }
  
  .bento-small {
    grid-column: span 1;
    grid-row: span 1;
  }
}

@media (max-width: 480px) {
  .bento-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 100px;
    gap: 8px;
  }
  
  .bento-large,
  .bento-medium,
  .bento-small {
    grid-column: span 1;
    grid-row: span 1;
  }
}

/* Hover effects */
.bento-item {
  position: relative;
  min-height: 120px;
}

.bento-item:hover {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

/* Play button animation */
.bento-item .group:hover .opacity-0 {
  animation: fadeInScale 0.3s ease-out forwards;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Background image blur effect on hover */
.bento-item:hover .bg-cover {
  filter: blur(1px);
}

/* Text shadow for better readability */
.bento-item h3,
.bento-item p {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* Gradient animation */
.bento-item {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.bento-item:hover {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  transform: translateY(-4px) scale(1.02);
}

/* Loading skeleton for images */
.bento-item img {
  transition: opacity 0.3s ease;
}

.bento-item img:not([src]) {
  opacity: 0;
}

/* Custom scrollbar for mobile */
@media (max-width: 768px) {
  .bento-grid {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .bento-grid::-webkit-scrollbar {
    display: none;
  }
}
</style>