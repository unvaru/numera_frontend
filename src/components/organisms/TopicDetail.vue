<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'
import PremiumUpgradeModal from '../molecules/PremiumUpgradeModal.vue'
import ContentLockOverlay from '../molecules/ContentLockOverlay.vue'
import UsageLimitTracker from '../molecules/UsageLimitTracker.vue'
import { useAccessControl, type AccessResult } from '@/composables/useAccessControl'

const route = useRoute()
const router = useRouter()

interface Lesson {
  id: string
  title: string
  description: string
  duration: string
  completed: boolean
  progress: number
  isPremium: boolean
  videoUrl?: string
  hasQuiz: boolean
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: number
  timeLimit: number
  completed: boolean
  bestScore?: number
  attempts: number
  isPremium: boolean
}

interface PracticeItem {
  id: string
  title: string
  description: string
  type: 'ledger' | 'trial-balance' | 'journal' | 'scenario'
  difficulty: 'easy' | 'medium' | 'hard'
  completed: boolean
  isPremium: boolean
}

interface Topic {
  id: string
  title: string
  description: string
  subjectId: string
  progress: number
  totalLessons: number
  completedLessons: number
  estimatedTime: string
  isUnlocked: boolean
  isPremium: boolean
  learningObjectives: string[]
}

// Route parameters
const subjectId = ref(route.params.subjectId as string)
const topicId = ref(route.params.topicId as string)

// Component state
const activeTab = ref<'lessons' | 'quizzes' | 'practice'>('lessons')
const isLoading = ref(false)

// Access control
const {
  canAccessPremiumContent,
  canUsePracticeTools,
  incrementUsage,
  isPremiumUser,
  isFreeTier
} = useAccessControl()

// Modal state
const showUpgradeModal = ref(false)
const currentAccessResult = ref<AccessResult | null>(null)
const currentContentType = ref('')
const currentContentTitle = ref('')

// Mock data - in real app this would come from API
const topic = ref<Topic>({
  id: 'trial-balance',
  title: 'Trial Balance',
  description: 'Learn how to prepare and understand trial balance, identify errors, and use it for financial statement preparation.',
  subjectId: 'accounting',
  progress: 60,
  totalLessons: 6,
  completedLessons: 4,
  estimatedTime: '3 hours',
  isUnlocked: true,
  isPremium: false,
  learningObjectives: [
    'Understand the purpose of a trial balance',
    'Prepare a trial balance from ledger accounts',
    'Identify different types of errors',
    'Correct errors in the trial balance',
    'Use trial balance for financial statement preparation'
  ]
})

const lessons = ref<Lesson[]>([
  {
    id: 'intro-trial-balance',
    title: 'Introduction to Trial Balance',
    description: 'Understanding the purpose and importance of trial balance in accounting',
    duration: '25 mins',
    completed: true,
    progress: 100,
    isPremium: false,
    videoUrl: 'https://example.com/video1',
    hasQuiz: true
  },
  {
    id: 'preparing-trial-balance',
    title: 'Preparing a Trial Balance',
    description: 'Step-by-step process of creating a trial balance from ledger accounts',
    duration: '35 mins',
    completed: true,
    progress: 100,
    isPremium: false,
    videoUrl: 'https://example.com/video2',
    hasQuiz: true
  },
  {
    id: 'trial-balance-errors',
    title: 'Types of Errors in Trial Balance',
    description: 'Learn about different errors that can occur and how to identify them',
    duration: '30 mins',
    completed: true,
    progress: 100,
    isPremium: false,
    hasQuiz: true
  },
  {
    id: 'correcting-errors',
    title: 'Correcting Trial Balance Errors',
    description: 'Practical methods for correcting errors in trial balance',
    duration: '40 mins',
    completed: true,
    progress: 100,
    isPremium: false,
    hasQuiz: true
  },
  {
    id: 'advanced-trial-balance',
    title: 'Advanced Trial Balance Techniques',
    description: 'Advanced concepts and complex scenarios in trial balance preparation',
    duration: '45 mins',
    completed: false,
    progress: 0,
    isPremium: true,
    hasQuiz: true
  },
  {
    id: 'trial-balance-to-statements',
    title: 'From Trial Balance to Financial Statements',
    description: 'Using trial balance as a foundation for preparing financial statements',
    duration: '50 mins',
    completed: false,
    progress: 0,
    isPremium: true,
    hasQuiz: true
  }
])

