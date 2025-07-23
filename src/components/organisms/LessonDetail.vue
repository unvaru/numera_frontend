<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Import components
import LessonHeader from '../molecules/lesson/LessonHeader.vue'
import LessonInfoCard from '../molecules/lesson/LessonInfoCard.vue'
import LearningObjectives from '../molecules/lesson/LearningObjectives.vue'
import LessonVideo from '../molecules/lesson/LessonVideo.vue'
import LessonContent from '../molecules/lesson/LessonContent.vue'
import KeyPoints from '../molecules/lesson/KeyPoints.vue'
import AdditionalResources from '../molecules/lesson/AdditionalResources.vue'
import LessonActions from '../molecules/lesson/LessonActions.vue'
import LessonNavigation from '../molecules/lesson/LessonNavigation.vue'
import LessonNotes from '../molecules/lesson/LessonNotes.vue'
import LessonSidebar from '../molecules/lesson/LessonSidebar.vue'
import { mockLessons } from '@/mock/lessonContent'
import type { ContentBlock } from '@/services/ContentService'

// Types
type FontSize = 'small' | 'medium' | 'large' | 'extra-large'

interface Lesson {
  id: number
  title: string
  description: string
  topic: string
  content: ContentBlock[]
  videoUrl?: string
  duration: string
  progress: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  image: string
  estimatedReadTime: string
  keyPoints: string[]
  objectives: string[]
  previousLessonId?: number
  nextLessonId?: number
  relatedQuizId?: number
  resources: Array<{
    title: string
    url: string
    type: 'pdf' | 'link' | 'video'
  }>
  lastUpdated: string
}

// Convert mock lessons to our format with proper content
const lessons: Lesson[] = Object.values(mockLessons).map(mockLesson => ({
  id: parseInt(mockLesson.id),
  title: mockLesson.title,
  description: mockLesson.description,
  topic: mockLesson.metadata.tags[0] || 'General',
  content: mockLesson.blocks, // Make sure we're passing the blocks directly
  duration: mockLesson.metadata.duration,
  progress: 0,
  difficulty: mockLesson.metadata.difficulty,
  image: mockLesson.metadata.image,
  estimatedReadTime: mockLesson.metadata.duration,
  keyPoints: mockLesson.keyPoints,
  objectives: mockLesson.learningObjectives,
  lastUpdated: mockLesson.metadata.lastUpdated,
  resources: [
    {
      title: 'Sample Resource',
      url: '/resources/sample.pdf',
      type: 'pdf'
    }
  ],
  previousLessonId: parseInt(mockLesson.id) > 1 ? parseInt(mockLesson.id) - 1 : undefined,
  nextLessonId: parseInt(mockLesson.id) < Object.keys(mockLessons).length ? parseInt(mockLesson.id) + 1 : undefined,
  relatedQuizId: parseInt(mockLesson.id)
}))

const route = useRoute()
const router = useRouter()

// Get route parameters for subject-aware navigation
const subjectId = computed(() => route.params.subjectId as string)

// Reactive state
const currentLessonId = ref(parseInt(route.params.id as string))
const isVideoPlaying = ref(false)
const readingProgress = ref(0)
const showNotes = ref(false)
const studentNotes = ref('')
const isMarkingComplete = ref(false)
const fontSize = ref<FontSize>('medium')
const isFullscreen = ref(false)

// Computed properties
const currentLesson = computed(() => 
  lessons.find(lesson => lesson.id === currentLessonId.value)
)

const previousLesson = computed(() => 
  currentLesson.value?.previousLessonId 
    ? lessons.find(l => l.id === currentLesson.value?.previousLessonId)
    : null
)

const nextLesson = computed(() => 
  currentLesson.value?.nextLessonId 
    ? lessons.find(l => l.id === currentLesson.value?.nextLessonId)
    : null
)

const completionPercentage = computed(() => {
  return Math.min(100, readingProgress.value + (currentLesson.value?.progress || 0))
})

const estimatedTimeRemaining = computed(() => {
  if (!currentLesson.value) return '0 mins'
  const totalMinutes = parseInt(currentLesson.value.duration)
  const remainingMinutes = Math.ceil(totalMinutes * (1 - readingProgress.value / 100))
  return `${remainingMinutes} mins`
})

// Add isMobile computed property
const isMobile = computed(() => window.innerWidth < 1024)

// Methods
const navigateToLesson = (lessonId: number) => {
  if (subjectId.value) {
    router.push(`/app/subjects/${subjectId.value}/lessons/${lessonId}`)
  } else {
    router.push('/app/subjects')
  }
}

const handleBack = () => {
  router.push(subjectId.value ? `/app/subjects/${subjectId.value}/lessons` : '/app/subjects')
}

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}

// Handle fullscreen change events
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const markAsComplete = async () => {
  if (!currentLesson.value) return
  
  isMarkingComplete.value = true
  try {
    // In real app, make API call to update progress
    await new Promise(resolve => setTimeout(resolve, 1000))
    currentLesson.value.progress = 100
    
    // Show completion notification
    showCompletionMessage()
  } finally {
    isMarkingComplete.value = false
  }
}

