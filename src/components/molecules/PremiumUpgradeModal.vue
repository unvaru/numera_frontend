<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from '../atoms/Button.vue'
import type { AccessResult } from '@/composables/useAccessControl'

interface Props {
  isOpen: boolean
  accessResult: AccessResult
  contentType?: string
  contentTitle?: string
}

interface Emits {
  (e: 'close'): void
  (e: 'upgrade'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const router = useRouter()

// Premium benefits based on content type
const benefits = computed(() => {
  const commonBenefits = [
    'Unlimited access to all content',
    'Download certificates and resources',
    'Advanced progress analytics',
    'Priority customer support',
    'Ad-free learning experience'
  ]

  switch (props.contentType) {
    case 'quiz':
      return [
        'Unlimited daily quizzes',
        'Detailed quiz analytics',
        'Custom quiz creation',
        ...commonBenefits
      ]
    case 'practice':
      return [
        'Unlimited practice sessions',
        'Advanced practice tools',
        'Custom scenarios',
        ...commonBenefits
      ]
    case 'certificate':
      return [
        'Download all certificates',
        'Verified digital certificates',
        'LinkedIn badge integration',
        ...commonBenefits
      ]
    case 'subject':
      return [
        'Access to all subjects',
        'Cross-subject analytics',
        'Advanced learning paths',
        ...commonBenefits
      ]
    default:
      return commonBenefits
  }
})

const upgradeMessage = computed(() => {
  if (props.accessResult.reason === 'usage_limit') {
    const limitInfo = props.accessResult.limitInfo
    if (limitInfo) {
      return `You've used ${limitInfo.used}/${limitInfo.limit} of your daily limit. Upgrade to premium for unlimited access!`
    }
    return 'You\'ve reached your usage limit for today. Upgrade to premium for unlimited access!'
  }
  
  if (props.contentType === 'subject') {
    return 'Free users can access one subject. Upgrade to premium to learn multiple subjects!'
  }
  
  return `${props.contentTitle || 'This content'} is available to premium subscribers only.`
})

const ctaText = computed(() => {
  if (props.accessResult.reason === 'usage_limit') {
    return 'Upgrade for Unlimited Access'
  }
  return 'Upgrade to Premium'
})

const resetTimeText = computed(() => {
  if (props.accessResult.limitInfo?.resetTime) {
    return `Limit resets at ${props.accessResult.limitInfo.resetTime}`
  }
  return ''
})

const handleUpgrade = () => {
  emit('upgrade')
  router.push('/app/subscription')
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <!-- Modal Backdrop -->
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click="handleClose"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
        <button
          @click="handleClose"
          class="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="text-xl" />
        </button>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <font-awesome-icon :icon="['fas', 'crown']" class="text-2xl text-yellow-300" />
          </div>
          <h2 class="text-2xl font-bold mb-2">Upgrade to Premium</h2>
          <p class="text-white/90 text-sm">
            {{ upgradeMessage }}
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Usage Limit Info (if applicable) -->
        <div
          v-if="accessResult.reason === 'usage_limit' && accessResult.limitInfo"
          class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
        >
          <div class="flex items-center gap-3 mb-3">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-orange-600" />
            <h3 class="font-semibold text-orange-900">Usage Limit Reached</h3>
          </div>
          
          <div class="space-y-2 text-sm text-orange-800">
            <div class="flex justify-between">
              <span>Used Today:</span>
              <span class="font-medium">{{ accessResult.limitInfo.used }}/{{ accessResult.limitInfo.limit }}</span>
            </div>
            <div class="w-full bg-orange-200 rounded-full h-2">
              <div
                class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${(accessResult.limitInfo.used / accessResult.limitInfo.limit) * 100}%` }"
              ></div>
            </div>
            <p v-if="resetTimeText" class="text-xs text-orange-600 mt-2">
              {{ resetTimeText }}
            </p>
          </div>
        </div>

        <!-- Premium Benefits -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <font-awesome-icon :icon="['fas', 'star']" class="text-yellow-500" />
            Premium Benefits
          </h3>
          
          <div class="space-y-3">
            <div
              v-for="(benefit, index) in benefits.slice(0, 4)"
              :key="index"
              class="flex items-center gap-3"
            >
              <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <font-awesome-icon :icon="['fas', 'check']" class="text-green-600 text-xs" />
              </div>
              <span class="text-gray-700 text-sm">{{ benefit }}</span>
            </div>
          </div>
        </div>

        <!-- Pricing Preview -->
        <div class="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
          <div class="text-center">
            <div class="flex items-center justify-center gap-2 mb-2">
              <span class="text-2xl font-bold text-gray-900">$15</span>
              <span class="text-gray-600">/month</span>
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">Popular</span>
            </div>
            <p class="text-sm text-gray-600">
              Or save 33% with annual billing ($120/year)
            </p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button
            variant="primary"
            class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
            @click="handleUpgrade"
          >
            <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
            {{ ctaText }}
          </Button>
          
          <Button
            variant="outline"
            class="w-full"
            @click="handleClose"
          >
            Maybe Later
          </Button>
        </div>

        <!-- Fine Print -->
        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500">
            Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animation for modal entrance */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style> 