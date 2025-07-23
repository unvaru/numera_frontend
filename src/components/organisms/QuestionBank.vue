<script setup lang="ts">
import { ref, computed } from 'vue'
import Card from '../molecules/Card.vue'
import Input from '../atoms/Input.vue'
import Button from '../atoms/Button.vue'
import PremiumUpgradeModal from '../molecules/PremiumUpgradeModal.vue'
import ContentLockOverlay from '../molecules/ContentLockOverlay.vue'
import UsageLimitTracker from '../molecules/UsageLimitTracker.vue'
import { useAccessControl, type AccessResult } from '@/composables/useAccessControl'

// Cambridge O Level Accounting Topics
const accountingTopics = [
  {
    id: 1,
    title: 'Introduction to Accounting',
    description: 'Basic concepts, accounting equation, and business transactions',
    totalQuestions: 25,
    attempted: 20,
    correctAnswers: 16,
    difficulty: 'Basic',
    estimatedTime: '45 mins',
    category: 'Foundation',
    lastAttempted: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    title: 'Books of Prime Entry',
    description: 'Day books, cash book, petty cash book, and journal entries',
    totalQuestions: 30,
    attempted: 25,
    correctAnswers: 18,
    difficulty: 'Intermediate',
    estimatedTime: '60 mins',
    category: 'Recording',
    lastAttempted: '2024-01-20T14:15:00Z'
  },
  {
    id: 3,
    title: 'Ledger Accounts',
    description: 'Personal, real, and nominal accounts, posting from books of prime entry',
    totalQuestions: 35,
    attempted: 30,
    correctAnswers: 22,
    difficulty: 'Intermediate',
    estimatedTime: '70 mins',
    category: 'Recording',
    lastAttempted: '2024-01-22T16:45:00Z'
  },
  {
    id: 4,
    title: 'Trial Balance',
    description: 'Preparation of trial balance, errors, and corrections',
    totalQuestions: 20,
    attempted: 15,
    correctAnswers: 10,
    difficulty: 'Intermediate',
    estimatedTime: '40 mins',
    category: 'Recording',
    lastAttempted: '2024-01-18T09:20:00Z'
  },
  {
    id: 5,
    title: 'Trading Account',
    description: 'Gross profit calculation, cost of goods sold, opening and closing stock',
    totalQuestions: 28,
    attempted: 0,
    correctAnswers: 0,
    difficulty: 'Advanced',
    estimatedTime: '55 mins',
    category: 'Financial Statements',
    lastAttempted: null
  },
  {
    id: 6,
    title: 'Profit and Loss Account',
    description: 'Net profit calculation, expenses, and income classification',
    totalQuestions: 32,
    attempted: 0,
    correctAnswers: 0,
    difficulty: 'Advanced',
    estimatedTime: '65 mins',
    category: 'Financial Statements',
    lastAttempted: null
  },
  {
    id: 7,
    title: 'Balance Sheet',
    description: 'Assets, liabilities, and capital presentation',
    totalQuestions: 26,
    attempted: 12,
    correctAnswers: 8,
    difficulty: 'Advanced',
    estimatedTime: '50 mins',
    category: 'Financial Statements',
    lastAttempted: '2024-01-10T11:30:00Z'
  },
  {
    id: 8,
    title: 'Bank Reconciliation',
    description: 'Bank statements, reconciliation process, and adjustments',
    totalQuestions: 22,
    attempted: 18,
    correctAnswers: 14,
    difficulty: 'Intermediate',
    estimatedTime: '45 mins',
    category: 'Adjustments',
    lastAttempted: '2024-01-25T13:20:00Z'
  },
  {
    id: 9,
    title: 'Depreciation',
    description: 'Straight line, reducing balance methods, and asset disposal',
    totalQuestions: 24,
    attempted: 20,
    correctAnswers: 12,
    difficulty: 'Advanced',
    estimatedTime: '50 mins',
    category: 'Adjustments',
    lastAttempted: '2024-01-26T15:45:00Z',
    isPremium: true
  },
  {
    id: 10,
    title: 'Bad Debts and Provisions',
    description: 'Bad debt write-offs, provision for bad debts, and doubtful debts',
    totalQuestions: 18,
    attempted: 0,
    correctAnswers: 0,
    difficulty: 'Advanced',
    estimatedTime: '40 mins',
    category: 'Adjustments',
    lastAttempted: null,
    isPremium: true
  }
]