const showCompletionMessage = () => {
  // In real app, show a toast or modal
  console.log('Lesson completed! 🎉')
}

const saveNotes = async (notes: string) => {
  studentNotes.value = notes
  // In real app, save notes to API
  localStorage.setItem(`lesson-${currentLessonId.value}-notes`, notes)
}

const takeQuiz = () => {
  if (currentLesson.value?.relatedQuizId && subjectId.value) {
    router.push(`/app/subjects/${subjectId.value}/quiz/${currentLesson.value.relatedQuizId}`)
  }
}

const practice = () => {
  if (subjectId.value) {
    router.push(`/app/subjects/${subjectId.value}/practice`)
  }
}

// Track reading progress
const trackReadingProgress = () => {
  const scrollTop = window.pageYOffset
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = Math.min(100, (scrollTop / docHeight) * 100)
}

// Load content on mount
onMounted(() => {
  if (currentLessonId.value) {
    // loadLessonContent(currentLessonId.value) // No longer needed
  }
  window.addEventListener('scroll', trackReadingProgress)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  
  // Load saved notes for this lesson
  studentNotes.value = localStorage.getItem(`lesson-${currentLessonId.value}-notes`) || ''
})

// Cleanup
const saveAndCleanup = () => {
  if (studentNotes.value) {
    localStorage.setItem(`lesson-${currentLessonId.value}-notes`, studentNotes.value)
  }
  window.removeEventListener('scroll', trackReadingProgress)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
}

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    currentLessonId.value = parseInt(newId as string)
  readingProgress.value = 0
  isVideoPlaying.value = false
  showNotes.value = false
    
    // Load saved notes for this lesson
    studentNotes.value = localStorage.getItem(`lesson-${currentLessonId.value}-notes`) || ''
  }
})

const handleFontSizeChange = (size: FontSize) => {
  fontSize.value = size
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <!-- Main Container -->
    <div class=" bg-white rounded-lg shadow-sm relative">
      <!-- Header -->
      <div class="sticky top-4 bg-white rounded-t-lg ">
        <LessonHeader
          :topic="currentLesson?.topic"
          :title="currentLesson?.title"
          :show-notes="showNotes"
          :is-fullscreen="isFullscreen"
          :subject-id="subjectId"
          :font-size="fontSize"
          @back="handleBack"
          @toggle-notes="showNotes = !showNotes"
          @toggle-fullscreen="toggleFullscreen"
          @font-size-change="handleFontSizeChange"
        />
      </div>

      <!-- Floating Notes (Desktop) -->
      <Teleport to="body">
        <div class="fixed inset-0 z-[100] pointer-events-none">
          <LessonNotes
            v-if="showNotes && !isMobile"
            :initial-notes="studentNotes"
            :is-floating="true"
            @save="saveNotes"
            @close="showNotes = false"
          />
        </div>
      </Teleport>

      <!-- Mobile Notes Panel -->
      <LessonNotes
        v-if="showNotes && isMobile"
        class="lg:hidden fixed top-[60px] left-0 right-0 z-[85] bg-white border-b border-gray-200"
        :initial-notes="studentNotes"
        :is-mobile="true"
        @save="saveNotes"
      />

      <div class="flex flex-col lg:flex-row relative">
        <!-- Main Content -->
        <div 
          class="flex-1 overflow-y-auto main-content pb-[80px] lg:pb-6"
          :class="{
            'lg:mr-[60px]': !isFullscreen
          }"
        >
          <div 
            class="max-w-3xl mx-auto px-4 lg:px-8 py-6 space-y-8 lg:space-y-12"
            :class="{
              'text-sm': fontSize === 'small',
              'text-base': fontSize === 'medium',
              'text-lg': fontSize === 'large',
              'text-xl': fontSize === 'extra-large'
            }"
          >
            <!-- Lesson Info -->
            <LessonInfoCard
              v-if="currentLesson"
              :title="currentLesson.title"
              :description="currentLesson.description"
              :image="currentLesson.image"
              :difficulty="currentLesson.difficulty"
              :duration="currentLesson.duration"
              :estimated-read-time="currentLesson.estimatedReadTime"
              :last-updated="currentLesson.lastUpdated"
              :time-remaining="estimatedTimeRemaining"
              class="bg-gray-50/80 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md"
            />

            <!-- Learning Objectives -->
            <LearningObjectives
              v-if="currentLesson?.objectives"
              :objectives="currentLesson.objectives"
              class="bg-blue-50/50 rounded-2xl p-6 hover:bg-blue-50/80 transition-colors"
            />

            <!-- Video Section -->
            <LessonVideo
              v-if="currentLesson?.videoUrl"
              :video-url="currentLesson.videoUrl"
              class="rounded-2xl overflow-hidden shadow-sm bg-gray-50/80 backdrop-blur-sm border border-gray-200/50"
            />

            <!-- Lesson Content -->
            <LessonContent
              v-if="currentLesson?.content"
              :content="currentLesson.content"
              :font-size="fontSize"
              class="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-8 "
            />

            <!-- Key Points -->
            <KeyPoints
              v-if="currentLesson?.keyPoints?.length"
              :points="currentLesson.keyPoints"
              class="bg-amber-50/50 rounded-2xl p-6 hover:bg-amber-50/80 transition-colors"
            />

            <!-- Additional Resources -->
            <AdditionalResources
              v-if="currentLesson?.resources?.length"
              :resources="currentLesson.resources"
              class="bg-purple-50/50 rounded-2xl p-6 hover:bg-purple-50/80 transition-colors"
            />

            <!-- Action Buttons -->
            <LessonActions
              v-if="currentLesson"
              :progress="currentLesson.progress"
              :related-quiz-id="currentLesson.relatedQuizId"
              :is-marking-complete="isMarkingComplete"
              @complete="markAsComplete"
              @take-quiz="takeQuiz"
              @practice="practice"
              class="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm"
            />

            <!-- Navigation -->
            <!-- <LessonNavigation
              :previous-lesson="previousLesson"
              :next-lesson="nextLesson"
              @navigate="navigateToLesson"
              class="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50 hover:bg-indigo-50/80 transition-colors"
            /> -->
          </div>
        </div>

        <!-- Mobile Sidebar -->
        <aside
          v-if="!isFullscreen"
          class="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white border-t border-gray-200/50"
        >
          <LessonSidebar
            :reading-progress="readingProgress"
            :lesson-progress="currentLesson?.progress || 0"
            :previous-lesson="previousLesson"
            :next-lesson="nextLesson"
            :related-quiz-id="currentLesson?.relatedQuizId"
            @take-quiz="takeQuiz"
            @navigate="navigateToLesson"
          />
        </aside>

        <!-- Desktop Sidebar -->
        <aside
          v-if="!isFullscreen"
          class="hidden lg:block fixed top-[76px] right-4 w-[60px] bg-white rounded-b-lg"
        >
          <LessonSidebar
            :reading-progress="readingProgress"
            :lesson-progress="currentLesson?.progress || 0"
            :previous-lesson="previousLesson"
            :next-lesson="nextLesson"
            :related-quiz-id="currentLesson?.relatedQuizId"
            @take-quiz="takeQuiz"
            @navigate="navigateToLesson"
          />
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Main content area */
.main-content {
  height: calc(100vh - 76px - 2rem);
  scroll-behavior: smooth;
  @apply bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30;
}

