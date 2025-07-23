<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '../molecules/Card.vue'
import Button from '../atoms/Button.vue'
import balanceSheetImg from '@/assets/images/balancesheet.png'
import incomeStatementImg from '@/assets/images/incomeStatement.png'

const router = useRouter()

// Sample data - in real app this would come from API
const studentProgress = {
  overallProgress: 45,
  streak: 5,
  completedLessons: 12,
  totalLessons: 30,
  completedQuizzes: 8,
  totalQuizzes: 15,
  averageScore: 85
}

const recommendedLessons = [
  {
    id: 1,
    title: 'Balance Sheet Basics',
    description: 'Learn how to prepare a basic balance sheet',
    duration: '35 mins',
    progress: 0,
    image: balanceSheetImg
  },
  {
    id: 2,
    title: 'Income Statement',
    description: 'Understanding profit and loss statements',
    duration: '40 mins',
    progress: 0,
    image: incomeStatementImg
  }
]

const recentActivity = [
  {
    type: 'quiz',
    title: 'Double Entry Quiz',
    score: 90,
    date: '2 hours ago'
  },
  {
    type: 'lesson',
    title: 'Introduction to Accounting',
    progress: 100,
    date: 'Yesterday'
  },
  {
    type: 'badge',
    title: 'Quick Learner',
    date: '2 days ago'
  }
]

const quickLinks = [
  { 
    name: 'Continue Learning', 
    icon: ['fas', 'play-circle'], 
    route: '/app/lessons' 
  },
  { 
    name: 'Practice Questions', 
    icon: ['fas', 'database'], 
    route: '/app/question-bank' 
  },
  { 
    name: 'Past Papers', 
    icon: ['fas', 'file-alt'], 
    route: '/app/past-papers' 
  },
  { 
    name: 'View Progress', 
    icon: ['fas', 'chart-line'], 
    route: '/app/progress' 
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'lesson':
      return ['fas', 'book-open']
    case 'quiz':
      return ['fas', 'question-circle']
    case 'badge':
      return ['fas', 'medal']
    default:
      return ['fas', 'circle']
  }
}
</script>

