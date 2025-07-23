<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '../atoms/Input.vue'
import Button from '../atoms/Button.vue'

interface Badge {
  id: number
  title: string
  description: string
  icon: string[]
  color: string
  earnedDate: string
}

interface Certificate {
  id: number
  title: string
  earnedDate: string
  downloadUrl: string
  verified: boolean
}

// Sample data - in real app this would come from API
const studentInfo = ref({
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+960 123-4567',
  joinDate: '2023-09-01',
  language: 'English',
  school: 'Maldivian Heritage Foundation',
  grade: 'Grade 11'
})

const learningStats = ref({
  totalLessonsCompleted: 25,
  totalQuizzesCompleted: 18,
  averageScore: 85,
  studyStreak: 12,
  totalStudyHours: 45
})

const badges: Badge[] = [
  {
    id: 1,
    title: 'Quick Learner',
    description: 'Completed 5 lessons in one day',
    icon: ['fas', 'bolt'],
    color: 'text-yellow-500',
    earnedDate: '2024-01-15'
  },
  {
    id: 2,
    title: 'Perfect Score',
    description: 'Achieved 100% in a quiz',
    icon: ['fas', 'trophy'],
    color: 'text-amber-500',
    earnedDate: '2024-01-20'
  },
  {
    id: 3,
    title: 'Consistent Learner',
    description: 'Maintained a 7-day streak',
    icon: ['fas', 'fire'],
    color: 'text-red-500',
    earnedDate: '2024-02-01'
  },
  {
    id: 4,
    title: 'Quiz Master',
    description: 'Completed 10 quizzes with high scores',
    icon: ['fas', 'medal'],
    color: 'text-purple-500',
    earnedDate: '2024-02-10'
  },
  {
    id: 5,
    title: 'Dedicated Student',
    description: 'Studied for 50 total hours',
    icon: ['fas', 'graduation-cap'],
    color: 'text-blue-500',
    earnedDate: '2024-02-20'
  }
]

const certificates: Certificate[] = [
  {
    id: 1,
    title: 'Introduction to Accounting',
    earnedDate: '2024-01-30',
    downloadUrl: '/certificates/intro-accounting.pdf',
    verified: true
  },
  {
    id: 2,
    title: 'Double Entry Mastery',
    earnedDate: '2024-02-15',
    downloadUrl: '/certificates/double-entry.pdf',
    verified: true
  },
  {
    id: 3,
    title: 'Financial Statements Basics',
    earnedDate: '2024-02-28',
    downloadUrl: '/certificates/financial-statements.pdf',
    verified: false
  },
  {
    id: 4,
    title: 'Trial Balance Fundamentals',
    earnedDate: '2024-03-05',
    downloadUrl: '/certificates/trial-balance.pdf',
    verified: true
  },
  {
    id: 5,
    title: 'Books of Prime Entry',
    earnedDate: '2024-03-12',
    downloadUrl: '/certificates/books-prime-entry.pdf',
    verified: true
  },
  {
    id: 6,
    title: 'Ledger Accounts Mastery',
    earnedDate: '2024-03-18',
    downloadUrl: '/certificates/ledger-accounts.pdf',
    verified: false
  },
  {
    id: 7,
    title: 'Bank Reconciliation Expert',
    earnedDate: '2024-03-25',
    downloadUrl: '/certificates/bank-reconciliation.pdf',
    verified: true
  },
  {
    id: 8,
    title: 'Depreciation Methods',
    earnedDate: '2024-04-02',
    downloadUrl: '/certificates/depreciation.pdf',
    verified: true
  },
  {
    id: 9,
    title: 'Bad Debts and Provisions',
    earnedDate: '2024-04-08',
    downloadUrl: '/certificates/bad-debts.pdf',
    verified: false
  },
  {
    id: 10,
    title: 'Trading Account Preparation',
    earnedDate: '2024-04-15',
    downloadUrl: '/certificates/trading-account.pdf',
    verified: true
  }
]

// Certificate management
const certificatesPerPage = 6
const currentCertificatePage = ref(1)
const certificateSearchQuery = ref('')
const certificateFilter = ref('All')
const showAllCertificates = ref(false)

const certificateFilters = ['All', 'Verified', 'Pending Verification', 'Recent']

