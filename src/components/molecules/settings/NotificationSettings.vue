<script setup lang="ts">
import { ref } from 'vue'
import Button from '../../atoms/Button.vue'

interface NotificationSettings {
  studyReminders: boolean
  quizDeadlines: boolean
  achievementNotifications: boolean
  progressUpdates: boolean
  emailNotifications: boolean
  weeklyProgress: boolean
  newContent: boolean
}

const props = defineProps<{
  initialSettings: NotificationSettings
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', settings: NotificationSettings): void
  (e: 'reset'): void
}>()

const settings = ref<NotificationSettings>({ ...props.initialSettings })

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
        <font-awesome-icon :icon="['fas', 'bell']" class="text-yellow-600" />
        Notification Preferences
      </h2>
      <Button variant="outline" @click="resetToDefaults">
        <font-awesome-icon :icon="['fas', 'undo']" class="mr-2" />
        Reset to Defaults
      </Button>
    </div>

    <form @submit.prevent="saveSettings" class="space-y-6">
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Learning Notifications</h3>
        
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="settings.studyReminders"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Study Reminders</div>
              <div class="text-sm text-gray-500">Get reminders to maintain your study streak</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.quizDeadlines"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Quiz Deadlines</div>
              <div class="text-sm text-gray-500">Notifications about upcoming quiz deadlines</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.achievementNotifications"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Achievement Notifications</div>
              <div class="text-sm text-gray-500">Celebrate when you earn badges and certificates</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.progressUpdates"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Progress Updates</div>
              <div class="text-sm text-gray-500">Weekly summary of your learning progress</div>
            </div>
          </label>
        </div>
      </div>

      <div class="space-y-4 pt-6 border-t">
        <h3 class="text-lg font-semibold text-gray-900">Email Notifications</h3>
        
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="settings.emailNotifications"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Email Notifications</div>
              <div class="text-sm text-gray-500">Receive important updates via email</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.weeklyProgress"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Weekly Progress Reports</div>
              <div class="text-sm text-gray-500">Weekly email with your learning summary</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="settings.newContent"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">New Content Alerts</div>
              <div class="text-sm text-gray-500">Get notified when new lessons or quizzes are added</div>
            </div>
          </label>
        </div>
      </div>

      <div class="pt-4 border-t">
        <Button type="submit" :loading="isLoading">
          <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
          Save Notification Settings
        </Button>
      </div>
    </form>
  </div>
</template> 