<template>
  <div class="dashboard-content">
    <div class="max-w-[1400px] mx-auto dashboard-container">
      <!-- Welcome Section -->
      <div class="bg-white rounded-xl lg:rounded-2xl shadow-sm p-4 lg:p-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-xl lg:text-3xl font-bold text-gray-900 mobile-title">Welcome back, Student!</h1>
            <p class="mt-1 lg:mt-2 text-sm lg:text-base text-gray-600">Ready to continue your learning journey?</p>
          </div>
          <div class="flex items-center gap-2 bg-green-50 px-3 lg:px-4 py-2 rounded-xl">
            <font-awesome-icon :icon="['fas', 'fire']" class="text-xl lg:text-2xl text-green-600" />
            <div>
              <div class="text-2xl lg:text-3xl font-bold text-green-600">{{ studentProgress.streak }}</div>
              <div class="text-xs lg:text-sm text-green-700">Day Streak</div>
            </div>
          </div>
        </div>

        <!-- Overall Progress -->
        <div class="mt-6 lg:mt-8">
          <div class="flex items-center justify-between mb-2 lg:mb-3">
            <div class="text-sm font-medium text-gray-700">Overall Progress</div>
            <div class="text-sm font-medium text-gray-900">{{ studentProgress.overallProgress }}%</div>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 lg:h-3">
            <div
              class="bg-green-500 h-2 lg:h-3 rounded-full transition-all duration-300"
              :style="{ width: `${studentProgress.overallProgress}%` }"
            ></div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="mt-6 lg:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <div class="bg-green-50 rounded-xl p-3 lg:p-4 flex flex-col items-center justify-center mobile-stats">
            <div class="text-2xl lg:text-3xl font-bold text-green-600">{{ studentProgress.completedLessons }}/{{ studentProgress.totalLessons }}</div>
            <div class="text-xs lg:text-sm font-medium text-green-800 mt-1 text-center">Lessons Completed</div>
          </div>
          <div class="bg-blue-50 rounded-xl p-3 lg:p-4 flex flex-col items-center justify-center mobile-stats">
            <div class="text-2xl lg:text-3xl font-bold text-blue-600">{{ studentProgress.completedQuizzes }}/{{ studentProgress.totalQuizzes }}</div>
            <div class="text-xs lg:text-sm font-medium text-blue-800 mt-1 text-center">Quizzes Completed</div>
          </div>
          <div class="bg-purple-50 rounded-xl p-3 lg:p-4 flex flex-col items-center justify-center mobile-stats">
            <div class="text-2xl lg:text-3xl font-bold text-purple-600">{{ studentProgress.averageScore }}%</div>
            <div class="text-xs lg:text-sm font-medium text-purple-800 mt-1 text-center">Average Score</div>
          </div>
          <div class="bg-amber-50 rounded-xl p-3 lg:p-4 flex flex-col items-center justify-center mobile-stats">
            <div class="text-2xl lg:text-3xl font-bold text-amber-600">3</div>
            <div class="text-xs lg:text-sm font-medium text-amber-800 mt-1 text-center">Badges Earned</div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-6 lg:mt-8">
        <Button
          v-for="link in quickLinks"
          :key="link.name"
          variant="outline"
          class="h-20 lg:h-28 hover:bg-gray-50 transition-colors quick-link-button"
          @click="router.push(link.route)"
        >
          <div class="flex flex-col items-center">
            <font-awesome-icon :icon="link.icon" class="text-2xl lg:text-3xl mb-1 lg:mb-2 text-gray-700" />
            <span class="text-xs lg:text-sm font-medium text-gray-900 text-center">{{ link.name }}</span>
          </div>
        </Button>
      </div>

      <div class="grid lg:grid-cols-2 gap-4 lg:gap-8 mt-6 lg:mt-8">
        <!-- Recommended Lessons -->
        <div>
          <h2 class="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'star']" class="text-amber-400" />
            Recommended for You
          </h2>
          <div class="grid gap-3 lg:gap-4">
            <Card
              v-for="lesson in recommendedLessons"
              :key="lesson.id"
              :title="lesson.title"
              :image="lesson.image"
              variant="lesson"
              class="hover:shadow-md transition-shadow"
              clickable
            >
              <p class="text-gray-600 text-sm mb-3">{{ lesson.description }}</p>
              <div class="flex items-center text-sm text-gray-500">
                <font-awesome-icon :icon="['far', 'clock']" class="mr-2" />
                {{ lesson.duration }}
              </div>
            </Card>
          </div>
        </div>

        <!-- Recent Activity -->
        <div>
          <h2 class="text-lg lg:text-xl font-bold text-gray-900 mb-3 lg:mb-4 flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'history']" />
            Recent Activity
          </h2>
          <div class="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            <div
              v-for="activity in recentActivity"
              :key="activity.title"
              class="p-3 lg:p-4 flex items-center hover:bg-gray-50 transition-colors activity-item"
            >
              <div class="p-2 rounded-lg mr-3 lg:mr-4"
                :class="{
                  'bg-green-100': activity.type === 'lesson',
                  'bg-blue-100': activity.type === 'quiz',
                  'bg-amber-100': activity.type === 'badge'
                }"
              >
                <font-awesome-icon 
                  :icon="getActivityIcon(activity.type)"
                  class="text-lg lg:text-2xl"
                  :class="{
                    'text-green-600': activity.type === 'lesson',
                    'text-blue-600': activity.type === 'quiz',
                    'text-amber-600': activity.type === 'badge'
                  }"
                />
              </div>
              <div class="flex-1">
                <div class="font-medium text-gray-900 text-sm lg:text-base">{{ activity.title }}</div>
                <div class="text-xs lg:text-sm text-gray-600 mt-1">
                  <template v-if="activity.type === 'quiz'">
                    Scored {{ activity.score }}%
                  </template>
                  <template v-else-if="activity.type === 'lesson'">
                    Completed lesson
                  </template>
                  <template v-else>
                    Earned badge
                  </template>
                  <span class="mx-1">•</span>
                  {{ activity.date }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add transition for expanded state */
.lg\:expanded\:pl-\[19rem\] {
  padding-left: 19rem;
}

/* Mobile spacing to avoid overlap with fixed navigation */
.dashboard-content {
  /* Desktop spacing */
  padding: 2rem 1rem;
}

/* Mobile spacing adjustments */
@media (max-width: 1024px) {
  .dashboard-content {
    /* Mobile: account for fixed header (60px) and bottom nav (80px) */
    padding: 1rem;
    padding-top: calc(60px + 1rem); /* Fixed header height + padding */
    padding-bottom: calc(80px + 1rem + env(safe-area-inset-bottom, 0px)); /* Fixed bottom nav + padding + safe area */
  }
}

/* Safe area handling for mobile devices */
@media (max-width: 1024px) {
  .dashboard-container {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}

/* Ensure content doesn't get hidden behind mobile navigation */
@media (max-width: 640px) {
  .dashboard-content {
    /* Small mobile: more precise spacing */
    padding-top: calc(64px + 0.5rem); /* Slightly larger header on small screens */
    padding-bottom: calc(84px + 0.5rem + env(safe-area-inset-bottom, 0px)); /* Slightly larger bottom nav */
  }
  
  /* Adjust typography for better mobile readability */
  .mobile-title {
    line-height: 1.2;
  }
  
  .mobile-stats {
    min-height: 60px;
  }
}

/* Improve touch targets for mobile */
@media (max-width: 1024px) {
  .quick-link-button {
    min-height: 80px;
  }
  
  .activity-item {
    min-height: 60px;
  }
}
</style> 