// Exam preparation sets
const examSets = [
  {
    id: 'exam1',
    title: 'Cambridge O Level Mock Exam 1',
    description: 'Complete practice exam with MCQ and structured questions',
    totalQuestions: 50,
    mcqQuestions: 30,
    structuredQuestions: 20,
    attempted: 45,
    correctAnswers: 32,
    timeLimit: '3 hours',
    difficulty: 'Mixed',
    category: 'Full Exam',
    lastAttempted: '2024-01-24T09:00:00Z'
  },
  {
    id: 'exam2',
    title: 'Cambridge O Level Mock Exam 2',
    description: 'Advanced practice exam covering all syllabus topics',
    totalQuestions: 50,
    mcqQuestions: 30,
    structuredQuestions: 20,
    attempted: 0,
    correctAnswers: 0,
    timeLimit: '3 hours',
    difficulty: 'Mixed',
    category: 'Full Exam',
    lastAttempted: null
  },
  {
    id: 'mcq1',
    title: 'MCQ Practice Set 1',
    description: 'Multiple choice questions covering basic concepts',
    totalQuestions: 40,
    mcqQuestions: 40,
    structuredQuestions: 0,
    attempted: 35,
    correctAnswers: 28,
    timeLimit: '1 hour',
    difficulty: 'Basic to Intermediate',
    category: 'MCQ Only',
    lastAttempted: '2024-01-19T10:30:00Z'
  },
  {
    id: 'structured1',
    title: 'Structured Questions Set 1',
    description: 'Complex accounting problems and calculations',
    totalQuestions: 15,
    mcqQuestions: 0,
    structuredQuestions: 15,
    attempted: 10,
    correctAnswers: 6,
    timeLimit: '2 hours',
    difficulty: 'Advanced',
    category: 'Structured Only',
    lastAttempted: '2024-01-23T14:15:00Z'
  }
]

const categories = ['All Categories', 'Foundation', 'Recording', 'Financial Statements', 'Adjustments', 'Full Exam', 'MCQ Only', 'Structured Only']
const difficulties = ['All Levels', 'Basic', 'Intermediate', 'Advanced', 'Mixed']
const scoreFilters = ['All Scores', 'Need Improvement (<60%)', 'Good (60-80%)', 'Excellent (>80%)', 'Not Attempted']

const selectedCategory = ref('All Categories')
const selectedDifficulty = ref('All Levels')
const selectedScoreFilter = ref('All Scores')
const searchQuery = ref('')
const showTopicSets = ref(true)
const showExamSets = ref(true)

// Access control
const {
  canStartQuiz,
  incrementUsage,
  isPremiumUser,
  isFreeTier
} = useAccessControl()

// Modal state
const showUpgradeModal = ref(false)
const currentAccessResult = ref<AccessResult | null>(null)
const currentContentType = ref('')
const currentContentTitle = ref('')

// Calculate progress and performance
const calculateProgress = (attempted: number, total: number) => {
  return total > 0 ? Math.round((attempted / total) * 100) : 0
}

const calculateScore = (correct: number, attempted: number) => {
  return attempted > 0 ? Math.round((correct / attempted) * 100) : 0
}

const getScoreColor = (score: number, attempted: number) => {
  if (attempted === 0) return 'text-gray-500 bg-gray-50'
  if (score < 60) return 'text-red-600 bg-red-50'
  if (score < 80) return 'text-yellow-600 bg-yellow-50'
  return 'text-green-600 bg-green-50'
}

