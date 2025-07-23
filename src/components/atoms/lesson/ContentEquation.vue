<script setup lang="ts">
interface Props {
  equation: string
}

defineProps<Props>()
</script>

<template>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center text-lg font-mono font-bold text-blue-900 my-6">
    {{ equation }}
  </div>
</template> 