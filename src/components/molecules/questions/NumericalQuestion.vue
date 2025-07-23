<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { NumericalQuestion, NumericalAnswer } from '@/types/questions'
import Input from '../../atoms/Input.vue'
import Button from '../../atoms/Button.vue'

interface Props {
  question: NumericalQuestion
  showResult?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'answer', answer: NumericalAnswer): void
  (e: 'next'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userAnswer = ref<string>('')
const workingShown = ref('')
const showFeedback = ref(false)

const numericAnswer = computed(() => {
  const parsed = parseFloat(userAnswer.value)
  return isNaN(parsed) ? null : parsed
})

const isAnswerCorrect = computed(() => {
  if (numericAnswer.value === null) return false
  return Math.abs(numericAnswer.value - props.question.correctAnswer) <= props.question.tolerance
})

const score = computed(() => {
  return isAnswerCorrect.value ? 100 : 0
})

const hasAnswer = computed(() => {
  return userAnswer.value !== '' && numericAnswer.value !== null
})

const submitAnswer = () => {
  showFeedback.value = true
  
  const answer: NumericalAnswer = {
    questionId: props.question.id,
    questionType: props.question.type,
    answer: numericAnswer.value || 0,
    workingShown: workingShown.value || undefined
  }
  
  emit('answer', answer)
}

const nextQuestion = () => {
  emit('next')
}

// Watch for disabled state to show results
watch(() => props.disabled, (disabled) => {
  if (disabled) {
    showFeedback.value = true
  }
})
</script>

<template>
  <div class="numerical-question">
    <!-- Question Text -->
    <div class="mb-6">
      <h3 class="text-lg lg:text-xl font-semibold text-gray-900 mb-4">{{ question.text }}</h3>
      
      <!-- Calculation Description -->
      <div class="p-4 bg-blue-50 rounded-lg mb-4">
        <h4 class="font-medium text-blue-900 mb-2">Calculate:</h4>
        <p class="text-blue-800">{{ question.calculation }}</p>
      </div>
      
      <!-- Hints -->
      <div v-if="question.hints && question.hints.length > 0" class="mb-4 p-3 bg-yellow-50 rounded-lg">
        <div class="flex items-start gap-2">
          <font-awesome-icon :icon="['fas', 'lightbulb']" class="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-sm font-medium text-yellow-900 mb-1">Hints:</p>
            <ul class="text-sm text-yellow-800 space-y-1">
              <li v-for="hint in question.hints" :key="hint">• {{ hint }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Provided Data -->
    <div class="mb-6 p-4 lg:p-6 bg-gray-50 rounded-lg">
      <h4 class="font-medium text-gray-900 mb-3">Given Information:</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(value, key) in question.providedData"
          :key="key"
          class="flex justify-between items-center p-3 bg-white rounded border"
        >
          <span class="font-medium text-gray-700">{{ key }}:</span>
          <span class="text-gray-900">{{ value }}</span>
        </div>
      </div>
    </div>

    <!-- Working/Steps (if required) -->
    <div v-if="question.showWorkingRequired" class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Show Your Working (Optional):
      </label>
      <textarea
        v-model="workingShown"
        :disabled="disabled"
        class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows="4"
        placeholder="Show your calculation steps here..."
      ></textarea>
    </div>

    <!-- Answer Input -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Your Answer:
      </label>
      <div class="flex items-center gap-3">
        <span v-if="question.unit && question.unit !== '%'" class="text-lg font-medium text-gray-600">
          {{ question.unit }}
        </span>
                 <Input
           v-model="userAnswer"
           type="number"
          step="0.01"
          :disabled="disabled"
          :class="{
            'border-green-500 bg-green-50': showFeedback && isAnswerCorrect,
            'border-red-500 bg-red-50': showFeedback && !isAnswerCorrect && hasAnswer
          }"
          class="w-48 text-lg text-center font-medium"
          placeholder="0.00"
        />
        <span v-if="question.unit === '%'" class="text-lg font-medium text-gray-600">
          {{ question.unit }}
        </span>
      </div>
    </div>

    <!-- Feedback -->
    <div v-if="showFeedback" class="mb-6">
      <div 
        class="p-4 rounded-lg"
        :class="isAnswerCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
      >
        <div class="flex items-center gap-2 mb-3">
          <font-awesome-icon 
            :icon="['fas', isAnswerCorrect ? 'check-circle' : 'times-circle']" 
            :class="isAnswerCorrect ? 'text-green-600' : 'text-red-600'"
          />
          <h4 class="font-semibold" :class="isAnswerCorrect ? 'text-green-900' : 'text-red-900'">
            {{ isAnswerCorrect ? 'Correct!' : 'Incorrect' }}
          </h4>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-gray-700">Your answer:</span>
            <span class="font-medium">
              {{ question.unit && question.unit !== '%' ? question.unit : '' }}{{ userAnswer }}{{ question.unit === '%' ? '%' : '' }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-gray-700">Correct answer:</span>
            <span class="font-medium text-green-700">
              {{ question.unit && question.unit !== '%' ? question.unit : '' }}{{ question.correctAnswer }}{{ question.unit === '%' ? '%' : '' }}
            </span>
          </div>
          <div v-if="!isAnswerCorrect" class="flex items-center justify-between">
            <span class="text-gray-700">Tolerance:</span>
            <span class="text-gray-600">±{{ question.tolerance }}</span>
          </div>
        </div>
        
        <!-- Explanation -->
        <div v-if="question.explanation" class="mt-3 pt-3 border-t border-gray-200">
          <p class="text-sm text-gray-700">
            <strong>Explanation:</strong> {{ question.explanation }}
          </p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-end">
      <Button
        v-if="!showFeedback"
        variant="primary"
        :disabled="!hasAnswer || disabled"
        @click="submitAnswer"
        class="w-full sm:w-auto"
      >
        <font-awesome-icon :icon="['fas', 'calculator']" class="mr-2" />
        Submit Answer
      </Button>
      
      <Button
        v-else
        variant="primary"
        @click="nextQuestion"
        class="w-full sm:w-auto"
      >
        <font-awesome-icon :icon="['fas', 'arrow-right']" class="mr-2" />
        Next Question
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Ensure proper number input styling */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

@media (max-width: 640px) {
  .numerical-question input[type="number"] {
    width: 100%;
    max-width: 200px;
  }
}
</style> 