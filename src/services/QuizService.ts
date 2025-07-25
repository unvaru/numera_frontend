import apiClient, { apiUtils } from '@/config/api'
import type { ApiResponse } from '@/config/api'
import type { Question, Quiz, QuizAttempt, Answer } from '@/types/questions'
import { QuestionType, DifficultyLevel } from '@/types/questions'

// Quiz interface
export interface QuizData {
  id: string
  topic_id: string
  title: string
  description: string
  instructions?: string
  time_limit?: number // in minutes
  passing_score?: number
  allow_review?: boolean
  shuffle_questions?: boolean
  show_results?: 'immediate' | 'after_submission' | 'never'
  is_active: boolean
  is_premium_only?: boolean
  created_at?: string
  updated_at?: string
}

// Quiz attempt interface
export interface QuizAttemptData {
  id: string
  user_id: string
  quiz_id: string
  attempt_number: number
  status: 'in_progress' | 'completed' | 'abandoned'
  score?: number
  max_score: number
  started_at: string
  completed_at?: string
  time_spent?: number // in seconds
}

// Quiz attempt with answers interface
export interface QuizAttemptWithAnswers extends QuizAttemptData {
  answers: Answer[]
  results?: QuestionResult[]
}

// Question result interface
export interface QuestionResult {
  question_id: string
  score: number
  max_score: number
  is_correct: boolean
  feedback: string[]
  partial_scores?: { part_id: string; score: number; max_score: number }[]
}

// Start quiz attempt request
export interface StartQuizAttemptRequest {
  quiz_id: string
}

// Submit quiz answers request
export interface SubmitQuizAnswersRequest {
  answers: Answer[]
}