const quizzes = ref<Quiz[]>([
  {
    id: 'trial-balance-basics',
    title: 'Trial Balance Basics Quiz',
    description: 'Test your understanding of trial balance fundamentals',
    questions: 15,
    timeLimit: 20,
    completed: true,
    bestScore: 87,
    attempts: 2,
    isPremium: false
  },
  {
    id: 'error-identification',
    title: 'Error Identification Quiz',
    description: 'Practice identifying different types of errors in trial balance',
    questions: 12,
    timeLimit: 15,
    completed: true,
    bestScore: 92,
    attempts: 1,
    isPremium: false
  },
  {
    id: 'advanced-trial-balance-quiz',
    title: 'Advanced Trial Balance Quiz',
    description: 'Advanced scenarios and complex trial balance problems',
    questions: 20,
    timeLimit: 30,
    completed: false,
    bestScore: undefined,
    attempts: 0,
    isPremium: true
  }
])

const practiceItems = ref<PracticeItem[]>([
  {
    id: 'trial-balance-simulator',
    title: 'Trial Balance Simulator',
    description: 'Interactive tool to practice preparing trial balance',
    type: 'trial-balance',
    difficulty: 'medium',
    completed: true,
    isPremium: false
  },
  {
    id: 'error-correction-practice',
    title: 'Error Correction Practice',
    description: 'Practice correcting common trial balance errors',
    type: 'scenario',
    difficulty: 'medium',
    completed: false,
    isPremium: false
  },
  {
    id: 'complex-trial-balance',
    title: 'Complex Trial Balance Scenarios',
    description: 'Advanced practice with complex business scenarios',
    type: 'scenario',
    difficulty: 'hard',
    completed: false,
    isPremium: true
  }
])

// Computed properties
const currentSubject = computed(() => {
  const stored = localStorage.getItem('selectedSubject')
  return stored ? JSON.parse(stored) : null
})

const completedLessons = computed(() => lessons.value.filter(l => l.completed).length)
const totalLessons = computed(() => lessons.value.length)
const progressPercentage = computed(() => 
  totalLessons.value > 0 ? Math.round((completedLessons.value / totalLessons.value) * 100) : 0
)

const nextLesson = computed(() => lessons.value.find(l => !l.completed))
const availableQuizzes = computed(() => quizzes.value.filter(q => !q.isPremium))
const availablePractice = computed(() => practiceItems.value.filter(p => !p.isPremium))

// Access control methods
const startLesson = (lesson: Lesson) => {
  // Check if lesson is premium and user access
  if (lesson.isPremium && !isPremiumUser.value) {
    currentAccessResult.value = { canAccess: false, reason: 'premium_required', upgradeRequired: true }
    currentContentType.value = 'lesson'
    currentContentTitle.value = lesson.title
    showUpgradeModal.value = true
    return
  }
  
  router.push(`/app/subjects/${subjectId.value}/lessons/${lesson.id}`)
}

const startQuiz = (quiz: Quiz) => {
  // Check if quiz is premium and user access
  if (quiz.isPremium && !isPremiumUser.value) {
    currentAccessResult.value = { canAccess: false, reason: 'premium_required', upgradeRequired: true }
    currentContentType.value = 'quiz'
    currentContentTitle.value = quiz.title
    showUpgradeModal.value = true
    return
  }
  
  router.push(`/app/subjects/${subjectId.value}/quiz/${quiz.id}`)
}

const startPractice = (practice: PracticeItem) => {
  // Check if practice is premium and user access
  if (practice.isPremium && !isPremiumUser.value) {
    currentAccessResult.value = { canAccess: false, reason: 'premium_required', upgradeRequired: true }
    currentContentType.value = 'practice'
    currentContentTitle.value = practice.title
    showUpgradeModal.value = true
    return
  }
  
  // Check usage limits for practice tools
  const accessResult = canUsePracticeTools()
  if (!accessResult.canAccess) {
    currentAccessResult.value = accessResult
    currentContentType.value = 'practice'
    currentContentTitle.value = practice.title
    showUpgradeModal.value = true
    return
  }
  
  // Increment usage and start practice
  incrementUsage('dailyPractice')
  router.push(`/app/subjects/${subjectId.value}/practice?type=${practice.type}&id=${practice.id}`)
}

const closeUpgradeModal = () => {
  showUpgradeModal.value = false
  currentAccessResult.value = null
}

