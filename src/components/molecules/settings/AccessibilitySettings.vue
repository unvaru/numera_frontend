<script setup lang="ts">
import { ref } from 'vue'
import Button from '../../atoms/Button.vue'

interface AccessibilitySettings {
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  reduceMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

const props = defineProps<{
  initialSettings: AccessibilitySettings
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', settings: AccessibilitySettings): void
  (e: 'reset'): void
}>()

const settings = ref<AccessibilitySettings>({ ...props.initialSettings })

const fontSizeOptions = ['small', 'medium', 'large', 'extra-large']

const saveSettings = () => {
  emit('save', settings.value)
}

const resetToDefaults = () => {
  emit('reset')
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'universal-access']" class="text-indigo-600" />
        Accessibility Settings
      </h2>
      <Button variant="outline" @click="resetToDefaults">
        <font-awesome-icon :icon="['fas', 'undo']" class="mr-2" />
        Reset to Defaults
      </Button>
    </div>

    <form @submit.prevent="saveSettings" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <select
            v-model="settings.fontSize"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option v-for="size in fontSizeOptions" :key="size" :value="size">
              {{ size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ') }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Adjust text size for better readability</p>
        </div>
      </div>

      <div class="space-y-4 pt-6 border-t">
        <h3 class="text-lg font-semibold text-gray-900">Visual Accessibility</h3>
        
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="settings.highContrast"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">High Contrast Mode</div>
              <div class="text-sm text-gray-500">Increase contrast for better visibility</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.reduceMotion"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Reduce Motion</div>
              <div class="text-sm text-gray-500">Minimize animations and transitions</div>
            </div>
          </label>
        </div>
      </div>

      <div class="space-y-4 pt-6 border-t">
        <h3 class="text-lg font-semibold text-gray-900">Navigation Accessibility</h3>
        
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="settings.keyboardNavigation"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Enhanced Keyboard Navigation</div>
              <div class="text-sm text-gray-500">Improved keyboard shortcuts and focus indicators</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.screenReader"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Screen Reader Optimization</div>
              <div class="text-sm text-gray-500">Enhanced compatibility with screen readers</div>
            </div>
          </label>
        </div>
      </div>

      <div class="pt-4 border-t">
        <Button type="submit" :loading="isLoading">
          <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
          Save Accessibility Settings
        </Button>
      </div>
    </form>
  </div>
</template> 