const filteredCertificates = computed(() => {
  let filtered = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(certificateSearchQuery.value.toLowerCase())
    let matchesFilter = true
    
    if (certificateFilter.value === 'Verified') {
      matchesFilter = cert.verified
    } else if (certificateFilter.value === 'Pending Verification') {
      matchesFilter = !cert.verified
    } else if (certificateFilter.value === 'Recent') {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      matchesFilter = new Date(cert.earnedDate) > oneMonthAgo
    }
    
    return matchesSearch && matchesFilter
  })
  
  // Sort by date (newest first)
  return filtered.sort((a, b) => new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime())
})

const displayedCertificates = computed(() => {
  if (showAllCertificates.value) {
    return filteredCertificates.value
  }
  
  const startIndex = (currentCertificatePage.value - 1) * certificatesPerPage
  const endIndex = startIndex + certificatesPerPage
  return filteredCertificates.value.slice(startIndex, endIndex)
})

const totalCertificatePages = computed(() => {
  if (showAllCertificates.value) return 1
  return Math.ceil(filteredCertificates.value.length / certificatesPerPage)
})

const certificateStats = computed(() => {
  const total = certificates.length
  const verified = certificates.filter(c => c.verified).length
  const pending = total - verified
  const recent = certificates.filter(c => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    return new Date(c.earnedDate) > oneMonthAgo
  }).length
  
  return { total, verified, pending, recent }
})

const clearCertificateFilters = () => {
  certificateSearchQuery.value = ''
  certificateFilter.value = 'All'
  currentCertificatePage.value = 1
}

const goToCertificatePage = (page: number) => {
  currentCertificatePage.value = page
}

const isEditing = ref(false)
const editedInfo = ref({ ...studentInfo.value })

const languages = ['English', 'Dhivehi']

function saveChanges() {
  studentInfo.value = { ...editedInfo.value }
  isEditing.value = false
}

function cancelEdit() {
  editedInfo.value = { ...studentInfo.value }
  isEditing.value = false
}

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPasswordSection = ref(false)

function downloadCertificate(url: string) {
  window.location.href = url
}

function updatePassword() {
  // TODO: Implement password update logic
  console.log('Updating password...')
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordSection.value = false
}
</script>

