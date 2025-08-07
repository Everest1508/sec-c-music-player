import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMusicPlayerStore = defineStore('musicPlayer', () => {
  // Current song state
  const currentSong = ref(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const isLoading = ref(false)
  
  // Queue management
  const queue = ref([])
  const currentIndex = ref(-1)
  const isShuffled = ref(false)
  const repeatMode = ref('none') // 'none', 'one', 'all'
  
  // Cache for song data
  const songCache = ref(new Map())
  
  // Computed properties
  const hasNext = computed(() => currentIndex.value < queue.value.length - 1)
  const hasPrevious = computed(() => currentIndex.value > 0)
  const currentQueueSong = computed(() => 
    currentIndex.value >= 0 ? queue.value[currentIndex.value] : null
  )
  
  // Actions
  const setCurrentSong = (song) => {
    currentSong.value = song
  }
  
  const setPlayingState = (playing) => {
    isPlaying.value = playing
  }
  
  const setCurrentTime = (time) => {
    currentTime.value = time
  }
  
  const setDuration = (dur) => {
    duration.value = dur
  }
  
  const setLoading = (loading) => {
    isLoading.value = loading
  }
  
  // Queue management
  const addToQueue = (song) => {
    queue.value.push(song)
  }
  
  const removeFromQueue = (index) => {
    if (index >= 0 && index < queue.value.length) {
      queue.value.splice(index, 1)
      if (currentIndex.value > index) {
        currentIndex.value--
      }
    }
  }
  
  const clearQueue = () => {
    queue.value = []
    currentIndex.value = -1
  }
  
  const playFromQueue = (index) => {
    if (index >= 0 && index < queue.value.length) {
      currentIndex.value = index
      return queue.value[index]
    }
    return null
  }
  
  const playNext = () => {
    if (hasNext.value) {
      currentIndex.value++
      return queue.value[currentIndex.value]
    }
    if (repeatMode.value === 'all' && queue.value.length > 0) {
      currentIndex.value = 0
      return queue.value[0]
    }
    return null
  }
  
  const playPrevious = () => {
    if (hasPrevious.value) {
      currentIndex.value--
      return queue.value[currentIndex.value]
    }
    return null
  }
  
  const toggleShuffle = () => {
    isShuffled.value = !isShuffled.value
    if (isShuffled.value) {
      // Shuffle queue but keep current song at current position
      const currentSong = queue.value[currentIndex.value]
      const otherSongs = queue.value.filter((_, index) => index !== currentIndex.value)
      
      // Fisher-Yates shuffle
      for (let i = otherSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]]
      }
      
      queue.value = [currentSong, ...otherSongs]
      currentIndex.value = 0
    }
  }
  
  const setRepeatMode = (mode) => {
    repeatMode.value = mode
  }
  
  // Cache management
  const getCachedSong = (slug) => {
    return songCache.value.get(slug)
  }
  
  const setCachedSong = (slug, data) => {
    songCache.value.set(slug, {
      ...data,
      cachedAt: Date.now()
    })
    
    // Store in localStorage for persistence
    try {
      const cacheData = Object.fromEntries(songCache.value)
      localStorage.setItem('musicCache', JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error)
    }
  }
  
  const loadCacheFromStorage = () => {
    try {
      const cached = localStorage.getItem('musicCache')
      if (cached) {
        const cacheData = JSON.parse(cached)
        songCache.value = new Map(Object.entries(cacheData))
        
        // Clean old cache entries (older than 24 hours)
        const now = Date.now()
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        
        for (const [key, value] of songCache.value.entries()) {
          if (now - value.cachedAt > maxAge) {
            songCache.value.delete(key)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error)
    }
  }
  
  return {
    // State
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    queue,
    currentIndex,
    isShuffled,
    repeatMode,
    songCache,
    
    // Computed
    hasNext,
    hasPrevious,
    currentQueueSong,
    
    // Actions
    setCurrentSong,
    setPlayingState,
    setCurrentTime,
    setDuration,
    setLoading,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playFromQueue,
    playNext,
    playPrevious,
    toggleShuffle,
    setRepeatMode,
    getCachedSong,
    setCachedSong,
    loadCacheFromStorage
  }
})