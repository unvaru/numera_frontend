<script setup lang="ts">
interface Resource {
  title: string
  url: string
  type: 'pdf' | 'link' | 'video'
}

interface Props {
  resources: Resource[]
}

defineProps<Props>()
</script>

<template>
  <div v-if="resources?.length" class="bg-white rounded-xl shadow-sm p-4">
    <h2 class="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
      <font-awesome-icon :icon="['fas', 'external-link-alt']" class="text-green-600 text-sm" />
      Additional Resources
    </h2>
    <div class="space-y-2">
      <a
        v-for="resource in resources"
        :key="resource.url"
        :href="resource.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-3 shadow-sm rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all duration-200 group"
      >
        <div class="flex-shrink-0 w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
          <font-awesome-icon 
            :icon="['fas', 
              resource.type === 'pdf' ? 'file-pdf' : 
              resource.type === 'video' ? 'play-circle' : 
              'external-link-alt'
            ]"
            class="text-green-600 text-sm"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-900 text-sm truncate">{{ resource.title }}</div>
          <div class="text-xs text-gray-500 capitalize">{{ resource.type }}</div>
        </div>
        <font-awesome-icon 
          :icon="['fas', 'arrow-up-right-from-square']" 
          class="text-gray-400 text-xs group-hover:text-green-600 transition-colors"
        />
      </a>
    </div>
  </div>
</template> 