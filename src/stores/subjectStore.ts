import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import subjectService, { 
  type Subject, 
  type Topic, 
  type Lesson, 
  type SubjectWithTopics, 
  type TopicWithLessons 
} from '@/services/SubjectService'

export const useSubjectStore = defineStore('subject', () => {
  // State
  const subjects = ref<Subject[]>([])
  const topics = ref<Record<string, Topic[]>>({}) // keyed by subjectId
  const lessons = ref<Record<string, Lesson[]>>({}) // keyed by topicId
  const currentSubject = ref<Subject | null>(null)
  const currentTopic = ref<Topic | null>(null)
  const currentLesson = ref<Lesson | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const activeSubjects = computed(() => {
    return subjects.value.filter(subject => subject.is_active)
  })

  const subjectsByOrder = computed(() => {
    return [...activeSubjects.value].sort((a, b) => (a.order || 0) - (b.order || 0))
  })

  const topicsBySubject = computed(() => (subjectId: string) => {
    return topics.value[subjectId] || []
  })

  const lessonsByTopic = computed(() => (topicId: string) => {
    return lessons.value[topicId] || []
  })

  // Actions
  const fetchSubjects = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const apiSubjects = await subjectService.getSubjects()
        subjects.value = apiSubjects
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const mockSubjects = await subjectService.getMockSubjects()
        subjects.value = mockSubjects
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch subjects'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchTopicsBySubject = async (subjectId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Check if we already have topics for this subject
      if (topics.value[subjectId]) {
        return topics.value[subjectId]
      }

      // Try to fetch from API first, fallback to mock data
      let apiTopics: Topic[]
      try {
        apiTopics = await subjectService.getTopicsBySubject(subjectId)
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        apiTopics = await subjectService.getMockTopicsBySubject(subjectId)
      }

      topics.value[subjectId] = apiTopics
      return apiTopics
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch topics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchLessonsByTopic = async (topicId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Check if we already have lessons for this topic
      if (lessons.value[topicId]) {
        return lessons.value[topicId]
      }

      // Try to fetch from API first, fallback to mock data
      let apiLessons: Lesson[]
      try {
        apiLessons = await subjectService.getLessonsByTopic(topicId)
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        apiLessons = await subjectService.getMockLessonsByTopic(topicId)
      }

      lessons.value[topicId] = apiLessons
      return apiLessons
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch lessons'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchSubjectWithTopics = async (subjectId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const subjectWithTopics = await subjectService.getSubjectWithTopics(subjectId)
        currentSubject.value = subjectWithTopics
        topics.value[subjectId] = subjectWithTopics.topics
        return subjectWithTopics
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        const [mockSubject, mockTopics] = await Promise.all([
          subjectService.getMockSubjects().then(subjects => subjects.find(s => s.id === subjectId)),
          subjectService.getMockTopicsBySubject(subjectId)
        ])
        
        if (!mockSubject) {
          throw new Error('Subject not found')
        }

        const subjectWithTopics: SubjectWithTopics = {
          ...mockSubject,
          topics: mockTopics
        }
        
        currentSubject.value = subjectWithTopics
        topics.value[subjectId] = mockTopics
        return subjectWithTopics
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch subject with topics'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchTopicWithLessons = async (topicId: string) => {
    try {
      isLoading.value = true
      error.value = null

      // Try to fetch from API first, fallback to mock data
      try {
        const topicWithLessons = await subjectService.getTopicWithLessons(topicId)
        currentTopic.value = topicWithLessons
        lessons.value[topicId] = topicWithLessons.lessons
        return topicWithLessons
      } catch (apiError) {
        console.warn('API not available, using mock data:', apiError)
        // For mock data, we need to find the topic and its lessons
        const allSubjects = await subjectService.getMockSubjects()
        let foundTopic: Topic | null = null
        let foundLessons: Lesson[] = []

        for (const subject of allSubjects) {
          const topics = await subjectService.getMockTopicsBySubject(subject.id)
          const topic = topics.find(t => t.id === topicId)
          if (topic) {
            foundTopic = topic
            foundLessons = await subjectService.getMockLessonsByTopic(topicId)
            break
          }
        }

        if (!foundTopic) {
          throw new Error('Topic not found')
        }

        const topicWithLessons: TopicWithLessons = {
          ...foundTopic,
          lessons: foundLessons
        }
        
        currentTopic.value = topicWithLessons
        lessons.value[topicId] = foundLessons
        return topicWithLessons
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch topic with lessons'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentSubject = (subject: Subject | null) => {
    currentSubject.value = subject
  }

  const setCurrentTopic = (topic: Topic | null) => {
    currentTopic.value = topic
  }

  const setCurrentLesson = (lesson: Lesson | null) => {
    currentLesson.value = lesson
  }

  const getSubjectById = (subjectId: string) => {
    return subjects.value.find(subject => subject.id === subjectId) || null
  }

  const getTopicById = (topicId: string) => {
    for (const topicList of Object.values(topics.value)) {
      const topic = topicList.find(t => t.id === topicId)
      if (topic) return topic
    }
    return null
  }

  const getLessonById = (lessonId: string) => {
    for (const lessonList of Object.values(lessons.value)) {
      const lesson = lessonList.find(l => l.id === lessonId)
      if (lesson) return lesson
    }
    return null
  }

  const clearCache = () => {
    topics.value = {}
    lessons.value = {}
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    subjects,
    topics,
    lessons,
    currentSubject,
    currentTopic,
    currentLesson,
    isLoading,
    error,
    
    // Computed
    activeSubjects,
    subjectsByOrder,
    topicsBySubject,
    lessonsByTopic,
    
    // Actions
    fetchSubjects,
    fetchTopicsBySubject,
    fetchLessonsByTopic,
    fetchSubjectWithTopics,
    fetchTopicWithLessons,
    setCurrentSubject,
    setCurrentTopic,
    setCurrentLesson,
    getSubjectById,
    getTopicById,
    getLessonById,
    clearCache,
    clearError
  }
}) 