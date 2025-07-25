<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useProgressStore } from '@/stores/progressStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useLoading } from '@/composables/useLoading'
import { useErrorHandler } from '@/utils/errorHandler'
import Button from '../atoms/Button.vue'
import Card from '../molecules/Card.vue'

const authStore = useAuthStore()
const progressStore = useProgressStore()
const subscriptionStore = useSubscriptionStore()
const loading = useLoading('student-profile')
const errorHandler = useErrorHandler()

const activeTab = ref('overview')
const isEditing = ref(false)

// Form data for editing
const editForm = ref({
  name: '',
  email: '',
  bio: '',
  location: '',
  website: ''
})

// Computed properties
const user = computed(() => authStore.user)
const isPremium = computed(() => subscriptionStore.isPremium)
const progress = computed(() => progressStore.userProgress)
const analytics = computed(() => progressStore.progressAnalytics)

const totalSubjects = computed(() => progress.value.length)
const completedSubjects = computed(() => 
  progress.value.filter(p => p.overall_progress >= 100).length
)
const averageScore = computed(() => {
  if (!progress.value.length) return 0
  const total = progress.value.reduce((sum, p) => sum + (p.average_score || 0), 0)
  return Math.round(total / progress.value.length)
})

// Load profile data
onMounted(async () => {
  try {
    loading.startLoading('Loading profile...')
    
    // Load user progress
    await progressStore.fetchUserProgress()
    
    // Load subscription data
    await subscriptionStore.fetchUserSubscription()
    
    // Initialize edit form
    if (user.value) {
      editForm.value = {
        name: user.value.name,
        email: user.value.email,
        bio: '', // Would come from user profile API
        location: '',
        website: ''
      }
    }
  } catch (error) {
    const appError = errorHandler.handleError(error)
    console.error('Failed to load profile:', appError)
  } finally {
    loading.stopLoading()
  }
})

const handleEditProfile = async () => {
  try {
    loading.startLoading('Updating profile...')
    
    await authStore.updateProfile({
      name: editForm.value.name,
      email: editForm.value.email
    })
    
    isEditing.value = false
  } catch (error) {
    const appError = errorHandler.handleError(error)
    console.error('Failed to update profile:', appError)
  } finally {
    loading.stopLoading()
  }
}