class QuizService {
  // Get quizzes by topic
  async getQuizzesByTopic(topicId: string): Promise<QuizData[]> {
    try {
      const response = await apiClient.get<ApiResponse<QuizData[]>>(`/api/v1/topics/${topicId}/quizzes`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get quiz by ID
  async getQuiz(id: string): Promise<QuizData> {
    try {
      const response = await apiClient.get<ApiResponse<QuizData>>(`/api/v1/quizzes/${id}`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get quiz questions
  async getQuizQuestions(quizId: string): Promise<Question[]> {
    try {
      const response = await apiClient.get<ApiResponse<Question[]>>(`/api/v1/quizzes/${quizId}/questions`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Start quiz attempt
  async startQuizAttempt(quizId: string): Promise<QuizAttemptData> {
    try {
      const response = await apiClient.post<ApiResponse<QuizAttemptData>>('/api/v1/quiz-attempts', {
        quiz_id: quizId
      })
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Submit quiz answers
  async submitQuizAnswers(attemptId: string, answers: Answer[]): Promise<QuizAttemptWithAnswers> {
    try {
      const response = await apiClient.put<ApiResponse<QuizAttemptWithAnswers>>(`/api/v1/quiz-attempts/${attemptId}`, {
        answers
      })
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get quiz attempt by ID
  async getQuizAttempt(id: string): Promise<QuizAttemptWithAnswers> {
    try {
      const response = await apiClient.get<ApiResponse<QuizAttemptWithAnswers>>(`/api/v1/quiz-attempts/${id}`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get user's quiz attempts
  async getUserQuizAttempts(userId?: string): Promise<QuizAttemptData[]> {
    try {
      const endpoint = userId ? `/api/v1/users/${userId}/quiz-attempts` : '/api/v1/quiz-attempts'
      const response = await apiClient.get<ApiResponse<QuizAttemptData[]>>(endpoint)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get quiz attempts for a specific quiz
  async getQuizAttemptsByQuiz(quizId: string): Promise<QuizAttemptData[]> {
    try {
      const response = await apiClient.get<ApiResponse<QuizAttemptData[]>>(`/api/v1/quizzes/${quizId}/attempts`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Abandon quiz attempt
  async abandonQuizAttempt(attemptId: string): Promise<void> {
    try {
      await apiClient.put<ApiResponse<void>>(`/api/v1/quiz-attempts/${attemptId}`, {
        status: 'abandoned'
      })
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get quiz analytics
  async getQuizAnalytics(quizId: string): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/api/v1/quizzes/${quizId}/analytics`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Development helper methods (for testing)
  // These methods provide mock data when backend is not available
  
  // Get mock quizzes for a topic
  async getMockQuizzesByTopic(topicId: string): Promise<QuizData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const quizzesByTopic: Record<string, QuizData[]> = {
      'accounting-basics': [
        {
          id: 'accounting-basics-quiz-1',
          topic_id: 'accounting-basics',
          title: 'Accounting Basics Quiz',
          description: 'Test your knowledge of fundamental accounting principles',
          instructions: 'Answer all questions. You have 30 minutes to complete this quiz.',
          time_limit: 30,
          passing_score: 70,
          allow_review: true,
          shuffle_questions: true,
          show_results: 'after_submission',
          is_active: true,
          is_premium_only: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'accounting-basics-quiz-2',
          topic_id: 'accounting-basics',
          title: 'Advanced Accounting Quiz',
          description: 'Advanced questions on accounting principles',
          instructions: 'This is a premium quiz with advanced questions.',
          time_limit: 45,
          passing_score: 80,
          allow_review: false,
          shuffle_questions: true,
          show_results: 'never',
          is_active: true,
          is_premium_only: true,
          created_at: new Date().toISOString()
        }
      ],
      'double-entry': [
        {
          id: 'double-entry-quiz-1',
          topic_id: 'double-entry',
          title: 'Double-Entry Bookkeeping Quiz',
          description: 'Test your understanding of debits and credits',
          instructions: 'Complete all journal entries correctly.',
          time_limit: 20,
          passing_score: 75,
          allow_review: true,
          shuffle_questions: false,
          show_results: 'immediate',
          is_active: true,
          is_premium_only: false,
          created_at: new Date().toISOString()
        }
      ]
    }
    
    return quizzesByTopic[topicId] || []
  }

  // Get mock quiz questions
  async getMockQuizQuestions(quizId: string): Promise<Question[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const questionsByQuiz: Record<string, Question[]> = {
      'accounting-basics-quiz-1': [
        {
          id: 'q1',
          type: QuestionType.MCQ,
          text: 'What is the basic accounting equation?',
          points: 5,
          difficulty: DifficultyLevel.BASIC,
          options: [
            { id: 'a', text: 'Assets = Liabilities + Owner\'s Equity', isCorrect: true },
            { id: 'b', text: 'Assets = Liabilities - Owner\'s Equity', isCorrect: false },
            { id: 'c', text: 'Assets + Liabilities = Owner\'s Equity', isCorrect: false },
            { id: 'd', text: 'Assets - Liabilities = Owner\'s Equity', isCorrect: false }
          ],
          explanation: 'The basic accounting equation is Assets = Liabilities + Owner\'s Equity. This equation must always balance.'
        },
        {
          id: 'q2',
          type: QuestionType.TRUE_FALSE,
          text: 'Revenue increases owner\'s equity.',
          points: 3,
          difficulty: DifficultyLevel.BASIC,
          statement: 'Revenue increases owner\'s equity.',
          correctAnswer: true,
          explanation: 'Revenue increases owner\'s equity because it represents an increase in the company\'s net worth.'
        }
      ],
      'double-entry-quiz-1': [
        {
          id: 'q3',
          type: QuestionType.LEDGER_ENTRY,
          text: 'Record the following transaction: Company purchases office supplies for $500 on credit.',
          points: 10,
          difficulty: DifficultyLevel.INTERMEDIATE,
          scenario: 'Company purchases office supplies for $500 on credit.',
          transactions: [
            {
              id: 't1',
              description: 'Purchase of office supplies',
              amount: 500,
              date: new Date().toISOString()
            }
          ],
          requiredEntries: [
            { account: 'Office Supplies', debitAmount: 500 },
            { account: 'Accounts Payable', creditAmount: 500 }
          ],
          availableAccounts: ['Office Supplies', 'Accounts Payable', 'Cash', 'Equipment'],
          explanation: 'When purchasing supplies on credit, we debit Office Supplies (asset increase) and credit Accounts Payable (liability increase).'
        }
      ]
    }
    
    return questionsByQuiz[quizId] || []
  }

  // Mock start quiz attempt
  async mockStartQuizAttempt(quizId: string): Promise<QuizAttemptData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      id: `attempt-${Date.now()}`,
      user_id: 'dev-student-001',
      quiz_id: quizId,
      attempt_number: 1,
      status: 'in_progress',
      max_score: 100,
      started_at: new Date().toISOString()
    }
  }

  // Mock submit quiz answers
  async mockSubmitQuizAnswers(attemptId: string, answers: Answer[]): Promise<QuizAttemptWithAnswers> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Calculate mock score based on answers
    const totalScore = answers.reduce((score, answer) => {
      // Mock scoring logic
      if (answer.questionType === 'mcq') {
        return score + 5 // Assume 5 points per MCQ
      } else if (answer.questionType === 'true_false') {
        return score + 3 // Assume 3 points per T/F
      }
      return score + 10 // Assume 10 points for other types
    }, 0)
    
    return {
      id: attemptId,
      user_id: 'dev-student-001',
      quiz_id: 'mock-quiz-id',
      attempt_number: 1,
      status: 'completed',
      score: totalScore,
      max_score: 100,
      started_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      completed_at: new Date().toISOString(),
      time_spent: 300, // 5 minutes
      answers,
      results: answers.map(answer => ({
        question_id: answer.questionId,
        score: 5, // Mock score
        max_score: 5,
        is_correct: true, // Mock correct
        feedback: ['Good job!']
      }))
    }
  }

  // Check if we should use development mode
  private shouldUseDevMode(): boolean {
    return import.meta.env.DEV
  }
}

export const quizService = new QuizService()
export default quizService 