<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'

const route = useRoute()
const router = useRouter()

interface Badge {
  id: string
  title: string
  description: string
  icon: string[]
  color: string
  bgColor: string
  category: 'learning' | 'streak' | 'score' | 'time' | 'special'
  requirement: string
  isEarned: boolean
  earnedDate?: string
  progress?: number
  maxProgress?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface Certificate {
  id: string
  title: string
  description: string
  requirement: string
  isEarned: boolean
  earnedDate?: string
  downloadUrl?: string
  verificationId?: string
  isPremium: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string[]
  color: string
  points: number
  isEarned: boolean
  earnedDate?: string
  category: string
}

// Route parameters
const subjectId = ref(route.params.subjectId as string)

// Component state
const activeTab = ref<'badges' | 'certificates' | 'achievements'>('badges')
const selectedCategory = ref<'all' | 'learning' | 'streak' | 'score' | 'time' | 'special'>('all')
const showOnlyEarned = ref(false)

// Mock data - in real app this would come from API
const badges = ref<Badge[]>([
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: ['fas', 'play'],
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    category: 'learning',
    requirement: 'Complete 1 lesson',
    isEarned: true,
    earnedDate: '2024-01-15',
    rarity: 'common'
  },
  {
    id: 'lesson-streak-7',
    title: 'Weekly Warrior',
    description: 'Complete lessons for 7 consecutive days',
    icon: ['fas', 'fire'],
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    category: 'streak',
    requirement: 'Study for 7 consecutive days',
    isEarned: true,
    earnedDate: '2024-01-22',
    rarity: 'rare'
  },
  {
    id: 'perfect-score',
    title: 'Perfectionist',
    description: 'Score 100% on any quiz',
    icon: ['fas', 'star'],
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    category: 'score',
    requirement: 'Score 100% on a quiz',
    isEarned: true,
    earnedDate: '2024-01-18',
    rarity: 'rare'
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Complete 10 quizzes with 90% average',
    icon: ['fas', 'trophy'],
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    category: 'score',
    requirement: 'Complete 10 quizzes with 90%+ average',
    isEarned: true,
    earnedDate: '2024-01-25',
    rarity: 'epic'
  },
  {
    id: 'speed-learner',
    title: 'Speed Learner',
    description: 'Complete a lesson in under 15 minutes',
    icon: ['fas', 'bolt'],
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    category: 'time',
    requirement: 'Complete a lesson in under 15 minutes',
    isEarned: false,
    progress: 18,
    maxProgress: 15,
    rarity: 'common'
  },
  {
    id: 'topic-master',
    title: 'Topic Conqueror',
    description: 'Complete an entire topic with 85%+ average',
    icon: ['fas', 'crown'],
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    category: 'learning',
    requirement: 'Complete a topic with 85%+ average score',
    isEarned: false,
    progress: 1,
    maxProgress: 1,
    rarity: 'epic'
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Study before 8 AM for 5 consecutive days',
    icon: ['fas', 'sun'],
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    category: 'special',
    requirement: 'Study before 8 AM for 5 days',
    isEarned: false,
    progress: 2,
    maxProgress: 5,
    rarity: 'rare'
  },
  {
    id: 'legend',
    title: 'Accounting Legend',
    description: 'Complete all accounting topics with 95%+ average',
    icon: ['fas', 'medal'],
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    category: 'special',
    requirement: 'Complete all topics with 95%+ average',
    isEarned: false,
    progress: 7,
    maxProgress: 12,
    rarity: 'legendary'
  }
])

