<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'

const route = useRoute()
const router = useRouter()

interface ProgressStats {
  overallProgress: number
  totalStudyTime: number // in minutes
  currentStreak: number
  longestStreak: number
  completedLessons: number
  totalLessons: number
  completedQuizzes: number
  totalQuizzes: number
  averageQuizScore: number
  topicsCompleted: number
  totalTopics: number
  badgesEarned: number
}

interface TopicProgress {
  id: string
  title: string
  progress: number
  completedLessons: number
  totalLessons: number
  averageScore: number
  timeSpent: number
  lastAccessed: string
  isPremium: boolean
}

interface ActivityData {
  date: string
  studyTime: number // in minutes
  lessonsCompleted: number
  quizzesCompleted: number
  averageScore: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string[]
  color: string
  earnedDate: string
  category: 'learning' | 'streak' | 'score' | 'time'
}

interface WeakArea {
  topic: string
  averageScore: number
  attempts: number
  lastAttempt: string
  recommendation: string
}

// Route parameters
const subjectId = ref(route.params.subjectId as string)

// Component state
const selectedPeriod = ref<'week' | 'month' | 'quarter' | 'year'>('month')
const activeTab = ref<'overview' | 'topics' | 'activity' | 'achievements'>('overview')

// Mock data - in real app this would come from API
const stats = ref<ProgressStats>({
  overallProgress: 65,
  totalStudyTime: 1847, // minutes
  currentStreak: 12,
  longestStreak: 18,
  completedLessons: 29,
  totalLessons: 45,
  completedQuizzes: 15,
  totalQuizzes: 23,
  averageQuizScore: 84,
  topicsCompleted: 7,
  totalTopics: 12,
  badgesEarned: 8
})

const topicProgress = ref<TopicProgress[]>([
  {
    id: 'intro-accounting',
    title: 'Introduction to Accounting',
    progress: 100,
    completedLessons: 5,
    totalLessons: 5,
    averageScore: 92,
    timeSpent: 180,
    lastAccessed: '2024-01-25',
    isPremium: false
  },
  {
    id: 'double-entry',
    title: 'Double Entry System',
    progress: 100,
    completedLessons: 6,
    totalLessons: 6,
    averageScore: 89,
    timeSpent: 240,
    lastAccessed: '2024-01-24',
    isPremium: false
  },
  {
    id: 'trial-balance',
    title: 'Trial Balance',
    progress: 80,
    completedLessons: 4,
    totalLessons: 5,
    averageScore: 76,
    timeSpent: 200,
    lastAccessed: '2024-01-23',
    isPremium: false
  },
  {
    id: 'financial-statements',
    title: 'Financial Statements',
    progress: 60,
    completedLessons: 3,
    totalLessons: 8,
    averageScore: 82,
    timeSpent: 150,
    lastAccessed: '2024-01-22',
    isPremium: true
  },
  {
    id: 'depreciation',
    title: 'Depreciation',
    progress: 40,
    completedLessons: 2,
    totalLessons: 6,
    averageScore: 71,
    timeSpent: 90,
    lastAccessed: '2024-01-20',
    isPremium: true
  }
])

const activityData = ref<ActivityData[]>([
  { date: '2024-01-25', studyTime: 45, lessonsCompleted: 2, quizzesCompleted: 1, averageScore: 87 },
  { date: '2024-01-24', studyTime: 60, lessonsCompleted: 1, quizzesCompleted: 2, averageScore: 92 },
  { date: '2024-01-23', studyTime: 30, lessonsCompleted: 1, quizzesCompleted: 1, averageScore: 76 },
  { date: '2024-01-22', studyTime: 50, lessonsCompleted: 2, quizzesCompleted: 0, averageScore: 0 },
  { date: '2024-01-21', studyTime: 40, lessonsCompleted: 1, quizzesCompleted: 1, averageScore: 89 },
  { date: '2024-01-20', studyTime: 35, lessonsCompleted: 1, quizzesCompleted: 1, averageScore: 71 },
  { date: '2024-01-19', studyTime: 55, lessonsCompleted: 2, quizzesCompleted: 1, averageScore: 94 }
])

const achievements = ref<Achievement[]>([
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Completed your first lesson',
    icon: ['fas', 'play'],
    color: 'text-green-600',
    earnedDate: '2024-01-15',
    category: 'learning'
  },
  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Achieved 100% on a quiz',
    icon: ['fas', 'star'],
    color: 'text-yellow-600',
    earnedDate: '2024-01-18',
    category: 'score'
  },
  {
    id: 'week-streak',
    title: 'Weekly Warrior',
    description: 'Maintained a 7-day learning streak',
    icon: ['fas', 'fire'],
    color: 'text-red-600',
    earnedDate: '2024-01-22',
    category: 'streak'
  },
  {
    id: 'topic-master',
    title: 'Topic Master',
    description: 'Completed your first topic with 90%+ average',
    icon: ['fas', 'trophy'],
    color: 'text-purple-600',
    earnedDate: '2024-01-20',
    category: 'learning'
  }
])

