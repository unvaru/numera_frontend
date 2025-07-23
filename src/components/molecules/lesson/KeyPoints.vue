<script setup lang="ts">
interface Props {
  points: string[]
}

defineProps<Props>()
</script>

<template>
  <div class="bg-yellow-50 rounded-xl p-6 shadow-md">
    <h2 class="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
      <font-awesome-icon :icon="['fas', 'key']" />
      Key Points to Remember
    </h2>
    <ul class="space-y-2">
      <li
        v-for="(point, index) in points"
        :key="index"
        class="flex items-start gap-3 text-yellow-800"
      >
        <font-awesome-icon :icon="['fas', 'check-circle']" class="text-yellow-600 mt-1" />
        <span>{{ point }}</span>
      </li>
    </ul>
  </div>
</template> 