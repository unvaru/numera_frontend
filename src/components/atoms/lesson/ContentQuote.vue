<script setup lang="ts">
interface Props {
  quote: string
  author?: string
}

defineProps<Props>()
</script>

<template>
  <blockquote class="border-l-4 border-green-500 pl-4 italic text-gray-600 my-6 bg-green-50 py-3 rounded-r-lg">
    {{ quote }}
    <footer v-if="author" class="mt-2 text-sm font-medium text-gray-500">
      — {{ author }}
    </footer>
  </blockquote>
</template> 