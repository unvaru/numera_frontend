<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'
const router = useRouter()

// Add animation classes to style block
const style = document.createElement('style')
style.textContent = `
  @keyframes blob {
    0% {
      transform: translate(0, 0) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0, 0) scale(1);
    }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
`
document.head.appendChild(style)

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration: '3 years'
  features: string[]
  isCurrentPlan?: boolean
  subjectId?: string
  purchaseDate?: string
  expiryDate?: string
  savings?: number
  recommended?: boolean
}

interface UserSubscription {
  planId: string
  status: 'active' | 'expired' | 'cancelled' | 'trial'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  lastUpdated?: string
}

// Get user subscription from localStorage for development
const getUserSubscription = (): UserSubscription => {
  const userStr = localStorage.getItem('currentUser')
  if (userStr) {
    const userData = JSON.parse(userStr)
    const planId = userData.subscriptionPlan === 'premium' ? 'premium-monthly' : 'free'
    return {
      planId,
      status: 'active',
      currentPeriodStart: '2024-01-01',
      currentPeriodEnd: userData.subscriptionPlan === 'premium' ? '2024-02-01' : '2024-12-31',
      cancelAtPeriodEnd: false,
      lastUpdated: new Date().toISOString()
    }
  }
  return {
    planId: 'free',
    status: 'active',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-12-31',
    cancelAtPeriodEnd: false,
    lastUpdated: new Date().toISOString()
  }
}

const userSubscription = ref<UserSubscription>(getUserSubscription())

// Add loading states for better UX
const isLoading = ref(false)
const loadingMessage = ref('')

// Simulate loading state
const simulateLoading = async (message: string, duration: number = 1000) => {
  isLoading.value = true
  loadingMessage.value = message
  await new Promise(resolve => setTimeout(resolve, duration))
  isLoading.value = false
  loadingMessage.value = ''
}

// Available subscription plans
const plans = ref<SubscriptionPlan[]>([
  {
    id: 'free',
    name: 'Free Access',
    price: 0,
    duration: '3 years',
    features: [
      'Basic lessons and concepts',
      'Limited practice questions (5 per day)',
      'Basic progress tracking',
      'Community forum access',
      'Standard video quality'
    ],
    isCurrentPlan: true
  },
  {
    id: 'premium',
    name: 'Premium Access',
    price: 49.99,
    duration: '3 years',
    features: [
      'Full access to all lessons',
      'Unlimited practice questions',
      'Advanced practice tools',
      'Detailed progress analytics',
      'Downloadable resources',
      'HD video quality',
      'Certificate of completion',
      'Email support',
      '3 years of updates'
    ]
  }
])

const currentPlan = computed(() => {
  return plans.value.find(plan => plan.id === userSubscription.value.planId) || plans.value[0]
})

const isFreePlan = computed(() => userSubscription.value.planId === 'free')

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-emerald-600 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200/50'
    case 'trial':
      return 'text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50'
    case 'expired':
    case 'cancelled':
      return 'text-red-600 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200/50'
    default:
      return 'text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100/50 border border-gray-200/50'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const selectPlan = async (plan: SubscriptionPlan) => {
  if (plan.id === userSubscription.value.planId) return
  
  if (plan.id === 'free') {
    // Handle downgrade to free
    await downgradeToPlan(plan)
  } else {
    // Handle upgrade to premium
    await upgradeToPlan(plan)
  }
}

const upgradeToPlan = async (plan: SubscriptionPlan) => {
  try {
    await simulateLoading('Processing your upgrade to ' + plan.name + '...', 2000)
    
    const purchaseDate = new Date()
    const expiryDate = new Date(purchaseDate)
    expiryDate.setFullYear(expiryDate.getFullYear() + 3) // Add 3 years
    
    // Update user subscription
    userSubscription.value = {
      planId: plan.id,
      status: 'active',
      currentPeriodStart: purchaseDate.toISOString().split('T')[0],
      currentPeriodEnd: expiryDate.toISOString().split('T')[0],
      cancelAtPeriodEnd: false,
      lastUpdated: new Date().toISOString()
    }
    
    // Update localStorage for development
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      userData.subscriptionPlan = 'premium'
      userData.lastUpdated = new Date().toISOString()
      localStorage.setItem('currentUser', JSON.stringify(userData))
    }
    
    // Update plan status
    plans.value.forEach(p => {
      p.isCurrentPlan = p.id === plan.id
    })
    
    await simulateLoading('Success! Preparing your premium features...', 1000)
  } catch (error) {
    console.error('Upgrade failed:', error)
    await simulateLoading('Upgrade failed. Please try again.', 1000)
  }
}

