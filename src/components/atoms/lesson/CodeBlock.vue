<script setup lang="ts">
interface Props {
  code: string
  language?: string
}

defineProps<Props>()
</script>

<template>
  <div class="code-block">
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block {
  @apply my-6 rounded-xl overflow-hidden;
  
  pre {
    @apply m-0 p-4 bg-gray-50 border border-gray-200 overflow-x-auto;
  }
  
  code {
    @apply block text-sm font-mono text-gray-800 whitespace-pre;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .code-block {
    pre {
      @apply bg-gray-900 border-gray-700;
    }
    
    code {
      @apply text-gray-200;
    }
  }
}
</style> 