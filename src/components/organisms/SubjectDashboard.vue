<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSubjectStore } from '@/stores/subjectStore'
import { useLoading } from '@/composables/useLoading'
import { useErrorHandler } from '@/utils/errorHandler'
import Button from '../atoms/Button.vue'
import Card from '../molecules/Card.vue'
import UsageLimitTracker from '../molecules/UsageLimitTracker.vue'

const route = useRoute()
const router = useRouter()
const subjectStore = useSubjectStore()
const loading = useLoading('subject-dashboard')
const errorHandler = useErrorHandler()

interface Subject {
  id: string
  title: string
  description: string
  code: string
  icon: string[]
  color: string
  bgColor: string
}

interface SubjectProgress {
  overallProgress: number
  completedTopics: number
  totalTopics: number
  completedLessons: number
  totalLessons: number
  completedQuizzes: number
  totalQuizzes: number
  averageScore: number
  streak: number
  timeSpent: number // in minutes
}

interface Topic {
  id: string
  title: string
  description: string
  progress: number
  totalLessons: number
  completedLessons: number
  estimatedTime: string
  isUnlocked: boolean
  isPremium: boolean
}

interface RecentActivity {
  id: string
  type: 'lesson' | 'quiz' | 'badge'
  title: string
  progress?: number
  score?: number
  date: string
  icon: string[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string[]
  color: string
  earnedDate?: string
  isEarned: boolean
}

// Current subject from route params
const subjectId = ref(route.params.subjectId as string)
const currentSubject = computed(() => {
  const apiSubject = subjectStore.getSubjectById(subjectId.value)
  if (!apiSubject) return null
  
  return {
    id: apiSubject.id,
    title: apiSubject.title,
    description: apiSubject.description,
    code: apiSubject.id.substring(0, 3).toUpperCase(),
    icon: ['fas', 'calculator'], // Default icon
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
})

const progress = ref<SubjectProgress>({
  overallProgress: 45,
  completedTopics: 5,
  totalTopics: 12,
  completedLessons: 23,
  totalLessons: 45,
  completedQuizzes: 8,
  totalQuizzes: 15,
  averageScore: 85,
  streak: 7,
  timeSpent: 1240 // minutes
})

const topics = ref<Topic[]>([
  {
    id: 'intro-accounting',
    title: 'Introduction to Accounting',
    description: 'Basic concepts and accounting equation',
    progress: 100,
    totalLessons: 5,
    completedLessons: 5,
    estimatedTime: '2 hours',
    isUnlocked: true,
    isPremium: false
  },
  {
    id: 'double-entry',
    title: 'Double Entry System',
    description: 'Understanding debits and credits',
    progress: 80,
    totalLessons: 6,
    completedLessons: 5,
    estimatedTime: '3 hours',
    isUnlocked: true,
    isPremium: false
  },
  {
    id: 'trial-balance',
    title: 'Trial Balance',
    description: 'Preparing and understanding trial balance',
    progress: 60,
    totalLessons: 4,
    completedLessons: 2,
    estimatedTime: '2.5 hours',
    isUnlocked: true,
    isPremium: false
  },
  {
    id: 'financial-statements',
    title: 'Financial Statements',
    description: 'Income statement and balance sheet',
    progress: 0,
    totalLessons: 8,
    completedLessons: 0,
    estimatedTime: '4 hours',
    isUnlocked: true,
    isPremium: true
  },
  {
    id: 'advanced-topics',
    title: 'Advanced Accounting Topics',
    description: 'Depreciation, accruals, and provisions',
    progress: 0,
    totalLessons: 10,
    completedLessons: 0,
    estimatedTime: '5 hours',
    isUnlocked: false,
    isPremium: true
  }
])

const recentActivity = ref<RecentActivity[]>([
  {
    id: '1',
    type: 'lesson',
    title: 'Journal Entries Practice',
    progress: 100,
    date: '2 hours ago',
    icon: ['fas', 'book-open']
  },
  {
    id: '2',
    type: 'quiz',
    title: 'Double Entry Quiz',
    score: 90,
    date: 'Yesterday',
    icon: ['fas', 'question-circle']
  },
  {
    id: '3',
    type: 'badge',
    title: 'Quick Learner Badge',
    date: '2 days ago',
    icon: ['fas', 'medal']
  }
])

const achievements = ref<Achievement[]>([
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: ['fas', 'play'],
    color: 'text-green-600',
    isEarned: true,
    earnedDate: '2024-01-20'
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Score 90% or higher on 5 quizzes',
    icon: ['fas', 'trophy'],
    color: 'text-yellow-600',
    isEarned: true,
    earnedDate: '2024-01-24'
  },
  {
    id: 'streak-7',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: ['fas', 'fire'],
    color: 'text-red-600',
    isEarned: true,
    earnedDate: '2024-01-25'
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete a topic with 100% score',
    icon: ['fas', 'star'],
    color: 'text-purple-600',
    isEarned: false
  }
])

const earnedAchievements = computed(() => achievements.value.filter(a => a.isEarned))
const nextTopicToStudy = computed(() => topics.value.find(t => t.progress < 100 && t.isUnlocked))

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const getProgressColor = (progress: number): string => {
  if (progress === 0) return 'bg-gray-300'
  if (progress < 50) return 'bg-red-400'
  if (progress < 80) return 'bg-yellow-400'
  return 'bg-green-400'
}

const navigateToTopic = (topicId: string) => {
  router.push(`/app/subjects/${subjectId.value}/topics/${topicId}`)
}

const navigateToLessons = () => {
  router.push(`/app/subjects/${subjectId.value}/lessons`)
}

const navigateToQuizzes = () => {
  router.push(`/app/subjects/${subjectId.value}/quizzes`)
}

const navigateToProgress = () => {
  router.push(`/app/subjects/${subjectId.value}/progress`)
}

const changeSubject = () => {
  router.push('/app/subjects')
}

const continueNext = () => {
  if (nextTopicToStudy.value) {
    navigateToTopic(nextTopicToStudy.value.id)
  }
}

// Load subject data
onMounted(async () => {
  try {
    loading.startLoading('Loading subject data...')
    
    // Load subjects if not already loaded
    if (subjectStore.subjects.length === 0) {
      await subjectStore.fetchSubjects()
    }
    
    // Load topics for current subject
    if (subjectId.value) {
      await subjectStore.fetchTopicsBySubject(subjectId.value)
    }
    
    // Check if subject exists
    if (!currentSubject.value) {
      router.push('/app/subjects')
      return
    }
  } catch (error) {
    const appError = errorHandler.handleError(error)
    console.error('Failed to load subject dashboard:', appError)
  } finally {
    loading.stopLoading()
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <!-- Subject Info -->
          <div class="flex items-center gap-4">
            <button
              @click="changeSubject"
              class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'arrow-left']" />
              <span class="text-sm">Back to Subjects</span>
            </button>
            
            <div class="h-6 w-px bg-gray-300"></div>
            
            <div v-if="currentSubject" class="flex items-center gap-3">
              <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', currentSubject.bgColor]">
                <font-awesome-icon :icon="currentSubject.icon" :class="['text-lg', currentSubject.color]" />
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900">{{ currentSubject.title }}</h1>
                <p class="text-sm text-gray-600">{{ currentSubject.description }}</p>
              </div>
            </div>
          </div>
          
          <!-- Quick Stats -->
          <div class="hidden md:flex items-center gap-6 text-sm">
            <div class="text-center">
              <div class="font-semibold text-gray-900">{{ progress.streak }}</div>
              <div class="text-gray-600">Day Streak</div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-gray-900">{{ progress.averageScore }}%</div>
              <div class="text-gray-600">Avg Score</div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-gray-900">{{ formatTime(progress.timeSpent) }}</div>
              <div class="text-gray-600">Time Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading.isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ loading.message }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="subjectStore.error" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
        <p class="text-gray-600 mb-4">{{ subjectStore.error }}</p>
        <Button
          variant="primary"
          @click="subjectStore.fetchSubjects"
          class="bg-green-600 hover:bg-green-700"
        >
          Try Again
        </Button>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Usage Limit Tracker -->
      <UsageLimitTracker 
        variant="dashboard" 
        class="mb-8"
      />

      <!-- Progress Overview -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Your Progress</h2>
          <Button variant="outline" size="sm" @click="navigateToProgress">
            View Details
          </Button>
        </div>
        
        <!-- Overall Progress -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">Overall Progress</span>
            <span class="text-sm font-medium text-gray-900">{{ progress.overallProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              :class="['h-3 rounded-full transition-all duration-300', getProgressColor(progress.overallProgress)]"
              :style="{ width: `${progress.overallProgress}%` }"
            ></div>
          </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">{{ progress.completedTopics }}/{{ progress.totalTopics }}</div>
            <div class="text-sm text-green-800">Topics</div>
          </div>
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{{ progress.completedLessons }}/{{ progress.totalLessons }}</div>
            <div class="text-sm text-blue-800">Lessons</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">{{ progress.completedQuizzes }}/{{ progress.totalQuizzes }}</div>
            <div class="text-sm text-purple-800">Quizzes</div>
          </div>
          <div class="text-center p-4 bg-amber-50 rounded-lg">
            <div class="text-2xl font-bold text-amber-600">{{ earnedAchievements.length }}</div>
            <div class="text-sm text-amber-800">Badges</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Continue Learning -->
          <div v-if="nextTopicToStudy" class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
            <h3 class="text-xl font-semibold mb-2">Continue Learning</h3>
            <p class="opacity-90 mb-4">Pick up where you left off</p>
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium">{{ nextTopicToStudy.title }}</h4>
                <p class="text-sm opacity-80">{{ nextTopicToStudy.completedLessons }}/{{ nextTopicToStudy.totalLessons }} lessons • {{ nextTopicToStudy.estimatedTime }}</p>
              </div>
              <Button variant="secondary" @click="continueNext" class="bg-white text-green-600 hover:bg-gray-50">
                Continue
              </Button>
            </div>
            <div class="mt-4">
              <div class="w-full bg-white/20 rounded-full h-2">
                <div
                  class="bg-white h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${nextTopicToStudy.progress}%` }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Topics Overview -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900">Topics</h3>
              <Button variant="outline" size="sm" @click="navigateToLessons">
                View All
              </Button>
            </div>
            
            <div class="space-y-4">
              <div
                v-for="topic in topics.slice(0, 4)"
                :key="topic.id"
                class="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors cursor-pointer"
                :class="{ 'opacity-50': !topic.isUnlocked }"
                @click="topic.isUnlocked ? navigateToTopic(topic.id) : null"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h4 class="font-medium text-gray-900">{{ topic.title }}</h4>
                      <span v-if="topic.isPremium" class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Premium
                      </span>
                      <span v-if="!topic.isUnlocked" class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        <font-awesome-icon :icon="['fas', 'lock']" class="mr-1" />
                        Locked
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">{{ topic.description }}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{{ topic.completedLessons }}/{{ topic.totalLessons }} lessons</span>
                      <span>{{ topic.estimatedTime }}</span>
                    </div>
                  </div>
                  <div class="ml-4 text-right">
                    <div class="text-sm font-medium text-gray-900">{{ topic.progress }}%</div>
                    <div class="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        :class="['h-2 rounded-full transition-all duration-300', getProgressColor(topic.progress)]"
                        :style="{ width: `${topic.progress}%` }"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                @click="navigateToLessons"
                class="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
              >
                <font-awesome-icon :icon="['fas', 'book-open']" class="text-2xl text-gray-400 group-hover:text-green-600 mb-2" />
                <div class="text-sm font-medium text-gray-900">Lessons</div>
              </button>
              
              <button
                @click="navigateToQuizzes"
                class="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <font-awesome-icon :icon="['fas', 'question-circle']" class="text-2xl text-gray-400 group-hover:text-blue-600 mb-2" />
                <div class="text-sm font-medium text-gray-900">Quizzes</div>
              </button>
              
              <button
                @click="router.push(`/app/subjects/${subjectId}/practice`)"
                class="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              >
                <font-awesome-icon :icon="['fas', 'calculator']" class="text-2xl text-gray-400 group-hover:text-purple-600 mb-2" />
                <div class="text-sm font-medium text-gray-900">Practice</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Recent Activity -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div class="space-y-3">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-shrink-0">
                  <font-awesome-icon :icon="activity.icon" class="text-gray-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ activity.title }}</p>
                  <div class="flex items-center gap-2 text-xs text-gray-600">
                    <span>{{ activity.date }}</span>
                    <span v-if="activity.score">• {{ activity.score }}%</span>
                    <span v-if="activity.progress">• {{ activity.progress }}% complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievements -->
          <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div class="space-y-3">
              <div
                v-for="achievement in earnedAchievements.slice(0, 3)"
                :key="achievement.id"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div :class="['flex-shrink-0 text-lg', achievement.color]">
                  <font-awesome-icon :icon="achievement.icon" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">{{ achievement.title }}</p>
                  <p class="text-xs text-gray-600">{{ achievement.earnedDate }}</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm" class="w-full mt-4" @click="router.push(`/app/subjects/${subjectId}/badges`)">
              View All Badges
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 