const weakAreas = ref<WeakArea[]>([
  {
    topic: 'Trial Balance',
    averageScore: 76,
    attempts: 3,
    lastAttempt: '2024-01-23',
    recommendation: 'Review error correction techniques and practice more trial balance scenarios'
  },
  {
    topic: 'Depreciation',
    averageScore: 71,
    attempts: 2,
    lastAttempt: '2024-01-20',
    recommendation: 'Focus on different depreciation methods and calculations'
  }
])

// Computed properties
const currentSubject = computed(() => {
  const stored = localStorage.getItem('selectedSubject')
  return stored ? JSON.parse(stored) : null
})

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

const getProgressColor = (progress: number): string => {
  if (progress >= 90) return 'bg-green-500'
  if (progress >= 70) return 'bg-blue-500'
  if (progress >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

const topPerformingTopics = computed(() => {
  return [...topicProgress.value]
    .filter(topic => topic.averageScore > 0)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 3)
})

const studyTimeThisWeek = computed(() => {
  return activityData.value
    .slice(0, 7)
    .reduce((total, day) => total + day.studyTime, 0)
})

const averageSessionTime = computed(() => {
  const sessionsWithTime = activityData.value.filter(day => day.studyTime > 0)
  if (sessionsWithTime.length === 0) return 0
  return Math.round(sessionsWithTime.reduce((total, day) => total + day.studyTime, 0) / sessionsWithTime.length)
})

// Methods
const goBack = () => {
  router.push(`/app/subjects/${subjectId.value}/dashboard`)
}

const viewTopic = (topicId: string) => {
  router.push(`/app/subjects/${subjectId.value}/topics/${topicId}`)
}

const exportProgress = () => {
  // In real app, this would generate and download a progress report
  console.log('Exporting progress report...')
  alert('Progress report exported!')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Load progress data
onMounted(() => {
  console.log('Loading progress for subject:', subjectId.value)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button variant="outline" size="sm" @click="goBack">
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
              Back to Dashboard
            </Button>
            
            <div v-if="currentSubject">
              <h1 class="text-2xl font-bold text-gray-900">Learning Progress</h1>
              <p class="text-gray-600">{{ currentSubject.title }} • Track your learning journey</p>
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <select
              v-model="selectedPeriod"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            
            <Button variant="outline" size="sm" @click="exportProgress">
              <font-awesome-icon :icon="['fas', 'download']" class="mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Progress Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Overall Progress</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.overallProgress }}%</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'chart-line']" class="text-green-600 text-xl" />
            </div>
          </div>
          <div class="mt-4">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-green-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${stats.overallProgress}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Study Time</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatTime(stats.totalStudyTime) }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'clock']" class="text-blue-600 text-xl" />
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2">{{ formatTime(studyTimeThisWeek) }} this week</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Current Streak</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.currentStreak }}</p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'fire']" class="text-red-600 text-xl" />
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2">Best: {{ stats.longestStreak }} days</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Average Score</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.averageQuizScore }}%</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'trophy']" class="text-purple-600 text-xl" />
            </div>
          </div>
          <p class="text-sm text-gray-600 mt-2">{{ stats.completedQuizzes }}/{{ stats.totalQuizzes }} quizzes</p>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="bg-white rounded-xl shadow-sm">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in [
                { id: 'overview', label: 'Overview', icon: ['fas', 'chart-pie'] },
                { id: 'topics', label: 'Topics', icon: ['fas', 'book'] },
                { id: 'activity', label: 'Activity', icon: ['fas', 'calendar'] },
                { id: 'achievements', label: 'Achievements', icon: ['fas', 'medal'] }
              ]"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2',
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="tab.icon" />
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Learning Stats -->
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Learning Statistics</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <font-awesome-icon :icon="['fas', 'book-open']" class="text-green-600" />
                        <span class="font-medium text-gray-900">Lessons Completed</span>
                      </div>
                      <span class="text-lg font-bold text-gray-900">{{ stats.completedLessons }}/{{ stats.totalLessons }}</span>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <font-awesome-icon :icon="['fas', 'question-circle']" class="text-blue-600" />
                        <span class="font-medium text-gray-900">Quizzes Completed</span>
                      </div>
                      <span class="text-lg font-bold text-gray-900">{{ stats.completedQuizzes }}/{{ stats.totalQuizzes }}</span>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <font-awesome-icon :icon="['fas', 'layer-group']" class="text-purple-600" />
                        <span class="font-medium text-gray-900">Topics Completed</span>
                      </div>
                      <span class="text-lg font-bold text-gray-900">{{ stats.topicsCompleted }}/{{ stats.totalTopics }}</span>
                    </div>
                    
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div class="flex items-center gap-3">
                        <font-awesome-icon :icon="['fas', 'medal']" class="text-amber-600" />
                        <span class="font-medium text-gray-900">Badges Earned</span>
                      </div>
                      <span class="text-lg font-bold text-gray-900">{{ stats.badgesEarned }}</span>
                    </div>
                  </div>
                </div>

                <!-- Top Performing Topics -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Performing Topics</h3>
                  <div class="space-y-3">
                    <div
                      v-for="topic in topPerformingTopics"
                      :key="topic.id"
                      class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 class="font-medium text-gray-900">{{ topic.title }}</h4>
                        <p class="text-sm text-gray-600">{{ topic.completedLessons }}/{{ topic.totalLessons }} lessons</p>
                      </div>
                      <div class="text-right">
                        <div :class="['text-lg font-bold', getScoreColor(topic.averageScore)]">
                          {{ topic.averageScore }}%
                        </div>
                        <div class="text-sm text-gray-500">avg score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Areas for Improvement -->
              <div class="space-y-6">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
                  <div class="space-y-4">
                    <div
                      v-for="area in weakAreas"
                      :key="area.topic"
                      class="p-4 border border-red-200 bg-red-50 rounded-lg"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <h4 class="font-medium text-gray-900">{{ area.topic }}</h4>
                        <span class="text-red-600 font-bold">{{ area.averageScore }}%</span>
                      </div>
                      <p class="text-sm text-gray-600 mb-2">{{ area.attempts }} attempts • Last: {{ formatDate(area.lastAttempt) }}</p>
                      <p class="text-sm text-red-700 font-medium">💡 {{ area.recommendation }}</p>
                    </div>
                  </div>
                </div>

                <!-- Study Habits -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Study Habits</h3>
                  <div class="space-y-4 text-sm">
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span class="text-gray-700">Average session time</span>
                      <span class="font-semibold">{{ formatTime(averageSessionTime) }}</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span class="text-gray-700">Most active day</span>
                      <span class="font-semibold">Monday</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span class="text-gray-700">Preferred study time</span>
                      <span class="font-semibold">Evening</span>
                    </div>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span class="text-gray-700">Learning style</span>
                      <span class="font-semibold">Visual learner</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Topics Tab -->
          <div v-if="activeTab === 'topics'">
            <div class="space-y-4">
              <div
                v-for="topic in topicProgress"
                :key="topic.id"
                class="border border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors cursor-pointer"
                @click="viewTopic(topic.id)"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <h3 class="text-lg font-semibold text-gray-900">{{ topic.title }}</h3>
                    <span v-if="topic.isPremium" class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Premium
                    </span>
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-gray-900">{{ topic.progress }}%</div>
                    <div class="text-sm text-gray-600">Complete</div>
                  </div>
                </div>
                
                <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    :class="['h-2 rounded-full transition-all duration-300', getProgressColor(topic.progress)]"
                    :style="{ width: `${topic.progress}%` }"
                  ></div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600">Lessons:</span>
                    <span class="ml-1 font-medium">{{ topic.completedLessons }}/{{ topic.totalLessons }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Avg Score:</span>
                    <span :class="['ml-1 font-medium', getScoreColor(topic.averageScore)]">{{ topic.averageScore }}%</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Time Spent:</span>
                    <span class="ml-1 font-medium">{{ formatTime(topic.timeSpent) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Last Accessed:</span>
                    <span class="ml-1 font-medium">{{ formatDate(topic.lastAccessed) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Tab -->
          <div v-if="activeTab === 'activity'">
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900">Recent Activity</h3>
              
              <div class="grid grid-cols-1 gap-4">
                <div
                  v-for="activity in activityData"
                  :key="activity.date"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-medium text-gray-900">{{ formatDate(activity.date) }}</h4>
                    <span class="text-sm text-gray-600">{{ formatTime(activity.studyTime) }} studied</span>
                  </div>
                  
                  <div class="grid grid-cols-3 gap-4 text-sm">
                    <div class="text-center p-2 bg-green-50 rounded">
                      <div class="font-bold text-green-600">{{ activity.lessonsCompleted }}</div>
                      <div class="text-green-800">Lessons</div>
                    </div>
                    <div class="text-center p-2 bg-blue-50 rounded">
                      <div class="font-bold text-blue-600">{{ activity.quizzesCompleted }}</div>
                      <div class="text-blue-800">Quizzes</div>
                    </div>
                    <div class="text-center p-2 bg-purple-50 rounded">
                      <div class="font-bold text-purple-600">{{ activity.averageScore || 'N/A' }}{{ activity.averageScore ? '%' : '' }}</div>
                      <div class="text-purple-800">Avg Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievements Tab -->
          <div v-if="activeTab === 'achievements'">
            <div class="space-y-6">
              <h3 class="text-lg font-semibold text-gray-900">Your Achievements</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="achievement in achievements"
                  :key="achievement.id"
                  class="border border-gray-200 rounded-lg p-4"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <div :class="['w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50', achievement.color.replace('text-', 'bg-').replace('600', '100')]">
                      <font-awesome-icon :icon="achievement.icon" :class="['text-xl', achievement.color]" />
                    </div>
                    <div>
                      <h4 class="font-semibold text-gray-900">{{ achievement.title }}</h4>
                      <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500">Earned on {{ formatDate(achievement.earnedDate) }}</span>
                    <span :class="['px-2 py-1 rounded-full text-xs font-medium', achievement.color.replace('text-', 'bg-').replace('600', '100'), achievement.color]">
                      {{ achievement.category }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 