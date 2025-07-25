import { chromium, FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  const { baseURL } = config.projects[0].use

  // Launch browser and clean up test data
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Navigate to the application
    await page.goto(baseURL!)

    // Clean up test data from localStorage
    await page.evaluate(() => {
      // Remove authentication data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')

      // Remove mock data
      localStorage.removeItem('mock_subjects')
      localStorage.removeItem('mock_topics')
      localStorage.removeItem('mock_lessons')
      localStorage.removeItem('mock_quizzes')
      localStorage.removeItem('mock_questions')
      localStorage.removeItem('mock_progress')

      // Clear any other test-related data
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('test_')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    })

    console.log('✅ Global teardown completed successfully')
  } catch (error) {
    console.error('❌ Global teardown failed:', error)
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close()
  }
}

export default globalTeardown 