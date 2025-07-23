<script setup lang="ts">
import { ref } from 'vue'
import Button from '../../atoms/Button.vue'

interface LearningPreferences {
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  dailyStudyGoal: number
  streakReminders: boolean
  recommendedLessonsFrequency: 'daily' | 'weekly' | 'bi-weekly'
  autoPlay: boolean
  showHints: boolean
}

const props = defineProps<{
  initialPreferences: LearningPreferences
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', preferences: LearningPreferences): void
  (e: 'reset'): void
}>()

const preferences = ref<LearningPreferences>({ ...props.initialPreferences })

const difficultyLevels = ['beginner', 'intermediate', 'advanced']
const studyGoalOptions = [15, 30, 45, 60, 90, 120]

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
        <font-awesome-icon :icon="['fas', 'graduation-cap']" class="text-purple-600" />
        Learning Preferences
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
            Difficulty Level
          </label>
          <select
            v-model="preferences.difficultyLevel"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option v-for="level in difficultyLevels" :key="level" :value="level">
              {{ level.charAt(0).toUpperCase() + level.slice(1) }}
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Adjusts the complexity of recommended content</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Daily Study Goal (minutes)
          </label>
          <select
            v-model="preferences.dailyStudyGoal"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option v-for="goal in studyGoalOptions" :key="goal" :value="goal">
              {{ goal }} minutes
            </option>
          </select>
          <p class="text-xs text-gray-500 mt-1">Your target study time per day</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Recommended Content Frequency
          </label>
          <select
            v-model="preferences.recommendedLessonsFrequency"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-weekly</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">How often to refresh recommended lessons</p>
        </div>
      </div>

      <div class="space-y-4 pt-6 border-t">
        <h3 class="text-lg font-semibold text-gray-900">Study Aids</h3>
        
        <div class="space-y-3">
          <label class="flex items-center gap-3">
            <input
              v-model="preferences.streakReminders"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Streak Reminders</div>
              <div class="text-sm text-gray-500">Get reminders to maintain your daily study streak</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="preferences.autoPlay"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Auto-play Videos</div>
              <div class="text-sm text-gray-500">Automatically play lesson videos when available</div>
            </div>
          </label>

          <label class="flex items-center gap-3">
            <input
              v-model="preferences.showHints"
              type="checkbox"
              class="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <div>
              <div class="font-medium text-gray-900">Show Hints</div>
              <div class="text-sm text-gray-500">Display helpful hints during quizzes and exercises</div>
            </div>
          </label>
        </div>
      </div>

      <div class="pt-4 border-t">
        <Button type="submit" :loading="isLoading">
          <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
          Save Learning Preferences
        </Button>
      </div>
    </form>
  </div>
</template> 