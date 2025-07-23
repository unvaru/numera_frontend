<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNavigationStore } from '@/stores/navigationStore'
import profileImage from '@/assets/images/profileimage.png'

const route = useRoute()
const router = useRouter()
const navigationStore = useNavigationStore()

// Get user data from localStorage (development)
const getUserData = () => {
  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    const userData = JSON.parse(userStr)
    return {
      name: userData.name,
      email: userData.email,
      avatar: profileImage,
      subscriptionPlan: userData.subscriptionPlan
    }
  }
  // Fallback for development
  return {
  name: 'John Doe',
  email: 'john@example.com',
    avatar: profileImage,
    subscriptionPlan: 'free'
  }
}

const user = getUserData()

// Subject interface
interface Subject {
  id: string
  title: string
  description: string
  code: string
  icon: string[]
  color: string
  bgColor: string
}

// Get current subject from route or localStorage
const currentSubject = ref<Subject | null>(null)
const subjectId = computed(() => route.params.subjectId as string)

// Load current subject data
const loadCurrentSubject = () => {
  if (subjectId.value) {
    // Try to get from localStorage first
    const stored = localStorage.getItem('selectedSubject')
    if (stored) {
      currentSubject.value = JSON.parse(stored)
    }
  }
}

// Subject-aware navigation items
const navigationItems = computed(() => {
  const baseItems = [
    {
      name: 'Dashboard',
      icon: ['fas', 'chart-line'],
      route: subjectId.value ? `/app/subjects/${subjectId.value}/dashboard` : '/app/subjects',
      description: 'Overview of your progress',
      badge: null
    },
    {
      name: 'Lessons',
      icon: ['fas', 'book-open'],
      route: subjectId.value ? `/app/subjects/${subjectId.value}/lessons` : '/app/subjects',
      description: 'Access your learning materials',
      badge: '3'
    },
    {
      name: 'Quizzes',
      icon: ['fas', 'database'],
      route: subjectId.value ? `/app/subjects/${subjectId.value}/quizzes` : '/app/subjects',
      description: 'Practice with question sets',
      badge: '10'
    },
    {
      name: 'Practice',
      icon: ['fas', 'calculator'],
      route: subjectId.value ? `/app/subjects/${subjectId.value}/practice` : '/app/subjects',
      description: 'Interactive practice tools',
      badge: null
    },
    {
      name: 'Past Papers',
      icon: ['fas', 'file-alt'],
      route: subjectId.value ? `/app/subjects/${subjectId.value}/past-papers` : '/app/subjects',
      description: 'Practice with previous exams',
      badge: '2'
    },
    {
      name: 'Progress',
      icon: ['fas', 'chart-bar'],
      route: subjectId.value ? `/app/subjects/${subjectId.value}/progress` : '/app/subjects',
      description: 'Track your learning progress',
      badge: null
    }
  ]

  // Add subject selector if no subject is selected
  if (!subjectId.value) {
    baseItems.unshift({
      name: 'Choose Subject',
      icon: ['fas', 'graduation-cap'],
      route: '/app/subjects',
      description: 'Select your learning subject',
      badge: null
    })
    }

  return baseItems
})

const isMobileMenuOpen = ref(false)
const isProfileMenuOpen = ref(false)

const isCurrentRoute = (path: string) => route.path === path

const sidebarWidth = computed(() => navigationStore.isExpanded ? 'lg:w-72' : 'lg:w-20')

const navItemClasses = (path: string) => {
  return [
    'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 min-h-[52px]',
    isCurrentRoute(path)
      ? 'bg-green-50 text-green-700 shadow-sm border border-green-200'
      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
  ].join(' ')
}

const handleLogout = () => {
  // Clear development authentication data
  localStorage.removeItem('authToken')
  localStorage.removeItem('currentUser')
  localStorage.removeItem('selectedSubject')
  
  // Redirect to login
  router.push('/login')
}

const toggleSidebar = () => {
  navigationStore.toggleSidebar()
  if (!navigationStore.isExpanded) {
    isProfileMenuOpen.value = false
  }
}

// Load subject data on mount and route change
onMounted(() => {
  loadCurrentSubject()
})

// Watch for route changes to update subject
watch(() => route.params.subjectId, () => {
  loadCurrentSubject()
})
</script>