const handleChangePassword = async () => {
  // This would open a password change modal
  console.log('Change password clicked')
}

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Loading State -->
    <div v-if="loading.isLoading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">{{ loading.message }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="authStore.error" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Failed to load profile</h3>
        <p class="text-gray-600 mb-4">{{ authStore.error }}</p>
        <Button
          variant="primary"
          @click="() => location.reload()"
          class="bg-green-600 hover:bg-green-700"
        >
          Try Again
        </Button>
      </div>
    </div>

    <!-- Profile Content -->
    <div v-else-if="user" class="space-y-8">
      <!-- Profile Header -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center space-x-6">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-3xl text-green-600 font-bold">
                {{ user.name.charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1">
            <div class="flex items-center space-x-4">
              <h1 class="text-2xl font-bold text-gray-900">{{ user.name }}</h1>
              <span 
                v-if="isPremium"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                Premium
              </span>
            </div>
            <p class="text-gray-600">{{ user.email }}</p>
                         <p class="text-sm text-gray-500">Member since {{ user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown' }}</p>
          </div>

          <!-- Actions -->
          <div class="flex space-x-3">
            <Button
              variant="outline"
              @click="isEditing = !isEditing"
            >
              {{ isEditing ? 'Cancel' : 'Edit Profile' }}
            </Button>
            <Button
              variant="outline"
              @click="handleChangePassword"
            >
              Change Password
            </Button>
            <Button
              variant="outline"
              @click="handleLogout"
              class="text-red-600 hover:text-red-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div v-if="isEditing" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Edit Profile</h2>
        <form @submit.prevent="handleEditProfile" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Name</label>
              <input
                v-model="editForm.name"
                type="text"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                required
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Bio</label>
            <textarea
              v-model="editForm.bio"
              rows="3"
              class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Location</label>
              <input
                v-model="editForm.location"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Website</label>
              <input
                v-model="editForm.website"
                type="url"
                class="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div class="flex space-x-3">
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
            <Button type="button" variant="outline" @click="isEditing = false">
              Cancel
            </Button>
          </div>
        </form>
      </div>

      <!-- Navigation Tabs -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in ['overview', 'progress', 'achievements', 'settings']"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === tab
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="space-y-6">
        <!-- Overview Tab -->
        <div v-if="activeTab === 'overview'" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div class="text-center">
              <div class="text-3xl font-bold text-green-600">{{ totalSubjects }}</div>
              <div class="text-sm text-gray-600">Total Subjects</div>
            </div>
          </Card>
          <Card>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-600">{{ completedSubjects }}</div>
              <div class="text-sm text-gray-600">Completed</div>
            </div>
          </Card>
          <Card>
            <div class="text-center">
              <div class="text-3xl font-bold text-yellow-600">{{ averageScore }}%</div>
              <div class="text-sm text-gray-600">Average Score</div>
            </div>
          </Card>
        </div>

                 <!-- Progress Tab -->
         <div v-if="activeTab === 'progress'" class="space-y-6">
           <div v-for="subject in progress" :key="subject.subject_id" class="bg-white rounded-lg shadow-sm p-6">
             <div class="flex items-center justify-between">
               <div>
                 <h3 class="text-lg font-medium text-gray-900">Subject {{ subject.subject_id }}</h3>
                 <p class="text-sm text-gray-600">{{ subject.completed_lessons }} of {{ subject.total_lessons }} lessons completed</p>
               </div>
               <div class="text-right">
                 <div class="text-2xl font-bold text-green-600">{{ subject.overall_progress }}%</div>
                 <div class="text-sm text-gray-600">Progress</div>
               </div>
             </div>
             <div class="mt-4">
               <div class="w-full bg-gray-200 rounded-full h-2">
                 <div
                   class="bg-green-500 h-2 rounded-full transition-all duration-300"
                   :style="{ width: `${subject.overall_progress}%` }"
                 ></div>
               </div>
             </div>
           </div>
         </div>

        <!-- Achievements Tab -->
        <div v-if="activeTab === 'achievements'" class="space-y-6">
          <div class="text-center py-12">
            <div class="text-6xl mb-4">🏆</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Achievements Coming Soon</h3>
            <p class="text-gray-600">Track your learning milestones and earn badges as you progress.</p>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">Email Notifications</h4>
                  <p class="text-sm text-gray-600">Receive updates about your progress and new content</p>
                </div>
                <input type="checkbox" class="rounded border-gray-300 text-green-600 focus:ring-green-500" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">Push Notifications</h4>
                  <p class="text-sm text-gray-600">Get notified about new lessons and quizzes</p>
                </div>
                <input type="checkbox" class="rounded border-gray-300 text-green-600 focus:ring-green-500" />
              </div>
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">Study Reminders</h4>
                  <p class="text-sm text-gray-600">Daily reminders to continue your learning</p>
                </div>
                <input type="checkbox" class="rounded border-gray-300 text-green-600 focus:ring-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

/* Mobile spacing to avoid overlap with fixed navigation */
.profile-content {
  /* Desktop spacing */
  padding: 2rem 1rem;
}

/* Mobile spacing adjustments */
@media (max-width: 1024px) {
  .profile-content {
    /* Mobile: account for fixed header (60px) and bottom nav (80px) */
    padding: 1rem;
    padding-top: calc(60px + 1rem); /* Fixed header height + padding */
    padding-bottom: calc(80px + 1rem + env(safe-area-inset-bottom, 0px)); /* Fixed bottom nav + padding + safe area */
  }
}

/* Ensure content doesn't get hidden behind mobile navigation */
@media (max-width: 640px) {
  .profile-content {
    /* Small mobile: more precise spacing */
    padding-top: calc(64px + 0.5rem); /* Slightly larger header on small screens */
    padding-bottom: calc(84px + 0.5rem + env(safe-area-inset-bottom, 0px)); /* Slightly larger bottom nav */
  }
}

.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring circle {
  transition: stroke-dasharray 0.35s;
  transform-origin: 50% 50%;
}
</style> 