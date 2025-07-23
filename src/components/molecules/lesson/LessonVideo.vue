<script setup lang="ts">
import { ref } from 'vue'
import Button from '../../atoms/Button.vue'

interface Props {
  videoUrl?: string
}

const props = defineProps<Props>()
const showTranscript = ref(false)
const videoPlayerRef = ref<HTMLIFrameElement>()

const toggleTranscript = () => {
  showTranscript.value = !showTranscript.value
}
</script>

<template>
  <div v-if="videoUrl" class="bg-white rounded-xl shadow-sm overflow-hidden">
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'play-circle']" class="text-green-600" />
          Lesson Video
        </h2>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="toggleTranscript"
          >
            <font-awesome-icon :icon="['fas', 'closed-captioning']" class="mr-2" />
            Transcript
          </Button>
        </div>
      </div>
    </div>
    
    <div class="aspect-video">
      <iframe
        ref="videoPlayerRef"
        :src="videoUrl"
        class="w-full h-full"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>

    <!-- Video Transcript -->
    <div v-if="showTranscript" class="p-4 bg-gray-50 border-t">
      <h3 class="font-medium text-gray-900 mb-2">Video Transcript</h3>
      <p class="text-sm text-gray-600">
        Transcript content would be displayed here. This helps with accessibility and allows students to follow along with the video content.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Ensure proper image sizing on all devices */
@media (max-width: 640px) {
  .aspect-video iframe {
    height: 200px;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .aspect-video iframe {
    height: 280px;
  }
}
</style> 