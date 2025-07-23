<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Card from '../molecules/Card.vue'
import Input from '../atoms/Input.vue'

// Import images properly for Vite
import { mockLessons } from '@/mock/lessonContent'

// Get route parameters
const route = useRoute()
const subjectId = computed(() => route.params.subjectId as string)

// If no subjectId, this component shouldn't be rendered here
// But add safety check for development
if (!route.params.subjectId) {
  console.warn('LessonList: No subjectId found in route params')
}

// Convert mock lessons to list format
const lessons = Object.values(mockLessons).map(mockLesson => ({
  id: parseInt(mockLesson.id),
  title: mockLesson.title,
  description: mockLesson.description,
  topic: mockLesson.metadata.tags[0] || 'General',
  duration: mockLesson.metadata.duration,
  progress: 0, // This would come from user progress data in real app
  difficulty: mockLesson.metadata.difficulty,
  image: mockLesson.metadata.image
}))

// Get unique topics from mock data
const topics = ['All Topics', ...new Set(lessons.map(lesson => lesson.topic))]

const selectedTopic = ref('All Topics')
const searchQuery = ref('')
const sortBy = ref('title') // 'title', 'duration', 'progress'
const sortOrder = ref('asc') // 'asc', 'desc'

const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
const selectedDifficulty = ref('All Levels')
const showFilters = ref(false)

