<script setup lang="ts">
import { ref } from 'vue'
import Input from '../../atoms/Input.vue'
import Button from '../../atoms/Button.vue'

interface ProfileData {
  name: string
  email: string
  phone: string
  school: string
  grade: string
  bio: string
  joinDate: string
}

const props = defineProps<{
  initialData: ProfileData
  availableGrades: string[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: ProfileData): void
}>()

const profileData = ref<ProfileData>({ ...props.initialData })

const saveProfile = async () => {
  emit('save', profileData.value)
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'user']" class="text-blue-600" />
        Profile Information
      </h2>
    </div>

    <form @submit.prevent="saveProfile" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          v-model="profileData.name"
          label="Full Name"
          required
        />
        <Input
          v-model="profileData.email"
          type="email"
          label="Email Address"
          required
        />
        <Input
          v-model="profileData.phone"
          type="text"
          label="Phone Number"
        />
        <Input
          v-model="profileData.school"
          label="School/Institution"
        />
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Grade Level <span class="text-red-500">*</span>
          </label>
          <select
            v-model="profileData.grade"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option v-for="grade in availableGrades" :key="grade">{{ grade }}</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Bio (Optional)
        </label>
        <textarea
          v-model="profileData.bio"
          rows="3"
          class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Tell us a bit about yourself..."
        />
      </div>

      <div class="flex items-center gap-3 pt-4 border-t">
        <Button type="submit" :loading="isLoading">
          <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
          Save Changes
        </Button>
        <div class="text-sm text-gray-500">
          <font-awesome-icon :icon="['fas', 'calendar']" class="mr-1" />
          Member since {{ new Date(profileData.joinDate).toLocaleDateString() }}
        </div>
      </div>
    </form>
  </div>
</template> 