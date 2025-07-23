<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'
import { useAccessControl } from '@/composables/useAccessControl'

interface Props {
  variant?: 'dashboard' | 'sidebar' | 'banner'
  showUpgradeButton?: boolean
  limits?: string[] // Which limits to show: ['dailyQuizzes', 'dailyPractice', etc.]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'dashboard',
  showUpgradeButton: true,
  limits: () => ['dailyQuizzes', 'dailyPractice', 'weeklyLessons']
})

const router = useRouter()
const {
  usageLimits,
  isPremiumUser,
  isFreeTier,
  getRemainingUsage,
  getUsagePercentage,
  getResetTime
} = useAccessControl()

// Limit configurations
const limitConfig = {
  dailyQuizzes: {
    label: 'Daily Quizzes',
    icon: ['fas', 'question-circle'],
    color: 'blue'
  },
  dailyPractice: {
    label: 'Practice Sessions',
    icon: ['fas', 'calculator'],
    color: 'purple'
  },
  weeklyLessons: {
    label: 'Weekly Lessons',
    icon: ['fas', 'book-open'],
    color: 'green'
  },
  subjectsAccess: {
    label: 'Subjects Access',
    icon: ['fas', 'graduation-cap'],
    color: 'orange'
  }
}

const visibleLimits = computed(() => {
  return props.limits
    .filter(limitType => limitType in limitConfig && limitType in usageLimits.value)
    .map(limitType => ({
      key: limitType,
      ...limitConfig[limitType as keyof typeof limitConfig],
      ...usageLimits.value[limitType as keyof typeof usageLimits.value],
      remaining: getRemainingUsage(limitType as any),
      percentage: getUsagePercentage(limitType as any),
      resetTime: getResetTime(limitType as any)
    }))
})

const overallUsage = computed(() => {
  const totalUsed = visibleLimits.value.reduce((sum, limit) => sum + limit.used, 0)
  const totalLimit = visibleLimits.value.reduce((sum, limit) => sum + limit.limit, 0)
  return totalLimit > 0 ? Math.round((totalUsed / totalLimit) * 100) : 0
})

const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
  const colorMap = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' }
  }
  return colorMap[color as keyof typeof colorMap]?.[type] || colorMap.blue[type]
}

const getProgressColor = (percentage: number, color: string) => {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return `bg-${color}-500`
}

const handleUpgrade = () => {
  router.push('/app/subscription')
}
</script>

<template>
  <!-- Only show for free tier users -->
  <div v-if="isFreeTier">
    <!-- Dashboard Variant -->
    <div v-if="variant === 'dashboard'" class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Usage Limits</h3>
          <p class="text-sm text-gray-600">Track your daily and weekly usage</p>
        </div>
        
        <div class="text-right">
          <div class="text-2xl font-bold text-gray-900">{{ overallUsage }}%</div>
          <div class="text-xs text-gray-500">Overall Usage</div>
        </div>
      </div>

      <!-- Limits Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div
          v-for="limit in visibleLimits"
          :key="limit.key"
          :class="['border rounded-lg p-4', getColorClasses(limit.color, 'border')]"
        >
          <div class="flex items-center gap-3 mb-3">
            <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', getColorClasses(limit.color, 'bg')]">
              <font-awesome-icon :icon="limit.icon" :class="['text-lg', getColorClasses(limit.color, 'text')]" />
            </div>
            <div>
              <h4 class="font-medium text-gray-900 text-sm">{{ limit.label }}</h4>
              <p class="text-xs text-gray-600">{{ limit.used }}/{{ limit.limit }} used</p>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mb-3">
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                :class="['h-2 rounded-full transition-all duration-300', getProgressColor(limit.percentage, limit.color)]"
                :style="{ width: `${limit.percentage}%` }"
              ></div>
            </div>
          </div>
          
          <!-- Remaining/Reset Info -->
          <div class="flex justify-between text-xs text-gray-500">
            <span>{{ limit.remaining }} remaining</span>
            <span v-if="limit.resetTime">Resets {{ limit.resetTime }}</span>
          </div>
        </div>
      </div>

      <!-- Upgrade Section -->
      <div v-if="showUpgradeButton" class="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-medium text-gray-900 mb-1">Upgrade to Premium</h4>
            <p class="text-sm text-gray-600">Get unlimited access to all features</p>
          </div>
          <Button variant="primary" @click="handleUpgrade">
            <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
            Upgrade
          </Button>
        </div>
      </div>
    </div>

    <!-- Sidebar Variant -->
    <div v-else-if="variant === 'sidebar'" class="bg-white rounded-lg shadow-sm p-4">
      <h4 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'chart-bar']" class="text-gray-500" />
        Usage Today
      </h4>
      
      <div class="space-y-3">
        <div
          v-for="limit in visibleLimits"
          :key="limit.key"
          class="flex items-center gap-3"
        >
          <font-awesome-icon :icon="limit.icon" :class="['text-sm', getColorClasses(limit.color, 'text')]" />
          <div class="flex-1">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-700">{{ limit.label }}</span>
              <span class="font-medium">{{ limit.used }}/{{ limit.limit }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div
                :class="['h-1.5 rounded-full transition-all duration-300', getProgressColor(limit.percentage, limit.color)]"
                :style="{ width: `${limit.percentage}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <Button
        v-if="showUpgradeButton"
        variant="outline"
        size="sm"
        class="w-full mt-4"
        @click="handleUpgrade"
      >
        <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
        Upgrade
      </Button>
    </div>

    <!-- Banner Variant -->
    <div v-else-if="variant === 'banner'" class="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-orange-600" />
          <div>
            <h4 class="font-medium text-orange-900 text-sm">Usage Limits Apply</h4>
            <p class="text-orange-700 text-xs">
              You're using {{ overallUsage }}% of your daily limits
            </p>
          </div>
        </div>
        
        <!-- Quick Usage Overview -->
        <div class="flex items-center gap-4">
          <div
            v-for="limit in visibleLimits.slice(0, 2)"
            :key="limit.key"
            class="text-center"
          >
            <div class="text-xs text-orange-700">{{ limit.label }}</div>
            <div class="text-sm font-medium text-orange-900">{{ limit.used }}/{{ limit.limit }}</div>
          </div>
          
          <Button
            v-if="showUpgradeButton"
            variant="outline"
            size="sm"
            @click="handleUpgrade"
            class="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  </div>

  <!-- Premium User Message -->
  <div v-else-if="isPremiumUser && variant === 'dashboard'" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
    <div class="text-center">
      <div class="w-12 h-12 bg-green-100 rounded-full mx-auto mb-3 flex items-center justify-center">
        <font-awesome-icon :icon="['fas', 'crown']" class="text-green-600 text-xl" />
      </div>
      <h3 class="font-semibold text-green-900 mb-1">Premium Active</h3>
      <p class="text-sm text-green-700">Enjoy unlimited access to all features!</p>
    </div>
  </div>
</template> 