import { useMusicPlayerStore } from '@/stores/musicPlayer.js'

class MusicService {
  constructor() {
    this.baseUrl = 'https://song-scraper.riteshmahale15.workers.dev'
  }
  
  async fetchSongData(slug) {
    const playerStore = useMusicPlayerStore()
    
    // Check cache first
    const cached = playerStore.getCachedSong(slug)
    if (cached) {
      console.log('Using cached song data for:', slug)
      return cached
    }
    
    try {
      console.log('Fetching song data for:', slug)
      const response = await fetch(`${this.baseUrl}/song?slug=${slug}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.audioSrc) {
        // Cache the result
        playerStore.setCachedSong(slug, data)
        return data
      } else {
        throw new Error('No audio source found in response')
      }
    } catch (error) {
      console.error('Error fetching song data:', error)
      throw error
    }
  }
  
  async searchSongs(query) {
    try {
      const response = await fetch(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error searching songs:', error)
      throw error
    }
  }
  
  // Preload song data for better UX
  async preloadSong(slug) {
    try {
      await this.fetchSongData(slug)
    } catch (error) {
      console.warn('Failed to preload song:', slug, error)
    }
  }
  
  // Preload multiple songs (for queue)
  async preloadSongs(slugs) {
    const promises = slugs.map(slug => this.preloadSong(slug))
    await Promise.allSettled(promises)
  }
}

export const musicService = new MusicService()