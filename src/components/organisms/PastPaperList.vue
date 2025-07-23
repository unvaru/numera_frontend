<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from '../molecules/Card.vue'
import Input from '../atoms/Input.vue'
import Button from '../atoms/Button.vue'

const router = useRouter()

interface PastPaper {
  id: number
  year: number
  title: string
  session: string
  variant: string
  duration: number
  questions: number
  attempted: boolean
  score?: number
  completedAt?: string
  paperType: 'Theory' | 'MCQ' | 'Practical'
}

// Sample data - in real app this would come from API
const pastPapers: PastPaper[] = [
  {
    id: 1,
    year: 2023,
    title: 'Cambridge O Level Accounting',
    session: 'May/June',
    variant: 'Paper 1',
    duration: 180,
    questions: 40,
    attempted: true,
    score: 85,
    completedAt: '2 days ago',
    paperType: 'Theory'
  },
  {
    id: 2,
    year: 2023,
    title: 'Cambridge O Level Accounting',
    session: 'May/June',
    variant: 'Paper 2',
    duration: 120,
    questions: 30,
    attempted: true,
    score: 78,
    completedAt: '1 week ago',
    paperType: 'MCQ'
  },
  {
    id: 3,
    year: 2023,
    title: 'Cambridge O Level Accounting',
    session: 'Oct/Nov',
    variant: 'Paper 1',
    duration: 180,
    questions: 40,
    attempted: false,
    paperType: 'Theory'
  },
  {
    id: 4,
    year: 2022,
    title: 'Cambridge O Level Accounting',
    session: 'May/June',
    variant: 'Paper 1',
    duration: 180,
    questions: 40,
    attempted: true,
    score: 72,
    completedAt: '2 weeks ago',
    paperType: 'Theory'
  },
  {
    id: 5,
    year: 2022,
    title: 'Cambridge O Level Accounting',
    session: 'Oct/Nov',
    variant: 'Paper 2',
    duration: 120,
    questions: 30,
    attempted: false,
    paperType: 'MCQ'
  },
  {
    id: 6,
    year: 2021,
    title: 'Cambridge O Level Accounting',
    session: 'May/June',
    variant: 'Paper 1',
    duration: 180,
    questions: 40,
    attempted: true,
    score: 68,
    completedAt: '1 month ago',
    paperType: 'Theory'
  }
]

const years = [...new Set(pastPapers.map(paper => paper.year))].sort((a, b) => b - a)
const sessions = ['All Sessions', 'May/June', 'Oct/Nov']
const paperTypes = ['All Types', 'Theory', 'MCQ', 'Practical']
const statusFilters = ['All Papers', 'Attempted', 'Not Attempted', 'High Score (≥80%)', 'Need Improvement (<70%)']

const selectedYear = ref('All Years')
const selectedSession = ref('All Sessions')
const selectedPaperType = ref('All Types')
const selectedStatus = ref('All Papers')
const searchQuery = ref('')

const getScoreColor = (score?: number) => {
  if (!score) return 'text-gray-500'
  if (score >= 80) return 'text-green-600'
  if (score >= 70) return 'text-blue-600'
  return 'text-yellow-600'
}

const getScoreBadgeColor = (score?: number) => {
  if (!score) return 'bg-gray-100 text-gray-600'
  if (score >= 80) return 'bg-green-100 text-green-700'
  if (score >= 70) return 'bg-blue-100 text-blue-700'
  return 'bg-yellow-100 text-yellow-700'
}

