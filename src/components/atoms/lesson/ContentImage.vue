<script setup lang="ts">
interface Props {
  src: string
  alt?: string
  caption?: string
}

defineProps<Props>()
</script>

<template>
  <figure class="content-image">
    <img 
      :src="src" 
      :alt="alt || ''" 
      class="w-full h-auto rounded-lg"
      loading="lazy"
    >
    <figcaption v-if="caption" class="mt-2 text-sm text-gray-600 text-center">
      {{ caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.content-image {
  @apply my-6;
  
  img {
    @apply shadow-sm transition-shadow duration-200;
    
    &:hover {
      @apply shadow-md;
    }
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .content-image figcaption {
    @apply text-gray-400;
  }
}
</style> 