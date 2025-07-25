import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import progressService, { 
  type UserProgress, 
  type ProgressAnalytics, 
  type TopicProgress, 
  type LessonProgress 
} from '@/services/ProgressService'

export const useProgressStore = defineStore('progress', () => {
  // State
  const userProgress = ref<UserProgress[]>([])
  const progressAnalytics = ref<ProgressAnalytics | null>(null)
  const topicProgress = ref<Record<string, TopicProgress>>({})
  const lessonProgress = ref<Record<string, LessonProgress>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const totalSubjects = computed(() => userProgress.value.length)
  
  const completedSubjects = computed(() => 
    userProgress.value.filter(progress => progress.overall_progress >= 100).length
  )
  
  const totalStudyTime = computed(() => 
    userProgress.value.reduce((total, progress) => total + progress.time_spent, 0)
  )
  
  const averageScore = computed(() => {
    const scores = userProgress.value.map(progress => progress.average_score).filter(score => score > 0)
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  })

  // Get progress for specific subject
  const getSubjectProgress = (subjectId: string) => {
    return userProgress.value.find(progress => progress.subject_id === subjectId) || null
  }

  // Get topic progress
  const getTopicProgress = (topicId: string) => {
    return topicProgress.value[topicId] || null
  }

  // Get lesson progress
  const getLessonProgress = (lessonId: string) => {
    return lessonProgress.value[lessonId] || null
  }

  // Actions
  const fetchUserProgress = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiProgress = await progressService.getUserProgress()
        userProgress.value = apiProgress
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockProgress = await progressService.getMockUserProgress()
        userProgress.value = mockProgress
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user progress'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchSubjectProgress = async (subjectId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiProgress = await progressService.getSubjectProgress(subjectId)
        // Update or add to userProgress array
        const index = userProgress.value.findIndex(p => p.subject_id === subjectId)
        if (index >= 0) {
          userProgress.value[index] = apiProgress
        } else {
          userProgress.value.push(apiProgress)
        }
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockProgress = await progressService.getMockUserProgress()
        const subjectProgress = mockProgress.find(p => p.subject_id === subjectId)
        if (subjectProgress) {
          const index = userProgress.value.findIndex(p => p.subject_id === subjectId)
          if (index >= 0) {
            userProgress.value[index] = subjectProgress
          } else {
            userProgress.value.push(subjectProgress)
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch subject progress'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchProgressAnalytics = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiAnalytics = await progressService.getProgressAnalytics()
        progressAnalytics.value = apiAnalytics
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockAnalytics = await progressService.getMockProgressAnalytics()
        progressAnalytics.value = mockAnalytics
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch progress analytics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchTopicProgress = async (topicId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiProgress = await progressService.getTopicProgress(topicId)
        topicProgress.value[topicId] = apiProgress
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockProgress = await progressService.getMockTopicProgress(topicId)
        topicProgress.value[topicId] = mockProgress
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch topic progress'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProgress = async (subjectId: string, progressData: Partial<UserProgress>) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to update via API first, fallback to local update
      try {
        const updatedProgress = await progressService.updateProgress(subjectId, progressData)
        const index = userProgress.value.findIndex(p => p.subject_id === subjectId)
        if (index >= 0) {
          userProgress.value[index] = updatedProgress
        } else {
          userProgress.value.push(updatedProgress)
        }
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError)
        // Update locally for development
        const index = userProgress.value.findIndex(p => p.subject_id === subjectId)
        if (index >= 0) {
          userProgress.value[index] = {
            ...userProgress.value[index],
            ...progressData,
            updated_at: new Date().toISOString()
          }
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update progress'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const completeLesson = async (lessonId: string, timeSpent: number, score?: number) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to complete via API first, fallback to local update
      try {
        const lessonProgressData = await progressService.completeLesson(lessonId, timeSpent, score)
        lessonProgress.value[lessonId] = lessonProgressData
      } catch (apiError) {
        console.warn('API not available, updating locally:', apiError)
        // Update locally for development
        lessonProgress.value[lessonId] = {
          lesson_id: lessonId,
          topic_id: 'unknown',
          is_completed: true,
          time_spent: timeSpent,
          completed_at: new Date().toISOString(),
          score: score
        }
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to complete lesson'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getStudyStreak = async () => {
    try {
      return await progressService.getStudyStreak()
    } catch (err: any) {
      console.error('Failed to get study streak:', err)
      return 0
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCache = () => {
    topicProgress.value = {}
    lessonProgress.value = {}
    progressAnalytics.value = null
  }

  return {
    // State
    userProgress,
    progressAnalytics,
    topicProgress,
    lessonProgress,
    isLoading,
    error,
    
    // Computed
    totalSubjects,
    completedSubjects,
    totalStudyTime,
    averageScore,
    
    // Getters
    getSubjectProgress,
    getTopicProgress,
    getLessonProgress,
    
    // Actions
    fetchUserProgress,
    fetchSubjectProgress,
    fetchProgressAnalytics,
    fetchTopicProgress,
    updateProgress,
    completeLesson,
    getStudyStreak,
    clearError,
    clearCache
  }
}) 