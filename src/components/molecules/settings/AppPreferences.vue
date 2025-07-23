<script setup lang="ts">
import { ref } from 'vue'
import Button from '../../atoms/Button.vue'

interface AppPreferences {
  theme: 'light' | 'dark' | 'auto'
  dashboardLayout: 'default' | 'compact' | 'detailed'
  navigationStyle: 'sidebar' | 'top' | 'bottom'
  showProgressInNavigation: boolean
  compactMode: boolean
}

const props = defineProps<{
  initialPreferences: AppPreferences
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', preferences: AppPreferences): void
  (e: 'reset'): void
}>()

const preferences = ref<AppPreferences>({ ...props.initialPreferences })

const savePreferences = () => {
  emit('save', preferences.value)
}

const resetToDefaults = () => {
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'cog']" class="text-gray-600" />
        Application Preferences
      </h2>
      <Button variant="outline" @click="resetToDefaults">
        <font-awesome-icon :icon="['fas', 'undo']" class="mr-2" />
        Reset to Defaults
      </Button>
    </div>

    <form @submit.prevent="savePreferences" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <select
            v-model="preferences.theme"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (system)</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Choose your preferred color theme</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Dashboard Layout
          </label>
          <select
            v-model="preferences.dashboardLayout"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="default">Default</option>
            <option value="compact">Compact</option>
            <option value="detailed">Detailed</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Customize how information is displayed</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Navigation Style
          </label>
          <select
            v-model="preferences.navigationStyle"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="sidebar">Sidebar</option>
            <option value="top">Top Navigation</option>
            <option value="bottom">Bottom Navigation (Mobile)</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Choose how you want to navigate the app</p>
        </div>
      </div>

      <div class="space-y-4 pt-6 border-t">
        <h3 class="text-lg font-semibold text-gray-900">Interface Options</h3>
        
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="preferences.showProgressInNavigation"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Show Progress in Navigation</div>
              <div class="text-sm text-gray-500">Display progress indicators in the navigation menu</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="preferences.compactMode"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Compact Mode</div>
              <div class="text-sm text-gray-500">Use less spacing for a more condensed interface</div>
            </div>
          </label>
        </div>
      </div>

      <div class="pt-4 border-t">
        <Button type="submit" :loading="isLoading">
          <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
          Save App Preferences
        </Button>
      </div>
    </form>
  </div>
</template> 