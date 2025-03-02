<template>
  <div class="app-container">
    <!-- Header -->
    <header>
      <h1>🎵 Music PWA</h1>
      <button v-if="installPrompt" @click="installPWA">Install App</button>
    </header>

    <!-- Search Bar -->
    <div class="search-bar">
      <input v-model="query" placeholder="Search for songs..." />
      <button @click="searchSongs">🔍</button>
    </div>

    <!-- Song List -->
    <div class="song-list">
      <div v-for="song in songs" :key="song.slug" class="song-item">
        <img :src="song.img" alt="Song Cover" />
        <div>
          <h3>{{ song.title }}</h3>
          <p>{{ song.artist }}</p>
        </div>
        <button @click="playSong(song.slug)">▶️ Play</button>
      </div>
    </div>

    <!-- Audio Player -->
    <audio v-if="currentSong" controls :src="currentSong" autoplay></audio>
  </div>
</template>

<script>
export default {
  data() {
    return {
      query: "",
      songs: [],
      currentSong: null,
      installPrompt: null,
    };
  },
  methods: {
    async searchSongs() {
      const res = await fetch(`https://sec-c-music-api-470410220262.us-central1.run.app/search?q=${this.query}`);
      const data = await res.json();
      this.songs = data.results;
    },
    async playSong(slug) {
      const res = await fetch(`https://sec-c-music-api-470410220262.us-central1.run.app/song?slug=${slug}`);
      const data = await res.json();
      this.currentSong = data.audioSrc;
    },
    installPWA() {
      if (this.installPrompt) {
        this.installPrompt.prompt();
        this.installPrompt = null;
      }
    }
  },
  mounted() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.installPrompt = e;
    });
  }
};
</script>

<style>
.app-container {
  text-align: center;
  max-width: 500px;
  margin: auto;
  padding: 20px;
}
.song-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.song-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #ddd;
  padding: 10px;
}
.song-item img {
  width: 50px;
  height: 50px;
  border-radius: 5px;
}
</style>
