<script setup lang="ts">
interface Tab {
  id: string
  name: string
  icon: string[]
}

const props = defineProps<{
  tabs: Tab[]
  activeTab: string
}>()

const emit = defineEmits<{
  (e: 'tabChange', tabId: string): void
}>()
</script>

<template>
  <div class="settings-content">
    <div class="max-w-[1400px] mx-auto">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div class="flex items-center gap-3">
          <font-awesome-icon :icon="['fas', 'cog']" class="text-2xl text-blue-600" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
            <p class="text-sm text-gray-500">Manage your account preferences and settings</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-4 sticky top-8">
            <nav class="space-y-2">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                @click="emit('tabChange', tab.id)"
                class="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors"
                :class="activeTab === tab.id 
                  ? 'bg-green-50 text-green-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
              >
                <font-awesome-icon :icon="tab.icon" class="text-sm" />
                <span class="text-sm">{{ tab.name }}</span>
              </button>
            </nav>
          </div>
        </div>

        <!-- Content Area -->
        <div class="lg:col-span-3">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styles for better visual hierarchy */
.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

/* Mobile spacing to avoid overlap with fixed navigation */
.settings-content {
  /* Desktop spacing */
  padding: 2rem 1rem;
}

/* Mobile spacing adjustments */
@media (max-width: 1024px) {
  .settings-content {
    /* Mobile: account for fixed header (60px) and bottom nav (80px) */
    padding: 1rem;
    padding-top: calc(60px + 1rem); /* Fixed header height + padding */
    padding-bottom: calc(80px + 1rem + env(safe-area-inset-bottom, 0px)); /* Fixed bottom nav + padding + safe area */
  }
}

/* Ensure content doesn't get hidden behind mobile navigation */
@media (max-width: 640px) {
  .settings-content {
    /* Small mobile: more precise spacing */
    padding-top: calc(64px + 0.5rem); /* Slightly larger header on small screens */
    padding-bottom: calc(84px + 0.5rem + env(safe-area-inset-bottom, 0px)); /* Slightly larger bottom nav */
  }
}
</style> 