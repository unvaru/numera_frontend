<script setup lang="ts">
import StudentNavigation from '@/components/organisms/StudentNavigation.vue'
import { useNavigationStore } from '@/stores/navigationStore'

const navigationStore = useNavigationStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <StudentNavigation />
    
    <!-- Main Content -->
    <main 
      :class="[
        navigationStore.isExpanded ? 'lg:ml-72' : 'lg:ml-20',
        'transition-all duration-300 ease-in-out'
      ]"
    >
      <router-view />
    </main>
  </div>
</template> 