const downgradeToPlan = async (plan: SubscriptionPlan) => {
  const confirmed = confirm('Are you sure you want to downgrade to the free plan? You will lose access to premium features.')
  
  if (!confirmed) return
  
  try {
    await simulateLoading('Processing your downgrade request...', 1500)
    
    userSubscription.value = {
      planId: plan.id,
      status: 'active',
      currentPeriodStart: new Date().toISOString().split('T')[0],
      currentPeriodEnd: '2024-12-31',
      cancelAtPeriodEnd: false,
      lastUpdated: new Date().toISOString()
    }
    
    // Update localStorage for development
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      const userData = JSON.parse(userStr)
      userData.subscriptionPlan = 'free'
      userData.lastUpdated = new Date().toISOString()
      localStorage.setItem('currentUser', JSON.stringify(userData))
    }
    
    plans.value.forEach(p => {
      p.isCurrentPlan = p.id === plan.id
    })
    
    await simulateLoading('Successfully downgraded to free plan', 1000)
  } catch (error) {
    console.error('Downgrade failed:', error)
    await simulateLoading('Downgrade failed. Please try again.', 1000)
  }
}

const cancelSubscription = async () => {
  const confirmed = confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')
  
  if (!confirmed) return
  
  try {
    await simulateLoading('Processing your cancellation request...', 1500)
    
    userSubscription.value.cancelAtPeriodEnd = true
    userSubscription.value.lastUpdated = new Date().toISOString()
    
    await simulateLoading(
      `Subscription will be cancelled on ${formatDate(userSubscription.value.currentPeriodEnd)}. 
      You'll retain access until then.`, 
      2000
    )
  } catch (error) {
    console.error('Cancellation failed:', error)
    await simulateLoading('Cancellation failed. Please try again.', 1000)
  }
}

