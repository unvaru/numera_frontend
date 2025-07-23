import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const isExpanded = ref(true)

  function toggleSidebar() {
    isExpanded.value = !isExpanded.value
  }

  return {
    isExpanded,
    toggleSidebar
  }
}) 