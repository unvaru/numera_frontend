<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TrueFalseQuestion, TrueFalseAnswer } from '@/types/questions'
import Button from '../../atoms/Button.vue'

interface Props {
  question: TrueFalseQuestion
  showResult?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'answer', answer: TrueFalseAnswer): void
  (e: 'next'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedAnswer = ref<boolean | null>(null)
const justification = ref('')
const showFeedback = ref(false)

const isAnswerCorrect = computed(() => {
  return selectedAnswer.value === props.question.correctAnswer
})

const hasAnswer = computed(() => {
  return selectedAnswer.value !== null
})

const hasRequiredJustification = computed(() => {
  if (!props.question.justificationRequired) return true
  return justification.value.trim() !== ''
})

const canSubmit = computed(() => {
  return hasAnswer.value && hasRequiredJustification.value
})

const selectAnswer = (value: boolean) => {
  if (props.disabled || showFeedback.value) return
  selectedAnswer.value = value
}

const submitAnswer = () => {
  showFeedback.value = true
  
  const answer: TrueFalseAnswer = {
    questionId: props.question.id,
    questionType: props.question.type,
    answer: selectedAnswer.value!,
    justification: props.question.justificationRequired ? justification.value : undefined
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
  <div class="true-false-question">
    <!-- Question Text -->
    <div class="mb-6">
      <h3 class="text-lg lg:text-xl font-semibold text-gray-900 mb-4">{{ question.text }}</h3>
      
      <!-- Hints -->
      <div v-if="question.hints && question.hints.length > 0" class="mb-4 p-3 lg:p-4 bg-blue-50 rounded-lg">
        <div class="flex items-start gap-2">
          <font-awesome-icon :icon="['fas', 'lightbulb']" class="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-sm font-medium text-blue-900 mb-1">Hints:</p>
            <ul class="text-sm text-blue-800 space-y-1">
              <li v-for="hint in question.hints" :key="hint">• {{ hint }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Statement -->
    <div class="mb-6 p-4 lg:p-6 bg-gray-50 rounded-lg">
      <h4 class="font-medium text-gray-900 mb-3">Statement:</h4>
      <p class="text-base lg:text-lg text-gray-800 leading-relaxed">{{ question.statement }}</p>
    </div>

    <!-- Answer Options -->
    <div class="mb-6">
      <h4 class="font-medium text-gray-900 mb-4">Select your answer:</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        <!-- True Option -->
        <button
          @click="selectAnswer(true)"
          :disabled="disabled"
          :class="[
            'flex items-center justify-center gap-3 p-4 lg:p-6 rounded-xl border-2 transition-all duration-200 min-h-[60px] lg:min-h-[80px]',
            selectedAnswer === true
              ? showFeedback
                ? isAnswerCorrect
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-red-50 border-red-500 text-red-700'
                : 'bg-blue-50 border-blue-500 text-blue-700'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          ]"
        >
          <div 
            class="w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
            :class="selectedAnswer === true ? 'border-current' : 'border-gray-400'"
          >
            <div
              v-if="selectedAnswer === true"
              class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-current"
            ></div>
          </div>
          <span class="text-lg lg:text-xl font-semibold">TRUE</span>
          <font-awesome-icon 
            v-if="showFeedback && selectedAnswer === true"
            :icon="['fas', isAnswerCorrect ? 'check-circle' : 'times-circle']"
            class="text-xl lg:text-2xl"
          />
        </button>

        <!-- False Option -->
        <button
          @click="selectAnswer(false)"
          :disabled="disabled"
          :class="[
            'flex items-center justify-center gap-3 p-4 lg:p-6 rounded-xl border-2 transition-all duration-200 min-h-[60px] lg:min-h-[80px]',
            selectedAnswer === false
              ? showFeedback
                ? isAnswerCorrect
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-red-50 border-red-500 text-red-700'
                : 'bg-blue-50 border-blue-500 text-blue-700'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          ]"
        >
          <div 
            class="w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
            :class="selectedAnswer === false ? 'border-current' : 'border-gray-400'"
          >
            <div
              v-if="selectedAnswer === false"
              class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-current"
            ></div>
          </div>
          <span class="text-lg lg:text-xl font-semibold">FALSE</span>
          <font-awesome-icon 
            v-if="showFeedback && selectedAnswer === false"
            :icon="['fas', isAnswerCorrect ? 'check-circle' : 'times-circle']"
            class="text-xl lg:text-2xl"
          />
        </button>
      </div>
    </div>

    <!-- Justification (if required) -->
    <div v-if="question.justificationRequired" class="mb-6">
      <label class="block text-sm lg:text-base font-medium text-gray-700 mb-2">
        Explain your reasoning:
        <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="justification"
        :disabled="disabled"
        class="w-full p-3 lg:p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        rows="4"
        placeholder="Provide a brief explanation for your answer..."
      ></textarea>
    </div>

    <!-- Feedback -->
    <div v-if="showFeedback" class="mb-6">
      <div 
        class="p-4 lg:p-6 rounded-lg"
        :class="isAnswerCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
      >
        <div class="flex items-center gap-2 mb-3">
          <font-awesome-icon 
            :icon="['fas', isAnswerCorrect ? 'check-circle' : 'times-circle']" 
            :class="isAnswerCorrect ? 'text-green-600' : 'text-red-600'"
            class="text-xl"
          />
          <h4 class="font-semibold text-lg" :class="isAnswerCorrect ? 'text-green-900' : 'text-red-900'">
            {{ isAnswerCorrect ? 'Correct!' : 'Incorrect' }}
          </h4>
        </div>
        
        <div class="space-y-3 text-sm lg:text-base">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="font-medium text-gray-700">Your answer:</span>
            <span 
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="selectedAnswer ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'"
            >
              {{ selectedAnswer ? 'TRUE' : 'FALSE' }}
            </span>
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
            <span class="font-medium text-gray-700">Correct answer:</span>
            <span 
              class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
            >
              {{ question.correctAnswer ? 'TRUE' : 'FALSE' }}
            </span>
          </div>
          
          <!-- Show justification if provided -->
          <div v-if="question.justificationRequired && justification" class="mt-3 pt-3 border-t border-gray-200">
            <p class="font-medium text-gray-700 mb-1">Your reasoning:</p>
            <p class="text-gray-600 italic">{{ justification }}</p>
          </div>
        </div>
        
        <!-- Explanation -->
        <div v-if="question.explanation" class="mt-4 pt-4 border-t border-gray-200">
          <p class="text-sm lg:text-base text-gray-700">
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
        :disabled="!canSubmit || disabled"
        @click="submitAnswer"
        class="w-full sm:w-auto"
      >
        <font-awesome-icon :icon="['fas', 'check']" class="mr-2" />
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
/* Ensure proper touch targets on mobile */
@media (max-width: 640px) {
  .true-false-question button {
    min-height: 60px;
  }
}

/* Smooth transitions for interactive elements */
.true-false-question button {
  transition: all 0.2s ease-in-out;
}

.true-false-question button:active {
  transform: scale(0.98);
}
</style> 