const reactivateSubscription = async () => {
  try {
    await simulateLoading('Reactivating your subscription...', 1500)
    
    userSubscription.value.cancelAtPeriodEnd = false
    userSubscription.value.lastUpdated = new Date().toISOString()
    
    await simulateLoading('Your subscription has been successfully reactivated!', 1000)
  } catch (error) {
    console.error('Reactivation failed:', error)
    await simulateLoading('Reactivation failed. Please try again.', 1000)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Background Decoration -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply blur-3xl animate-blob"></div>
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-200/20 rounded-full mix-blend-multiply blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <!-- Header -->
    <div class="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-6">
            <Button 
              variant="outline" 
              @click="router.back()" 
              class="rounded-full w-10 h-10 p-0 flex items-center justify-center border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="text-gray-600" />
            </Button>
            <div>
              <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-gray-900 bg-clip-text text-transparent">
                Subscription
              </h1>
              <p class="mt-1 text-gray-500 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'shield-alt']" class="text-gray-400" />
                Manage your subscription and billing
              </p>
            </div>
          </div>
          
          <div class="hidden md:flex items-center gap-4">
            <Button 
              variant="outline" 
              class="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              <font-awesome-icon :icon="['fas', 'history']" class="mr-2" />
              Billing History
            </Button>
            <Button 
              variant="outline"
              class="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              <font-awesome-icon :icon="['fas', 'credit-card']" class="mr-2" />
              Payment Methods
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Usage Statistics -->
      <div class="max-w-2xl mx-auto">
        <div class="bg-gradient-to-br from-white to-blue-50/30 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 p-5">
          <div class="flex items-center gap-3 mb-5">
            <div class="p-2 rounded-lg bg-blue-600/10">
              <font-awesome-icon :icon="['fas', 'chart-line']" class="text-blue-600" />
            </div>
            <h2 class="text-base font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Usage Overview
            </h2>
          </div>
          
          <div class="flex flex-col gap-5">
            <!-- Daily Practice -->
            <div class="group p-3 rounded-xl transition-colors hover:bg-blue-50/50">
              <div class="flex items-center gap-4">
                <div class="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'book']" class="text-white" />
                </div>
                <div class="flex-grow">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">Daily Practice Questions</span>
                    <span class="text-sm font-bold text-blue-600">3/5</span>
                  </div>
                  <div class="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700"
                      style="width: 60%"
                    ></div>
                  </div>
                  <p class="text-xs font-medium text-blue-600/75 mt-1.5">Resets at midnight</p>
                </div>
              </div>
            </div>
            
            <!-- Content Access -->
            <div class="group p-3 rounded-xl transition-colors hover:bg-purple-50/50">
              <div class="flex items-center gap-4">
                <div class="shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'book-reader']" class="text-white" />
                </div>
                <div class="flex-grow">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-sm font-medium text-gray-700">Content Access Level</span>
                    <span class="text-xs font-medium px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-sm">
                      Basic
                    </span>
                  </div>
                  <p class="text-sm text-gray-500">Access to fundamental topics and practice tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- Premium Features Preview (shown when free plan and no usage stats) -->
        <div v-if="isFreePlan" class="lg:hidden bg-gradient-to-br from-yellow-50 to-white rounded-2xl shadow-sm p-6 border border-yellow-100">
          <div class="flex items-center gap-3 mb-4">
            <font-awesome-icon :icon="['fas', 'star']" class="text-yellow-600" />
            <h2 class="text-lg font-semibold text-gray-700">Premium Features</h2>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <font-awesome-icon :icon="['fas', 'infinity']" class="text-yellow-500" />
              <span>Unlimited practice questions</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <font-awesome-icon :icon="['fas', 'tools']" class="text-yellow-500" />
              <span>Advanced practice tools</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <font-awesome-icon :icon="['fas', 'download']" class="text-yellow-500" />
              <span>Downloadable resources</span>
            </div>
          </div>
          <Button 
            variant="primary"
            class="mt-4 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 border-0"
          >
            <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>

      <!-- Available Plans -->
      <div class="p-8 relative">
        <!-- Background Decoration -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-200/20 to-yellow-400/20 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div class="relative">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-3">
              Available Plans
            </h2>
            <p class="text-gray-600">Choose the plan that fits your learning journey</p>
          </div>
          
          <div class="flex flex-col md:flex-row gap-8 justify-center max-w-5xl mx-auto">
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="bg-white border-2 rounded-2xl p-8 relative w-full md:w-96 transition-all duration-300 hover:shadow-xl backdrop-blur-sm"
              :class="{
                'border-yellow-400 bg-gradient-to-b from-yellow-50 to-white ring-4 ring-yellow-50/50': plan.isCurrentPlan,
                'border-gray-100 hover:border-yellow-200': !plan.isCurrentPlan && plan.id !== 'free',
                'border-gray-100 hover:border-blue-200': plan.id === 'free'
              }"
            >
              <!-- Current Plan Badge -->
              <div v-if="plan.isCurrentPlan" class="absolute -top-4 right-6">
                <span class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-1 text-sm font-medium rounded-full shadow-md">
                  Current Plan
                </span>
              </div>
              
              <!-- Plan Header -->
              <div class="mb-8">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-bold" :class="plan.id === 'free' ? 'text-gray-900' : 'bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent'">
                    {{ plan.name }}
                  </h3>
                  <div v-if="plan.id !== 'free'" class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg transform rotate-12">
                      <font-awesome-icon :icon="['fas', 'crown']" class="text-white" />
                    </div>
                  </div>
                  <div v-else class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <font-awesome-icon :icon="['fas', 'user']" class="text-white" />
                    </div>
                  </div>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="text-4xl font-bold" :class="plan.id === 'free' ? 'text-blue-600' : 'text-yellow-600'">
                    {{ plan.price === 0 ? 'Free' : '$' + plan.price }}
                  </span>
                  <span class="text-gray-500" v-if="!isFreePlan">for {{ plan.duration }}</span>
                </div>
                <p v-if="!isFreePlan" class="text-sm text-yellow-600 font-medium mt-2 flex items-center gap-2">
                  <font-awesome-icon :icon="['fas', 'tag']" />
                  One-time payment
                </p>
              </div>
              
              <!-- Features List -->
              <ul class="space-y-4 mb-8">
                <li
                  v-for="feature in plan.features"
                  :key="feature"
                  class="flex items-start gap-3 group"
                >
                  <div class="rounded-lg p-1.5 flex-shrink-0 transition-colors duration-300"
                    :class="plan.id === 'free' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100'"
                  >
                    <font-awesome-icon 
                      :icon="['fas', 'check']" 
                      class="text-xs"
                    />
                  </div>
                  <span class="text-sm text-gray-600 leading-tight">{{ feature }}</span>
                </li>
              </ul>
              
              <!-- Action Button -->
              <Button
                :variant="plan.isCurrentPlan ? 'outline' : 'primary'"
                class="w-full py-3 shadow-sm transition-all duration-300 rounded-xl"
                :class="{
                  'hover:shadow-lg': !plan.isCurrentPlan,
                  'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 border-0 text-white': !plan.isCurrentPlan && plan.id !== 'free',
                  'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-0 text-white': !plan.isCurrentPlan && plan.id === 'free',
                  'hover:border-yellow-500 hover:text-yellow-600': plan.isCurrentPlan && plan.id !== 'free',
                  'hover:border-blue-500 hover:text-blue-600': plan.isCurrentPlan && plan.id === 'free'
                }"
                :disabled="plan.isCurrentPlan"
                @click="selectPlan(plan)"
              >
                <template v-if="plan.isCurrentPlan">
                  <font-awesome-icon :icon="['fas', 'check']" class="mr-2" />
                  Current Plan
                </template>
                <template v-else-if="plan.id === 'free'">
                  <font-awesome-icon :icon="['fas', 'user']" class="mr-2" />
                  Switch to Free
                </template>
                <template v-else>
                  <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
                  Get Premium Access
                </template>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm p-8 mt-12 border border-gray-100/50">
          <!-- Section Header -->
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center p-2 rounded-xl bg-indigo-50 mb-4">
              <font-awesome-icon :icon="['fas', 'question-circle']" class="text-indigo-600 text-xl" />
            </div>
            <h2 class="text-2xl font-bold bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent mb-2">
              Frequently Asked Questions
            </h2>
            <p class="text-gray-500">Everything you need to know about our subscription plans</p>
          </div>
          
          <!-- FAQ Grid -->
          <div class="grid md:grid-cols-2 gap-6">
            <!-- Duration Question -->
            <div class="group p-5 rounded-xl transition-all duration-300 hover:bg-gradient-to-br from-indigo-50/50 to-white border border-indigo-100/50 hover:border-indigo-200/50">
              <div class="flex items-start gap-4">
                <div class="shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'clock']" class="text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-indigo-900">
                    How long does the premium access last?
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed group-hover:text-indigo-700">
                    Premium access is valid for 3 years from the date of purchase. You'll have full access to all premium features and updates throughout this period.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Progress Question -->
            <div class="group p-5 rounded-xl transition-all duration-300 hover:bg-gradient-to-br from-blue-50/50 to-white border border-blue-100/50 hover:border-blue-200/50">
              <div class="flex items-start gap-4">
                <div class="shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'chart-line']" class="text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-blue-900">
                    What happens to my progress if I don't upgrade?
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed group-hover:text-blue-700">
                    Your learning progress is always securely saved. With the free plan, you maintain access to basic features while keeping all your completed work and achievements.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Student Discount Question -->
            <div class="group p-5 rounded-xl transition-all duration-300 hover:bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-100/50 hover:border-emerald-200/50">
              <div class="flex items-start gap-4">
                <div class="shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'graduation-cap']" class="text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-emerald-900">
                    Do you offer student discounts?
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed group-hover:text-emerald-700">
                    Yes! We're proud to support students with a 20% discount on premium access. Simply verify your student status with a valid ID through our support team.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Transfer Question -->
            <div class="group p-5 rounded-xl transition-all duration-300 hover:bg-gradient-to-br from-violet-50/50 to-white border border-violet-100/50 hover:border-violet-200/50">
              <div class="flex items-start gap-4">
                <div class="shrink-0 w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg shadow-sm flex items-center justify-center">
                  <font-awesome-icon :icon="['fas', 'exchange-alt']" class="text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-violet-900">
                    Can I transfer my premium access?
                  </h3>
                  <p class="text-gray-600 text-sm leading-relaxed group-hover:text-violet-700">
                    Premium access is specifically tied to individual subjects to ensure focused learning. Each subject requires its own premium access for the best educational experience.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Help Link -->
          <div class="text-center mt-8">
            <p class="text-gray-500 text-sm">
              Still have questions?
              <a href="#" class="text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                Contact our support team
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="ml-1 text-xs" />
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Support Banner -->
      <div class="max-w-4xl mx-auto">
        <div class="bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 mt-12 text-white relative overflow-hidden group">
          <!-- Decorative Elements -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full transform rotate-12 transition-transform duration-700 group-hover:rotate-45"></div>
            <div class="absolute -bottom-32 -left-32 w-64 h-64 bg-white/10 rounded-full blur-2xl transition-all duration-700 group-hover:blur-3xl"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"></div>
          </div>

          <div class="relative flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <!-- Icon -->
            <div class="shrink-0">
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <font-awesome-icon :icon="['fas', 'headset']" class="text-2xl text-white" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-grow text-center md:text-left">
              <h2 class="text-2xl font-bold mb-2">
                Need Assistance?
                <span class="block text-sm font-normal text-indigo-200 mt-1">We're here to help you succeed</span>
              </h2>
              <p class="text-indigo-100 text-sm md:text-base max-w-xl">
                Our dedicated support team is available to assist you with any questions about our subscription plans, features, or technical support.
              </p>
            </div>

                          <!-- Action Buttons -->
             <div class="flex flex-col sm:flex-row gap-3 md:flex-col lg:flex-row shrink-0">
               <Button
                 variant="outline"
                 class="border-2 border-white hover:bg-white hover:text-indigo-600 text-white transition-all duration-300 px-6 py-2.5 font-medium"
               >
                 <font-awesome-icon :icon="['fas', 'message']" class="mr-2" />
                 Live Chat
               </Button>
               <Button
                 variant="outline"
                 class="border border-white/30 text-white hover:bg-white/10 transition-all duration-300 px-6 py-2.5"
               >
                 <font-awesome-icon :icon="['fas', 'envelope']" class="mr-2" />
                 Email Support
               </Button>
             </div>
          </div>

          <!-- Quick Links -->
          <div class="relative mt-8 pt-6 border-t border-white/20">
            <div class="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              <a href="#" class="text-indigo-100 hover:text-white transition-colors duration-300 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'book']" />
                Documentation
              </a>
              <a href="#" class="text-indigo-100 hover:text-white transition-colors duration-300 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'circle-question']" />
                FAQs
              </a>
              <a href="#" class="text-indigo-100 hover:text-white transition-colors duration-300 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'video']" />
                Video Tutorials
              </a>
              <a href="#" class="text-indigo-100 hover:text-white transition-colors duration-300 flex items-center gap-2">
                <font-awesome-icon :icon="['fas', 'users']" />
                Community Forum
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isLoading" 
        class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse"></div>
          <div class="relative flex flex-col items-center">
            <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
            <p class="text-gray-600 text-center">{{ loadingMessage || 'Loading...' }}</p>
          </div>
        </div>
      </div>
    </Transition>
  
</template>