const certificates = ref<Certificate[]>([
  {
    id: 'accounting-fundamentals',
    title: 'Accounting Fundamentals Certificate',
    description: 'Master the basic principles of accounting',
    requirement: 'Complete first 6 topics with 80%+ average',
    isEarned: true,
    earnedDate: '2024-01-24',
    downloadUrl: '/certificates/accounting-fundamentals.pdf',
    verificationId: 'ACC-FUND-2024-001',
    isPremium: false
  },
  {
    id: 'trial-balance-expert',
    title: 'Trial Balance Expert',
    description: 'Demonstrate mastery of trial balance preparation',
    requirement: 'Complete trial balance topic with 90%+ score',
    isEarned: false,
    isPremium: false
  },
  {
    id: 'financial-statements-pro',
    title: 'Financial Statements Professional',
    description: 'Advanced certification in financial statement preparation',
    requirement: 'Complete financial statements topics with 85%+ average',
    isEarned: false,
    isPremium: true
  },
  {
    id: 'accounting-master',
    title: 'Certified Accounting Master',
    description: 'Complete mastery of all accounting topics',
    requirement: 'Complete all topics with 90%+ average and all practice modules',
    isEarned: false,
    isPremium: true
  }
])

const achievements = ref<Achievement[]>([
  {
    id: 'first-quiz',
    title: 'Quiz Rookie',
    description: 'Completed your first quiz',
    icon: ['fas', 'question'],
    color: 'text-green-600',
    points: 10,
    isEarned: true,
    earnedDate: '2024-01-16',
    category: 'Learning'
  },
  {
    id: 'practice-master',
    title: 'Practice Makes Perfect',
    description: 'Used practice tools 10 times',
    icon: ['fas', 'calculator'],
    color: 'text-blue-600',
    points: 25,
    isEarned: true,
    earnedDate: '2024-01-20',
    category: 'Practice'
  },
  {
    id: 'help-seeker',
    title: 'Knowledge Seeker',
    description: 'Used hints 5 times in practice sessions',
    icon: ['fas', 'lightbulb'],
    color: 'text-yellow-600',
    points: 15,
    isEarned: false,
    category: 'Learning'
  }
])

// Computed properties
const currentSubject = computed(() => {
  const stored = localStorage.getItem('selectedSubject')
  return stored ? JSON.parse(stored) : null
})

const filteredBadges = computed(() => {
  let filtered = badges.value

  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(badge => badge.category === selectedCategory.value)
  }

  if (showOnlyEarned.value) {
    filtered = filtered.filter(badge => badge.isEarned)
  }

  return filtered
})

const earnedBadges = computed(() => badges.value.filter(badge => badge.isEarned))
const totalBadges = computed(() => badges.value.length)
const earnedCertificates = computed(() => certificates.value.filter(cert => cert.isEarned))
const totalCertificates = computed(() => certificates.value.length)
const earnedAchievements = computed(() => achievements.value.filter(ach => ach.isEarned))
const totalAchievementPoints = computed(() => 
  earnedAchievements.value.reduce((total, ach) => total + ach.points, 0)
)

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return 'border-gray-300'
    case 'rare':
      return 'border-blue-400'
    case 'epic':
      return 'border-purple-400'
    case 'legendary':
      return 'border-yellow-400'
    default:
      return 'border-gray-300'
  }
}

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'rare':
      return 'shadow-blue-200'
    case 'epic':
      return 'shadow-purple-200'
    case 'legendary':
      return 'shadow-yellow-200'
    default:
      return ''
  }
}

// Methods
const goBack = () => {
  router.push(`/app/subjects/${subjectId.value}/dashboard`)
}

const downloadCertificate = (certificate: Certificate) => {
  if (certificate.downloadUrl) {
    // In real app, this would trigger download
    console.log('Downloading certificate:', certificate.downloadUrl)
    alert('Certificate downloaded!')
  }
}

