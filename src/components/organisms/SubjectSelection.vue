<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'

const router = useRouter()

interface Subject {
  id: string
  title: string
  description: string
  code: string
  icon: string[]
  color: string
  bgColor: string
  totalTopics: number
  totalLessons: number
  estimatedHours: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  isComingSoon?: boolean
  userProgress?: number
  lastAccessed?: string
}

// Sample subjects data - in real app this would come from API
const subjects = ref<Subject[]>([
  {
    id: 'accounting',
    title: 'Accounting',
    description: 'Master the fundamentals of financial accounting, from basic bookkeeping to preparing financial statements.',
    code: 'ACC',
    icon: ['fas', 'calculator'],
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    totalTopics: 12,
    totalLessons: 45,
    estimatedHours: 60,
    difficulty: 'Intermediate',
    userProgress: 45,
    lastAccessed: '2024-01-25'
  },
  {
    id: 'economics',
    title: 'Economics',
    description: 'Understand economic principles, market dynamics, and how economies function at micro and macro levels.',
    code: 'ECO',
    icon: ['fas', 'chart-line'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    totalTopics: 10,
    totalLessons: 38,
    estimatedHours: 50,
    difficulty: 'Intermediate',
    userProgress: 0,
    isComingSoon: true
  },
  {
    id: 'business-studies',
    title: 'Business Studies',
    description: 'Learn about business operations, management principles, marketing, and entrepreneurship.',
    code: 'BUS',
    icon: ['fas', 'briefcase'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    totalTopics: 8,
    totalLessons: 32,
    estimatedHours: 45,
    difficulty: 'Beginner',
    userProgress: 0,
    isComingSoon: true
  },
  {
    id: 'mathematics',
    title: 'Mathematics',
    description: 'Strengthen your mathematical foundation with topics essential for business and economics.',
    code: 'MAT',
    icon: ['fas', 'square-root-variable'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    totalTopics: 15,
    totalLessons: 55,
    estimatedHours: 70,
    difficulty: 'Advanced',
    userProgress: 0,
    isComingSoon: true
  }
])

const searchQuery = ref('')
const selectedDifficulty = ref('All Levels')
const showOnlyStarted = ref(false)

const filteredSubjects = computed(() => {
  return subjects.value.filter(subject => {
    const matchesSearch = subject.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesDifficulty = selectedDifficulty.value === 'All Levels' || 
                             subject.difficulty === selectedDifficulty.value
    
    const matchesProgress = !showOnlyStarted.value || 
                           (subject.userProgress && subject.userProgress > 0)
    
    return matchesSearch && matchesDifficulty && matchesProgress
  })
})

const continueSubject = computed(() => {
  return subjects.value.find(subject => subject.userProgress && subject.userProgress > 0)
})

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'text-green-600 bg-green-50'
    case 'Intermediate':
      return 'text-blue-600 bg-blue-50'
    case 'Advanced':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

const selectSubject = (subject: Subject) => {
  if (subject.isComingSoon) {
    // Show coming soon message
    return
  }
  
  // Store selected subject in localStorage for now
  localStorage.setItem('selectedSubject', JSON.stringify(subject))
  
  // Navigate to subject dashboard
  router.push(`/app/subjects/${subject.id}/dashboard`)
}

const continueLearning = () => {
  if (continueSubject.value) {
    selectSubject(continueSubject.value)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900">Choose Your Subject</h1>
          <p class="mt-2 text-lg text-gray-600">Select a subject to begin your learning journey</p>
        </div>
        
        <!-- Continue Learning Banner -->
        <div v-if="continueSubject" class="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold">Continue Learning</h2>
              <p class="mt-1 opacity-90">Pick up where you left off in {{ continueSubject.title }}</p>
              <div class="mt-3 flex items-center gap-4 text-sm">
                <span>{{ continueSubject.userProgress }}% Complete</span>
                <span>•</span>
                <span>Last accessed {{ continueSubject.lastAccessed }}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              @click="continueLearning"
              class="bg-white text-green-600 hover:bg-gray-50"
            >
              Continue
            </Button>
          </div>
          <div class="mt-4">
            <div class="w-full bg-white/20 rounded-full h-2">
              <div
                class="bg-white h-2 rounded-full transition-all duration-300"
                :style="{ width: `${continueSubject.userProgress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <!-- Search -->
        <div class="flex-1">
          <div class="relative">
            <font-awesome-icon 
              :icon="['fas', 'search']" 
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search subjects..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
        
        <!-- Difficulty Filter -->
        <div>
          <select
            v-model="selectedDifficulty"
            class="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option>All Levels</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>
        
        <!-- Progress Filter -->
        <div class="flex items-center">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="showOnlyStarted"
              type="checkbox"
              class="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span class="text-sm text-gray-700">Only started subjects</span>
          </label>
        </div>
      </div>

      <!-- Subjects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="subject in filteredSubjects"
          :key="subject.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group"
          :class="{ 'opacity-60': subject.isComingSoon }"
          @click="selectSubject(subject)"
        >
          <!-- Subject Header -->
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', subject.bgColor]">
                <font-awesome-icon :icon="subject.icon" :class="['text-xl', subject.color]" />
              </div>
              
              <div class="flex items-center gap-2">
                <span :class="['px-2 py-1 text-xs font-medium rounded-full', getDifficultyColor(subject.difficulty)]">
                  {{ subject.difficulty }}
                </span>
                <span v-if="subject.isComingSoon" class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  Coming Soon
                </span>
              </div>
            </div>
            
            <h3 class="mt-4 text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
              {{ subject.title }}
            </h3>
            <p class="mt-2 text-gray-600 text-sm leading-relaxed">
              {{ subject.description }}
            </p>
          </div>
          
          <!-- Subject Stats -->
          <div class="px-6 pb-4">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-lg font-semibold text-gray-900">{{ subject.totalTopics }}</div>
                <div class="text-xs text-gray-500">Topics</div>
              </div>
              <div>
                <div class="text-lg font-semibold text-gray-900">{{ subject.totalLessons }}</div>
                <div class="text-xs text-gray-500">Lessons</div>
              </div>
              <div>
                <div class="text-lg font-semibold text-gray-900">{{ subject.estimatedHours }}h</div>
                <div class="text-xs text-gray-500">Duration</div>
              </div>
            </div>
          </div>
          
          <!-- Progress Bar (if started) -->
          <div v-if="subject.userProgress && subject.userProgress > 0" class="px-6 pb-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{{ subject.userProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                :class="['h-2 rounded-full transition-all duration-300', subject.color.replace('text-', 'bg-')]"
                :style="{ width: `${subject.userProgress}%` }"
              ></div>
            </div>
          </div>
          
          <!-- Action Button -->
          <div class="p-6 pt-0">
            <Button
              variant="outline"
              class="w-full group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700"
              :disabled="subject.isComingSoon"
            >
              <template v-if="subject.isComingSoon">
                <font-awesome-icon :icon="['fas', 'clock']" class="mr-2" />
                Coming Soon
              </template>
              <template v-else-if="subject.userProgress && subject.userProgress > 0">
                <font-awesome-icon :icon="['fas', 'play']" class="mr-2" />
                Continue Learning
              </template>
              <template v-else>
                <font-awesome-icon :icon="['fas', 'rocket']" class="mr-2" />
                Start Learning
              </template>
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredSubjects.length === 0" class="text-center py-12">
        <font-awesome-icon :icon="['fas', 'search']" class="text-4xl text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
        <p class="text-gray-600">Try adjusting your search criteria</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group:hover .group-hover\:bg-green-50 {
  background-color: rgb(240 253 244);
}
.group:hover .group-hover\:border-green-300 {
  border-color: rgb(134 239 172);
}
.group:hover .group-hover\:text-green-700 {
  color: rgb(21 128 61);
}
</style> 