const canAccessContent = (item: { isPremium: boolean }) => {
  if (!item.isPremium) return true
  return isPremiumUser.value
}

const continueNext = () => {
  if (nextLesson.value) {
    startLesson(nextLesson.value)
  }
}

const goBack = () => {
  router.push(`/app/subjects/${subjectId.value}/dashboard`)
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-50'
    case 'medium':
      return 'text-yellow-600 bg-yellow-50'
    case 'hard':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'ledger':
      return ['fas', 'book']
    case 'trial-balance':
      return ['fas', 'balance-scale']
    case 'journal':
      return ['fas', 'pen']
    case 'scenario':
      return ['fas', 'briefcase']
    default:
      return ['fas', 'calculator']
  }
}

// Load topic data
onMounted(() => {
  // In real app, fetch topic data from API based on subjectId and topicId
  console.log('Loading topic:', topicId.value, 'for subject:', subjectId.value)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <!-- Back Navigation -->
          <div class="flex items-center gap-4">
            <Button variant="outline" size="sm" @click="goBack">
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
              Back to Dashboard
            </Button>
            
            <!-- Breadcrumb -->
            <nav class="text-sm text-gray-500" v-if="currentSubject">
              <span>{{ currentSubject.title }}</span>
              <span class="mx-2">/</span>
              <span class="text-gray-900 font-medium">{{ topic.title }}</span>
            </nav>
          </div>
          
          <!-- Continue Button -->
          <Button v-if="nextLesson" variant="primary" @click="continueNext">
            <font-awesome-icon :icon="['fas', 'play']" class="mr-2" />
            Continue Learning
          </Button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Usage Limit Tracker for Free Users -->
      <UsageLimitTracker 
        v-if="isFreeTier"
        variant="banner" 
        :limits="['dailyPractice']"
        class="mb-6"
      />

      <!-- Topic Overview -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-4">
              <h1 class="text-2xl font-bold text-gray-900">{{ topic.title }}</h1>
              <span v-if="topic.isPremium" class="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 rounded-full">
                <font-awesome-icon :icon="['fas', 'crown']" class="mr-1" />
                Premium
              </span>
            </div>
            
            <p class="text-gray-600 mb-6">{{ topic.description }}</p>
            
            <!-- Learning Objectives -->
            <div class="mb-6">
              <h3 class="font-semibold text-gray-900 mb-3">Learning Objectives</h3>
              <ul class="space-y-2">
                <li v-for="objective in topic.learningObjectives" :key="objective" class="flex items-start gap-2">
                  <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-600 mt-0.5 flex-shrink-0" />
                  <span class="text-gray-700 text-sm">{{ objective }}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- Progress Card -->
          <div class="ml-8 bg-gray-50 rounded-xl p-6 min-w-[200px]">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600 mb-2">{{ progressPercentage }}%</div>
              <div class="text-sm text-gray-600 mb-4">Complete</div>
              
              <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  class="bg-green-500 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${progressPercentage}%` }"
                ></div>
              </div>
              
              <div class="space-y-2 text-sm text-gray-600">
                <div class="flex justify-between">
                  <span>Lessons:</span>
                  <span>{{ completedLessons }}/{{ totalLessons }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Est. Time:</span>
                  <span>{{ topic.estimatedTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="bg-white rounded-xl shadow-sm">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              @click="activeTab = 'lessons'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'lessons'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="['fas', 'book-open']" class="mr-2" />
              Lessons ({{ lessons.length }})
            </button>
            
            <button
              @click="activeTab = 'quizzes'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'quizzes'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="['fas', 'question-circle']" class="mr-2" />
              Quizzes ({{ quizzes.length }})
            </button>
            
            <button
              @click="activeTab = 'practice'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'practice'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="['fas', 'calculator']" class="mr-2" />
              Practice ({{ practiceItems.length }})
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Lessons Tab -->
          <div v-if="activeTab === 'lessons'" class="space-y-4">
            <div
              v-for="(lesson, index) in lessons"
              :key="lesson.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
              :class="{ 'opacity-60': lesson.isPremium }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 flex-1">
                  <!-- Lesson Number -->
                  <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {{ index + 1 }}
                  </div>
                  
                  <!-- Lesson Info -->
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="font-medium text-gray-900">{{ lesson.title }}</h4>
                      <span 
                        v-if="lesson.isPremium" 
                        class="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                      >
                        <font-awesome-icon :icon="['fas', 'crown']" class="text-xs" />
                        Premium
                      </span>
                      <font-awesome-icon v-if="lesson.completed" :icon="['fas', 'check-circle']" class="text-green-600" />
                    </div>
                    <p class="text-sm text-gray-600 mb-2">{{ lesson.description }}</p>
                    <div class="flex items-center gap-4 text-xs text-gray-500">
                      <span>{{ lesson.duration }}</span>
                      <span v-if="lesson.videoUrl">• Video included</span>
                      <span v-if="lesson.hasQuiz">• Quiz available</span>
                    </div>
                  </div>
                </div>
                
                <!-- Action Button -->
                <div class="ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="startLesson(lesson)"
                    :disabled="lesson.isPremium && !canAccessContent(lesson)"
                  >
                    <template v-if="lesson.completed">
                      <font-awesome-icon :icon="['fas', 'redo']" class="mr-2" />
                      Review
                    </template>
                    <template v-else-if="lesson.isPremium && !canAccessContent(lesson)">
                      <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
                      Upgrade
                    </template>
                    <template v-else>
                      <font-awesome-icon :icon="['fas', 'play']" class="mr-2" />
                      Start
                    </template>
                  </Button>
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div v-if="lesson.progress > 0" class="mt-3">
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    class="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                    :style="{ width: `${lesson.progress}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quizzes Tab -->
          <div v-if="activeTab === 'quizzes'" class="space-y-4">
            <div
              v-for="quiz in quizzes"
              :key="quiz.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              :class="{ 'opacity-60': quiz.isPremium }"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <h4 class="font-medium text-gray-900">{{ quiz.title }}</h4>
                    <span v-if="quiz.isPremium" class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Premium
                    </span>
                    <font-awesome-icon v-if="quiz.completed" :icon="['fas', 'check-circle']" class="text-green-600" />
                  </div>
                  <p class="text-sm text-gray-600 mb-3">{{ quiz.description }}</p>
                  <div class="flex items-center gap-6 text-sm text-gray-500">
                    <span>{{ quiz.questions }} questions</span>
                    <span>{{ quiz.timeLimit }} minutes</span>
                    <span v-if="quiz.bestScore">Best: {{ quiz.bestScore }}%</span>
                    <span>{{ quiz.attempts }} attempts</span>
                  </div>
                </div>
                
                <div class="ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="startQuiz(quiz)"
                    :disabled="quiz.isPremium"
                    class="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <template v-if="quiz.isPremium">
                      <font-awesome-icon :icon="['fas', 'lock']" class="mr-2" />
                      Upgrade
                    </template>
                    <template v-else>
                      <font-awesome-icon :icon="['fas', 'play']" class="mr-2" />
                      {{ quiz.completed ? 'Retake' : 'Start' }}
                    </template>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Practice Tab -->
          <div v-if="activeTab === 'practice'" class="space-y-4">
            <div
              v-for="practice in practiceItems"
              :key="practice.id"
              class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              :class="{ 'opacity-60': practice.isPremium }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4 flex-1">
                  <!-- Type Icon -->
                  <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <font-awesome-icon :icon="getTypeIcon(practice.type)" class="text-purple-600" />
                  </div>
                  
                  <!-- Practice Info -->
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="font-medium text-gray-900">{{ practice.title }}</h4>
                      <span v-if="practice.isPremium" class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Premium
                      </span>
                      <span :class="['px-2 py-1 text-xs font-medium rounded-full', getDifficultyColor(practice.difficulty)]">
                        {{ practice.difficulty.charAt(0).toUpperCase() + practice.difficulty.slice(1) }}
                      </span>
                      <font-awesome-icon v-if="practice.completed" :icon="['fas', 'check-circle']" class="text-green-600" />
                    </div>
                    <p class="text-sm text-gray-600">{{ practice.description }}</p>
                  </div>
                </div>
                
                <div class="ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    @click="startPractice(practice)"
                    :disabled="practice.isPremium"
                    class="border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <template v-if="practice.isPremium">
                      <font-awesome-icon :icon="['fas', 'lock']" class="mr-2" />
                      Upgrade
                    </template>
                    <template v-else>
                      <font-awesome-icon :icon="['fas', 'play']" class="mr-2" />
                      {{ practice.completed ? 'Practice Again' : 'Start Practice' }}
                    </template>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 