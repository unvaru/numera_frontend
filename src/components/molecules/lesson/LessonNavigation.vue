<script setup lang="ts">
import Button from '../../atoms/Button.vue'

interface Lesson {
  id: number
  title: string
}

interface Props {
  previousLesson?: Lesson | null
  nextLesson?: Lesson | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'navigate', lessonId: number): void
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-4 lg:p-6">
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="flex-1">
        <Button
          v-if="previousLesson"
          variant="outline"
          class="w-full sm:w-auto"
          @click="emit('navigate', previousLesson.id)"
        >
          <font-awesome-icon :icon="['fas', 'chevron-left']" class="mr-2" />
          <span class="truncate">{{ previousLesson.title }}</span>
        </Button>
      </div>
      
      <div class="flex-1 sm:flex-none sm:ml-auto">
        <Button
          v-if="nextLesson"
          variant="primary"
          class="w-full sm:w-auto"
          @click="emit('navigate', nextLesson.id)"
        >
          <span class="truncate">{{ nextLesson.title }}</span>
          <font-awesome-icon :icon="['fas', 'chevron-right']" class="ml-2" />
        </Button>
      </div>
    </div>
  </div>
</template> 