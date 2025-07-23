<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '../../atoms/Input.vue'
import Button from '../../atoms/Button.vue'

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const props = defineProps<{
  isLoading?: boolean
  lastPasswordChange?: string
  twoFactorEnabled?: boolean
  lastLoginDate?: string
}>()

const emit = defineEmits<{
  (e: 'changePassword', data: PasswordData): void
}>()

const passwordData = ref<PasswordData>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordStrength = computed(() => {
  const password = passwordData.value.newPassword
  if (!password) return { strength: 0, text: '', color: '' }
  
  let strength = 0
  if (password.length >= 8) strength++
  if (password.match(/[a-z]/)) strength++
  if (password.match(/[A-Z]/)) strength++
  if (password.match(/[0-9]/)) strength++
  if (password.match(/[^a-zA-Z0-9]/)) strength++
  
  const strengthLevels = [
    { text: 'Very Weak', color: 'text-red-600' },
    { text: 'Weak', color: 'text-red-500' },
    { text: 'Fair', color: 'text-yellow-500' },
    { text: 'Good', color: 'text-blue-500' },
    { text: 'Strong', color: 'text-green-500' }
  ]
  
  return { strength, ...strengthLevels[strength] }
})

const passwordsMatch = computed(() => {
  return passwordData.value.newPassword === passwordData.value.confirmPassword
})

const changePassword = async () => {
  if (!passwordsMatch.value) return
  emit('changePassword', passwordData.value)
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'shield-alt']" class="text-red-600" />
        Account Security
      </h2>
    </div>

    <form @submit.prevent="changePassword" class="space-y-6">
      <div class="space-y-4 max-w-md">
        <Input
          v-model="passwordData.currentPassword"
          type="password"
          label="Current Password"
          required
        />
        <Input
          v-model="passwordData.newPassword"
          type="password"
          label="New Password"
          required
        />
        <div v-if="passwordData.newPassword" class="flex items-center gap-2 text-sm">
          <span>Password Strength:</span>
          <span :class="passwordStrength.color" class="font-medium">
            {{ passwordStrength.text }}
          </span>
          <div class="flex-1 bg-gray-200 rounded-full h-2 ml-2">
            <div 
              class="bg-current h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(passwordStrength.strength / 5) * 100}%` }"
              :class="passwordStrength.color"
            />
          </div>
        </div>
        <Input
          v-model="passwordData.confirmPassword"
          type="password"
          label="Confirm New Password"
          :error="passwordData.confirmPassword && !passwordsMatch ? 'Passwords do not match' : ''"
          required
        />
      </div>

      <div class="pt-4 border-t">
        <Button 
          type="submit" 
          :loading="isLoading"
          :disabled="!passwordsMatch || !passwordData.newPassword"
        >
          <font-awesome-icon :icon="['fas', 'key']" class="mr-2" />
          Update Password
        </Button>
      </div>
    </form>

    <div class="mt-8 pt-6 border-t">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Security Information</h3>
      <div class="space-y-3 text-sm text-gray-600">
        <div class="flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500" />
          Last password change: {{ lastPasswordChange || 'Never' }}
        </div>
        <div class="flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500" />
          Two-factor authentication: {{ twoFactorEnabled ? 'Enabled' : 'Disabled' }}
        </div>
        <div class="flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'clock']" class="text-blue-500" />
          Last login: {{ lastLoginDate || 'Unknown' }}
        </div>
      </div>
    </div>
  </div>
</template> 