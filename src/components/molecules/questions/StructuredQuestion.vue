<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { StructuredQuestion, StructuredAnswer } from '@/types/questions'
import Button from '../../atoms/Button.vue'
import Input from '../../atoms/Input.vue'

interface Props {
  question: StructuredQuestion
  showResult?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'answer', answer: StructuredAnswer): void
  (e: 'next'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const partAnswers = ref<{ [key: string]: any }>({})
const showFeedback = ref(false)
const currentPartIndex = ref(0)

const currentPart = computed(() => props.question.parts[currentPartIndex.value])
const isLastPart = computed(() => currentPartIndex.value === props.question.parts.length - 1)
const isFirstPart = computed(() => currentPartIndex.value === 0)

const hasAnswerForPart = (partId: string, subType: string): boolean => {
  const answer = partAnswers.value[partId]
  if (!answer) return false
  
  switch (subType) {
    case 'mcq':
      return answer.selectedOption !== undefined && answer.selectedOption !== null
    case 'numerical':
      return answer.value !== undefined && answer.value !== null && answer.value !== ''
    case 'text':
      return answer.text !== undefined && answer.text.trim() !== ''
    case 'calculation':
      return answer.result !== undefined && answer.result !== null && answer.result !== ''
    default:
      return false
  }
}

const allPartsAnswered = computed(() => {
  return props.question.parts.every(part => 
    hasAnswerForPart(part.id, part.subType)
  )
})

const canGoNext = computed(() => {
  return hasAnswerForPart(currentPart.value.id, currentPart.value.subType)
})

const selectMCQOption = (partId: string, optionId: string) => {
  if (props.disabled || showFeedback.value) return
  
  if (!partAnswers.value[partId]) {
    partAnswers.value[partId] = {}
  }
  partAnswers.value[partId].selectedOption = optionId
}

const updateAnswer = (partId: string, field: string, value: any) => {
  if (props.disabled || showFeedback.value) return
  
  if (!partAnswers.value[partId]) {
    partAnswers.value[partId] = {}
  }
  partAnswers.value[partId][field] = value
}

const nextPart = () => {
  if (!isLastPart.value) {
    currentPartIndex.value++
  }
}

const previousPart = () => {
  if (!isFirstPart.value) {
    currentPartIndex.value--
  }
}

const submitAnswer = () => {
  showFeedback.value = true
  
  const answer: StructuredAnswer = {
    questionId: props.question.id,
    questionType: props.question.type,
    partAnswers: props.question.parts.map(part => ({
      partId: part.id,
      answer: partAnswers.value[part.id] || {}
    }))
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
  <div class="structured-question">
    <!-- Question Header -->
    <div class="mb-6">
      <h3 class="text-lg lg:text-xl font-semibold text-gray-900 mb-4">{{ question.text }}</h3>
      
      <!-- Progress Indicator -->
      <div class="mb-4">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Question Progress</span>
          <span>Part {{ currentPartIndex + 1 }} of {{ question.parts.length }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${((currentPartIndex + 1) / question.parts.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Total Points -->
      <div class="text-sm text-gray-600">
        Total Points: {{ question.totalPoints }}
      </div>
    </div>

    <!-- Part Navigation (Mobile) -->
    <div class="mb-6 lg:hidden">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="(part, index) in question.parts"
          :key="part.id"
          @click="currentPartIndex = index"
          :class="[
            'flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            currentPartIndex === index
              ? 'bg-blue-600 text-white'
              : hasAnswerForPart(part.id, part.subType)
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-600'
          ]"
        >
          {{ part.partNumber }}
        </button>
      </div>
    </div>

    <!-- Desktop Part Navigation -->
    <div class="hidden lg:block mb-6">
      <div class="grid grid-cols-auto gap-3" :style="{ gridTemplateColumns: `repeat(${question.parts.length}, minmax(0, 1fr))` }">
        <button
          v-for="(part, index) in question.parts"
          :key="part.id"
          @click="currentPartIndex = index"
          :class="[
            'p-3 rounded-lg text-sm font-medium transition-colors border-2',
            currentPartIndex === index
              ? 'bg-blue-600 text-white border-blue-600'
              : hasAnswerForPart(part.id, part.subType)
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          ]"
        >
          <div class="font-semibold">{{ part.partNumber }}</div>
          <div class="text-xs mt-1">{{ part.points }} pts</div>
        </button>
      </div>
    </div>

    <!-- Current Part -->
    <div class="mb-6 p-4 lg:p-6 bg-white rounded-xl border border-gray-200">
      <div class="flex items-start justify-between mb-4">
        <h4 class="text-lg font-semibold text-gray-900">
          {{ currentPart.partNumber }} ({{ currentPart.points }} points)
        </h4>
        <span 
          class="px-2 py-1 text-xs font-medium rounded-full"
          :class="{
            'bg-blue-100 text-blue-800': currentPart.subType === 'mcq',
            'bg-green-100 text-green-800': currentPart.subType === 'numerical',
            'bg-purple-100 text-purple-800': currentPart.subType === 'text',
            'bg-orange-100 text-orange-800': currentPart.subType === 'calculation'
          }"
        >
          {{ currentPart.subType.toUpperCase() }}
        </span>
      </div>
      
      <p class="text-gray-700 mb-4">{{ currentPart.text }}</p>

      <!-- MCQ Sub-question -->
      <div v-if="currentPart.subType === 'mcq'" class="space-y-3">
        <button
          v-for="option in currentPart.data?.options || []"
          :key="option.id"
          @click="selectMCQOption(currentPart.id, option.id)"
          :disabled="disabled"
          :class="[
            'w-full text-left px-4 py-3 rounded-lg border transition-all duration-200',
            partAnswers[currentPart.id]?.selectedOption === option.id
              ? 'bg-blue-50 border-blue-500 text-blue-700'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          ]"
        >
          <div class="flex items-center">
            <span class="font-medium mr-3">{{ option.id }}.</span>
            {{ option.text }}
          </div>
        </button>
      </div>

      <!-- Numerical Sub-question -->
      <div v-else-if="currentPart.subType === 'numerical'" class="space-y-4">
        <div class="flex items-center gap-3">
          <span v-if="currentPart.data?.unit && currentPart.data.unit !== '%'" class="text-lg font-medium text-gray-600">
            {{ currentPart.data.unit }}
          </span>
          <Input
            :model-value="partAnswers[currentPart.id]?.value || ''"
            @update:model-value="updateAnswer(currentPart.id, 'value', $event)"
            type="number"
            step="0.01"
            :disabled="disabled"
            class="w-48 text-lg text-center font-medium"
            placeholder="0.00"
          />
          <span v-if="currentPart.data?.unit === '%'" class="text-lg font-medium text-gray-600">
            {{ currentPart.data.unit }}
          </span>
        </div>
      </div>

      <!-- Text Sub-question -->
      <div v-else-if="currentPart.subType === 'text'" class="space-y-4">
        <textarea
          :value="partAnswers[currentPart.id]?.text || ''"
          @input="updateAnswer(currentPart.id, 'text', ($event.target as HTMLTextAreaElement).value)"
          :disabled="disabled"
          class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="4"
          placeholder="Enter your answer here..."
        ></textarea>
      </div>

      <!-- Calculation Sub-question -->
      <div v-else-if="currentPart.subType === 'calculation'" class="space-y-4">
        <div class="p-4 bg-gray-50 rounded-lg">
          <h5 class="font-medium text-gray-900 mb-2">Given Data:</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="(value, key) in currentPart.data?.providedData || {}"
              :key="key"
              class="flex justify-between items-center p-2 bg-white rounded border text-sm"
            >
              <span class="font-medium text-gray-700">{{ key }}:</span>
              <span class="text-gray-900">{{ value }}</span>
            </div>
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Your Calculation Result:
          </label>
          <Input
            :model-value="partAnswers[currentPart.id]?.result || ''"
            @update:model-value="updateAnswer(currentPart.id, 'result', $event)"
            type="number"
            step="0.01"
            :disabled="disabled"
            class="w-48 text-lg text-center font-medium"
            placeholder="0.00"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Show Your Working (Optional):
          </label>
          <textarea
            :value="partAnswers[currentPart.id]?.working || ''"
            @input="updateAnswer(currentPart.id, 'working', ($event.target as HTMLTextAreaElement).value)"
            :disabled="disabled"
            class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Show your calculation steps..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Navigation & Submit -->
    <div class="flex flex-col sm:flex-row gap-3 justify-between">
      <div class="flex gap-3">
        <Button
          v-if="!isFirstPart"
          variant="outline"
          @click="previousPart"
          class="w-full sm:w-auto"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
          Previous
        </Button>
      </div>

      <div class="flex gap-3">
        <Button
          v-if="!isLastPart && !showFeedback"
          variant="outline"
          :disabled="!canGoNext"
          @click="nextPart"
          class="w-full sm:w-auto"
        >
          Next
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="ml-2" />
        </Button>

        <Button
          v-if="isLastPart && !showFeedback"
          variant="primary"
          :disabled="!allPartsAnswered || disabled"
          @click="submitAnswer"
          class="w-full sm:w-auto"
        >
          <font-awesome-icon :icon="['fas', 'check']" class="mr-2" />
          Submit All Parts
        </Button>

        <Button
          v-if="showFeedback"
          variant="primary"
          @click="nextQuestion"
          class="w-full sm:w-auto"
        >
          <font-awesome-icon :icon="['fas', 'arrow-right']" class="mr-2" />
          Next Question
        </Button>
      </div>
    </div>

    <!-- Feedback (shown after submission) -->
    <div v-if="showFeedback" class="mt-6 p-4 lg:p-6 bg-blue-50 rounded-lg">
      <h4 class="font-semibold text-blue-900 mb-3">Answer Submitted</h4>
      <p class="text-blue-800 text-sm">
        Your structured answer has been recorded. The detailed feedback will be available after the quiz is completed.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Ensure proper spacing for mobile */
@media (max-width: 640px) {
  .structured-question .grid {
    gap: 0.5rem;
  }
}

/* Custom grid for dynamic columns */
.grid-cols-auto {
  display: grid;
}

/* Smooth transitions */
.structured-question button {
  transition: all 0.2s ease-in-out;
}

.structured-question button:active {
  transform: scale(0.98);
}
</style> 