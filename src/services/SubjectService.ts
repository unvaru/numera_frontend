import apiClient, { apiUtils } from '@/config/api'
import type { ApiResponse } from '@/config/api'

// Subject interface
export interface Subject {
  id: string
  title: string
  description: string
  is_active: boolean
  order?: number
  created_at?: string
  updated_at?: string
}

// Topic interface
export interface Topic {
  id: string
  subject_id: string
  title: string
  description: string
  order?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Lesson interface
export interface Lesson {
  id: string
  topic_id: string
  title: string
  content: string
  video_url?: string
  order?: number
  is_active: boolean
  is_premium_only?: boolean
  created_at?: string
  updated_at?: string
}

// Subject with topics interface
export interface SubjectWithTopics extends Subject {
  topics: Topic[]
}

// Topic with lessons interface
export interface TopicWithLessons extends Topic {
  lessons: Lesson[]
}

class SubjectService {
  // Get all subjects
  async getSubjects(): Promise<Subject[]> {
    try {
      const response = await apiClient.get<ApiResponse<Subject[]>>('/api/v1/subjects')
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get subject by ID
  async getSubject(id: string): Promise<Subject> {
    try {
      const response = await apiClient.get<ApiResponse<Subject>>(`/api/v1/subjects/${id}`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get topics by subject ID
  async getTopicsBySubject(subjectId: string): Promise<Topic[]> {
    try {
      const response = await apiClient.get<ApiResponse<Topic[]>>(`/api/v1/subjects/${subjectId}/topics`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get topic by ID
  async getTopic(id: string): Promise<Topic> {
    try {
      const response = await apiClient.get<ApiResponse<Topic>>(`/api/v1/topics/${id}`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get lessons by topic ID
  async getLessonsByTopic(topicId: string): Promise<Lesson[]> {
    try {
      const response = await apiClient.get<ApiResponse<Lesson[]>>(`/api/v1/topics/${topicId}/lessons`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get lesson by ID
  async getLesson(id: string): Promise<Lesson> {
    try {
      const response = await apiClient.get<ApiResponse<Lesson>>(`/api/v1/lessons/${id}`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get subject with topics
  async getSubjectWithTopics(subjectId: string): Promise<SubjectWithTopics> {
    try {
      const [subject, topics] = await Promise.all([
        this.getSubject(subjectId),
        this.getTopicsBySubject(subjectId)
      ])
      
      return {
        ...subject,
        topics
      }
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get topic with lessons
  async getTopicWithLessons(topicId: string): Promise<TopicWithLessons> {
    try {
      const [topic, lessons] = await Promise.all([
        this.getTopic(topicId),
        this.getLessonsByTopic(topicId)
      ])
      
      return {
        ...topic,
        lessons
      }
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Development helper methods (for testing)
  // These methods provide mock data when backend is not available
  
  // Get mock subjects
  async getMockSubjects(): Promise<Subject[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      {
        id: 'accounting-001',
        title: 'Accounting Fundamentals',
        description: 'Learn the basics of accounting principles, double-entry bookkeeping, and financial statements.',
        is_active: true,
        order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'economics-001',
        title: 'Economics Principles',
        description: 'Understand economic concepts, supply and demand, market structures, and macroeconomic principles.',
        is_active: true,
        order: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 'business-001',
        title: 'Business Studies',
        description: 'Explore business management, marketing, operations, and strategic planning.',
        is_active: true,
        order: 3,
        created_at: new Date().toISOString()
      }
    ]
  }

  // Get mock topics for a subject
  async getMockTopicsBySubject(subjectId: string): Promise<Topic[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const topicsBySubject: Record<string, Topic[]> = {
      'accounting-001': [
        {
          id: 'accounting-basics',
          subject_id: 'accounting-001',
          title: 'Accounting Basics',
          description: 'Introduction to accounting principles and concepts',
          order: 1,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'double-entry',
          subject_id: 'accounting-001',
          title: 'Double-Entry Bookkeeping',
          description: 'Understanding debits, credits, and the accounting equation',
          order: 2,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'financial-statements',
          subject_id: 'accounting-001',
          title: 'Financial Statements',
          description: 'Balance sheet, income statement, and cash flow statement',
          order: 3,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      'economics-001': [
        {
          id: 'supply-demand',
          subject_id: 'economics-001',
          title: 'Supply and Demand',
          description: 'Understanding market forces and price determination',
          order: 1,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'market-structures',
          subject_id: 'economics-001',
          title: 'Market Structures',
          description: 'Perfect competition, monopoly, oligopoly, and monopolistic competition',
          order: 2,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ],
      'business-001': [
        {
          id: 'business-management',
          subject_id: 'business-001',
          title: 'Business Management',
          description: 'Principles of management and organizational behavior',
          order: 1,
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          id: 'marketing-principles',
          subject_id: 'business-001',
          title: 'Marketing Principles',
          description: 'Marketing mix, consumer behavior, and market research',
          order: 2,
          is_active: true,
          created_at: new Date().toISOString()
        }
      ]
    }
    
    return topicsBySubject[subjectId] || []
  }

  // Get mock lessons for a topic
  async getMockLessonsByTopic(topicId: string): Promise<Lesson[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const lessonsByTopic: Record<string, Lesson[]> = {
      'accounting-basics': [
        {
          id: 'accounting-intro',
          topic_id: 'accounting-basics',
          title: 'Introduction to Accounting',
          content: 'Learn about the fundamental principles of accounting...',
          order: 1,
          is_active: true,
          is_premium_only: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'accounting-equation',
          topic_id: 'accounting-basics',
          title: 'The Accounting Equation',
          content: 'Assets = Liabilities + Owner\'s Equity...',
          order: 2,
          is_active: true,
          is_premium_only: false,
          created_at: new Date().toISOString()
        }
      ],
      'double-entry': [
        {
          id: 'debits-credits',
          topic_id: 'double-entry',
          title: 'Debits and Credits',
          content: 'Understanding how debits and credits work...',
          order: 1,
          is_active: true,
          is_premium_only: false,
          created_at: new Date().toISOString()
        },
        {
          id: 'journal-entries',
          topic_id: 'double-entry',
          title: 'Journal Entries',
          content: 'How to record business transactions...',
          order: 2,
          is_active: true,
          is_premium_only: true,
          created_at: new Date().toISOString()
        }
      ]
    }
    
    return lessonsByTopic[topicId] || []
  }

  // Check if we should use development mode
  private shouldUseDevMode(): boolean {
    return import.meta.env.DEV
  }
}

export const subjectService = new SubjectService()
export default subjectService 