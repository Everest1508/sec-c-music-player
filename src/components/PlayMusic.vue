<template>
  <div>
    <input v-model="videoUrl" placeholder="Enter YouTube URL"/>
    <button @click="playMusic">Play</button>
    <audio ref="audioPlayer" controls></audio>
  </div>
</template>

<script>
import { fetchMusicStream } from "@/services/api";
import { storeAudio, getAudio } from "@/utils/db";

export default {
  data() {
    return {
      videoUrl: "",
    };
  },
  methods: {
    async playMusic() {
      if (!this.videoUrl) return;

      // Check if audio is already cached
      const cachedAudio = await getAudio(this.videoUrl);
      if (cachedAudio) {
        console.log("Playing from cache");
        this.playAudio(cachedAudio);
        return;
      }

      // Fetch and store audio
      console.log("Fetching from API");
      const audioBlob = await fetchMusicStream(this.videoUrl);
      if (audioBlob) {
        await storeAudio(this.videoUrl, audioBlob);
        this.playAudio(audioBlob);
      }
    },
    playAudio(audioBlob) {
      const audioUrl = URL.createObjectURL(new Blob([audioBlob], { type: "audio/mpeg" }));
      this.$refs.audioPlayer.src = audioUrl;
      this.$refs.audioPlayer.play();
    },
  },
};
</script>