const getPaperTypeColor = (type: string) => {
  switch (type) {
    case 'Theory':
      return 'bg-purple-100 text-purple-700'
    case 'MCQ':
      return 'bg-blue-100 text-blue-700'
    case 'Practical':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const filteredPapers = computed(() => {
  return pastPapers.filter(paper => {
    const matchesYear = selectedYear.value === 'All Years' || paper.year.toString() === selectedYear.value
    const matchesSession = selectedSession.value === 'All Sessions' || paper.session === selectedSession.value
    const matchesPaperType = selectedPaperType.value === 'All Types' || paper.paperType === selectedPaperType.value
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         paper.session.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         paper.variant.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    let matchesStatus = true
    if (selectedStatus.value === 'Attempted') {
      matchesStatus = paper.attempted
    } else if (selectedStatus.value === 'Not Attempted') {
      matchesStatus = !paper.attempted
    } else if (selectedStatus.value === 'High Score (≥80%)') {
      matchesStatus = paper.attempted && paper.score !== undefined && paper.score >= 80
    } else if (selectedStatus.value === 'Need Improvement (<70%)') {
      matchesStatus = paper.attempted && paper.score !== undefined && paper.score < 70
    }
    
    return matchesYear && matchesSession && matchesPaperType && matchesSearch && matchesStatus
  })
})

const clearFilters = () => {
  selectedYear.value = 'All Years'
  selectedSession.value = 'All Sessions'
  selectedPaperType.value = 'All Types'
  selectedStatus.value = 'All Papers'
  searchQuery.value = ''
}

const startPaper = (paperId: number) => {
  // Navigate to paper attempt page
  router.push(`/app/past-papers/${paperId}`)
}
</script>

<template>
  <div class="past-papers-content">
    <div class="max-w-[1400px] mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'file-alt']" class="text-orange-600" />
              Past Papers
            </h1>
            <p class="mt-1 text-sm text-gray-500">Practice with Cambridge O Level past examination papers</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-sm text-gray-500 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'clipboard-list']" />
              {{ filteredPapers.length }} papers available
            </div>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <Input
            v-model="searchQuery"
            type="search"
            placeholder="Search past papers by year, session, or variant..."
            class="w-full pl-10"
          />
          <font-awesome-icon 
            :icon="['fas', 'magnifying-glass']" 
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <!-- Filters -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              v-model="selectedYear"
              class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-lg"
            >
              <option>All Years</option>
              <option v-for="year in years" :key="year">{{ year }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Session</label>
            <select
              v-model="selectedSession"
              class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-lg"
            >
              <option v-for="session in sessions" :key="session">{{ session }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Paper Type</label>
            <select
              v-model="selectedPaperType"
              class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-lg"
            >
              <option v-for="type in paperTypes" :key="type">{{ type }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              v-model="selectedStatus"
              class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 rounded-lg"
            >
              <option v-for="status in statusFilters" :key="status">{{ status }}</option>
            </select>
          </div>

          <div class="flex items-end">
            <Button
              variant="outline"
              @click="clearFilters"
              class="w-full"
            >
              <font-awesome-icon :icon="['fas', 'rotate']" class="mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <!-- Past Papers Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="paper in filteredPapers"
          :key="paper.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
          :class="{
            'ring-2 ring-green-200 border-green-300': paper.attempted && paper.score && paper.score >= 80,
            'ring-2 ring-yellow-200 border-yellow-300': paper.attempted && paper.score && paper.score < 70
          }"
        >
          <div class="p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-lg font-bold text-orange-600">{{ paper.year }}</span>
                  <span 
                    class="text-xs font-medium px-2 py-1 rounded-full"
                    :class="getPaperTypeColor(paper.paperType)"
                  >
                    {{ paper.paperType }}
                  </span>
                </div>
                <h3 class="font-semibold text-gray-900 text-sm">{{ paper.session }} {{ paper.variant }}</h3>
              </div>
              
              <!-- Score Badge -->
              <div v-if="paper.attempted && paper.score !== undefined" class="text-right">
                <div 
                  class="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                  :class="getScoreBadgeColor(paper.score)"
                >
                  <font-awesome-icon 
                    :icon="['fas', paper.score >= 80 ? 'trophy' : paper.score >= 70 ? 'medal' : 'star']" 
                    class="text-xs"
                  />
                  {{ paper.score }}%
                </div>
                <div class="text-xs text-gray-500 mt-1">{{ paper.completedAt }}</div>
              </div>
              <div v-else class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                Not attempted
              </div>
            </div>

            <!-- Paper Details -->
            <div class="space-y-3 mb-6">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="flex items-center text-gray-600">
                  <font-awesome-icon :icon="['fas', 'clock']" class="mr-2 text-gray-400" />
                  <span>{{ Math.floor(paper.duration / 60) }}h {{ paper.duration % 60 }}m</span>
                </div>
                <div class="flex items-center text-gray-600">
                  <font-awesome-icon :icon="['fas', 'question-circle']" class="mr-2 text-gray-400" />
                  <span>{{ paper.questions }} questions</span>
                </div>
              </div>

              <!-- Progress indicator for attempted papers -->
              <div v-if="paper.attempted" class="pt-2">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Performance</span>
                  <span :class="getScoreColor(paper.score)">
                    {{ paper.score ? `${paper.score}%` : 'Completed' }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-300"
                    :class="{
                      'bg-green-400': paper.score && paper.score >= 80,
                      'bg-blue-400': paper.score && paper.score >= 70 && paper.score < 80,
                      'bg-yellow-400': paper.score && paper.score < 70,
                      'bg-gray-400': !paper.score
                    }"
                    :style="{ width: paper.score ? `${paper.score}%` : '100%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <Button
              :variant="paper.attempted ? 'outline' : 'primary'"
              class="w-full group-hover:shadow-sm transition-shadow"
              @click="startPaper(paper.id)"
            >
              <font-awesome-icon 
                :icon="paper.attempted ? ['fas', 'redo'] : ['fas', 'play']" 
                class="mr-2" 
              />
              {{ paper.attempted ? 'Retry Paper' : 'Start Paper' }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredPapers.length === 0"
        class="text-center py-12 bg-white rounded-xl shadow-sm"
      >
        <div class="bg-gray-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto">
          <font-awesome-icon 
            :icon="['fas', 'file-alt']" 
            class="text-4xl text-gray-400"
          />
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No past papers found</h3>
        <p class="mt-2 text-sm text-gray-500">
          Try adjusting your search or filters to find what you're looking for.
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
  </div>
</template>

<style scoped>
/* Mobile spacing to avoid overlap with fixed navigation */
.past-papers-content {
  /* Desktop spacing */
  padding: 2rem 1rem;
}

/* Mobile spacing adjustments */
@media (max-width: 1024px) {
  .past-papers-content {
    /* Mobile: account for fixed header (60px) and bottom nav (80px) */
    padding: 1rem;
    padding-top: calc(60px + 1rem); /* Fixed header height + padding */
    padding-bottom: calc(80px + 1rem + env(safe-area-inset-bottom, 0px)); /* Fixed bottom nav + padding + safe area */
  }
}

/* Ensure content doesn't get hidden behind mobile navigation */
@media (max-width: 640px) {
  .past-papers-content {
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

.hover-scale {
  transition: transform 0.2s ease-in-out;
}

.hover-scale:hover {
  transform: scale(1.02);
}
</style> 