const getProgressColor = (progress: number) => {
  if (progress === 0) return 'bg-gray-300'
  if (progress < 50) return 'bg-red-400'
  if (progress < 80) return 'bg-yellow-400'
  return 'bg-green-400'
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'basic':
      return 'text-green-600 bg-green-50'
    case 'intermediate':
      return 'text-blue-600 bg-blue-50'
    case 'advanced':
      return 'text-purple-600 bg-purple-50'
    case 'mixed':
      return 'text-orange-600 bg-orange-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

// Find the most recently attempted set across all sets
const getMostRecentAttempt = () => {
  const allSets = [...accountingTopics, ...examSets].filter(set => set.lastAttempted)
  if (allSets.length === 0) return null
  
  return allSets.reduce((latest, current) => {
    const currentTime = new Date(current.lastAttempted!).getTime()
    const latestTime = new Date(latest.lastAttempted!).getTime()
    return currentTime > latestTime ? current : latest
  })
}

const mostRecentSet = computed(() => getMostRecentAttempt())

// Access control methods
const startQuiz = (topic: any) => {
  // Check if topic is premium and user access
  if (topic.isPremium && !isPremiumUser.value) {
    currentAccessResult.value = { canAccess: false, reason: 'premium_required', upgradeRequired: true }
    currentContentType.value = 'quiz'
    currentContentTitle.value = topic.title
    showUpgradeModal.value = true
    return
  }
  
  // Check usage limits
  const accessResult = canStartQuiz()
  if (!accessResult.canAccess) {
    currentAccessResult.value = accessResult
    currentContentType.value = 'quiz'
    currentContentTitle.value = topic.title
    showUpgradeModal.value = true
    return
  }
  
  // Increment usage and start quiz
  incrementUsage('dailyQuizzes')
  console.log('Starting quiz:', topic.title)
  // In real app, navigate to quiz
}

const startExam = (exam: any) => {
  // Similar logic for exams
  if (exam.isPremium && !isPremiumUser.value) {
    currentAccessResult.value = { canAccess: false, reason: 'premium_required', upgradeRequired: true }
    currentContentType.value = 'quiz'
    currentContentTitle.value = exam.title
    showUpgradeModal.value = true
    return
  }
  
  const accessResult = canStartQuiz()
  if (!accessResult.canAccess) {
    currentAccessResult.value = accessResult
    currentContentType.value = 'quiz'
    currentContentTitle.value = exam.title
    showUpgradeModal.value = true
    return
  }
  
  incrementUsage('dailyQuizzes')
  console.log('Starting exam:', exam.title)
}

const closeUpgradeModal = () => {
  showUpgradeModal.value = false
  currentAccessResult.value = null
}

const isRecentAttempt = (setId: string | number) => {
  return mostRecentSet.value && mostRecentSet.value.id === setId
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}h ago`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days}d ago`
  }
}

// Filter logic
const filteredTopicSets = computed(() => {
  return accountingTopics.filter(topic => {
    const matchesCategory = selectedCategory.value === 'All Categories' || topic.category === selectedCategory.value
    const matchesDifficulty = selectedDifficulty.value === 'All Levels' || topic.difficulty === selectedDifficulty.value
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const score = calculateScore(topic.correctAnswers, topic.attempted)
    let matchesScore = true
    
    if (selectedScoreFilter.value === 'Need Improvement (<60%)') {
      matchesScore = topic.attempted > 0 && score < 60
    } else if (selectedScoreFilter.value === 'Good (60-80%)') {
      matchesScore = topic.attempted > 0 && score >= 60 && score <= 80
    } else if (selectedScoreFilter.value === 'Excellent (>80%)') {
      matchesScore = topic.attempted > 0 && score > 80
    } else if (selectedScoreFilter.value === 'Not Attempted') {
      matchesScore = topic.attempted === 0
    }
    
    return matchesCategory && matchesDifficulty && matchesSearch && matchesScore
  })
})

const filteredExamSets = computed(() => {
  return examSets.filter(exam => {
    const matchesCategory = selectedCategory.value === 'All Categories' || exam.category === selectedCategory.value
    const matchesDifficulty = selectedDifficulty.value === 'All Levels' || exam.difficulty === selectedDifficulty.value
    const matchesSearch = exam.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         exam.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const score = calculateScore(exam.correctAnswers, exam.attempted)
    let matchesScore = true
    
    if (selectedScoreFilter.value === 'Need Improvement (<60%)') {
      matchesScore = exam.attempted > 0 && score < 60
    } else if (selectedScoreFilter.value === 'Good (60-80%)') {
      matchesScore = exam.attempted > 0 && score >= 60 && score <= 80
    } else if (selectedScoreFilter.value === 'Excellent (>80%)') {
      matchesScore = exam.attempted > 0 && score > 80
    } else if (selectedScoreFilter.value === 'Not Attempted') {
      matchesScore = exam.attempted === 0
    }
    
    return matchesCategory && matchesDifficulty && matchesSearch && matchesScore
  })
})