/* Hide scrollbar but keep functionality */
.main-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.main-content::-webkit-scrollbar {
  width: 6px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

/* Safe area handling for mobile devices */
@media (max-width: 1024px) {
  .main-content {
    padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  }
}

/* Typography enhancements */
@media (min-width: 1024px) {
  .prose {
    font-feature-settings: 'kern', 'liga', 'clig', 'calt';
    font-kerning: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .prose pre {
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 0.75rem;
    padding: 1rem;
    margin: 1.5rem 0;
  }

  .prose code {
    background-color: #f1f5f9;
    border-radius: 0.25rem;
    padding: 0.125rem 0.25rem;
    font-size: 0.875em;
  }

  .prose blockquote {
    border-left-color: #22c55e;
    background-color: #f0fdf4;
    border-radius: 0.5rem;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
  }

  .prose table {
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;
    margin: 2rem 0;
    border-radius: 0.75rem;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .prose th {
    background-color: #f8fafc;
    font-weight: 600;
    text-align: left;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .prose td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .prose tr:last-child td {
    border-bottom: none;
  }
}

/* Component styles */
:deep(.bg-white) {
  @apply bg-white;
}

:deep(.bg-white\/80) {
  @apply bg-white/80;
}

:deep(.border-indigo-100) {
  @apply border-indigo-100;
}

:deep(.border-indigo-100\/50) {
  @apply border-indigo-100/50;
}

:deep(.bg-blue-50\/50) {
  @apply bg-blue-50/50;
}

:deep(.border-blue-100\/50) {
  @apply border-blue-100/50;
}

:deep(.bg-amber-50\/50) {
  @apply bg-amber-50/50;
}

:deep(.border-amber-100\/50) {
  @apply border-amber-100/50;
}

:deep(.bg-purple-50\/50) {
  @apply bg-purple-50/50;
}

:deep(.border-purple-100\/50) {
  @apply border-purple-100/50;
}

:deep(.bg-indigo-50\/50) {
  @apply bg-indigo-50/50;
}

/* Text colors */
:deep(.text-gray-900) {
  @apply text-gray-900;
}

:deep(.text-gray-800) {
  @apply text-gray-800;
}

:deep(.text-gray-700) {
  @apply text-gray-700;
}

:deep(.text-gray-600) {
  @apply text-gray-600;
}

:deep(.text-gray-500) {
  @apply text-gray-500;
}

/* Print optimizations */
@media print {
  .main-content {
    height: auto;
    overflow: visible;
  }

  .prose {
    max-width: none;
  }

  .prose pre {
    white-space: pre-wrap;
  }
}

/* Remove any backdrop-blur that might affect text */
.backdrop-blur-sm {
  backdrop-filter: none;
}

/* Ensure text stays sharp */
.main-content {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 