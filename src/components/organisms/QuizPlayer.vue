<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '@/stores/quizStore'
import { useProgressStore } from '@/stores/progressStore'
import { useLoading } from '@/composables/useLoading'
import { useErrorHandler } from '@/utils/errorHandler'
import Button from '../atoms/Button.vue'

const route = useRoute()
const router = useRouter()
const quizStore = useQuizStore()
const progressStore = useProgressStore()
const loading = useLoading('quiz-player')
const errorHandler = useErrorHandler()

const quizId = route.params.quizId as string
const attemptId = ref<string | null>(null)

const currentQuestionIndex = ref(0)
const selectedAnswers = ref<Record<string, string>>({})
const showExplanation = ref(false)
const quizCompleted = ref(false)
const timeSpent = ref(0)
const startTime = ref<number>(0)

// Computed properties
const quiz = computed(() => quizStore.currentQuiz)
const questions = computed(() => quizStore.currentQuizQuestions)
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1)

  const score = computed(() => {
    if (!questions.value.length) return 0
    const correctAnswers = questions.value.filter((q: any) => 
      selectedAnswers.value[q.id] === q.correct_answer
    )
    return Math.round((correctAnswers.length / questions.value.length) * 100)
  })

const isAnswerCorrect = computed(() => {
  if (!currentQuestion.value) return false
  return selectedAnswers.value[currentQuestion.value.id] === currentQuestion.value.correct_answer
})

const progressPercentage = computed(() => {
  if (!questions.value.length) return 0
  return ((currentQuestionIndex.value + 1) / questions.value.length) * 100
})

// Load quiz data
onMounted(async () => {
  try {
    loading.startLoading('Loading quiz...')
    
    // Load quiz details
    await quizStore.fetchQuiz(quizId)
    
    // Load quiz questions
    await quizStore.fetchQuizQuestions(quizId)
    
    // Start quiz attempt
    const attempt = await quizStore.startQuizAttempt(quizId)
    attemptId.value = attempt.id
    startTime.value = Date.now()
    
    // Start timer
    const timer = setInterval(() => {
      timeSpent.value = Math.floor((Date.now() - startTime.value) / 1000)
    }, 1000)
    
    // Cleanup timer on component unmount
    return () => clearInterval(timer)
  } catch (error) {
    const appError = errorHandler.handleError(error)
    console.error('Failed to load quiz:', appError)
  } finally {
    loading.stopLoading()
  }
})

function selectAnswer(optionId: string) {
  if (showExplanation.value || !currentQuestion.value) return
  selectedAnswers.value[currentQuestion.value.id] = optionId
  showExplanation.value = true
}

async function nextQuestion() {
  showExplanation.value = false
  
  if (isLastQuestion.value) {
    await completeQuiz()
  } else {
    currentQuestionIndex.value++
  }
}

async function completeQuiz() {
  try {
    loading.startLoading('Submitting quiz...')
    
    if (!attemptId.value) {
      throw new Error('No active quiz attempt')
    }
    
    // Convert answers to API format
    const answers = Object.entries(selectedAnswers.value).map(([questionId, answer]) => ({
      question_id: questionId,
      answer: answer
    }))
    
    // Submit quiz answers
    const result = await quizStore.submitQuizAnswers(attemptId.value, answers)
    
    // Update progress
    await progressStore.completeLesson(quizId, timeSpent.value, score.value)
    
    quizCompleted.value = true
  } catch (error) {
    const appError = errorHandler.handleError(error)
    console.error('Failed to submit quiz:', appError)
  } finally {
    loading.stopLoading()
  }
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading.isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ loading.message }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="quizStore.error" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to load quiz</h3>
        <p class="text-gray-600 mb-4">{{ quizStore.error }}</p>
        <Button
          variant="primary"
          @click="quizStore.fetchQuiz(quizId)"
          class="bg-green-600 hover:bg-green-700"
        >
          Try Again
        </Button>
      </div>
    </div>

    <!-- Quiz Content -->
    <div v-else-if="quiz && questions.length > 0" class="space-y-6">
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
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <div class="mt-2 text-sm text-gray-600">
            Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
          </div>
          <div class="mt-1 text-xs text-gray-500">
            Time: {{ formatTime(timeSpent) }}
          </div>
        </div>
      </div>
    </div>

      <!-- Quiz Questions -->
      <div v-if="!quizCompleted" class="space-y-6">
        <!-- Question -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            {{ currentQuestion?.text }}
          </h2>

          <!-- Options -->
          <div class="space-y-3">
            <button
              v-for="option in currentQuestion?.options"
              :key="option.id"
              @click="selectAnswer(option.id)"
              :class="[
                'w-full text-left px-4 py-3 rounded-lg border transition-colors',
                selectedAnswers[currentQuestion?.id] === option.id
                  ? option.id === currentQuestion?.correct_answer
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
                <p class="mt-1 text-sm text-gray-600">{{ currentQuestion?.explanation }}</p>
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
  </div>
</template> 