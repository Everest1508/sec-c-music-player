import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlaylistStore = defineStore('playlist', () => {
  const playlists = ref([])
  
  // Computed
  const playlistCount = computed(() => playlists.value.length)
  
  // Load playlists from localStorage
  const loadPlaylists = () => {
    try {
      const stored = localStorage.getItem('musicPlaylists')
      if (stored) {
        playlists.value = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load playlists:', error)
    }
  }
  
  // Save playlists to localStorage
  const savePlaylists = () => {
    try {
      localStorage.setItem('musicPlaylists', JSON.stringify(playlists.value))
    } catch (error) {
      console.warn('Failed to save playlists:', error)
    }
  }
  
  // Create new playlist
  const createPlaylist = (name, description = '') => {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    playlists.value.push(newPlaylist)
    savePlaylists()
    return newPlaylist
  }
  
  // Delete playlist
  const deletePlaylist = (playlistId) => {
    const index = playlists.value.findIndex(p => p.id === playlistId)
    if (index !== -1) {
      playlists.value.splice(index, 1)
      savePlaylists()
      return true
    }
    return false
  }
  
  // Update playlist
  const updatePlaylist = (playlistId, updates) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist) {
      Object.assign(playlist, updates, {
        updatedAt: new Date().toISOString()
      })
      savePlaylists()
      return playlist
    }
    return null
  }
  
  // Add song to playlist
  const addSongToPlaylist = (playlistId, song) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist) {
      // Check if song already exists
      const exists = playlist.songs.some(s => s.src === song.src)
      if (!exists) {
        playlist.songs.push({
          ...song,
          addedAt: new Date().toISOString()
        })
        playlist.updatedAt = new Date().toISOString()
        savePlaylists()
        return true
      }
    }
    return false
  }
  
  // Remove song from playlist
  const removeSongFromPlaylist = (playlistId, songSrc) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist) {
      const index = playlist.songs.findIndex(s => s.src === songSrc)
      if (index !== -1) {
        playlist.songs.splice(index, 1)
        playlist.updatedAt = new Date().toISOString()
        savePlaylists()
        return true
      }
    }
    return false
  }
  
  // Get playlist by ID
  const getPlaylist = (playlistId) => {
    return playlists.value.find(p => p.id === playlistId)
  }
  
  // Get playlists containing a specific song
  const getPlaylistsWithSong = (songSrc) => {
    return playlists.value.filter(playlist => 
      playlist.songs.some(song => song.src === songSrc)
    )
  }
  
  return {
    // State
    playlists,
    
    // Computed
    playlistCount,
    
    // Actions
    loadPlaylists,
    savePlaylists,
    createPlaylist,
    deletePlaylist,
    updatePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    getPlaylist,
    getPlaylistsWithSong
  }
})