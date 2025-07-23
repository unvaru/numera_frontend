import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // If the user used browser back/forward buttons, restore the saved position
    if (savedPosition) {
      return savedPosition
    }
    
    // If navigating to a hash anchor, scroll to that element
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // For all other navigation, scroll to top
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    // Root redirect to subject selection
    {
      path: '/',
      redirect: '/app/subjects'
    },
    // Public routes
    {
      path: '/landing',
      name: 'landing',
      component: () => import('../components/organisms/LandingPage.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../components/organisms/LoginPage.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../components/organisms/RegisterPage.vue')
    },
    // Subject selection (no layout)
    {
      path: '/app/subjects',
      name: 'subject-selection',
      component: () => import('../components/organisms/SubjectSelection.vue'),
      meta: { requiresAuth: true }
    },
    // Lesson detail route (no layout for full-screen)
    {
      path: '/app/subjects/:subjectId/lessons/:id',
      name: 'subject-lesson-detail',
      component: () => import('../components/organisms/LessonDetail.vue'),
      meta: { requiresAuth: true }
    },
    // Protected routes - using MainLayout
    {
      path: '/app',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/app/subjects'
        },
        // Subject-specific routes
        {
          path: 'subjects/:subjectId/dashboard',
          name: 'subject-dashboard',
          component: () => import('../components/organisms/SubjectDashboard.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subjects/:subjectId/lessons',
          name: 'subject-lessons',
          component: () => import('../components/organisms/LessonList.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subjects/:subjectId/topics/:topicId',
          name: 'subject-topic',
          component: () => import('../components/organisms/TopicDetail.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subjects/:subjectId/quizzes',
          name: 'subject-quizzes',
          component: () => import('../components/organisms/QuestionBank.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subjects/:subjectId/quiz/:id',
          name: 'subject-quiz',
          component: () => import('../components/organisms/QuizPlayer.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subjects/:subjectId/practice',
          name: 'subject-practice',
          component: () => import('../components/organisms/LedgerPractice.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subjects/:subjectId/past-papers',
          name: 'subject-past-papers',
          component: () => import('../components/organisms/PastPaperList.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subjects/:subjectId/progress',
          name: 'subject-progress',
          component: () => import('../components/organisms/ProgressView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subjects/:subjectId/badges',
          name: 'subject-badges',
          component: () => import('../components/organisms/BadgeView.vue'),
          meta: { requiresAuth: true }
        },
        // Global user routes (not subject-specific)
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../components/organisms/StudentProfile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../components/organisms/StudentSettings.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'subscription',
          name: 'subscription',
          component: () => import('../components/organisms/SubscriptionManager.vue'),
          meta: { requiresAuth: true }
        },
        // Legacy routes for backward compatibility (redirect to subject selection)
        {
          path: 'dashboard',
          redirect: '/app/subjects'
        },
        {
          path: 'lessons',
          redirect: '/app/subjects'
        },
        {
          path: 'question-bank',
          redirect: '/app/subjects'
        },
        {
          path: 'quiz',
          redirect: '/app/subjects'
        },
        {
          path: 'practice',
          redirect: '/app/subjects'
        },
        {
          path: 'progress',
          name: 'progress',
          component: () => import('../components/organisms/StudentDashboard.vue'), // Using dashboard for now
          meta: { requiresAuth: false }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../components/organisms/StudentSettings.vue'),
          meta: { requiresAuth: false }
        },
        {
          path: 'test-questions',
          name: 'test-questions',
          component: () => import('../views/QuestionTestPage.vue'),
          meta: { requiresAuth: false }
        }
      ]
    },
    // Admin routes
    {
      path: '/admin',
      component: MainLayout,
      meta: { requiresAuth: false, requiresAdmin: false },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../components/organisms/AdminDashboard.vue')
        },
        {
          path: 'lessons',
          name: 'admin-lessons',
          component: () => import('../components/organisms/AdminLessonEditor.vue')
        },
        {
          path: 'quizzes',
          name: 'admin-quizzes',
          component: () => import('../components/organisms/AdminQuizEditor.vue')
        }
      ]
    },
    // Catch all 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../components/common/NotFound.vue')
    }
  ]
})

// Development authentication helper
const checkDevAuth = () => {
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('currentUser')
  return token === 'dev-token-12345' && user !== null
}

const getDevUser = () => {
  const userStr = localStorage.getItem('currentUser')
  return userStr ? JSON.parse(userStr) : null
}

// Navigation guards
router.beforeEach((to, from, next) => {
  // Check if route requires auth
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isAuthenticated = checkDevAuth()
    
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    } else {
      // Check if route requires admin privileges
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        const user = getDevUser()
        const isAdmin = user && user.role === 'admin'
        
        if (!isAdmin) {
          next({ path: '/app/subjects' })
        } else {
          next()
        }
      } else {
        next()
      }
    }
  } else {
    next()
  }
})

export default router
