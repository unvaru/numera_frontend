import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import quizService, {
  type QuizData,
  type QuizAttemptData,
  type QuizAttemptWithAnswers,
  type QuestionResult
} from '@/services/QuizService'

export const useQuizStore = defineStore('quiz', () => {
  // State
  const quizzes = ref<QuizData[]>([])
  const currentQuiz = ref<QuizData | null>(null)
  const currentQuizQuestions = ref<any[]>([])
  const currentAttempt = ref<QuizAttemptData | null>(null)
  const quizAttempts = ref<QuizAttemptData[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const quizzesByTopic = computed(() => (topicId: string) => {
    return quizzes.value.filter(quiz => quiz.topic_id === topicId)
  })

  const getQuizById = (quizId: string) => {
    return quizzes.value.find(quiz => quiz.id === quizId)
  }

  const getAttemptById = (attemptId: string) => {
    return quizAttempts.value.find(attempt => attempt.id === attemptId)
  }

  // Actions
  const fetchQuizzesByTopic = async (topicId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiQuizzes = await quizService.getQuizzesByTopic(topicId)
        quizzes.value = apiQuizzes
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockQuizzes = await quizService.getMockQuizzesByTopic(topicId)
        quizzes.value = mockQuizzes
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch quizzes'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchQuiz = async (quizId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiQuiz = await quizService.getQuiz(quizId)
        currentQuiz.value = apiQuiz
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        // For now, use the first mock quiz as fallback
        const mockQuizzes = await quizService.getMockQuizzesByTopic('topic-001')
        currentQuiz.value = mockQuizzes.find(q => q.id === quizId) || mockQuizzes[0]
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch quiz'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchQuizQuestions = async (quizId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiQuestions = await quizService.getQuizQuestions(quizId)
        currentQuizQuestions.value = apiQuestions
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockQuestions = await quizService.getMockQuizQuestions(quizId)
        currentQuizQuestions.value = mockQuestions
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch quiz questions'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const startQuizAttempt = async (quizId: string): Promise<QuizAttemptData> => {
    try {
      isLoading.value = true
      error.value = null

      // Try to start via API first, fallback to mock
      try {
        const apiAttempt = await quizService.startQuizAttempt(quizId)
        currentAttempt.value = apiAttempt
        return apiAttempt
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockAttempt = await quizService.mockStartQuizAttempt(quizId)
        currentAttempt.value = mockAttempt
        return mockAttempt
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to start quiz attempt'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const submitQuizAnswers = async (attemptId: string, answers: any[]): Promise<QuizAttemptWithAnswers> => {
    try {
      isLoading.value = true
      error.value = null

      // Try to submit via API first, fallback to mock
      try {
        const apiResult = await quizService.submitQuizAnswers(attemptId, answers)
        return apiResult
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockResult = await quizService.mockSubmitQuizAnswers(attemptId, answers)
        return mockResult
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to submit quiz answers'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchQuizAttempt = async (attemptId: string): Promise<QuizAttemptWithAnswers> => {
    try {
      isLoading.value = true
      error.value = null

      const apiAttempt = await quizService.getQuizAttempt(attemptId)
      return apiAttempt
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch quiz attempt'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserQuizAttempts = async (userId?: string): Promise<QuizAttemptData[]> => {
    try {
      isLoading.value = true
      error.value = null

      const apiAttempts = await quizService.getUserQuizAttempts(userId)
      quizAttempts.value = apiAttempts
      return apiAttempts
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user quiz attempts'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchQuizAttemptsByQuiz = async (quizId: string): Promise<QuizAttemptData[]> => {
    try {
      isLoading.value = true
      error.value = null

      const apiAttempts = await quizService.getQuizAttemptsByQuiz(quizId)
      quizAttempts.value = apiAttempts
      return apiAttempts
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch quiz attempts'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const abandonQuizAttempt = async (attemptId: string): Promise<void> => {
    try {
      isLoading.value = true
      error.value = null

      await quizService.abandonQuizAttempt(attemptId)
      currentAttempt.value = null
    } catch (err: any) {
      error.value = err.message || 'Failed to abandon quiz attempt'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchQuizAnalytics = async (quizId: string): Promise<any> => {
    try {
      isLoading.value = true
      error.value = null

      const apiAnalytics = await quizService.getQuizAnalytics(quizId)
      return apiAnalytics
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch quiz analytics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCache = () => {
    quizzes.value = []
    currentQuiz.value = null
    currentQuizQuestions.value = []
    currentAttempt.value = null
    quizAttempts.value = []
  }

  return {
    // State
    quizzes,
    currentQuiz,
    currentQuizQuestions,
    currentAttempt,
    quizAttempts,
    isLoading,
    error,
    
    // Computed
    quizzesByTopic,
    
    // Getters
    getQuizById,
    getAttemptById,
    
    // Actions
    fetchQuizzesByTopic,
    fetchQuiz,
    fetchQuizQuestions,
    startQuizAttempt,
    submitQuizAnswers,
    fetchQuizAttempt,
    fetchUserQuizAttempts,
    fetchQuizAttemptsByQuiz,
    abandonQuizAttempt,
    fetchQuizAnalytics,
    clearError,
    clearCache
  }
}) 