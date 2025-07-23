<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  image?: string
  variant?: 'default' | 'lesson' | 'quiz' | 'badge'
  progress?: number
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  clickable: false
})

const cardClasses = computed(() => {
  return [
    'bg-white rounded-xl shadow-sm overflow-hidden',
    props.clickable ? 'hover:shadow-md transition-shadow cursor-pointer' : ''
  ].join(' ')
})

const progressBarClasses = computed(() => {
  return [
    'h-1 bg-green-500 transition-all duration-300',
    props.variant === 'lesson' ? 'bg-green-500' : '',
    props.variant === 'quiz' ? 'bg-teal-500' : ''
  ].join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <div v-if="image" class="aspect-video">
      <img :src="image" :alt="title" class="w-full h-full object-cover" />
    </div>
    
    <div class="p-4">
      <div v-if="title" class="font-semibold text-gray-900">{{ title }}</div>
      <div v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</div>
      
      <div class="mt-4">
        <slot></slot>
      </div>
      
      <div v-if="typeof progress === 'number'" class="mt-4">
        <div class="w-full bg-gray-100 rounded-full h-1">
          <div
            :class="progressBarClasses"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="text-xs text-gray-500 mt-1">{{ progress }}% Complete</div>
      </div>
    </div>
  </div>
</template> 