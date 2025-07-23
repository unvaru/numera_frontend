<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Quiz, Question, Answer, QuestionResult, QuizAttempt } from '@/types/questions'
import { QuestionType } from '@/types/questions'

// Import all question components
import MCQQuestion from '../molecules/questions/MCQQuestion.vue'
import FillInBlankQuestion from '../molecules/questions/FillInBlankQuestion.vue'
import NumericalQuestion from '../molecules/questions/NumericalQuestion.vue'
import TrueFalseQuestion from '../molecules/questions/TrueFalseQuestion.vue'
import StructuredQuestion from '../molecules/questions/StructuredQuestion.vue'
import FinancialStatementQuestion from '../molecules/questions/FinancialStatementQuestion.vue'
import ScenarioQuestion from '../molecules/questions/ScenarioQuestion.vue'

import Button from '../atoms/Button.vue'

interface Props {
  quizId: string
}

const props = defineProps<Props>()
const router = useRouter()

// Quiz state
const quiz = ref<Quiz | null>(null)
const currentQuestionIndex = ref(0)
const answers = ref<Answer[]>([])
const quizStarted = ref(false)
const quizCompleted = ref(false)
const timeRemaining = ref(0)
const timer = ref<NodeJS.Timeout | null>(null)
const showReview = ref(false)

// Sample quiz data - in real app this would come from API
const sampleQuiz: Quiz = {
  id: '1',
  title: 'Comprehensive Accounting Assessment',
  description: 'Test your understanding of accounting principles with various question types',
  timeLimit: 90, // 90 minutes
  questions: [
    {
      id: '1',
      type: QuestionType.MCQ,
      text: 'What is the fundamental accounting equation?',
      points: 5,
      difficulty: 'basic',
      options: [
        { id: 'A', text: 'Assets = Liabilities - Equity', isCorrect: false },
        { id: 'B', text: 'Assets = Liabilities + Equity', isCorrect: true },
        { id: 'C', text: 'Assets + Liabilities = Equity', isCorrect: false },
        { id: 'D', text: 'Assets - Equity = Liabilities', isCorrect: false }
      ],
      explanation: 'The fundamental accounting equation is Assets = Liabilities + Equity, which represents the balance between what a company owns and what it owes.'
    },
    {
      id: '2',
      type: QuestionType.FILL_IN_BLANK,
      text: 'Complete the following statement about double-entry bookkeeping:',
      points: 8,
      difficulty: 'basic',
      template: 'In double-entry bookkeeping, every transaction affects at least {0} accounts. For every debit entry, there must be a corresponding {1} entry of equal amount.',
      blanks: [
        { id: 0, acceptedAnswers: ['two', '2', 'TWO'], caseSensitive: false },
        { id: 1, acceptedAnswers: ['credit', 'CREDIT'], caseSensitive: false }
      ],
      explanation: 'Double-entry bookkeeping requires that every transaction affects at least two accounts, with total debits equaling total credits.'
    },
    {
      id: '3',
      type: QuestionType.NUMERICAL,
      text: 'Calculate the gross profit for ABC Company',
      points: 10,
      difficulty: 'intermediate',
      calculation: 'Gross Profit = Sales Revenue - Cost of Goods Sold',
      providedData: {
        'Sales Revenue': 150000,
        'Opening Stock': 25000,
        'Purchases': 90000,
        'Closing Stock': 20000
      },
      correctAnswer: 55000,
      tolerance: 100,
      unit: '$',
      explanation: 'Gross Profit = Sales Revenue (150,000) - Cost of Goods Sold (95,000) = $55,000. Cost of Goods Sold = Opening Stock + Purchases - Closing Stock = 25,000 + 90,000 - 20,000 = 95,000.'
    },
    {
      id: '4',
      type: QuestionType.TRUE_FALSE,
      text: 'Evaluate the following accounting statement:',
      points: 5,
      difficulty: 'basic',
      statement: 'Depreciation reduces the book value of an asset and is recorded as an expense.',
      correctAnswer: true,
      justificationRequired: true,
      explanation: 'True. Depreciation represents the allocation of an asset\'s cost over its useful life, reducing the book value and recording an expense.'
    }
  ],
  passingScore: 70,
  allowReview: true,
  shuffleQuestions: false,
  showResults: 'immediate'
}

const currentQuestion = computed(() => {
  if (!quiz.value || currentQuestionIndex.value >= quiz.value.questions.length) return null
  return quiz.value.questions[currentQuestionIndex.value]
})

const progress = computed(() => {
  if (!quiz.value) return 0
  return Math.round(((currentQuestionIndex.value + 1) / quiz.value.questions.length) * 100)
})