const shareBadge = (badge: Badge) => {
  // In real app, this would open sharing options
  console.log('Sharing badge:', badge.title)
  
  if (navigator.share) {
    navigator.share({
      title: `I earned the "${badge.title}" badge!`,
      text: badge.description,
      url: window.location.href
    })
  } else {
    // Fallback to copying link
    navigator.clipboard.writeText(`I earned the "${badge.title}" badge on Numera! ${window.location.href}`)
    alert('Link copied to clipboard!')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Load badge data
onMounted(() => {
  console.log('Loading badges for subject:', subjectId.value)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Button variant="outline" size="sm" @click="goBack">
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
              Back to Dashboard
            </Button>
            
            <div v-if="currentSubject">
              <h1 class="text-2xl font-bold text-gray-900">Badges & Achievements</h1>
              <p class="text-gray-600">{{ currentSubject.title }} • Celebrate your learning milestones</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm p-6 text-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'medal']" class="text-green-600 text-xl" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ earnedBadges.length }}/{{ totalBadges }}</p>
          <p class="text-sm text-gray-600">Badges Earned</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 text-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'certificate']" class="text-blue-600 text-xl" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ earnedCertificates.length }}/{{ totalCertificates }}</p>
          <p class="text-sm text-gray-600">Certificates</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 text-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'trophy']" class="text-purple-600 text-xl" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ earnedAchievements.length }}</p>
          <p class="text-sm text-gray-600">Achievements</p>
        </div>

        <div class="bg-white rounded-xl shadow-sm p-6 text-center">
          <div class="w-12 h-12 bg-amber-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <font-awesome-icon :icon="['fas', 'star']" class="text-amber-600 text-xl" />
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ totalAchievementPoints }}</p>
          <p class="text-sm text-gray-600">Total Points</p>
        </div>
      </div>

      <!-- Content Tabs -->
      <div class="bg-white rounded-xl shadow-sm">
        <!-- Tab Navigation -->
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6">
            <button
              v-for="tab in [
                { id: 'badges', label: 'Badges', icon: ['fas', 'medal'] },
                { id: 'certificates', label: 'Certificates', icon: ['fas', 'certificate'] },
                { id: 'achievements', label: 'Achievements', icon: ['fas', 'trophy'] }
              ]"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2',
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              <font-awesome-icon :icon="tab.icon" />
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Badges Tab -->
          <div v-if="activeTab === 'badges'">
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-4 mb-6">
              <select
                v-model="selectedCategory"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                <option value="learning">Learning</option>
                <option value="streak">Streak</option>
                <option value="score">Score</option>
                <option value="time">Time</option>
                <option value="special">Special</option>
              </select>
              
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="showOnlyEarned"
                  type="checkbox"
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span class="text-sm text-gray-700">Show only earned badges</span>
              </label>
            </div>

            <!-- Badges Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <div
                v-for="badge in filteredBadges"
                :key="badge.id"
                class="relative border-2 rounded-xl p-6 transition-all duration-200"
                :class="[
                  badge.isEarned ? 'bg-white' : 'bg-gray-50',
                  badge.isEarned ? getRarityColor(badge.rarity) : 'border-gray-200',
                  badge.isEarned && badge.rarity !== 'common' ? 'shadow-lg ' + getRarityGlow(badge.rarity) : '',
                  !badge.isEarned ? 'opacity-60' : ''
                ]"
              >
                <!-- Rarity indicator -->
                <div v-if="badge.isEarned && badge.rarity !== 'common'" class="absolute top-2 right-2">
                  <span 
                    :class="[
                      'px-2 py-1 text-xs font-bold rounded-full',
                      badge.rarity === 'rare' ? 'bg-blue-100 text-blue-800' : '',
                      badge.rarity === 'epic' ? 'bg-purple-100 text-purple-800' : '',
                      badge.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' : ''
                    ]"
                  >
                    {{ badge.rarity.toUpperCase() }}
                  </span>
                </div>

                <!-- Badge Icon -->
                <div class="text-center mb-4">
                  <div :class="['w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3', badge.bgColor]">
                    <font-awesome-icon 
                      :icon="badge.icon" 
                      :class="['text-2xl', badge.color]"
                    />
                  </div>
                  
                  <h3 class="font-semibold text-gray-900 mb-2">{{ badge.title }}</h3>
                  <p class="text-sm text-gray-600 mb-3">{{ badge.description }}</p>
                  
                  <!-- Progress Bar (for unearned badges) -->
                  <div v-if="!badge.isEarned && badge.progress !== undefined" class="mb-3">
                    <div class="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{{ badge.progress }}/{{ badge.maxProgress }}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-green-500 h-2 rounded-full transition-all duration-300"
                        :style="{ width: `${Math.min(100, (badge.progress! / badge.maxProgress!) * 100)}%` }"
                      ></div>
                    </div>
                  </div>
                  
                  <p class="text-xs text-gray-500">{{ badge.requirement }}</p>
                </div>

                <!-- Earned Date or Status -->
                <div class="text-center">
                  <div v-if="badge.isEarned" class="space-y-2">
                    <p class="text-xs text-green-600 font-medium">
                      Earned {{ formatDate(badge.earnedDate!) }}
                    </p>
                    <Button variant="outline" size="sm" @click="shareBadge(badge)" class="w-full">
                      <font-awesome-icon :icon="['fas', 'share']" class="mr-1" />
                      Share
                    </Button>
                  </div>
                  <div v-else class="flex items-center justify-center text-gray-400">
                    <font-awesome-icon :icon="['fas', 'lock']" class="mr-1" />
                    <span class="text-xs">Not earned yet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Certificates Tab -->
          <div v-if="activeTab === 'certificates'">
            <div class="space-y-6">
              <div
                v-for="certificate in certificates"
                :key="certificate.id"
                class="border border-gray-200 rounded-lg p-6"
                :class="{ 'bg-gray-50 opacity-75': !certificate.isEarned }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex items-start gap-4 flex-1">
                    <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <font-awesome-icon :icon="['fas', 'certificate']" class="text-blue-600 text-2xl" />
                    </div>
                    
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <h3 class="text-lg font-semibold text-gray-900">{{ certificate.title }}</h3>
                        <span v-if="certificate.isPremium" class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Premium
                        </span>
                        <font-awesome-icon v-if="certificate.isEarned" :icon="['fas', 'check-circle']" class="text-green-600" />
                      </div>
                      
                      <p class="text-gray-600 mb-3">{{ certificate.description }}</p>
                      <p class="text-sm text-gray-500 mb-3">{{ certificate.requirement }}</p>
                      
                      <div v-if="certificate.isEarned" class="text-sm text-green-600">
                        <p>Earned on {{ formatDate(certificate.earnedDate!) }}</p>
                        <p v-if="certificate.verificationId" class="text-gray-500">
                          Verification ID: {{ certificate.verificationId }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Action Button -->
                  <div class="ml-4">
                    <Button
                      v-if="certificate.isEarned"
                      variant="primary"
                      @click="downloadCertificate(certificate)"
                    >
                      <font-awesome-icon :icon="['fas', 'download']" class="mr-2" />
                      Download
                    </Button>
                    <Button
                      v-else-if="certificate.isPremium"
                      variant="outline"
                      @click="router.push('/app/subscription')"
                    >
                      <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
                      Upgrade
                    </Button>
                    <div v-else class="text-gray-400 text-center">
                      <font-awesome-icon :icon="['fas', 'lock']" class="mb-1" />
                      <p class="text-xs">Not earned</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Achievements Tab -->
          <div v-if="activeTab === 'achievements'">
            <div class="space-y-4">
              <div
                v-for="achievement in achievements"
                :key="achievement.id"
                class="border border-gray-200 rounded-lg p-4"
                :class="{ 'bg-gray-50 opacity-75': !achievement.isEarned }"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', achievement.color.replace('text-', 'bg-').replace('600', '100')]">
                      <font-awesome-icon :icon="achievement.icon" :class="['text-xl', achievement.color]" />
                    </div>
                    
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-medium text-gray-900">{{ achievement.title }}</h4>
                        <span :class="['px-2 py-1 text-xs font-medium rounded-full', achievement.color.replace('text-', 'bg-').replace('600', '100'), achievement.color]">
                          {{ achievement.category }}
                        </span>
                        <font-awesome-icon v-if="achievement.isEarned" :icon="['fas', 'check-circle']" class="text-green-600" />
                      </div>
                      <p class="text-sm text-gray-600 mb-1">{{ achievement.description }}</p>
                      <p v-if="achievement.isEarned" class="text-xs text-green-600">
                        Earned on {{ formatDate(achievement.earnedDate!) }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="text-right">
                    <div :class="['text-lg font-bold', achievement.isEarned ? achievement.color : 'text-gray-400']">
                      +{{ achievement.points }}
                    </div>
                    <div class="text-xs text-gray-500">points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 