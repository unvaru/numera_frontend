<script setup lang="ts">
interface Props {
  objectives: string[]
}

defineProps<Props>()
</script>

<template>
  <div class="bg-blue-50 rounded-xl p-4 lg:p-6 shadow-lg">
    <h2 class="text-base lg:text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
      <font-awesome-icon :icon="['fas', 'bullseye']" />
      Learning Objectives
    </h2>
    <ul class="space-y-2">
      <li
        v-for="(objective, index) in objectives"
        :key="index"
        class="flex items-start gap-3 text-blue-800 text-sm lg:text-base"
      >
        <span class="text-blue-500 mt-1 text-xs lg:text-sm">{{ index + 1 }}.</span>
        <span>{{ objective }}</span>
      </li>
    </ul>
  </div>
</template> 