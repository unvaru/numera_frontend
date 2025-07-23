<script setup lang="ts">
import { ref } from 'vue'
import ProgressBar from '../../atoms/ProgressBar.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface Lesson {
  id: number
  title: string
}

interface Props {
  readingProgress: number
  lessonProgress: number
  previousLesson?: Lesson | null
  nextLesson?: Lesson | null
  relatedQuizId?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'takeQuiz'): void
  (e: 'navigate', lessonId: number): void
}>()
</script>

<template>
  <div class="flex lg:flex-col items-center justify-center lg:justify-start lg:pt-10 lg:pb-4 lg:space-y-6 w-full lg:w-[60px] px-4 py-3 lg:px-0">
    <!-- All Actions Container -->
    <div class="flex items-center justify-center gap-6 lg:flex-col lg:gap-6">
      <!-- Progress Circle -->
      <div class="relative group">
        <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
          <font-awesome-icon :icon="['fas', 'book-reader']" 
            class="text-blue-500"
            :style="{ opacity: 0.3 + (readingProgress / 100) * 0.7 }"
          />
        </div>
        <!-- Tooltip -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute lg:fixed bottom-full lg:ml-[-200px] mb-2 lg:mb-0 lg:top-1/2 lg:-translate-y-1/2 z-[100] pointer-events-none">
          <div class="px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap">
            Reading Progress: {{ Math.round(readingProgress) }}%
          </div>
        </div>
      </div>

      <!-- Lesson Progress -->
      <div class="relative group">
        <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
          <font-awesome-icon :icon="['fas', 'check-circle']" 
            class="text-green-500"
            :style="{ opacity: 0.3 + (lessonProgress / 100) * 0.7 }"
          />
        </div>
        <!-- Tooltip -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute lg:fixed bottom-full lg:ml-[-200px] mb-2 lg:mb-0 lg:top-1/2 lg:-translate-y-1/2 z-[100] pointer-events-none">
          <div class="px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap">
            Lesson Progress: {{ Math.round(lessonProgress) }}%
          </div>
        </div>
      </div>

      <!-- Quiz -->
      <div v-if="relatedQuizId" class="relative group">
        <button
          @click="emit('takeQuiz')"
          class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'graduation-cap']" class="text-purple-500" />
        </button>
        <!-- Tooltip -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute lg:fixed bottom-full lg:ml-[-200px] mb-2 lg:mb-0 lg:top-1/2 lg:-translate-y-1/2 z-[100] pointer-events-none">
          <div class="px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap">
            Take Quiz
          </div>
        </div>
      </div>

      <!-- Bookmark -->
      <div class="relative group">
        <button
          class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'bookmark']" class="text-amber-500" />
        </button>
        <!-- Tooltip -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute lg:fixed bottom-full lg:ml-[-200px] mb-2 lg:mb-0 lg:top-1/2 lg:-translate-y-1/2 z-[100] pointer-events-none">
          <div class="px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap">
            Bookmark Lesson
          </div>
        </div>
      </div>

      <!-- Previous Lesson -->
      <div v-if="previousLesson" class="relative group">
        <button
          @click="emit('navigate', previousLesson.id)"
          class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'arrow-up']" class="text-gray-500" />
        </button>
        <!-- Tooltip -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute lg:fixed bottom-full lg:ml-[-200px] mb-2 lg:mb-0 lg:top-1/2 lg:-translate-y-1/2 z-[100] pointer-events-none">
          <div class="px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap">
            Previous: {{ previousLesson.title }}
          </div>
        </div>
      </div>

      <!-- Next Lesson -->
      <div v-if="nextLesson" class="relative group">
        <button
          @click="emit('navigate', nextLesson.id)"
          class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'arrow-down']" class="text-gray-500" />
        </button>
        <!-- Tooltip -->
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute lg:fixed bottom-full lg:ml-[-200px] mb-2 lg:mb-0 lg:top-1/2 lg:-translate-y-1/2 z-[100] pointer-events-none">
          <div class="px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap">
            Next: {{ nextLesson.title }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add safe area padding for mobile devices */
@supports (padding: max(0px)) {
  .py-3 {
    padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
  }
}
</style> 