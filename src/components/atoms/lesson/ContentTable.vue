<script setup lang="ts">
interface Props {
  headers?: string[]
  rows: string[][]
}

defineProps<Props>()
</script>

<template>
  <table class="w-full border-collapse border border-gray-300 my-6">
    <thead v-if="headers">
      <tr>
        <th
          v-for="(header, index) in headers"
          :key="index"
          class="bg-gray-50 border border-gray-300 px-4 py-2 text-left font-semibold"
        >
          {{ header }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
        <td
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          class="border border-gray-300 px-4 py-2"
        >
          {{ cell }}
        </td>
      </tr>
    </tbody>
  </table>
</template> 