<template>
  <!-- Desktop Sidebar -->
  <div :class="['hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 transition-all duration-300', sidebarWidth]">
    <div class="flex flex-col h-full border-r border-gray-200 bg-white">
      <!-- Logo and Toggle -->
      <div class="flex items-center justify-between px-6 py-5 flex-shrink-0">
        <img v-if="navigationStore.isExpanded" class="h-8 w-auto transition-opacity duration-200" src="@/assets/images/logo.png" alt="Numera" />
        <img v-else class="h-8 w-8 transition-opacity duration-200" src="@/assets/images/logo.png" alt="Numera" />
        <button 
          @click="toggleSidebar"
          class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
        >
          <font-awesome-icon 
            :icon="['fas', 'chevron-left']" 
            class="transition-transform duration-200"
            :class="{ 'rotate-180': !navigationStore.isExpanded }"
          />
        </button>
      </div>

      <!-- Current Subject Display -->
      <div v-if="currentSubject && navigationStore.isExpanded" class="px-4 mb-4">
        <div class="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
          <div class="flex items-center gap-2">
            <div :class="['w-8 h-8 rounded-lg flex items-center justify-center', currentSubject.bgColor]">
              <font-awesome-icon :icon="currentSubject.icon" :class="['text-sm', currentSubject.color]" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium text-gray-900 truncate text-sm">{{ currentSubject.title }}</div>
            </div>
            <button
              @click="router.push('/app/subjects')"
              class="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded hover:bg-white/75 transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 flex flex-col px-4 space-y-2 overflow-y-auto py-4">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.route"
          :class="navItemClasses(item.route)"
        >
          <div class="relative">
            <font-awesome-icon :icon="item.icon" class="text-xl" />
            <div 
              v-if="item.badge" 
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
            >
              {{ item.badge }}
            </div>
          </div>
          <template v-if="navigationStore.isExpanded">
            <div class="flex-1 ml-3">
              <div>{{ item.name }}</div>
              <div class="text-xs text-gray-500 font-normal">{{ item.description }}</div>
            </div>
            <font-awesome-icon 
              v-if="isCurrentRoute(item.route)"
              :icon="['fas', 'chevron-right']" 
              class="text-green-600"
            />
          </template>
        </router-link>
      </nav>

      <!-- Footer Section -->
      <div class="flex-shrink-0 px-4 py-4" v-if="navigationStore.isExpanded">
              <!-- User Profile -->
        <div class="mb-4">
        <div class="relative">
          <button 
            @click="isProfileMenuOpen = !isProfileMenuOpen"
            class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <img 
              :src="user.avatar" 
              alt="Profile" 
                class="h-10 w-10 rounded-full bg-gray-200 object-cover flex-shrink-0"
            />
              <div class="flex-1 text-left min-w-0">
                <div class="font-medium text-gray-900 truncate">{{ user.name }}</div>
              <div class="text-sm text-gray-500 truncate">{{ user.email }}</div>
            </div>
            <font-awesome-icon 
              :icon="['fas', 'chevron-down']" 
                class="text-gray-400 transition-transform duration-200 flex-shrink-0"
              :class="{ 'rotate-180': isProfileMenuOpen }"
            />
          </button>

          <!-- Profile Dropdown -->
          <div 
            v-if="isProfileMenuOpen"
              class="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
          >
              <router-link
                to="/app/profile"
                class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <font-awesome-icon :icon="['fas', 'user']" class="mr-3 text-gray-400" />
                Profile
              </router-link>
            <router-link
              to="/app/settings"
              class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <font-awesome-icon :icon="['fas', 'cog']" class="mr-3 text-gray-400" />
              Settings
            </router-link>
              <router-link
                to="/app/subscription"
                class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <font-awesome-icon :icon="['fas', 'crown']" class="mr-3 text-gray-400" />
                Subscription
              </router-link>
            <button
              @click="handleLogout"
              class="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

        <!-- Help Section -->
        <div class="bg-gray-50 rounded-xl p-4">
          <div class="flex items-center gap-3 text-gray-900">
            <font-awesome-icon :icon="['fas', 'question-circle']" class="text-gray-400" />
            <div class="text-sm">Need help?</div>
          </div>
          <button class="mt-2 text-sm text-green-600 hover:text-green-700 font-medium w-full text-left">
            Contact Support
          </button>
        </div>
      </div>

      <!-- Collapsed Profile Button -->
      <div class="flex-shrink-0 px-4 py-4" v-else>
        <button 
          class="w-full flex justify-center p-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <img 
            :src="user.avatar" 
            alt="Profile" 
            class="h-10 w-10 rounded-full bg-gray-200 object-cover"
          />
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Navigation -->
  <div class="lg:hidden">
    <!-- Mobile Header -->
    <header class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-20 safe-area-top">
      <div class="px-4 py-3 flex items-center justify-between min-h-[60px]">
        <img class="h-8 w-auto" src="@/assets/images/logo.png" alt="Numera" />
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="p-3 rounded-lg text-gray-500 hover:bg-gray-50 active:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <font-awesome-icon 
            :icon="['fas', isMobileMenuOpen ? 'times' : 'bars']" 
          />
        </button>
      </div>

      <!-- Mobile Menu -->
      <div 
        v-if="isMobileMenuOpen"
        class="absolute top-full left-0 right-0 bg-white border-b border-gray-200 py-2 shadow-lg"
      >
        <div class="px-4 py-3 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <img 
              :src="user.avatar" 
              alt="Profile" 
              class="h-10 w-10 rounded-full bg-gray-200 object-cover"
            />
            <div>
              <div class="font-medium text-gray-900">{{ user.name }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </div>
          </div>
        </div>

        <nav class="px-2 py-2">
          <router-link
            v-for="item in navigationItems"
            :key="item.name"
            :to="item.route"
            class="flex items-center px-4 py-4 text-sm rounded-lg min-h-[52px] active:bg-gray-100 transition-colors"
            :class="isCurrentRoute(item.route) ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'"
            @click="isMobileMenuOpen = false"
          >
            <div class="relative">
              <font-awesome-icon :icon="item.icon" class="mr-3" />
              <div 
                v-if="item.badge" 
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
              >
                {{ item.badge }}
              </div>
            </div>
            <div class="flex-1">
              <div class="font-medium">{{ item.name }}</div>
              <div class="text-xs text-gray-500">{{ item.description }}</div>
            </div>
          </router-link>

          <div class="border-t border-gray-200 my-2"></div>

          <router-link
            to="/app/settings"
            class="flex items-center px-4 py-3 text-sm text-gray-700 rounded-lg hover:bg-gray-50"
            @click="isMobileMenuOpen = false"
          >
            <font-awesome-icon :icon="['fas', 'cog']" class="mr-3" />
            Settings
          </router-link>

          <button
            @click="handleLogout"
            class="w-full flex items-center px-4 py-3 text-sm text-red-600 rounded-lg hover:bg-red-50"
          >
            <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="mr-3" />
            Sign out
          </button>
        </nav>
      </div>
    </header>

    <!-- Mobile Bottom Navigation -->
    <div class="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white z-20 safe-area-bottom">
      <nav class="flex justify-around px-2 py-1">
        <router-link
          v-for="item in navigationItems.slice(0, 4)"
          :key="item.name"
          :to="item.route"
          class="flex flex-col items-center py-2 px-3 relative min-w-[60px] min-h-[60px] justify-center rounded-lg active:bg-gray-100 transition-colors"
          :class="isCurrentRoute(item.route) ? 'text-green-700 bg-green-50' : 'text-gray-600'"
        >
          <div class="relative">
            <font-awesome-icon :icon="item.icon" class="text-xl" />
            <div 
              v-if="item.badge" 
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
            >
              {{ item.badge }}
            </div>
          </div>
          <span class="text-xs mt-1 font-medium">{{ item.name }}</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.fa-chevron-left, .fa-chevron-down {
  transition: transform 0.2s ease;
}

/* Safe area handling for mobile devices */
.safe-area-top {
  padding-top: env(safe-area-inset-top, 0px);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Improved mobile touch targets */
@media (max-width: 1024px) {
  /* Ensure all interactive elements meet minimum touch target size (44px) */
  button, .router-link-active, a {
    min-height: 44px;
    min-width: 44px;
  }
}

/* Enhanced hover states for non-touch devices */
@media (hover: hover) {
  button:hover, a:hover {
    transform: translateY(-1px);
  }
}

/* Improve text readability on small screens */
@media (max-width: 640px) {
  .text-xs {
    font-size: 0.75rem;
    line-height: 1rem;
  }
  
  .text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }
}

/* Smooth transitions for sidebar */
@media (min-width: 1024px) {
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }

  /* Custom scrollbar for desktop navigation */
  nav::-webkit-scrollbar {
    width: 4px;
  }

  nav::-webkit-scrollbar-track {
    background: transparent;
  }

  nav::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 2px;
  }

  nav::-webkit-scrollbar-thumb:hover {
    background: #d1d5db;
  }

  /* Hide scrollbar when not hovering */
  nav {
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
  }

  nav:hover {
    scrollbar-color: #e5e7eb transparent;
  }
}

/* Better focus states for accessibility */
button:focus-visible, a:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* Improve mobile menu animations */
@media (max-width: 1024px) {
  .mobile-menu-enter-active, .mobile-menu-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  
  .mobile-menu-enter-from, .mobile-menu-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* Responsive adjustments for intermediate screen sizes */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet adjustments */
  .px-4 {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

/* High DPI display optimizations */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style> 