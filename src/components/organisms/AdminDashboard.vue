<script setup lang="ts">
import { ref } from 'vue'
import Card from '../molecules/Card.vue'
import Button from '../atoms/Button.vue'

// Sample data - in real app this would come from API
const stats = {
  totalStudents: 156,
  activeToday: 45,
  totalLessons: 24,
  totalQuizzes: 15,
  averageScore: 82,
  completionRate: 68
}

const recentActivity = [
  {
    type: 'student_registered',
    user: 'Sarah Smith',
    date: '10 minutes ago'
  },
  {
    type: 'quiz_completed',
    user: 'John Doe',
    quiz: 'Double Entry Basics',
    score: 95,
    date: '30 minutes ago'
  },
  {
    type: 'lesson_completed',
    user: 'Mike Johnson',
    lesson: 'Introduction to Accounting',
    date: '1 hour ago'
  }
]

const quickActions = [
  { name: 'Add Lesson', icon: 'post_add', route: '/admin/lessons/new' },
  { name: 'Create Quiz', icon: 'add_task', route: '/admin/quizzes/new' },
  { name: 'Manage Students', icon: 'group', route: '/admin/students' },
  { name: 'View Reports', icon: 'analytics', route: '/admin/reports' }
]

const topPerformers = [
  {
    name: 'John Doe',
    progress: 85,
    quizzesTaken: 12,
    averageScore: 92
  },
  {
    name: 'Sarah Smith',
    progress: 78,
    quizzesTaken: 10,
    averageScore: 88
  },
  {
    name: 'Mike Johnson',
    progress: 72,
    quizzesTaken: 8,
    averageScore: 85
  }
]
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-900">Welcome, Admin!</h1>
      <p class="mt-1 text-gray-600">Here's what's happening in your learning platform.</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Students Card -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Students</p>
            <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.totalStudents }}</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <span class="material-icons-outlined text-2xl text-green-600">school</span>
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm text-gray-600">
          <span class="material-icons-outlined text-green-500 mr-1">person</span>
          {{ stats.activeToday }} active today
        </div>
      </div>

      <!-- Content Card -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Content</p>
            <p class="mt-2 text-3xl font-bold text-gray-900">
              {{ stats.totalLessons + stats.totalQuizzes }}
            </p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <span class="material-icons-outlined text-2xl text-blue-600">library_books</span>
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-600">
          {{ stats.totalLessons }} lessons, {{ stats.totalQuizzes }} quizzes
        </div>
      </div>

      <!-- Performance Card -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Average Score</p>
            <p class="mt-2 text-3xl font-bold text-gray-900">{{ stats.averageScore }}%</p>
          </div>
          <div class="bg-purple-100 rounded-full p-3">
            <span class="material-icons-outlined text-2xl text-purple-600">analytics</span>
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-600">
          {{ stats.completionRate }}% completion rate
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Button
        v-for="action in quickActions"
        :key="action.name"
        variant="outline"
        class="h-24"
        @click="$router.push(action.route)"
      >
        <div class="flex flex-col items-center">
          <span class="material-icons-outlined text-2xl mb-2">{{ action.icon }}</span>
          <span class="text-sm">{{ action.name }}</span>
        </div>
      </Button>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div class="space-y-4">
          <div
            v-for="(activity, index) in recentActivity"
            :key="index"
            class="flex items-start space-x-4"
          >
            <div class="flex-shrink-0">
              <span
                class="material-icons-outlined text-2xl"
                :class="{
                  'text-green-500': activity.type === 'student_registered',
                  'text-blue-500': activity.type === 'quiz_completed',
                  'text-purple-500': activity.type === 'lesson_completed'
                }"
              >
                {{ 
                  activity.type === 'student_registered' ? 'person_add' :
                  activity.type === 'quiz_completed' ? 'quiz' : 'book'
                }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">
                {{ activity.user }}
                <span class="text-gray-500">
                  {{ 
                    activity.type === 'student_registered' ? 'registered' :
                    activity.type === 'quiz_completed' ? `completed ${activity.quiz} with ${activity.score}%` :
                    `completed ${activity.lesson}`
                  }}
                </span>
              </p>
              <p class="text-sm text-gray-500">{{ activity.date }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Performers -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Top Performing Students</h2>
        <div class="space-y-6">
          <div
            v-for="student in topPerformers"
            :key="student.name"
            class="flex items-center"
          >
            <div class="flex-shrink-0">
              <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span class="material-icons-outlined text-gray-500">person</span>
              </div>
            </div>
            <div class="ml-4 flex-1">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-medium text-gray-900">{{ student.name }}</h3>
                <p class="text-sm text-gray-500">{{ student.averageScore }}% avg</p>
              </div>
              <div class="mt-1">
                <div class="bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-green-500 h-2 rounded-full"
                    :style="{ width: `${student.progress}%` }"
                  ></div>
                </div>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                {{ student.quizzesTaken }} quizzes completed
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 