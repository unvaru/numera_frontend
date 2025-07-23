<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'

const router = useRouter()

interface Question {
  id: number
  text: string
  options: {
    id: string
    text: string
  }[]
  correctAnswer: string
  explanation: string
}

// Sample quiz data - in real app this would come from API
const quiz = {
  id: 1,
  title: 'Double Entry Basics',
  description: 'Test your understanding of the double entry system',
  questions: [
    {
      id: 1,
      text: 'What is the basic principle of double entry bookkeeping?',
      options: [
        { id: 'A', text: 'Every transaction affects only one account' },
        { id: 'B', text: 'Every transaction affects at least two accounts' },
        { id: 'C', text: 'Every transaction must be recorded in cash' },
        { id: 'D', text: 'Every transaction must be approved by an accountant' }
      ],
      correctAnswer: 'B',
      explanation: 'The double entry system requires that every transaction affects at least two accounts - one debit and one credit.'
    },
    {
      id: 2,
      text: 'When cash is received from a customer, which account is credited?',
      options: [
        { id: 'A', text: 'Cash Account' },
        { id: 'B', text: 'Sales Account' },
        { id: 'C', text: 'Customer Account' },
        { id: 'D', text: 'Capital Account' }
      ],
      correctAnswer: 'C',
      explanation: 'When cash is received from a customer, the Customer Account is credited and Cash Account is debited.'
    }
  ]
}

const currentQuestionIndex = ref(0)
const selectedAnswers = ref<Record<number, string>>({})
const showExplanation = ref(false)
const quizCompleted = ref(false)

const currentQuestion = computed(() => quiz.questions[currentQuestionIndex.value])

const isLastQuestion = computed(() => currentQuestionIndex.value === quiz.questions.length - 1)

const score = computed(() => {
  const correctAnswers = quiz.questions.filter(q => selectedAnswers.value[q.id] === q.correctAnswer)
  return Math.round((correctAnswers.length / quiz.questions.length) * 100)
})

const isAnswerCorrect = computed(() => {
  return selectedAnswers.value[currentQuestion.value.id] === currentQuestion.value.correctAnswer
})

function selectAnswer(optionId: string) {
  if (showExplanation.value) return
  selectedAnswers.value[currentQuestion.value.id] = optionId
  showExplanation.value = true
}

function nextQuestion() {
  showExplanation.value = false
  if (isLastQuestion.value) {
    quizCompleted.value = true
  } else {
    currentQuestionIndex.value++
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Quiz Header -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-40 mb-8">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <h1 class="text-xl lg:text-2xl font-bold text-gray-900">{{ quiz.title }}</h1>
        <p class="mt-1 text-gray-600 text-sm lg:text-base">{{ quiz.description }}</p>
        
        <!-- Progress Bar -->
        <div class="mt-4">
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-green-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }"
            ></div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            Question {{ currentQuestionIndex + 1 }} of {{ quiz.questions.length }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Content -->
    <div v-if="!quizCompleted" class="space-y-6">
      <!-- Question -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">
          {{ currentQuestion.text }}
        </h2>

        <!-- Options -->
        <div class="space-y-3">
          <button
            v-for="option in currentQuestion.options"
            :key="option.id"
            @click="selectAnswer(option.id)"
            :class="[
              'w-full text-left px-4 py-3 rounded-lg border transition-colors',
              selectedAnswers[currentQuestion.id] === option.id
                ? option.id === currentQuestion.correctAnswer
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-red-50 border-red-500 text-red-700'
                : 'border-gray-300 hover:border-gray-400'
            ]"
          >
            <div class="flex items-center">
              <span class="font-medium mr-2">{{ option.id }}.</span>
              {{ option.text }}
            </div>
          </button>
        </div>

        <!-- Explanation -->
        <div
          v-if="showExplanation"
          class="mt-4 p-4 rounded-lg"
          :class="isAnswerCorrect ? 'bg-green-50' : 'bg-red-50'"
        >
          <div class="flex items-start">
            <span
              class="material-icons-outlined mr-2"
              :class="isAnswerCorrect ? 'text-green-500' : 'text-red-500'"
            >
              {{ isAnswerCorrect ? 'check_circle' : 'error' }}
            </span>
            <div>
              <p class="font-medium" :class="isAnswerCorrect ? 'text-green-700' : 'text-red-700'">
                {{ isAnswerCorrect ? 'Correct!' : 'Incorrect' }}
              </p>
              <p class="mt-1 text-sm text-gray-600">{{ currentQuestion.explanation }}</p>
            </div>
          </div>
          <Button
            class="mt-4"
            variant="primary"
            @click="nextQuestion"
          >
            {{ isLastQuestion ? 'Complete Quiz' : 'Next Question' }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Quiz Results -->
    <div v-else class="bg-white rounded-lg shadow-sm p-6 text-center">
      <span class="material-icons-outlined text-5xl" :class="score >= 70 ? 'text-green-500' : 'text-yellow-500'">
        {{ score >= 70 ? 'emoji_events' : 'stars' }}
      </span>
      <h2 class="mt-4 text-2xl font-bold text-gray-900">Quiz Completed!</h2>
      <p class="mt-2 text-lg text-gray-600">Your score: {{ score }}%</p>
      <div class="mt-6 space-x-4">
        <Button variant="outline" @click="router.push('/app/question-bank')">
          Back to Question Bank
        </Button>
        <Button variant="primary" @click="router.push('/app/dashboard')">
          Continue Learning
        </Button>
      </div>
    </div>
  </div>
</template> 