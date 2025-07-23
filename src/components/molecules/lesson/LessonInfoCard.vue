<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  image?: string
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
  duration?: string
  estimatedReadTime?: string
  lastUpdated?: string
  timeRemaining?: string
}

defineProps<Props>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-4 lg:p-6">
    <div class="flex flex-col sm:flex-row items-start gap-4 lg:gap-6">
      <img
        :src="image"
        :alt="title"
        class="w-full sm:w-20 lg:w-24 h-48 sm:h-20 lg:h-24 rounded-lg object-cover"
      />
      <div class="flex-1 w-full">
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
          <h1 class="text-xl lg:text-2xl font-bold text-gray-900">{{ title }}</h1>
          <span 
            class="text-xs font-medium px-2.5 py-0.5 rounded-full self-start sm:self-center"
            :class="{
              'text-green-600 bg-green-50': difficulty === 'Beginner',
              'text-blue-600 bg-blue-50': difficulty === 'Intermediate',
              'text-purple-600 bg-purple-50': difficulty === 'Advanced'
            }"
          >
            {{ difficulty }}
          </span>
        </div>
        <p class="text-gray-600 mb-4 text-sm lg:text-base">{{ description }}</p>
        
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 text-xs lg:text-sm">
          <div class="flex items-center gap-2 text-gray-500">
            <font-awesome-icon :icon="['fas', 'clock']" />
            <span>{{ duration }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500">
            <font-awesome-icon :icon="['fas', 'book-reader']" />
            <span class="hidden sm:inline">{{ estimatedReadTime }}</span>
            <span class="sm:hidden">{{ estimatedReadTime?.split(' ')[0] }}m</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500 col-span-2 lg:col-span-1">
            <font-awesome-icon :icon="['fas', 'calendar']" />
            <span class="hidden lg:inline">Updated {{ lastUpdated }}</span>
            <span class="lg:hidden">{{ lastUpdated }}</span>
          </div>
          <div class="flex items-center gap-2 text-gray-500 hidden lg:flex">
            <font-awesome-icon :icon="['fas', 'hourglass-half']" />
            <span>{{ timeRemaining }} left</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 