<template>
  <div class="profile-content">
    <div class="max-w-[1400px] mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'user']" class="text-blue-600" />
              Student Profile
            </h1>
            <p class="mt-1 text-sm text-gray-500">Manage your account settings and view achievements</p>
          </div>
          <div class="flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'user-check']" class="text-green-500" />
            <span class="text-sm text-green-600 font-medium">Verified Account</span>
          </div>
        </div>
      </div>

      <!-- Learning Statistics -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'chart-bar']" class="text-green-600" />
          Learning Statistics
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-xl">
            <font-awesome-icon :icon="['fas', 'book-open']" class="text-2xl text-blue-600 mb-2" />
            <div class="text-2xl font-bold text-blue-900">{{ learningStats.totalLessonsCompleted }}</div>
            <div class="text-sm text-blue-700">Lessons</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-xl">
            <font-awesome-icon :icon="['fas', 'question-circle']" class="text-2xl text-purple-600 mb-2" />
            <div class="text-2xl font-bold text-purple-900">{{ learningStats.totalQuizzesCompleted }}</div>
            <div class="text-sm text-purple-700">Quizzes</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-xl">
            <font-awesome-icon :icon="['fas', 'percentage']" class="text-2xl text-green-600 mb-2" />
            <div class="text-2xl font-bold text-green-900">{{ learningStats.averageScore }}%</div>
            <div class="text-sm text-green-700">Avg Score</div>
          </div>
          <div class="text-center p-4 bg-red-50 rounded-xl">
            <font-awesome-icon :icon="['fas', 'fire']" class="text-2xl text-red-600 mb-2" />
            <div class="text-2xl font-bold text-red-900">{{ learningStats.studyStreak }}</div>
            <div class="text-sm text-red-700">Day Streak</div>
          </div>
          <div class="text-center p-4 bg-amber-50 rounded-xl">
            <font-awesome-icon :icon="['fas', 'clock']" class="text-2xl text-amber-600 mb-2" />
            <div class="text-2xl font-bold text-amber-900">{{ learningStats.totalStudyHours }}h</div>
            <div class="text-sm text-amber-700">Study Time</div>
          </div>
        </div>
      </div>

      <!-- Profile Information -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'id-card']" class="text-blue-600" />
              Profile Information
            </h2>
            <Button
              v-if="!isEditing"
              variant="outline"
              @click="isEditing = true"
            >
              <font-awesome-icon :icon="['fas', 'edit']" class="mr-2" />
              Edit Profile
            </Button>
            <div v-else class="space-x-3">
              <Button
                variant="outline"
                @click="cancelEdit"
              >
                <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
                Cancel
              </Button>
              <Button
                variant="primary"
                @click="saveChanges"
              >
                <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          <div class="space-y-4">
            <div v-if="!isEditing">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <font-awesome-icon :icon="['fas', 'user']" class="text-gray-500" />
                  <div>
                    <div class="text-sm text-gray-500">Name</div>
                    <div class="font-medium">{{ studentInfo.name }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <font-awesome-icon :icon="['fas', 'envelope']" class="text-gray-500" />
                  <div>
                    <div class="text-sm text-gray-500">Email</div>
                    <div class="font-medium">{{ studentInfo.email }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <font-awesome-icon :icon="['fas', 'phone']" class="text-gray-500" />
                  <div>
                    <div class="text-sm text-gray-500">Phone</div>
                    <div class="font-medium">{{ studentInfo.phone }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <font-awesome-icon :icon="['fas', 'school']" class="text-gray-500" />
                  <div>
                    <div class="text-sm text-gray-500">School</div>
                    <div class="font-medium">{{ studentInfo.school }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <font-awesome-icon :icon="['fas', 'graduation-cap']" class="text-gray-500" />
                  <div>
                    <div class="text-sm text-gray-500">Grade</div>
                    <div class="font-medium">{{ studentInfo.grade }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <font-awesome-icon :icon="['fas', 'calendar']" class="text-gray-500" />
                  <div>
                    <div class="text-sm text-gray-500">Joined</div>
                    <div class="font-medium">{{ new Date(studentInfo.joinDate).toLocaleDateString() }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                v-model="editedInfo.name"
                label="Name"
                required
              />
              <Input
                v-model="editedInfo.email"
                type="email"
                label="Email"
                required
              />
              <Input
                v-model="editedInfo.phone"
                type="text"
                label="Phone"
              />
              <Input
                v-model="editedInfo.school"
                label="School"
              />
              <Input
                v-model="editedInfo.grade"
                label="Grade"
              />
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  v-model="editedInfo.language"
                  class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                >
                  <option v-for="lang in languages" :key="lang">{{ lang }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Badges -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'award']" class="text-yellow-600" />
          Badges Earned
          <span class="text-sm font-normal text-gray-500">({{ badges.length }} badges)</span>
        </h2>
        <div class="flex flex-wrap gap-6">
          <div
            v-for="badge in badges"
            :key="badge.id"
            class="group relative flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110"
          >
            <!-- Badge Icon -->
            <div class="relative">
              <div class="p-4 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-lg group-hover:shadow-xl transition-all duration-300 border-2 border-gray-100 group-hover:border-gray-200">
                <font-awesome-icon 
                  :icon="badge.icon" 
                  class="text-3xl transition-all duration-300"
                  :class="[badge.color, 'group-hover:scale-110']"
                />
              </div>
              <!-- Glow effect on hover -->
              <div class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                :class="badge.color.replace('text-', 'bg-').replace('-500', '-200')"
              ></div>
            </div>
            
            <!-- Badge Name -->
            <h3 class="mt-3 text-sm font-medium text-gray-900 text-center group-hover:text-gray-700 transition-colors">
              {{ badge.title }}
            </h3>
            
            <!-- Tooltip on hover -->
            <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-10">
              <div class="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs text-center shadow-lg">
                <div class="font-medium mb-1">{{ badge.title }}</div>
                <div class="text-gray-300 mb-2">{{ badge.description }}</div>
                <div class="flex items-center justify-center gap-1 text-gray-400">
                  <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-xs" />
                  {{ new Date(badge.earnedDate).toLocaleDateString() }}
                </div>
                <!-- Tooltip arrow -->
                <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Certificates -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'certificate']" class="text-blue-600" />
            Certificates
            <span class="text-sm font-normal text-gray-500">({{ certificateStats.total }} total)</span>
          </h2>
          <Button
            variant="outline"
            size="sm"
            @click="showAllCertificates = !showAllCertificates"
          >
            <font-awesome-icon :icon="['fas', showAllCertificates ? 'th-large' : 'list']" class="mr-2" />
            {{ showAllCertificates ? 'Show Pages' : 'Show All' }}
          </Button>
        </div>

        <!-- Certificate Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-900">{{ certificateStats.total }}</div>
            <div class="text-sm text-blue-700">Total</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-900">{{ certificateStats.verified }}</div>
            <div class="text-sm text-green-700">Verified</div>
          </div>
          <div class="text-center p-3 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-900">{{ certificateStats.pending }}</div>
            <div class="text-sm text-yellow-700">Pending</div>
          </div>
          <div class="text-center p-3 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-900">{{ certificateStats.recent }}</div>
            <div class="text-sm text-purple-700">Recent</div>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="sm:col-span-2">
            <div class="relative">
              <Input
                v-model="certificateSearchQuery"
                type="search"
                placeholder="Search certificates..."
                class="w-full pl-10"
              />
              <font-awesome-icon 
                :icon="['fas', 'magnifying-glass']" 
                class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
          <div class="flex gap-2">
            <select
              v-model="certificateFilter"
              class="flex-1 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg"
            >
              <option v-for="filter in certificateFilters" :key="filter">{{ filter }}</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              @click="clearCertificateFilters"
              class="px-3"
            >
              <font-awesome-icon :icon="['fas', 'rotate']" />
            </Button>
          </div>
        </div>

        <!-- Certificates Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div
            v-for="cert in displayedCertificates"
            :key="cert.id"
            class="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm p-6 border border-blue-100 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="p-3 bg-blue-100 rounded-full">
                <font-awesome-icon :icon="['fas', 'certificate']" class="text-2xl text-blue-600" />
              </div>
              <div class="flex items-center gap-2">
                <div v-if="cert.verified" class="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <font-awesome-icon :icon="['fas', 'check-circle']" />
                  Verified
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  @click="downloadCertificate(cert.downloadUrl)"
                >
                  <font-awesome-icon :icon="['fas', 'download']" class="mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ cert.title }}</h3>
            <div class="flex items-center gap-1 text-xs text-gray-500">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" />
              Earned on {{ new Date(cert.earnedDate).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!showAllCertificates && totalCertificatePages > 1" class="flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Showing {{ ((currentCertificatePage - 1) * certificatesPerPage) + 1 }}-{{ Math.min(currentCertificatePage * certificatesPerPage, filteredCertificates.length) }} of {{ filteredCertificates.length }} certificates
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              @click="goToCertificatePage(currentCertificatePage - 1)"
              :disabled="currentCertificatePage === 1"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </Button>
            <div class="flex gap-1">
              <button
                v-for="page in totalCertificatePages"
                :key="page"
                @click="goToCertificatePage(page)"
                class="px-3 py-2 text-sm rounded-lg transition-colors"
                :class="page === currentCertificatePage 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
              >
                {{ page }}
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              @click="goToCertificatePage(currentCertificatePage + 1)"
              :disabled="currentCertificatePage === totalCertificatePages"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </Button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="displayedCertificates.length === 0" class="text-center py-8">
          <div class="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon :icon="['fas', 'certificate']" class="text-3xl text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No certificates found</h3>
          <p class="text-sm text-gray-500">
            {{ certificateSearchQuery || certificateFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Complete lessons to earn your first certificate!' }}
          </p>
          <Button
            v-if="certificateSearchQuery || certificateFilter !== 'All'"
            @click="clearCertificateFilters"
            class="mt-4"
            variant="outline"
          >
            <font-awesome-icon :icon="['fas', 'rotate']" class="mr-2" />
            Clear Filters
          </Button>
        </div>
      </div>

      <!-- Account Security -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <font-awesome-icon :icon="['fas', 'shield-alt']" class="text-red-600" />
              Account Security
            </h2>
            <Button
              v-if="!showPasswordSection"
              variant="outline"
              @click="showPasswordSection = true"
            >
              <font-awesome-icon :icon="['fas', 'key']" class="mr-2" />
              Change Password
            </Button>
          </div>

          <div v-if="!showPasswordSection" class="text-gray-600">
            <div class="flex items-center gap-2 text-sm">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="text-blue-500" />
              Your password was last updated on January 15, 2024
            </div>
          </div>

          <div v-else class="space-y-4 max-w-md">
            <Input
              v-model="currentPassword"
              type="password"
              label="Current Password"
              required
            />
            <Input
              v-model="newPassword"
              type="password"
              label="New Password"
              required
            />
            <Input
              v-model="confirmPassword"
              type="password"
              label="Confirm New Password"
              required
            />
            <div class="flex gap-3">
              <Button variant="primary" @click="updatePassword">
                <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
                Update Password
              </Button>
              <Button variant="outline" @click="showPasswordSection = false">
                <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
                Cancel
              </Button>
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