const isLastQuestion = computed(() => {
  if (!quiz.value) return false
  return currentQuestionIndex.value === quiz.value.questions.length - 1
})

const totalScore = computed(() => {
  return answers.value.reduce((total, answer, index) => {
    const question = quiz.value?.questions[index]
    if (!question) return total
    
    // This would be calculated by the backend in a real application
    // For demo purposes, we'll assume all answers are correct
    return total + question.points
  }, 0)
})

const maxScore = computed(() => {
  if (!quiz.value) return 0
  return quiz.value.questions.reduce((total, question) => total + question.points, 0)
})

const scorePercentage = computed(() => {
  if (maxScore.value === 0) return 0
  return Math.round((totalScore.value / maxScore.value) * 100)
})

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const startQuiz = () => {
  quizStarted.value = true
  
  if (quiz.value?.timeLimit) {
    timeRemaining.value = quiz.value.timeLimit * 60 // Convert to seconds
    startTimer()
  }
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      completeQuiz()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const handleAnswer = (answer: Answer) => {
  // Update or add answer
  const existingIndex = answers.value.findIndex(a => a.questionId === answer.questionId)
  if (existingIndex >= 0) {
    answers.value[existingIndex] = answer
  } else {
    answers.value.push(answer)
  }
}

const nextQuestion = () => {
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
  } else {
    completeQuiz()
  }
}

const previousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const goToQuestion = (index: number) => {
  if (index >= 0 && index < (quiz.value?.questions.length || 0)) {
    currentQuestionIndex.value = index
  }
}

const completeQuiz = () => {
  stopTimer()
  quizCompleted.value = true
  
  // In a real application, this would send results to the backend
  console.log('Quiz completed:', {
    quizId: quiz.value?.id,
    answers: answers.value,
    timeSpent: (quiz.value?.timeLimit || 0) * 60 - timeRemaining.value
  })
}

const reviewAnswers = () => {
  showReview.value = true
  currentQuestionIndex.value = 0
}

const exitQuiz = () => {
  stopTimer()
  router.push('/app/question-bank')
}

// Load quiz data
onMounted(() => {
  quiz.value = sampleQuiz
})
</script>

