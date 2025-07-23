<script setup lang="ts">
import { computed } from 'vue'
import Button from '../atoms/Button.vue'
import type { AccessResult } from '@/composables/useAccessControl'

interface Props {
  accessResult: AccessResult
  contentType?: string
  contentTitle?: string
  showUpgradeButton?: boolean
  variant?: 'overlay' | 'card' | 'banner'
}

interface Emits {
  (e: 'upgrade'): void
}

const props = withDefaults(defineProps<Props>(), {
  showUpgradeButton: true,
  variant: 'overlay'
})

const emit = defineEmits<Emits>()

const lockIcon = computed(() => {
  switch (props.accessResult.reason) {
    case 'usage_limit':
      return ['fas', 'clock']
    case 'premium_required':
      return ['fas', 'crown']
    case 'subscription_expired':
      return ['fas', 'exclamation-triangle']
    default:
      return ['fas', 'lock']
  }
})

const lockColor = computed(() => {
  switch (props.accessResult.reason) {
    case 'usage_limit':
      return 'text-orange-600'
    case 'premium_required':
      return 'text-purple-600'
    case 'subscription_expired':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
})

const lockBgColor = computed(() => {
  switch (props.accessResult.reason) {
    case 'usage_limit':
      return 'bg-orange-50'
    case 'premium_required':
      return 'bg-purple-50'
    case 'subscription_expired':
      return 'bg-red-50'
    default:
      return 'bg-gray-50'
  }
})

const lockMessage = computed(() => {
  if (props.accessResult.reason === 'usage_limit') {
    const limitInfo = props.accessResult.limitInfo
    if (limitInfo) {
      return `Daily limit reached (${limitInfo.used}/${limitInfo.limit})`
    }
    return 'Usage limit reached'
  }
  
  if (props.accessResult.reason === 'premium_required') {
    return 'Premium content'
  }
  
  if (props.accessResult.reason === 'subscription_expired') {
    return 'Subscription expired'
  }
  
  return 'Access restricted'
})

const actionText = computed(() => {
  if (props.accessResult.reason === 'usage_limit') {
    return 'Upgrade for unlimited access'
  }
  return 'Upgrade to Premium'
})

const handleUpgrade = () => {
  emit('upgrade')
}
</script>

<template>
  <!-- Overlay Variant -->
  <div v-if="variant === 'overlay'" class="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm z-10">
    <div class="text-center p-6 max-w-sm">
      <!-- Lock Icon -->
      <div :class="['w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center', lockBgColor]">
        <font-awesome-icon :icon="lockIcon" :class="['text-2xl', lockColor]" />
      </div>
      
      <!-- Message -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ lockMessage }}</h3>
      <p v-if="contentTitle" class="text-gray-600 mb-4 text-sm">
        {{ contentTitle }}
      </p>
      
      <!-- Usage Limit Info -->
      <div
        v-if="accessResult.reason === 'usage_limit' && accessResult.limitInfo"
        class="bg-orange-100 rounded-lg p-3 mb-4 text-sm"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="text-orange-800">Used today:</span>
          <span class="font-medium text-orange-900">{{ accessResult.limitInfo.used }}/{{ accessResult.limitInfo.limit }}</span>
        </div>
        <div class="w-full bg-orange-200 rounded-full h-2">
          <div
            class="bg-orange-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(accessResult.limitInfo.used / accessResult.limitInfo.limit) * 100}%` }"
          ></div>
        </div>
        <p v-if="accessResult.limitInfo.resetTime" class="text-xs text-orange-600 mt-2">
          Resets at {{ accessResult.limitInfo.resetTime }}
        </p>
      </div>
      
      <!-- Upgrade Button -->
      <Button
        v-if="showUpgradeButton"
        variant="primary"
        @click="handleUpgrade"
        class="w-full"
      >
        <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
        {{ actionText }}
      </Button>
    </div>
  </div>

  <!-- Card Variant -->
  <div v-else-if="variant === 'card'" class="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
    <!-- Lock Icon -->
    <div :class="['w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center', lockBgColor]">
      <font-awesome-icon :icon="lockIcon" :class="['text-xl', lockColor]" />
    </div>
    
    <!-- Message -->
    <h3 class="text-base font-semibold text-gray-900 mb-2">{{ lockMessage }}</h3>
    <p v-if="contentTitle" class="text-gray-600 mb-4 text-sm">
      {{ contentTitle }}
    </p>
    
    <!-- Upgrade Button -->
    <Button
      v-if="showUpgradeButton"
      variant="outline"
      size="sm"
      @click="handleUpgrade"
    >
      <font-awesome-icon :icon="['fas', 'crown']" class="mr-2" />
      {{ actionText }}
    </Button>
  </div>

  <!-- Banner Variant -->
  <div v-else-if="variant === 'banner'" :class="['rounded-lg p-4 border', lockBgColor]">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <font-awesome-icon :icon="lockIcon" :class="[lockColor]" />
        <div>
          <p class="font-medium text-gray-900 text-sm">{{ lockMessage }}</p>
          <p v-if="contentTitle" class="text-gray-600 text-xs">{{ contentTitle }}</p>
        </div>
      </div>
      
      <Button
        v-if="showUpgradeButton"
        variant="outline"
        size="sm"
        @click="handleUpgrade"
      >
        <font-awesome-icon :icon="['fas', 'crown']" class="mr-1" />
        Upgrade
      </Button>
    </div>
    
    <!-- Usage Progress for banner -->
    <div
      v-if="accessResult.reason === 'usage_limit' && accessResult.limitInfo"
      class="mt-3 flex items-center gap-3 text-sm"
    >
      <span class="text-gray-600 text-xs">{{ accessResult.limitInfo.used }}/{{ accessResult.limitInfo.limit }}</span>
      <div class="flex-1 bg-gray-200 rounded-full h-2">
        <div
          :class="['h-2 rounded-full transition-all duration-300', lockColor.replace('text-', 'bg-')]"
          :style="{ width: `${(accessResult.limitInfo.used / accessResult.limitInfo.limit) * 100}%` }"
        ></div>
      </div>
      <span v-if="accessResult.limitInfo.resetTime" class="text-xs text-gray-500">
        Resets {{ accessResult.limitInfo.resetTime }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Backdrop blur effect for overlay variant */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Hover effects */
.hover-lift {
  transition: transform 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-2px);
}
</style> 