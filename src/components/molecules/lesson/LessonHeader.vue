<script setup lang="ts">
import { defineComponent } from 'vue'

interface Props {
  topic?: string
  title?: string
  showNotes: boolean
  isFullscreen: boolean
  subjectId?: string
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large'
}

defineProps<Props>()

type FontSize = 'small' | 'medium' | 'large' | 'extra-large'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'toggle-notes'): void
  (e: 'toggle-fullscreen'): void
  (e: 'font-size-change', size: FontSize): void
}>()

const handleFontSizeChange = (size: FontSize) => {
  emit('font-size-change', size)
}

const getFontSizeIcon = (size: FontSize) => {
  switch (size) {
    case 'small':
      return 'text-xs'
    case 'medium':
      return 'text-sm'
    case 'large':
      return 'text-base'
    case 'extra-large':
      return 'text-lg'
    default:
      return 'text-sm'
  }
}
</script>

<template>
  <header class="lesson-header">
    <div class="max-w-[1400px] mx-auto px-4 py-3">
      <div class="flex items-center justify-between gap-4">
        <!-- Back Button & Title -->
        <div class="flex items-center gap-4 min-w-0">
          <button 
            @click="emit('back')"
            class="p-2 -m-2 text-gray-600 hover:text-gray-900"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" />
          </button>
          
          <div class="min-w-0">
            <div class="text-sm text-gray-600 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'folder']" class="text-gray-400" />
              {{ topic || 'Untitled Topic' }}
            </div>
            <h1 class="text-lg font-semibold text-gray-900 truncate">
              {{ title || 'Untitled Lesson' }}
            </h1>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Font Size Toggle -->
          <div class="hidden sm:block relative group">
            <button
              @click="handleFontSizeChange(fontSize === 'small' ? 'medium' : fontSize === 'medium' ? 'large' : fontSize === 'large' ? 'extra-large' : 'small')"
              class="p-2 text-gray-600 hover:text-gray-900 relative"
            >
              <font-awesome-icon :icon="['fas', 'font']" :class="getFontSizeIcon('large')" />
            </button>
            <!-- Tooltip -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
              <div class="px-3 py-2 bg-gray-900 text-white text-sm rounded-md shadow-lg whitespace-nowrap">
                Font Size: {{ fontSize || 'medium' }}
              </div>
            </div>
          </div>

          <!-- Notes Toggle -->
          <button 
            @click="emit('toggle-notes')"
            class="p-2 text-gray-600 hover:text-gray-900 relative"
            :class="{ 'text-green-600': showNotes }"
          >
            <font-awesome-icon :icon="['fas', 'note-sticky']" />
          </button>

          <!-- Fullscreen Toggle -->
          <button 
            @click="emit('toggle-fullscreen')"
            class="p-2 text-gray-600 hover:text-gray-900"
            :class="{ 'text-green-600': isFullscreen }"
          >
            <font-awesome-icon 
              :icon="['fas', isFullscreen ? 'compress' : 'expand']" 
            />
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.lesson-header {
  @apply bg-white border-b border-gray-200/50;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}
</style> 