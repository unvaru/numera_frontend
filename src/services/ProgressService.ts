import apiClient, { apiUtils } from '@/config/api'
import type { ApiResponse } from '@/config/api'

// Progress interface
export interface UserProgress {
  id: string
  user_id: string
  subject_id: string
  overall_progress: number
  completed_lessons: number
  total_lessons: number
  completed_quizzes: number
  total_quizzes: number
  average_score: number
  time_spent: number // in minutes
  last_activity: string
  created_at: string
  updated_at: string
}

// Progress analytics interface
export interface ProgressAnalytics {
  total_study_time: number
  total_quizzes_taken: number
  average_quiz_score: number
  streak_days: number
  completed_subjects: number
  certificates_earned: number
  badges_earned: number
  weekly_progress: {
    date: string
    time_spent: number
    lessons_completed: number
    quizzes_taken: number
  }[]
}

// Topic progress interface
export interface TopicProgress {
  topic_id: string
  subject_id: string
  progress: number
  completed_lessons: number
  total_lessons: number
  average_score: number
  time_spent: number
  last_accessed: string
}

// Lesson progress interface
export interface LessonProgress {
  lesson_id: string
  topic_id: string
  is_completed: boolean
  time_spent: number
  completed_at?: string
  score?: number
}

class ProgressService {
  // Get user progress for all subjects
  async getUserProgress(): Promise<UserProgress[]> {
    try {
      const response = await apiClient.get<ApiResponse<UserProgress[]>>('/api/v1/progress')
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get user progress for specific subject
  async getSubjectProgress(subjectId: string): Promise<UserProgress> {
    try {
      const response = await apiClient.get<ApiResponse<UserProgress>>(`/api/v1/progress/${subjectId}`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Update progress for a subject
  async updateProgress(subjectId: string, progressData: Partial<UserProgress>): Promise<UserProgress> {
    try {
      const response = await apiClient.post<ApiResponse<UserProgress>>('/api/v1/progress', {
        subject_id: subjectId,
        ...progressData
      })
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get progress analytics
  async getProgressAnalytics(): Promise<ProgressAnalytics> {
    try {
      const response = await apiClient.get<ApiResponse<ProgressAnalytics>>('/api/v1/progress/analytics')
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get topic progress
  async getTopicProgress(topicId: string): Promise<TopicProgress> {
    try {
      const response = await apiClient.get<ApiResponse<TopicProgress>>(`/api/v1/topics/${topicId}/progress`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Update lesson progress
  async updateLessonProgress(lessonId: string, progressData: Partial<LessonProgress>): Promise<LessonProgress> {
    try {
      const response = await apiClient.post<ApiResponse<LessonProgress>>('/api/v1/lessons/progress', {
        lesson_id: lessonId,
        ...progressData
      })
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Mark lesson as completed
  async completeLesson(lessonId: string, timeSpent: number, score?: number): Promise<LessonProgress> {
    try {
      const response = await apiClient.post<ApiResponse<LessonProgress>>('/api/v1/lessons/complete', {
        lesson_id: lessonId,
        time_spent: timeSpent,
        score: score
      })
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get study streak
  async getStudyStreak(): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<{ streak: number }>>('/api/v1/progress/streak')
      const data = apiUtils.extractData(response)
      return data.streak
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Development helper methods (for testing)
  // These methods provide mock data when backend is not available
  
  // Get mock user progress
  async getMockUserProgress(): Promise<UserProgress[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      {
        id: 'progress-001',
        user_id: 'dev-student-001',
        subject_id: 'accounting-001',
        overall_progress: 45,
        completed_lessons: 23,
        total_lessons: 45,
        completed_quizzes: 8,
        total_quizzes: 15,
        average_score: 85,
        time_spent: 1200, // 20 hours
        last_activity: new Date().toISOString(),
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        updated_at: new Date().toISOString()
      },
      {
        id: 'progress-002',
        user_id: 'dev-student-001',
        subject_id: 'economics-001',
        overall_progress: 0,
        completed_lessons: 0,
        total_lessons: 38,
        completed_quizzes: 0,
        total_quizzes: 12,
        average_score: 0,
        time_spent: 0,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  // Get mock progress analytics
  async getMockProgressAnalytics(): Promise<ProgressAnalytics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      total_study_time: 1200, // 20 hours
      total_quizzes_taken: 25,
      average_quiz_score: 82.5,
      streak_days: 7,
      completed_subjects: 1,
      certificates_earned: 2,
      badges_earned: 5,
      weekly_progress: [
        {
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time_spent: 120,
          lessons_completed: 3,
          quizzes_taken: 2
        },
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time_spent: 90,
          lessons_completed: 2,
          quizzes_taken: 1
        },
        {
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time_spent: 150,
          lessons_completed: 4,
          quizzes_taken: 3
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time_spent: 80,
          lessons_completed: 2,
          quizzes_taken: 1
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time_spent: 200,
          lessons_completed: 5,
          quizzes_taken: 4
        },
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time_spent: 110,
          lessons_completed: 3,
          quizzes_taken: 2
        },
        {
          date: new Date().toISOString().split('T')[0],
          time_spent: 60,
          lessons_completed: 1,
          quizzes_taken: 1
        }
      ]
    }
  }

  // Get mock topic progress
  async getMockTopicProgress(topicId: string): Promise<TopicProgress> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const progressByTopic: Record<string, TopicProgress> = {
      'accounting-basics': {
        topic_id: 'accounting-basics',
        subject_id: 'accounting-001',
        progress: 75,
        completed_lessons: 3,
        total_lessons: 4,
        average_score: 88,
        time_spent: 180,
        last_accessed: new Date().toISOString()
      },
      'double-entry': {
        topic_id: 'double-entry',
        subject_id: 'accounting-001',
        progress: 50,
        completed_lessons: 2,
        total_lessons: 4,
        average_score: 92,
        time_spent: 240,
        last_accessed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    }
    
    return progressByTopic[topicId] || {
      topic_id: topicId,
      subject_id: 'unknown',
      progress: 0,
      completed_lessons: 0,
      total_lessons: 0,
      average_score: 0,
      time_spent: 0,
      last_accessed: new Date().toISOString()
    }
  }

  // Check if we should use development mode
  private shouldUseDevMode(): boolean {
    return import.meta.env.DEV
  }
}

export const progressService = new ProgressService()
export default progressService 