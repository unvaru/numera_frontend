<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  src: string
  title?: string
  poster?: string
}

const props = defineProps<Props>()
const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)

const togglePlay = () => {
  if (!videoRef.value) return
  
  if (isPlaying.value) {
    videoRef.value.pause()
  } else {
    videoRef.value.play()
  }
}

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.addEventListener('play', () => isPlaying.value = true)
    videoRef.value.addEventListener('pause', () => isPlaying.value = false)
  }
})
</script>

<template>
  <div class="content-video">
    <div class="video-container relative">
      <video
        ref="videoRef"
        :src="src"
        :poster="poster"
        class="w-full rounded-lg"
        controls
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      
      <button
        v-if="!isPlaying"
        @click="togglePlay"
        class="play-button absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
      >
        <span class="sr-only">Play video</span>
        <svg 
          class="w-16 h-16 text-white" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      </button>
    </div>
    
    <p v-if="title" class="mt-2 text-sm text-gray-600 text-center">
      {{ title }}
    </p>
  </div>
</template>

<style scoped>
.content-video {
  @apply my-6;
  
  .video-container {
    @apply aspect-video bg-black rounded-lg overflow-hidden shadow-sm;
  }
  
  video {
    @apply w-full h-full object-contain;
  }
  
  .play-button {
    @apply rounded-lg cursor-pointer;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .content-video p {
    @apply text-gray-400;
  }
}
</style> 