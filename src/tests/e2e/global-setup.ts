import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use

  // Launch browser and set up test data
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Navigate to the application
    await page.goto(baseURL!)

    // Set up test user authentication
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'test-jwt-token')
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student'
      }))
    })

    // Set up test data in localStorage
    await page.evaluate(() => {
      // Mock subjects data
      const subjects = [
        {
          id: 'subject-1',
          title: 'Introduction to Accounting',
          description: 'Learn the basics of accounting principles',
          order: 1,
          is_active: true
        },
        {
          id: 'subject-2',
          title: 'Financial Management',
          description: 'Advanced financial management concepts',
          order: 2,
          is_active: true
        }
      ]

      // Mock topics data
      const topics = [
        {
          id: 'topic-1',
          subject_id: 'subject-1',
          title: 'Double Entry Bookkeeping',
          description: 'Understanding the double entry system',
          order: 1,
          is_active: true
        },
        {
          id: 'topic-2',
          subject_id: 'subject-1',
          title: 'Financial Statements',
          description: 'Reading and analyzing financial statements',
          order: 2,
          is_active: true
        }
      ]

      // Mock lessons data
      const lessons = [
        {
          id: 'lesson-1',
          topic_id: 'topic-1',
          title: 'Basic Principles',
          description: 'Introduction to accounting principles',
          content: 'This is the lesson content...',
          order: 1,
          duration: 15,
          is_active: true
        },
        {
          id: 'lesson-2',
          topic_id: 'topic-1',
          title: 'Journal Entries',
          description: 'Creating journal entries',
          content: 'This is the lesson content...',
          order: 2,
          duration: 20,
          is_active: true
        }
      ]

      // Mock quizzes data
      const quizzes = [
        {
          id: 'quiz-1',
          topic_id: 'topic-1',
          title: 'Double Entry Quiz',
          description: 'Test your understanding of double entry bookkeeping',
          time_limit: 30,
          passing_score: 70,
          is_active: true
        }
      ]

      // Mock questions data
      const questions = [
        {
          id: 'question-1',
          quiz_id: 'quiz-1',
          text: 'What is the basic principle of double entry bookkeeping?',
          type: 'mcq',
          options: [
            { id: 'A', text: 'Every transaction affects only one account' },
            { id: 'B', text: 'Every transaction affects at least two accounts' },
            { id: 'C', text: 'Every transaction must be recorded in cash' },
            { id: 'D', text: 'Every transaction must be approved by an accountant' }
          ],
          correct_answer: 'B',
          explanation: 'The double entry system requires that every transaction affects at least two accounts.',
          difficulty: 'basic',
          order: 1,
          is_active: true
        }
      ]

      // Mock progress data
      const progress = [
        {
          id: 'progress-1',
          user_id: 'test-user-1',
          subject_id: 'subject-1',
          overall_progress: 75,
          completed_lessons: 3,
          total_lessons: 4,
          completed_quizzes: 2,
          total_quizzes: 3,
          average_score: 85,
          time_spent: 1200,
          last_activity: new Date().toISOString()
        }
      ]

      // Store mock data
      localStorage.setItem('mock_subjects', JSON.stringify(subjects))
      localStorage.setItem('mock_topics', JSON.stringify(topics))
      localStorage.setItem('mock_lessons', JSON.stringify(lessons))
      localStorage.setItem('mock_quizzes', JSON.stringify(quizzes))
      localStorage.setItem('mock_questions', JSON.stringify(questions))
      localStorage.setItem('mock_progress', JSON.stringify(progress))
    })

    console.log('✅ Global setup completed successfully')
  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup 