<script setup lang="ts">
import { ref } from 'vue'
import Button from '../../atoms/Button.vue'

interface PrivacySettings {
  profileVisibility: 'public' | 'private'
  progressSharing: boolean
  achievementSharing: boolean
  dataCollection: boolean
  analyticsTracking: boolean
}

const props = defineProps<{
  initialSettings: PrivacySettings
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', settings: PrivacySettings): void
  (e: 'reset'): void
  (e: 'exportData'): void
  (e: 'deleteAccount'): void
}>()

const settings = ref<PrivacySettings>({ ...props.initialSettings })
const showDeleteConfirmation = ref(false)

const saveSettings = () => {
  emit('save', settings.value)
}

const resetToDefaults = () => {
  emit('reset')
}

const exportData = () => {
  emit('exportData')
}

const deleteAccount = () => {
  emit('deleteAccount')
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'lock']" class="text-red-600" />
        Privacy & Data
      </h2>
      <Button variant="outline" @click="resetToDefaults">
        <font-awesome-icon :icon="['fas', 'undo']" class="mr-2" />
        Reset to Defaults
      </Button>
    </div>

    <form @submit.prevent="saveSettings" class="space-y-6">
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Profile Privacy</h3>
        
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="settings.progressSharing"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Share Progress</div>
              <div class="text-sm text-gray-500">Allow teachers to view your learning progress</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.achievementSharing"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Share Achievements</div>
              <div class="text-sm text-gray-500">Display badges and certificates on your profile</div>
            </div>
          </label>
        </div>
      </div>

      <div class="space-y-4 pt-6 border-t">
        <h3 class="text-lg font-semibold text-gray-900">Data Collection</h3>
        
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="settings.dataCollection"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Learning Data Collection</div>
              <div class="text-sm text-gray-500">Allow collection of learning data to improve recommendations</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.analyticsTracking"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Analytics Tracking</div>
              <div class="text-sm text-gray-500">Help us improve the platform with anonymous usage analytics</div>
            </div>
          </label>
        </div>
      </div>

      <div class="pt-6 border-t">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div class="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" @click="exportData">
            <font-awesome-icon :icon="['fas', 'download']" class="mr-2" />
            Export My Data
          </Button>
          <Button 
            variant="outline" 
            @click="showDeleteConfirmation = true" 
            class="text-red-600 border-red-300 hover:bg-red-50"
          >
            <font-awesome-icon :icon="['fas', 'trash']" class="mr-2" />
            Delete Account
          </Button>
        </div>
      </div>

      <div class="pt-4 border-t">
        <Button type="submit" :loading="isLoading">
          <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
          Save Privacy Settings
        </Button>
      </div>
    </form>

    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center gap-3 mb-4">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-2xl text-red-600" />
          <h3 class="text-lg font-bold text-gray-900">Delete Account</h3>
        </div>
        
        <p class="text-gray-600 mb-6">
          Are you sure you want to delete your account? This action cannot be undone. All your progress, certificates, and data will be permanently lost.
        </p>
        
        <div class="flex gap-3">
          <Button
            variant="outline"
            @click="showDeleteConfirmation = false"
            class="flex-1"
          >
            Cancel
          </Button>
          <Button
            @click="deleteAccount"
            :loading="isLoading"
            class="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  </div>
</template> 