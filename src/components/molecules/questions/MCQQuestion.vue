<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { MCQQuestion, MCQAnswer } from '@/types/questions'
import Button from '../../atoms/Button.vue'

interface Props {
  question: MCQQuestion
  showResult?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'answer', answer: MCQAnswer): void
  (e: 'next'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedOptions = ref<string[]>([])
const showFeedback = ref(false)

const correctOptions = computed(() => {
  return props.question.options.filter(opt => opt.isCorrect).map(opt => opt.id)
})

const isAnswerCorrect = computed(() => {
  if (props.question.allowMultipleAnswers) {
    return selectedOptions.value.sort().join(',') === correctOptions.value.sort().join(',')
  } else {
    return selectedOptions.value.length === 1 && correctOptions.value.includes(selectedOptions.value[0])
  }
})

const hasAnswer = computed(() => {
  return selectedOptions.value.length > 0
})

const selectOption = (optionId: string) => {
  if (props.disabled || showFeedback.value) return
  
  if (props.question.allowMultipleAnswers) {
    const index = selectedOptions.value.indexOf(optionId)
    if (index >= 0) {
      selectedOptions.value.splice(index, 1)
    } else {
      selectedOptions.value.push(optionId)
    }
  } else {
    selectedOptions.value = [optionId]
  }
}

const getOptionState = (optionId: string) => {
  const isSelected = selectedOptions.value.includes(optionId)
  const isCorrect = correctOptions.value.includes(optionId)
  
  if (!showFeedback.value) {
    return isSelected ? 'selected' : 'unselected'
  }
  
  if (isSelected && isCorrect) return 'correct'
  if (isSelected && !isCorrect) return 'incorrect'
  if (!isSelected && isCorrect) return 'missed'
  return 'unselected'
}

const getOptionClasses = (optionId: string) => {
  const state = getOptionState(optionId)
  
  const baseClasses = 'w-full text-left px-4 py-3 lg:py-4 rounded-xl border-2 transition-all duration-200 min-h-[60px] lg:min-h-[70px]'
  
  switch (state) {
    case 'selected':
      return `${baseClasses} bg-blue-50 border-blue-500 text-blue-700`
    case 'correct':
      return `${baseClasses} bg-green-50 border-green-500 text-green-700`
    case 'incorrect':
      return `${baseClasses} bg-red-50 border-red-500 text-red-700`
    case 'missed':
      return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-700`
    default:
      return `${baseClasses} border-gray-300 hover:border-gray-400 hover:bg-gray-50`
  }
}

const submitAnswer = () => {
  showFeedback.value = true
  
  const answer: MCQAnswer = {
    questionId: props.question.id,
    questionType: props.question.type,
    selectedOptions: [...selectedOptions.value]
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
  <div class="mcq-question">
    <!-- Question Text -->
    <div class="mb-6">
      <h3 class="text-lg lg:text-xl font-semibold text-gray-900 mb-4">{{ question.text }}</h3>
      
      <!-- Multiple answers instruction -->
      <div v-if="question.allowMultipleAnswers" class="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div class="flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'info-circle']" class="text-amber-600" />
          <p class="text-sm font-medium text-amber-800">
            Multiple answers allowed - select all that apply
          </p>
        </div>
      </div>
      
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

    <!-- Question Image -->
    <div v-if="question.imageUrl" class="mb-6">
      <img
        :src="question.imageUrl"
        :alt="question.text"
        class="w-full max-w-lg mx-auto rounded-lg shadow-sm"
      />
    </div>

    <!-- Options -->
    <div class="mb-6 space-y-3 lg:space-y-4">
      <button
        v-for="option in question.options"
        :key="option.id"
        @click="selectOption(option.id)"
        :disabled="disabled"
        :class="getOptionClasses(option.id)"
      >
        <div class="flex items-center gap-3">
          <!-- Option indicator -->
          <div class="flex-shrink-0">
            <div
              v-if="question.allowMultipleAnswers"
              class="w-5 h-5 lg:w-6 lg:h-6 rounded border-2 flex items-center justify-center"
              :class="selectedOptions.includes(option.id) ? 'border-current bg-current' : 'border-gray-400'"
            >
              <font-awesome-icon 
                v-if="selectedOptions.includes(option.id)"
                :icon="['fas', 'check']"
                class="text-white text-sm"
              />
            </div>
            <div
              v-else
              class="w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center"
              :class="selectedOptions.includes(option.id) ? 'border-current' : 'border-gray-400'"
            >
              <div
                v-if="selectedOptions.includes(option.id)"
                class="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-current"
              ></div>
            </div>
          </div>
          
          <!-- Option content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start gap-2">
              <span class="font-medium text-lg lg:text-xl flex-shrink-0">{{ option.id }}.</span>
              <span class="text-sm lg:text-base leading-relaxed">{{ option.text }}</span>
            </div>
          </div>
          
          <!-- Feedback icon -->
          <div v-if="showFeedback" class="flex-shrink-0">
            <font-awesome-icon 
              v-if="getOptionState(option.id) === 'correct'"
              :icon="['fas', 'check-circle']"
              class="text-green-600 text-xl lg:text-2xl"
            />
            <font-awesome-icon 
              v-else-if="getOptionState(option.id) === 'incorrect'"
              :icon="['fas', 'times-circle']"
              class="text-red-600 text-xl lg:text-2xl"
            />
            <font-awesome-icon 
              v-else-if="getOptionState(option.id) === 'missed'"
              :icon="['fas', 'exclamation-circle']"
              class="text-yellow-600 text-xl lg:text-2xl"
            />
          </div>
        </div>
      </button>
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
        
        <!-- Show correct answers -->
        <div v-if="!isAnswerCorrect" class="mb-3">
          <p class="text-sm font-medium text-gray-700 mb-1">Correct answer(s):</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="correctOption in question.options.filter(opt => opt.isCorrect)"
              :key="correctOption.id"
              class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
            >
              {{ correctOption.id }}. {{ correctOption.text }}
            </span>
          </div>
        </div>
        
        <!-- Explanation -->
        <div v-if="question.explanation" class="pt-3 border-t border-gray-200">
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
        :disabled="!hasAnswer || disabled"
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
  .mcq-question button {
    min-height: 60px;
  }
  
  .mcq-question .flex.items-center.gap-3 {
    align-items: flex-start;
  }
}

/* Smooth transitions for interactive elements */
.mcq-question button {
  transition: all 0.2s ease-in-out;
}

.mcq-question button:active {
  transform: scale(0.98);
}

/* Better text wrapping for long options */
.mcq-question .text-sm,
.mcq-question .text-base {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style> 