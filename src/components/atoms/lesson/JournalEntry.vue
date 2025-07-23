<script setup lang="ts">
interface Entry {
  account: string
  debit?: number
  credit?: number
}

interface Props {
  entries: Entry[]
  description?: string
  date?: string
}

defineProps<Props>()
</script>

<template>
  <div class="bg-gray-50 border border-gray-300 rounded-lg p-4 my-6">
    <div v-if="description || date" class="mb-3 text-sm text-gray-600">
      <div v-if="date">Date: {{ date }}</div>
      <div v-if="description">{{ description }}</div>
    </div>
    <table class="w-full">
      <tbody>
        <tr v-for="(entry, index) in entries" :key="index">
          <td class="py-1 border-b border-gray-200" >
            {{ entry.account }}
          </td>
          <td class="py-1 border-b border-gray-200 text-right w-32">
            {{ entry.debit?.toFixed(2) }}
          </td>
          <td class="py-1 border-b border-gray-200 text-right w-32">
            {{ entry.credit?.toFixed(2) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  table {
    @apply text-xs;
  }
  
  td {
    @apply py-0.5;
  }
}
</style> 