<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import ContentTable from '../../atoms/lesson/ContentTable.vue'
import ContentEquation from '../../atoms/lesson/ContentEquation.vue'
import ContentQuote from '../../atoms/lesson/ContentQuote.vue'
import JournalEntry from '../../atoms/lesson/JournalEntry.vue'
import CodeBlock from '../../atoms/lesson/CodeBlock.vue'
import type { ContentBlock } from '@/services/ContentService'

interface Props {
  content: ContentBlock[]
  fontSize?: 'small' | 'medium' | 'large' | 'extra-large'
}

const props = defineProps<Props>()

const fontSizeClasses = {
  small: 'text-sm leading-relaxed',
  medium: 'text-base leading-relaxed',
  large: 'text-lg leading-relaxed',
  'extra-large': 'text-xl leading-relaxed'
} as const

// Register components
defineComponent({
  components: {
    ContentTable,
    ContentEquation,
    ContentQuote,
    JournalEntry,
    CodeBlock
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-md">
    <div class="p-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <font-awesome-icon :icon="['fas', 'book-open']" class="text-green-600" />
        Lesson Content
      </h2>
      
      <!-- Content Blocks -->
      <div 
        class="max-w-none lesson-content space-y-6"
        :class="[fontSizeClasses[fontSize || 'medium']]"
      >
        <template v-for="block in content" :key="block.id">
          <!-- Text Block -->
          <div v-if="block.type === 'text'" class="content-text" v-html="block.content"></div>

          <!-- Equation Block -->
          <content-equation
            v-else-if="block.type === 'equation'"
            :equation="block.content"
          />

          <!-- Table Block -->
          <content-table
            v-else-if="block.type === 'table'"
            :headers="block.content.headers"
            :rows="block.content.rows"
          />

          <!-- Quote Block -->
          <content-quote
            v-else-if="block.type === 'quote'"
            :quote="block.content"
            :author="block.metadata?.author"
          />

          <!-- Journal Entry Block -->
          <journal-entry
            v-else-if="block.type === 'journal_entry'"
            :entries="block.content.entries"
            :description="block.content.description"
            :date="block.content.date"
          />

          <!-- Code Block -->
          <code-block
            v-else-if="block.type === 'code'"
            :code="block.content"
            :language="block.metadata?.language"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lesson-content {
  /* Base styles */
  @apply text-gray-900;
  
  /* Spacing between blocks */
  > * + * {
    @apply mt-6;
  }

  /* Text content */
  .content-text {
    @apply leading-relaxed text-gray-900;
    
    /* Headings */
    h1, h2, h3, h4, h5, h6 {
      @apply font-semibold text-gray-900 mb-4;
    }
    
    h1 { @apply text-3xl; }
    h2 { @apply text-2xl; }
    h3 { @apply text-xl; }
    h4 { @apply text-lg; }
    
    /* Lists */
    ul, ol {
      @apply my-4 ml-6 text-gray-900;
    }
    
    ul { @apply list-disc; }
    ol { @apply list-decimal; }
    
    /* Links */
    a {
      @apply text-green-600 hover:text-green-700 underline;
    }
    
    /* Paragraphs */
    p {
      @apply mb-4 text-gray-900;
    }

    /* Strong text */
    strong {
      @apply text-gray-900 font-semibold;
    }
  }
}

/* Print optimizations */
@media print {
  .lesson-content {
    @apply text-black;
    
    .content-text {
      h1, h2, h3, h4, h5, h6 {
        @apply text-black;
      }
    }
  }
}
</style> 