<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FillInBlankQuestion, FillInBlankAnswer } from '@/types/questions'
import Input from '../../atoms/Input.vue'
import Button from '../../atoms/Button.vue'

interface Props {
  question: FillInBlankQuestion
  showResult?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'answer', answer: FillInBlankAnswer): void
  (e: 'next'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const answers = ref<{ [key: number]: string }>({})
const showFeedback = ref(false)

// Parse template and create input fields
const templateParts = computed(() => {
  const parts: Array<{ type: 'text' | 'blank'; content: string; blankId?: number }> = []
  const template = props.question.template
  let currentIndex = 0
  
  // Find all placeholders like {0}, {1}, etc.
  const regex = /\{(\d+)\}/g
  let match
  
  while ((match = regex.exec(template)) !== null) {
    // Add text before the placeholder
    if (match.index > currentIndex) {
      parts.push({
        type: 'text',
        content: template.substring(currentIndex, match.index)
      })
    }
    
    // Add the blank
    parts.push({
      type: 'blank',
      content: match[0],
      blankId: parseInt(match[1])
    })
    
    currentIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (currentIndex < template.length) {
    parts.push({
      type: 'text',
      content: template.substring(currentIndex)
    })
  }
  
  return parts
})

const isAnswerCorrect = (blankId: number, answer: string): boolean => {
  const blank = props.question.blanks.find(b => b.id === blankId)
  if (!blank) return false
  
  const userAnswer = blank.caseSensitive ? answer : answer.toLowerCase()
  const acceptedAnswers = blank.caseSensitive 
    ? blank.acceptedAnswers 
    : blank.acceptedAnswers.map(a => a.toLowerCase())
  
  if (blank.isNumerical && blank.tolerance) {
    const numAnswer = parseFloat(answer)
    const correctNums = blank.acceptedAnswers.map(a => parseFloat(a))
    return correctNums.some(correct => 
      Math.abs(numAnswer - correct) <= blank.tolerance!
    )
  }
  
  return acceptedAnswers.includes(userAnswer)
}

const allAnswered = computed(() => {
  return props.question.blanks.every(blank => 
    answers.value[blank.id] && answers.value[blank.id].trim() !== ''
  )
})

const score = computed(() => {
  let correct = 0
  props.question.blanks.forEach(blank => {
    if (answers.value[blank.id] && isAnswerCorrect(blank.id, answers.value[blank.id])) {
      correct++
    }
  })
  return Math.round((correct / props.question.blanks.length) * 100)
})

const submitAnswer = () => {
  showFeedback.value = true
  
  const answer: FillInBlankAnswer = {
    questionId: props.question.id,
    questionType: props.question.type,
    answers: props.question.blanks.map(blank => ({
      blankId: blank.id,
      value: answers.value[blank.id] || ''
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
  <div class="fill-in-blank-question">
    <!-- Question Text -->
    <div class="mb-6">
      <h3 class="text-lg lg:text-xl font-semibold text-gray-900 mb-4">{{ question.text }}</h3>
      
      <!-- Hints -->
      <div v-if="question.hints && question.hints.length > 0" class="mb-4 p-3 bg-blue-50 rounded-lg">
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

    <!-- Template with Blanks -->
    <div class="mb-6 p-4 lg:p-6 bg-gray-50 rounded-lg">
      <div class="text-base lg:text-lg leading-relaxed">
        <template v-for="(part, index) in templateParts" :key="index">
          <span v-if="part.type === 'text'" class="text-gray-900">{{ part.content }}</span>
          <span v-else-if="part.type === 'blank'" class="inline-block mx-1">
            <Input
              v-model="answers[part.blankId!]"
              :disabled="disabled"
              :class="{
                'border-green-500 bg-green-50': showFeedback && isAnswerCorrect(part.blankId!, answers[part.blankId!] || ''),
                'border-red-500 bg-red-50': showFeedback && answers[part.blankId!] && !isAnswerCorrect(part.blankId!, answers[part.blankId!])
              }"
              class="inline-block w-32 lg:w-40 text-center"
              :placeholder="`Answer ${part.blankId! + 1}`"
            />
          </span>
        </template>
      </div>
    </div>

    <!-- Feedback -->
    <div v-if="showFeedback" class="mb-6">
      <div 
        class="p-4 rounded-lg"
        :class="score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
      >
        <div class="flex items-center gap-2 mb-3">
          <font-awesome-icon 
            :icon="['fas', score >= 70 ? 'check-circle' : 'times-circle']" 
            :class="score >= 70 ? 'text-green-600' : 'text-red-600'"
          />
          <h4 class="font-semibold" :class="score >= 70 ? 'text-green-900' : 'text-red-900'">
            Score: {{ score }}%
          </h4>
        </div>
        
        <!-- Individual Feedback -->
        <div class="space-y-2">
          <div 
            v-for="blank in question.blanks" 
            :key="blank.id"
            class="flex items-center gap-2 text-sm"
          >
            <span class="font-medium">Blank {{ blank.id + 1 }}:</span>
            <span v-if="isAnswerCorrect(blank.id, answers[blank.id] || '')" class="text-green-700">
              ✓ Correct
            </span>
            <span v-else class="text-red-700">
              ✗ Incorrect. Accepted answers: {{ blank.acceptedAnswers.join(', ') }}
            </span>
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
        :disabled="!allAnswered || disabled"
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
.fill-in-blank-question input {
  min-width: 120px;
  text-align: center;
}

@media (max-width: 640px) {
  .fill-in-blank-question input {
    min-width: 100px;
    font-size: 0.875rem;
  }
}
</style> 