<template>
  <div class="enhanced-quiz-player min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Quiz Header -->
    <div class="quiz-header bg-white/98 backdrop-blur-md shadow-2xl border-b border-white/30 sticky top-0 z-20">
      <!-- Main Header Content -->
      <div class="max-w-6xl mx-auto px-4 lg:px-8">
        <!-- Top Row: Quiz Info & Actions -->
        <div class="flex items-center justify-between py-4 lg:py-5">
          <!-- Quiz Info Section -->
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <!-- Quiz Icon -->
            <div class="relative">
              <div class="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'brain']" class="text-white text-lg lg:text-xl" />
              </div>
              <div v-if="quizStarted && !quizCompleted" class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            <!-- Quiz Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h1 class="text-lg lg:text-xl font-bold text-gray-900 truncate">
                  {{ quiz?.title }}
                </h1>
                <div v-if="quiz?.passingScore" class="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                  Pass: {{ quiz.passingScore }}%
                </div>
              </div>
              <p class="text-sm text-gray-600 truncate">{{ quiz?.description }}</p>
              
              <!-- Quiz Stats (Mobile Hidden) -->
              <div class="hidden lg:flex items-center gap-4 mt-2">
                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <font-awesome-icon :icon="['fas', 'question-circle']" />
                  <span>{{ quiz?.questions.length }} Questions</span>
                </div>
                <div v-if="quiz?.timeLimit" class="flex items-center gap-1 text-xs text-gray-500">
                  <font-awesome-icon :icon="['fas', 'clock']" />
                  <span>{{ quiz.timeLimit }} Minutes</span>
                </div>
                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <font-awesome-icon :icon="['fas', 'star']" />
                  <span>{{ maxScore }} Total Points</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Header Actions -->
          <div class="flex items-center gap-3">
            <!-- Menu Button (Mobile) -->
            <button class="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <font-awesome-icon :icon="['fas', 'bars']" />
            </button>
            
            <!-- Exit Button (Desktop) -->
            <Button variant="outline" size="sm" @click="exitQuiz" class="hidden lg:flex">
              <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
              Exit Quiz
            </Button>
          </div>
        </div>
        
        <!-- Bottom Row: Progress & Timer (When Quiz Started) -->
        <div v-if="quizStarted && !quizCompleted" class="pb-4 border-t border-gray-100">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4">
            <!-- Progress Section -->
            <div class="flex-1">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">
                  Question {{ currentQuestionIndex + 1 }} of {{ quiz?.questions.length }}
                </span>
                <span class="text-sm font-medium text-blue-600">{{ progress }}% Complete</span>
              </div>
              
              <!-- Enhanced Progress Bar -->
              <div class="relative">
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    class="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    :style="{ width: `${progress}%` }"
                  >
                    <!-- Animated shine effect -->
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
                  </div>
                </div>
                
                <!-- Progress markers -->
                <div class="absolute top-0 left-0 w-full h-full flex items-center">
                  <div
                    v-for="(question, index) in quiz?.questions"
                    :key="question.id"
                    class="flex-1 flex justify-center"
                    :class="{ 'first:justify-start': index === 0, 'last:justify-end': index === (quiz?.questions.length || 0) - 1 }"
                  >
                    <div
                      class="w-2 h-2 rounded-full border-2 border-white transition-colors duration-300"
                      :class="index <= currentQuestionIndex ? 'bg-blue-600' : 'bg-gray-300'"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Timer Section -->
            <div v-if="quiz?.timeLimit" class="lg:ml-8">
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="text-xs text-gray-500 mb-1">Time Remaining</div>
                  <div 
                    class="font-mono text-lg font-bold transition-colors duration-300"
                    :class="timeRemaining < 300 ? 'text-red-600' : timeRemaining < 600 ? 'text-amber-600' : 'text-gray-700'"
                  >
                    {{ formatTime(timeRemaining) }}
                  </div>
                </div>
                
                <!-- Timer Visual -->
                <div class="relative w-12 h-12">
                  <svg class="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                    <!-- Background circle -->
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      stroke-width="2"
                    />
                    <!-- Progress circle -->
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      :stroke="timeRemaining < 300 ? '#dc2626' : timeRemaining < 600 ? '#d97706' : '#3b82f6'"
                      stroke-width="2"
                      stroke-linecap="round"
                      :stroke-dasharray="`${((timeRemaining / (quiz?.timeLimit * 60)) * 100)} 100`"
                      class="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  
                  <!-- Timer Icon -->
                  <div class="absolute inset-0 flex items-center justify-center">
                    <font-awesome-icon 
                      :icon="['fas', 'clock']" 
                      :class="timeRemaining < 300 ? 'text-red-500' : timeRemaining < 600 ? 'text-amber-500' : 'text-blue-500'"
                      class="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Content -->
    <div class="quiz-content max-w-5xl mx-auto p-4 lg:p-6">
      <!-- Start Screen -->
      <div v-if="!quizStarted" class="text-center py-12 lg:py-20">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 lg:p-12 max-w-2xl mx-auto">
          <!-- Icon and Title -->
          <div class="mb-8">
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6 shadow-lg">
              <font-awesome-icon :icon="['fas', 'play-circle']" class="text-3xl text-white" />
            </div>
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Ready to Start?</h2>
            <p class="text-lg text-gray-600">Test your accounting knowledge with this comprehensive assessment</p>
          </div>
          
          <!-- Quiz Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Questions Card -->
            <div class="rounded-xl p-6  text-center">
              <div class="flex justify-center mb-4">
                <div class="p-3 bg-blue-500 rounded-full shadow-lg">
                  <font-awesome-icon :icon="['fas', 'question-circle']" class="text-white text-xl" />
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 mb-1">{{ quiz?.questions.length }}</div>
              <div class="text-sm font-medium text-gray-700">Questions</div>
            </div>
            
            <!-- Time Card -->
            <div v-if="quiz?.timeLimit" class="rounded-xl p-6  text-center">
              <div class="flex justify-center mb-4">
                <div class="p-3 bg-green-500 rounded-full shadow-lg">
                  <font-awesome-icon :icon="['fas', 'clock']" class="text-white text-xl" />
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 mb-1">{{ quiz?.timeLimit }}</div>
              <div class="text-sm font-medium text-gray-700">Minutes</div>
            </div>
            
            <!-- Pass Score Card -->
            <div v-if="quiz?.passingScore" class="rounded-xl p-6  text-center">
              <div class="flex justify-center mb-4">
                <div class="p-3 bg-yellow-500 rounded-full shadow-lg">
                  <font-awesome-icon :icon="['fas', 'trophy']" class="text-white text-xl" />
                </div>
              </div>
              <div class="text-3xl font-bold text-gray-900 mb-1">{{ quiz?.passingScore }}%</div>
              <div class="text-sm font-medium text-gray-700">Pass Score</div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" @click="exitQuiz" class="px-8">
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
              Cancel
            </Button>
            <Button variant="primary" size="lg" @click="startQuiz" class="px-8 shadow-lg">
              <font-awesome-icon :icon="['fas', 'play']" class="mr-2" />
              Start Quiz
            </Button>
          </div>
        </div>
      </div>

      <!-- Results Screen -->
      <div v-else-if="quizCompleted && !showReview" class="text-center py-12 lg:py-20">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 lg:p-12 max-w-3xl mx-auto">
          <!-- Success/Completion Icon -->
          <div class="mb-8">
            <div 
              class="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 shadow-lg"
              :class="scorePercentage >= (quiz?.passingScore || 70) 
                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                : 'bg-gradient-to-br from-yellow-500 to-yellow-600'"
            >
              <font-awesome-icon 
                :icon="['fas', scorePercentage >= (quiz?.passingScore || 70) ? 'trophy' : 'medal']" 
                class="text-4xl text-white"
              />
            </div>
            
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
              {{ scorePercentage >= (quiz?.passingScore || 70) ? 'Congratulations!' : 'Quiz Complete!' }}
            </h2>
            
            <p class="text-lg text-gray-600 mb-2">
              {{ scorePercentage >= (quiz?.passingScore || 70) 
                ? 'You passed with flying colors!' 
                : 'Thanks for completing the quiz!' }}
            </p>
          </div>
          
          <!-- Score Display -->
          <div class="mb-8">
            <div 
              class="inline-flex items-center justify-center w-32 h-32 rounded-full mb-4"
              :class="scorePercentage >= (quiz?.passingScore || 70) 
                ? 'bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-300' 
                : 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-300'"
            >
              <div class="text-center">
                <div 
                  class="text-4xl font-bold"
                  :class="scorePercentage >= (quiz?.passingScore || 70) ? 'text-green-800' : 'text-yellow-800'"
                >
                  {{ scorePercentage }}%
                </div>
              </div>
            </div>
            
            <div class="text-xl text-gray-700 mb-6">
              {{ totalScore }} / {{ maxScore }} points earned
            </div>
          </div>
          
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div class="text-2xl font-bold text-blue-900">{{ quiz?.questions.length }}</div>
              <div class="text-sm text-blue-700">Questions</div>
            </div>
            
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div class="text-2xl font-bold text-purple-900">{{ answers.length }}</div>
              <div class="text-sm text-purple-700">Answered</div>
            </div>
            
            <div 
              class="rounded-xl p-4 border"
              :class="scorePercentage >= (quiz?.passingScore || 70)
                ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'"
            >
              <div 
                class="text-2xl font-bold"
                :class="scorePercentage >= (quiz?.passingScore || 70) ? 'text-green-900' : 'text-red-900'"
              >
                {{ scorePercentage >= (quiz?.passingScore || 70) ? 'PASSED' : 'NOT PASSED' }}
              </div>
              <div 
                class="text-sm"
                :class="scorePercentage >= (quiz?.passingScore || 70) ? 'text-green-700' : 'text-red-700'"
              >
                Required: {{ quiz?.passingScore || 70 }}%
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg" @click="exitQuiz" class="px-8">
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
              Back to Question Bank
            </Button>
            <Button v-if="quiz?.allowReview" variant="primary" size="lg" @click="reviewAnswers" class="px-8 shadow-lg">
              <font-awesome-icon :icon="['fas', 'eye']" class="mr-2" />
              Review Answers
            </Button>
          </div>
        </div>
      </div>

      <!-- Question Display -->
      <div v-else-if="currentQuestion" class="question-container">
        <!-- Question Navigation (Mobile) -->
        <div class="lg:hidden mb-6">
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Question Navigation</h3>
            <div class="flex gap-2 overflow-x-auto pb-2">
              <button
                v-for="(question, index) in quiz?.questions"
                :key="question.id"
                @click="goToQuestion(index)"
                :class="[
                  'flex-shrink-0 w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 shadow-sm',
                  currentQuestionIndex === index
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md transform scale-110'
                    : answers.find(a => a.questionId === question.id)
                    ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-800 border border-green-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                ]"
              >
                {{ index + 1 }}
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Question Navigation -->
        <div class="hidden lg:block mb-6">
          <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
            <h3 class="text-sm font-medium text-gray-700 mb-3">Question Navigation</h3>
            <div class="flex flex-wrap gap-3">
              <button
                v-for="(question, index) in quiz?.questions"
                :key="question.id"
                @click="goToQuestion(index)"
                :class="[
                  'px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 shadow-sm',
                  currentQuestionIndex === index
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                    : answers.find(a => a.questionId === question.id)
                    ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-800 border-green-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                ]"
              >
                <div class="font-semibold">Question {{ index + 1 }}</div>
                <div class="text-xs opacity-75">{{ question.points }} pts</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Question Component -->
        <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 p-6 lg:p-8 mb-6">
          <!-- MCQ Question -->
          <MCQQuestion
            v-if="currentQuestion.type === QuestionType.MCQ"
            :question="currentQuestion"
            :disabled="showReview"
            @answer="handleAnswer"
            @next="nextQuestion"
          />
          
          <!-- Fill in Blank Question -->
          <FillInBlankQuestion
            v-else-if="currentQuestion.type === QuestionType.FILL_IN_BLANK"
            :question="currentQuestion"
            :disabled="showReview"
            @answer="handleAnswer"
            @next="nextQuestion"
          />
          
          <!-- Numerical Question -->
          <NumericalQuestion
            v-else-if="currentQuestion.type === QuestionType.NUMERICAL"
            :question="currentQuestion"
            :disabled="showReview"
            @answer="handleAnswer"
            @next="nextQuestion"
          />
          
          <!-- True/False Question -->
          <TrueFalseQuestion
            v-else-if="currentQuestion.type === QuestionType.TRUE_FALSE"
            :question="currentQuestion"
            :disabled="showReview"
            @answer="handleAnswer"
            @next="nextQuestion"
          />
          
          <!-- Structured Question -->
          <StructuredQuestion
            v-else-if="currentQuestion.type === QuestionType.STRUCTURED"
            :question="currentQuestion"
            :disabled="showReview"
            @answer="handleAnswer"
            @next="nextQuestion"
          />
          
          <!-- Financial Statement Question -->
          <FinancialStatementQuestion
            v-else-if="currentQuestion.type === QuestionType.FINANCIAL_STATEMENT"
            :question="currentQuestion"
            :disabled="showReview"
            @answer="handleAnswer"
            @next="nextQuestion"
          />
          
          <!-- Scenario Question -->
          <ScenarioQuestion
            v-else-if="currentQuestion.type === QuestionType.SCENARIO"
            :question="currentQuestion"
            :disabled="showReview"
            @answer="handleAnswer"
            @next="nextQuestion"
          />
        </div>

        <!-- Navigation Controls -->
        <div class="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
          <div class="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <!-- Previous Button -->
            <div class="flex-1">
              <Button
                v-if="currentQuestionIndex > 0"
                variant="outline"
                size="lg"
                @click="previousQuestion"
                class="w-full sm:w-auto px-6"
              >
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
                Previous Question
              </Button>
            </div>
            
            <!-- Center Actions -->
            <div class="flex gap-3">
              <Button
                v-if="showReview"
                variant="outline"
                size="lg"
                @click="showReview = false; quizCompleted = true"
                class="px-6"
              >
                <font-awesome-icon :icon="['fas', 'chart-line']" class="mr-2" />
                Back to Results
              </Button>
              
              <Button
                v-if="!showReview && !isLastQuestion"
                variant="outline"
                size="lg"
                @click="completeQuiz"
                class="px-6"
              >
                <font-awesome-icon :icon="['fas', 'flag-checkered']" class="mr-2" />
                Finish Early
              </Button>
            </div>
            
            <!-- Next/Finish Button -->
            <div class="flex-1 flex justify-end">
              <Button
                v-if="!showReview && isLastQuestion"
                variant="primary"
                size="lg"
                @click="completeQuiz"
                class="px-6 shadow-lg"
              >
                <font-awesome-icon :icon="['fas', 'flag-checkered']" class="mr-2" />
                Finish Quiz
              </Button>
              <Button
                v-else-if="!showReview && currentQuestionIndex < (quiz?.questions.length || 0) - 1"
                variant="primary"
                size="lg"
                @click="nextQuestion"
                class="px-6 shadow-lg"
              >
                Next Question
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Responsive design enhancements */
@media (max-width: 768px) {
  .enhanced-quiz-player {
    font-size: 14px;
  }
  
  .quiz-header {
    padding: 0.75rem 1rem;
  }
  
  .question-container {
    padding: 1rem;
  }
}

/* Timer warning animation */
@keyframes pulse-red {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.enhanced-quiz-player [class*="text-red-600"] {
  animation: pulse-red 1s infinite;
}

/* Smooth transitions */
.enhanced-quiz-player button {
  transition: all 0.2s ease-in-out;
}

.enhanced-quiz-player button:active {
  transform: scale(0.98);
}

/* Ensure proper spacing for mobile navigation */
.enhanced-quiz-player .overflow-x-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.enhanced-quiz-player .overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style> 