<script setup lang="ts">
import Button from '../../atoms/Button.vue'

interface Props {
  progress: number
  relatedQuizId?: number
  isMarkingComplete?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'takeQuiz'): void
  (e: 'practice'): void
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-4">
    <div class="flex flex-wrap gap-3">
      <!-- Mark Complete Button -->
      <Button
        variant="primary"
        size="sm"
        class="flex-1 min-w-[120px]"
        @click="emit('complete')"
        :loading="isMarkingComplete"
        :disabled="progress === 100"
      >
        <font-awesome-icon 
          :icon="['fas', progress === 100 ? 'check-circle' : 'check']" 
          class="mr-2 text-sm" 
        />
        <span class="text-sm font-medium">
          {{ progress === 100 ? 'Completed' : 'Mark Complete' }}
        </span>
      </Button>

      <!-- Take Quiz Button -->
      <Button
        v-if="relatedQuizId"
        variant="outline"
        size="sm"
        class="flex-1 min-w-[100px]"
        @click="emit('takeQuiz')"
      >
        <font-awesome-icon :icon="['fas', 'question-circle']" class="mr-2 text-sm" />
        <span class="text-sm font-medium">Take Quiz</span>
      </Button>

      <!-- Practice Button -->
      <Button
        variant="outline"
        size="sm"
        class="flex-1 min-w-[100px]"
        @click="emit('practice')"
      >
        <font-awesome-icon :icon="['fas', 'calculator']" class="mr-2 text-sm" />
        <span class="text-sm font-medium">Practice</span>
      </Button>
    </div>

    <!-- Progress Indicator -->
    <div v-if="progress > 0 && progress < 100" class="mt-3 pt-3 border-t border-gray-100">
      <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Progress</span>
        <span>{{ progress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="bg-green-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </div>
</template> 