const clearFilters = () => {
  selectedCategory.value = 'All Categories'
  selectedDifficulty.value = 'All Levels'
  selectedScoreFilter.value = 'All Scores'
  searchQuery.value = ''
}
</script>

<template>
  <div class="question-bank-content">
    <div class="max-w-[1400px] mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'question-circle']" class="text-blue-600" />
              Question Bank
            </h1>
            <p class="mt-1 text-sm text-gray-500">Cambridge O Level Accounting Practice Questions</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex gap-2">
              <Button
                :variant="showTopicSets ? 'primary' : 'outline'"
                size="sm"
                @click="showTopicSets = !showTopicSets"
              >
                <font-awesome-icon :icon="['fas', 'book']" class="mr-2" />
                Topic Sets
              </Button>
              <Button
                :variant="showExamSets ? 'primary' : 'outline'"
                size="sm"
                @click="showExamSets = !showExamSets"
              >
                <font-awesome-icon :icon="['fas', 'graduation-cap']" class="mr-2" />
                Exam Sets
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Limit Tracker for Free Users -->
      <UsageLimitTracker 
        v-if="isFreeTier"
        variant="banner" 
        :limits="['dailyQuizzes']"
      />

      <!-- Continue Where You Left Off -->
      <div v-if="mostRecentSet" class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-4 lg:p-6">
        <div class="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
          <div class="bg-blue-600 rounded-full p-1.5 lg:p-2 flex-shrink-0">
            <font-awesome-icon :icon="['fas', 'clock']" class="text-white text-sm lg:text-lg" />
          </div>
          <div class="min-w-0 flex-1">
            <h2 class="text-base lg:text-lg font-bold text-blue-900">Continue Where You Left Off</h2>
            <p class="text-xs lg:text-sm text-blue-700">Pick up from your most recent practice session</p>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-3 lg:p-4 border border-blue-200">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4">
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold text-gray-900 text-sm lg:text-base">{{ mostRecentSet.title }}</h3>
              <p class="text-xs lg:text-sm text-gray-600 mt-1">{{ mostRecentSet.description }}</p>
              <div class="flex flex-wrap items-center gap-2 lg:gap-4 mt-2 text-xs text-gray-500">
                <span class="flex items-center gap-1 flex-shrink-0">
                  <font-awesome-icon :icon="['fas', 'history']" />
                  {{ mostRecentSet.lastAttempted ? formatTimeAgo(mostRecentSet.lastAttempted) : 'Recently' }}
                </span>
                <span class="flex items-center gap-1 flex-shrink-0">
                  <font-awesome-icon :icon="['fas', 'chart-line']" />
                  {{ calculateProgress(mostRecentSet.attempted, mostRecentSet.totalQuestions) }}% complete
                </span>
                <span 
                  v-if="mostRecentSet.attempted > 0"
                  class="flex items-center gap-1 flex-shrink-0"
                  :class="getScoreColor(calculateScore(mostRecentSet.correctAnswers, mostRecentSet.attempted), mostRecentSet.attempted)"
                >
                  <font-awesome-icon :icon="['fas', 'star']" />
                  {{ calculateScore(mostRecentSet.correctAnswers, mostRecentSet.attempted) }}% score
                </span>
              </div>
            </div>
            <Button variant="primary" class="w-full lg:w-auto lg:ml-4 flex-shrink-0" size="sm">
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="mr-2" />
              Continue
            </Button>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl shadow-sm p-4 lg:p-6 space-y-4 lg:space-y-6">
        <!-- Search Bar -->
        <div class="relative">
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="Search question sets..."
            class="w-full pl-10 h-10 lg:h-auto"
          />
          <font-awesome-icon 
            :icon="['fas', 'magnifying-glass']" 
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <!-- Filters -->
        <div class="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-4">
          <!-- Mobile: Stack filters vertically, Desktop: 4-column grid -->
          <div class="space-y-3 lg:space-y-0 lg:contents">
            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Category</label>
              <select
                v-model="selectedCategory"
                class="block w-full pl-3 pr-8 py-2.5 lg:py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white appearance-none cursor-pointer"
              >
                <option v-for="category in categories" :key="category">{{ category }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Difficulty</label>
              <select
                v-model="selectedDifficulty"
                class="block w-full pl-3 pr-8 py-2.5 lg:py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white appearance-none cursor-pointer"
              >
                <option v-for="difficulty in difficulties" :key="difficulty">{{ difficulty }}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs lg:text-sm font-medium text-gray-700 mb-1 lg:mb-2">Performance</label>
              <select
                v-model="selectedScoreFilter"
                class="block w-full pl-3 pr-8 py-2.5 lg:py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white appearance-none cursor-pointer"
              >
                <option v-for="filter in scoreFilters" :key="filter">{{ filter }}</option>
              </select>
            </div>

            <div class="pt-2 lg:pt-0 lg:flex lg:items-end">
              <Button
                variant="outline"
                @click="clearFilters"
                class="w-full h-10 lg:h-auto"
                size="sm"
              >
                <font-awesome-icon :icon="['fas', 'rotate']" class="mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Topic-based Question Sets -->
      <div v-if="showTopicSets">
        <div class="flex items-center gap-2 mb-4">
          <font-awesome-icon :icon="['fas', 'book']" class="text-blue-600" />
          <h2 class="text-xl font-bold text-gray-900">Topic-based Question Sets</h2>
          <span class="text-sm text-gray-500">({{ filteredTopicSets.length }} sets)</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <div
            v-for="topic in filteredTopicSets"
            :key="topic.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden relative"
            :class="{
              'ring-2 ring-red-200 border-red-300': topic.attempted > 0 && calculateScore(topic.correctAnswers, topic.attempted) < 60 && !isRecentAttempt(topic.id),
              'ring-2 ring-yellow-200 border-yellow-300': topic.attempted > 0 && calculateScore(topic.correctAnswers, topic.attempted) >= 60 && calculateScore(topic.correctAnswers, topic.attempted) <= 80 && !isRecentAttempt(topic.id),
              'ring-2 ring-green-200 border-green-300': topic.attempted > 0 && calculateScore(topic.correctAnswers, topic.attempted) > 80 && !isRecentAttempt(topic.id),
              'ring-2 ring-blue-400 border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50': isRecentAttempt(topic.id)
            }"
          >
            <!-- Recent Attempt Badge -->
            <div
              v-if="isRecentAttempt(topic.id)"
              class="absolute top-3 right-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 z-10"
            >
              <font-awesome-icon :icon="['fas', 'clock']" class="text-xs" />
              Continue
            </div>
            <div class="p-6">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h3 class="font-semibold text-gray-900">{{ topic.title }}</h3>
                    <span 
                      v-if="topic.isPremium" 
                      class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                    >
                      <font-awesome-icon :icon="['fas', 'crown']" class="text-xs" />
                      Premium
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-4">{{ topic.description }}</p>
                </div>
                <span 
                  class="text-xs font-medium px-2.5 py-1 rounded-full"
                  :class="getDifficultyColor(topic.difficulty)"
                >
                  {{ topic.difficulty }}
                </span>
              </div>

              <!-- Progress and Score -->
              <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Progress</span>
                  <span class="font-medium">{{ calculateProgress(topic.attempted, topic.totalQuestions) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getProgressColor(calculateProgress(topic.attempted, topic.totalQuestions))"
                    :style="{ width: `${calculateProgress(topic.attempted, topic.totalQuestions)}%` }"
                  ></div>
                </div>

                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Score</span>
                  <span 
                    class="font-medium px-2 py-1 rounded text-xs"
                    :class="getScoreColor(calculateScore(topic.correctAnswers, topic.attempted), topic.attempted)"
                  >
                    {{ topic.attempted > 0 ? `${calculateScore(topic.correctAnswers, topic.attempted)}%` : 'Not attempted' }}
                  </span>
                </div>
              </div>

              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div class="text-center p-2 bg-gray-50 rounded-lg">
                  <div class="font-medium text-gray-900">{{ topic.totalQuestions }}</div>
                  <div class="text-gray-500">Questions</div>
                </div>
                <div class="text-center p-2 bg-gray-50 rounded-lg">
                  <div class="font-medium text-gray-900">{{ topic.estimatedTime }}</div>
                  <div class="text-gray-500">Est. Time</div>
                </div>
              </div>

              <!-- Recent Attempt Info -->
              <div
                v-if="isRecentAttempt(topic.id) && topic.lastAttempted"
                class="text-xs text-blue-600 mb-3 flex items-center gap-1"
              >
                <font-awesome-icon :icon="['fas', 'history']" />
                Last practiced {{ formatTimeAgo(topic.lastAttempted) }}
              </div>

              <!-- Action Button -->
              <Button
                :variant="isRecentAttempt(topic.id) ? 'primary' : (topic.attempted === 0 ? 'primary' : 'outline')"
                class="w-full"
                @click="startQuiz(topic)"
              >
                <font-awesome-icon 
                  :icon="isRecentAttempt(topic.id) ? ['fas', 'arrow-right'] : (topic.attempted === 0 ? ['fas', 'play'] : ['fas', 'redo'])" 
                  class="mr-2" 
                />
                {{ isRecentAttempt(topic.id) ? 'Continue Practice' : (topic.attempted === 0 ? 'Start Practice' : 'Practice Again') }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Exam Preparation Sets -->
      <div v-if="showExamSets">
        <div class="flex items-center gap-2 mb-4">
          <font-awesome-icon :icon="['fas', 'graduation-cap']" class="text-purple-600" />
          <h2 class="text-xl font-bold text-gray-900">Exam Preparation Sets</h2>
          <span class="text-sm text-gray-500">({{ filteredExamSets.length }} sets)</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            v-for="exam in filteredExamSets"
            :key="exam.id"
            class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden relative"
            :class="{
              'ring-2 ring-red-200 border-red-300': exam.attempted > 0 && calculateScore(exam.correctAnswers, exam.attempted) < 60 && !isRecentAttempt(exam.id),
              'ring-2 ring-yellow-200 border-yellow-300': exam.attempted > 0 && calculateScore(exam.correctAnswers, exam.attempted) >= 60 && calculateScore(exam.correctAnswers, exam.attempted) <= 80 && !isRecentAttempt(exam.id),
              'ring-2 ring-green-200 border-green-300': exam.attempted > 0 && calculateScore(exam.correctAnswers, exam.attempted) > 80 && !isRecentAttempt(exam.id),
              'ring-2 ring-blue-400 border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50': isRecentAttempt(exam.id)
            }"
          >
            <!-- Recent Attempt Badge -->
            <div
              v-if="isRecentAttempt(exam.id)"
              class="absolute top-3 right-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1 z-10"
            >
              <font-awesome-icon :icon="['fas', 'clock']" class="text-xs" />
              Continue
            </div>
            <div class="p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900 mb-2">{{ exam.title }}</h3>
                  <p class="text-sm text-gray-600">{{ exam.description }}</p>
                </div>
                <span 
                  class="text-xs font-medium px-2.5 py-1 rounded-full"
                  :class="getDifficultyColor(exam.difficulty)"
                >
                  {{ exam.difficulty }}
                </span>
              </div>

              <!-- Question Breakdown -->
              <div class="grid grid-cols-3 gap-3 mb-4 text-sm">
                <div class="text-center p-2 bg-blue-50 rounded-lg">
                  <div class="font-medium text-blue-900">{{ exam.mcqQuestions }}</div>
                  <div class="text-blue-600">MCQ</div>
                </div>
                <div class="text-center p-2 bg-purple-50 rounded-lg">
                  <div class="font-medium text-purple-900">{{ exam.structuredQuestions }}</div>
                  <div class="text-purple-600">Structured</div>
                </div>
                <div class="text-center p-2 bg-gray-50 rounded-lg">
                  <div class="font-medium text-gray-900">{{ exam.timeLimit }}</div>
                  <div class="text-gray-600">Duration</div>
                </div>
              </div>

              <!-- Progress and Score -->
              <div class="space-y-3 mb-4">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Progress</span>
                  <span class="font-medium">{{ calculateProgress(exam.attempted, exam.totalQuestions) }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="getProgressColor(calculateProgress(exam.attempted, exam.totalQuestions))"
                    :style="{ width: `${calculateProgress(exam.attempted, exam.totalQuestions)}%` }"
                  ></div>
                </div>

                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Score</span>
                  <span 
                    class="font-medium px-2 py-1 rounded text-xs"
                    :class="getScoreColor(calculateScore(exam.correctAnswers, exam.attempted), exam.attempted)"
                  >
                    {{ exam.attempted > 0 ? `${calculateScore(exam.correctAnswers, exam.attempted)}%` : 'Not attempted' }}
                  </span>
                </div>
              </div>

              <!-- Recent Attempt Info -->
              <div
                v-if="isRecentAttempt(exam.id) && exam.lastAttempted"
                class="text-xs text-blue-600 mb-3 flex items-center gap-1"
              >
                <font-awesome-icon :icon="['fas', 'history']" />
                Last attempted {{ formatTimeAgo(exam.lastAttempted) }}
              </div>

              <!-- Action Button -->
              <Button
                :variant="isRecentAttempt(exam.id) ? 'primary' : (exam.attempted === 0 ? 'primary' : 'outline')"
                class="w-full"
                @click="startExam(exam)"
              >
                <font-awesome-icon 
                  :icon="isRecentAttempt(exam.id) ? ['fas', 'arrow-right'] : (exam.attempted === 0 ? ['fas', 'play'] : ['fas', 'redo'])" 
                  class="mr-2" 
                />
                {{ isRecentAttempt(exam.id) ? 'Continue Exam' : (exam.attempted === 0 ? 'Start Exam' : 'Retake Exam') }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="(!showTopicSets || filteredTopicSets.length === 0) && (!showExamSets || filteredExamSets.length === 0)"
        class="text-center py-12 bg-white rounded-xl shadow-sm"
      >
        <div class="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
          <font-awesome-icon 
            :icon="['fas', 'question-circle']" 
            class="text-4xl text-gray-400"
          />
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No question sets found</h3>
        <p class="mt-2 text-sm text-gray-500">
          Try adjusting your filters to find what you're looking for.
        </p>
        <Button
          @click="clearFilters"
          class="mt-6"
        >
          <font-awesome-icon :icon="['fas', 'rotate']" class="mr-2" />
          Reset Filters
        </Button>
      </div>
    </div>

    <!-- Premium Upgrade Modal -->
    <PremiumUpgradeModal 
      :is-open="showUpgradeModal"
      :access-result="currentAccessResult || { canAccess: false, upgradeRequired: true }"
      :content-type="currentContentType"
      :content-title="currentContentTitle"
      @close="closeUpgradeModal"
      @upgrade="closeUpgradeModal"
    />
  </div>
</template>

<style scoped>
/* Mobile spacing to avoid overlap with fixed navigation */
.question-bank-content {
  /* Desktop spacing */
  padding: 2rem 1rem;
}

/* Mobile spacing adjustments */
@media (max-width: 1024px) {
  .question-bank-content {
    /* Mobile: account for fixed header (60px) and bottom nav (80px) */
    padding: 1rem;
    padding-top: calc(60px + 1rem); /* Fixed header height + padding */
    padding-bottom: calc(80px + 1rem + env(safe-area-inset-bottom, 0px)); /* Fixed bottom nav + padding + safe area */
  }
}

/* Ensure content doesn't get hidden behind mobile navigation */
@media (max-width: 640px) {
  .question-bank-content {
    /* Small mobile: more precise spacing */
    padding-top: calc(64px + 0.5rem); /* Slightly larger header on small screens */
    padding-bottom: calc(84px + 0.5rem + env(safe-area-inset-bottom, 0px)); /* Slightly larger bottom nav */
  }
}

.ring-2 {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
}
</style> 