const sortOptions = [
  { value: 'title', label: 'Title', icon: ['fas', 'sort-alpha-down'] },
  { value: 'duration', label: 'Duration', icon: ['fas', 'clock'] },
  { value: 'progress', label: 'Progress', icon: ['fas', 'chart-bar'] }
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'text-green-600 bg-green-50'
    case 'intermediate':
      return 'text-blue-600 bg-blue-50'
    case 'advanced':
      return 'text-purple-600 bg-purple-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

const sortedAndFilteredLessons = computed(() => {
  let filtered = lessons.filter(lesson => {
    const matchesTopic = selectedTopic.value === 'All Topics' || lesson.topic === selectedTopic.value
    const matchesDifficulty = selectedDifficulty.value === 'All Levels' || lesson.difficulty === selectedDifficulty.value
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesTopic && matchesDifficulty && matchesSearch
  })

  return filtered.sort((a, b) => {
    let comparison = 0
    switch (sortBy.value) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'duration':
        comparison = parseInt(a.duration) - parseInt(b.duration)
        break
      case 'progress':
        comparison = a.progress - b.progress
        break
    }
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedTopic.value = 'All Topics'
  selectedDifficulty.value = 'All Levels'
  sortBy.value = 'title'
  sortOrder.value = 'asc'
}
</script>

<template>
  <div class="lesson-list-content">
    <!-- Error state if no subject selected -->
    <div v-if="!subjectId" class="max-w-[1400px] mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div class="text-red-600 mb-2">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-2xl" />
        </div>
        <h3 class="text-lg font-semibold text-red-900 mb-2">No Subject Selected</h3>
        <p class="text-red-700 mb-4">Please select a subject to view lessons.</p>
        <router-link 
          to="/app/subjects" 
          class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
          Back to Subjects
        </router-link>
      </div>
    </div>

    <div v-else class="max-w-[1400px] mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'graduation-cap']" class="text-green-600" />
            Available Lessons
          </h1>
          <p class="mt-1 text-sm text-gray-500 flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'info-circle']" class="text-gray-400" />
            Explore our comprehensive accounting lessons
          </p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2 text-sm text-gray-500">
            <font-awesome-icon :icon="['fas', 'book']" />
            {{ sortedAndFilteredLessons.length }} lessons
          </div>
          <button 
            @click="showFilters = !showFilters"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <font-awesome-icon :icon="['fas', 'sliders']" class="mr-2" />
            Filters
            <span 
              v-if="selectedTopic !== 'All Topics' || selectedDifficulty !== 'All Levels'"
              class="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full flex items-center gap-1"
            >
              <font-awesome-icon :icon="['fas', 'check']" class="text-xs" />
              Active
            </span>
          </button>
        </div>
      </div>

      <!-- Search and Filters -->
      <div 
        class="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300"
        :class="showFilters ? 'max-h-[28rem]' : 'max-h-[68px]'"
      >
        <!-- Search Bar -->
        <div class="p-4 border-b border-gray-100">
          <div class="relative">
            <Input
              v-model="searchQuery"
              type="search"
              placeholder="Search lessons by title or description..."
              class="w-full pl-10"
            />
            <font-awesome-icon 
              :icon="['fas', 'magnifying-glass']" 
              class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <!-- Advanced Filters -->
        <div class="p-4 bg-gray-50" v-show="showFilters">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Topic Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'folder']" class="text-gray-400" />
                Topic
              </label>
              <select
                v-model="selectedTopic"
                class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-lg"
              >
                <option v-for="topic in topics" :key="topic">{{ topic }}</option>
              </select>
            </div>

            <!-- Difficulty Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'signal']" class="text-gray-400" />
                Difficulty
              </label>
              <select
                v-model="selectedDifficulty"
                class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-lg"
              >
                <option v-for="difficulty in difficulties" :key="difficulty">{{ difficulty }}</option>
              </select>
            </div>

            <!-- Sort By -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'sort']" class="text-gray-400" />
                Sort By
              </label>
              <div class="flex gap-2">
                <select
                  v-model="sortBy"
                  class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-lg"
                >
                  <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                    <font-awesome-icon :icon="option.icon" class="mr-2" />
                    {{ option.label }}
                  </option>
                </select>
                <button 
                  @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
                  class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white"
                  :title="sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
                >
                  <font-awesome-icon 
                    :icon="['fas', sortOrder === 'asc' ? 'arrow-down-short-wide' : 'arrow-up-wide-short']" 
                    class="text-gray-500"
                  />
                </button>
              </div>
            </div>

            <!-- Clear Filters -->
            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <font-awesome-icon :icon="['fas', 'rotate']" class="mr-2" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Lessons Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <router-link
          v-for="lesson in sortedAndFilteredLessons"
          :key="lesson.id"
          :to="subjectId ? `/app/subjects/${subjectId}/lessons/${lesson.id}` : '#'"
          class="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] block"
        >
          <Card
            :title="lesson.title"
            :subtitle="lesson.topic"
            :image="lesson.image"
            :progress="lesson.progress"
            variant="lesson"
            clickable
          >
          <div class="space-y-3">
            <p class="text-gray-600 text-sm line-clamp-2">{{ lesson.description }}</p>
            
            <div class="flex items-center justify-between">
              <div class="flex items-center text-sm text-gray-500">
                <font-awesome-icon :icon="['fas', 'clock']" class="mr-2" />
                {{ lesson.duration }}
              </div>
              <span 
                class="text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1"
                :class="getDifficultyColor(lesson.difficulty)"
              >
                <font-awesome-icon :icon="['fas', 'signal']" class="text-xs" />
                {{ lesson.difficulty }}
              </span>
            </div>

            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center text-gray-500">
                <font-awesome-icon :icon="['fas', 'chart-bar']" class="mr-2" />
                Progress
              </div>
              <span class="font-medium" :class="{
                'text-green-600': lesson.progress === 100,
                'text-blue-600': lesson.progress > 0 && lesson.progress < 100,
                'text-gray-500': lesson.progress === 0
              }">
                {{ lesson.progress }}%
              </span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                class="h-full transition-all duration-300"
                :class="{
                  'bg-green-500': lesson.progress === 100,
                  'bg-blue-500': lesson.progress > 0 && lesson.progress < 100,
                  'bg-gray-300': lesson.progress === 0
                }"
                :style="{ width: `${lesson.progress}%` }"
              ></div>
            </div>
          </div>

          <!-- Play Button Overlay -->
          <div 
            class="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-gray-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <button 
              class="transform scale-0 group-hover:scale-100 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300"
            >
              <font-awesome-icon 
                :icon="['fas', 'play']" 
                class="text-green-600 text-xl"
              />
            </button>
          </div>
        </Card>
        </router-link>
      </div>

      <!-- Empty State -->
      <div
        v-if="sortedAndFilteredLessons.length === 0"
        class="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm px-4 sm:px-6"
      >
        <div class="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
          <font-awesome-icon 
            :icon="['fas', 'magnifying-glass']" 
            class="text-4xl text-gray-400"
          />
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No lessons found</h3>
        <p class="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <button
          @click="clearFilters"
          class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <font-awesome-icon :icon="['fas', 'rotate']" class="mr-2" />
          Reset Filters
        </button>
      </div>
    </div> <!-- Close v-else div -->
  </div>
</template>

<style scoped>
/* Mobile spacing to avoid overlap with fixed navigation */
.lesson-list-content {
  /* Desktop spacing */
  padding: 2rem 1rem;
}

/* Mobile spacing adjustments */
@media (max-width: 1024px) {
  .lesson-list-content {
    /* Mobile: account for fixed header (60px) and bottom nav (80px) */
    padding: 1rem;
    padding-top: calc(60px + 1rem); /* Fixed header height + padding */
    padding-bottom: calc(80px + 1rem + env(safe-area-inset-bottom, 0px)); /* Fixed bottom nav + padding + safe area */
  }
}

/* Ensure content doesn't get hidden behind mobile navigation */
@media (max-width: 640px) {
  .lesson-list-content {
    /* Small mobile: more precise spacing */
    padding-top: calc(64px + 0.5rem); /* Slightly larger header on small screens */
    padding-bottom: calc(84px + 0.5rem + env(safe-area-inset-bottom, 0px)); /* Slightly larger bottom nav */
  }
}

.group {
  @apply relative;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 