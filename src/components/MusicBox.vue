<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  artist: String,
  image: String,
  src: String
})

// Emit play event to parent instead of using eventBus
const emit = defineEmits(['play'])

const getFormattedTitle = (title) => {
  return title ? title.split('-')[0].trim() : "Unknown Title"
}

// Compute formatted title for display
const formattedTitle = computed(() => getFormattedTitle(props.title))

// Play song without triggering global state change
const playSong = () => {
  emit('play', {
    title: formattedTitle.value,
    artist: props.artist,
    image: props.image,
    src: props.src
  })
}
</script>

<template>
  <div class="relative flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md w-full overflow-hidden">
    <img :src="image" alt="Song Cover" class="w-16 h-16 rounded-lg object-cover" />

    <div class="flex-1 px-4 overflow-hidden">
      <div class="relative w-full max-w-[200px] h-6 overflow-hidden">
        <p class="text-lg font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
          {{ formattedTitle }}
        </p>
      </div>
      <p class="text-sm text-gray-400">{{ artist }}</p>
    </div>

    <button @click="playSong" class="p-3 bg-blue-500 rounded-3xl text-white hover:bg-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.06v7.882a1 1 0 001.234.95l6.518-3.76a1 1 0 000-1.764z"/>
      </svg>
    </button>
  </div>
</template>
