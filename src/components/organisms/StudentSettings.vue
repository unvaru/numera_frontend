<script setup lang="ts">
import { ref } from 'vue'
import SettingsLayout from '../molecules/settings/SettingsLayout.vue'
import ProfileSettings from '../molecules/settings/ProfileSettings.vue'
import SecuritySettings from '../molecules/settings/SecuritySettings.vue'
import NotificationSettings from '../molecules/settings/NotificationSettings.vue'
import LearningSettings from '../molecules/settings/LearningSettings.vue'
import AccessibilitySettings from '../molecules/settings/AccessibilitySettings.vue'
import PrivacySettings from '../molecules/settings/PrivacySettings.vue'
import AppPreferences from '../molecules/settings/AppPreferences.vue'

// Types
interface ProfileData {
  name: string
  email: string
  phone: string
  school: string
  grade: string
  bio: string
  joinDate: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface NotificationSettings {
  studyReminders: boolean
  quizDeadlines: boolean
  achievementNotifications: boolean
  progressUpdates: boolean
  emailNotifications: boolean
  weeklyProgress: boolean
  newContent: boolean
}

interface LearningPreferences {
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced'
  dailyStudyGoal: number
  streakReminders: boolean
  recommendedLessonsFrequency: 'daily' | 'weekly' | 'bi-weekly'
  autoPlay: boolean
  showHints: boolean
}

interface AccessibilitySettings {
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  reduceMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private'
  progressSharing: boolean
  achievementSharing: boolean
  dataCollection: boolean
  analyticsTracking: boolean
}

interface AppPreferences {
  theme: 'light' | 'dark' | 'auto'
  dashboardLayout: 'default' | 'compact' | 'detailed'
  navigationStyle: 'sidebar' | 'top' | 'bottom'
  showProgressInNavigation: boolean
  compactMode: boolean
}

// Active tab state
const activeTab = ref('profile')

// Available tabs
const tabs = [
  { id: 'profile', name: 'Profile', icon: ['fas', 'user'] },
  { id: 'security', name: 'Security', icon: ['fas', 'shield-alt'] },
  { id: 'notifications', name: 'Notifications', icon: ['fas', 'bell'] },
  { id: 'learning', name: 'Learning', icon: ['fas', 'graduation-cap'] },
  { id: 'accessibility', name: 'Accessibility', icon: ['fas', 'universal-access'] },
  { id: 'privacy', name: 'Privacy', icon: ['fas', 'lock'] },
  { id: 'preferences', name: 'Preferences', icon: ['fas', 'cog'] }
]

// Loading state
const isLoading = ref(false)

// Profile data
const profileData = ref<ProfileData>({
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+960 123-4567',
  school: 'Maldivian Heritage Foundation',
  grade: 'Grade 11',
  bio: 'Passionate about accounting and business studies.',
  joinDate: '2023-09-01'
})

// Available grades
const availableGrades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Other']

// Notification settings
const notificationSettings = ref<NotificationSettings>({
  studyReminders: true,
  quizDeadlines: true,
  achievementNotifications: true,
  progressUpdates: false,
  emailNotifications: true,
  weeklyProgress: true,
  newContent: false
})

// Learning preferences
const learningPreferences = ref<LearningPreferences>({
  difficultyLevel: 'intermediate',
  dailyStudyGoal: 30,
  streakReminders: true,
  recommendedLessonsFrequency: 'daily',
  autoPlay: false,
  showHints: true
})

// Accessibility settings
const accessibilitySettings = ref<AccessibilitySettings>({
  highContrast: false,
  fontSize: 'medium',
  reduceMotion: false,
  screenReader: false,
  keyboardNavigation: true
})

// Privacy settings
const privacySettings = ref<PrivacySettings>({
  profileVisibility: 'private',
  progressSharing: false,
  achievementSharing: true,
  dataCollection: true,
  analyticsTracking: false
})

// App preferences
const appPreferences = ref<AppPreferences>({
  theme: 'light',
  dashboardLayout: 'default',
  navigationStyle: 'sidebar',
  showProgressInNavigation: true,
  compactMode: false
})

// Event handlers
const handleProfileSave = async (data: ProfileData) => {
  isLoading.value = true
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    profileData.value = data
  } finally {
    isLoading.value = false
  }
}

const handlePasswordChange = async (data: PasswordData) => {
  isLoading.value = true
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Password changed:', data)
  } finally {
    isLoading.value = false
  }
}

const handleNotificationSave = async (settings: NotificationSettings) => {
  isLoading.value = true
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    notificationSettings.value = settings
  } finally {
    isLoading.value = false
  }
}

const handleNotificationReset = () => {
  notificationSettings.value = {
    studyReminders: true,
    quizDeadlines: true,
    achievementNotifications: true,
    progressUpdates: false,
    emailNotifications: true,
    weeklyProgress: true,
    newContent: false
  }
}

const handleLearningPreferencesSave = async (preferences: LearningPreferences) => {
  isLoading.value = true
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    learningPreferences.value = preferences
  } finally {
    isLoading.value = false
  }
}

const handleLearningPreferencesReset = () => {
  learningPreferences.value = {
    difficultyLevel: 'intermediate',
    dailyStudyGoal: 30,
    streakReminders: true,
    recommendedLessonsFrequency: 'daily',
    autoPlay: false,
    showHints: true
  }
}

const handleAccessibilitySettingsSave = async (settings: AccessibilitySettings) => {
  isLoading.value = true
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    accessibilitySettings.value = settings
  } finally {
    isLoading.value = false
  }
}

const handleAccessibilitySettingsReset = () => {
  accessibilitySettings.value = {
    highContrast: false,
    fontSize: 'medium',
    reduceMotion: false,
    screenReader: false,
    keyboardNavigation: true
  }
}

const handlePrivacySettingsSave = async (settings: PrivacySettings) => {
  isLoading.value = true
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    privacySettings.value = settings
  } finally {
    isLoading.value = false
  }
}

const handlePrivacySettingsReset = () => {
  privacySettings.value = {
    profileVisibility: 'private',
    progressSharing: false,
    achievementSharing: true,
    dataCollection: true,
    analyticsTracking: false
  }
}

const handleExportData = async () => {
  isLoading.value = true
  try {
    // TODO: Implement data export
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Exporting user data...')
  } finally {
    isLoading.value = false
  }
}

const handleDeleteAccount = async () => {
  isLoading.value = true
  try {
    // TODO: Implement account deletion
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Account deleted')
  } finally {
    isLoading.value = false
  }
}

const handleAppPreferencesSave = async (preferences: AppPreferences) => {
  isLoading.value = true
  try {
    // TODO: Implement API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    appPreferences.value = preferences
  } finally {
    isLoading.value = false
  }
}

const handleAppPreferencesReset = () => {
      appPreferences.value = {
        theme: 'light',
        dashboardLayout: 'default',
        navigationStyle: 'sidebar',
        showProgressInNavigation: true,
        compactMode: false
  }
}
</script>

<template>
  <SettingsLayout
    :tabs="tabs"
    :active-tab="activeTab"
    @tab-change="activeTab = $event"
  >
          <!-- Profile Tab -->
    <ProfileSettings
      v-if="activeTab === 'profile'"
      :initial-data="profileData"
      :available-grades="availableGrades"
      :is-loading="isLoading"
      @save="handleProfileSave"
    />

          <!-- Security Tab -->
    <SecuritySettings
      v-else-if="activeTab === 'security'"
      :is-loading="isLoading"
      :last-password-change="'January 15, 2024'"
      :two-factor-enabled="true"
      :last-login-date="'Today at 10:30 AM'"
      @change-password="handlePasswordChange"
    />

          <!-- Notifications Tab -->
    <NotificationSettings
      v-else-if="activeTab === 'notifications'"
      :initial-settings="notificationSettings"
      :is-loading="isLoading"
      @save="handleNotificationSave"
      @reset="handleNotificationReset"
    />

    <!-- Learning Tab -->
    <LearningSettings
      v-else-if="activeTab === 'learning'"
      :initial-preferences="learningPreferences"
      :is-loading="isLoading"
      @save="handleLearningPreferencesSave"
      @reset="handleLearningPreferencesReset"
    />

          <!-- Accessibility Tab -->
    <AccessibilitySettings
      v-else-if="activeTab === 'accessibility'"
      :initial-settings="accessibilitySettings"
      :is-loading="isLoading"
      @save="handleAccessibilitySettingsSave"
      @reset="handleAccessibilitySettingsReset"
    />

          <!-- Privacy Tab -->
    <PrivacySettings
      v-else-if="activeTab === 'privacy'"
      :initial-settings="privacySettings"
      :is-loading="isLoading"
      @save="handlePrivacySettingsSave"
      @reset="handlePrivacySettingsReset"
      @export-data="handleExportData"
      @delete-account="handleDeleteAccount"
    />

          <!-- Preferences Tab -->
    <AppPreferences
      v-else-if="activeTab === 'preferences'"
      :initial-preferences="appPreferences"
      :is-loading="isLoading"
      @save="handleAppPreferencesSave"
      @reset="handleAppPreferencesReset"
    />
  </SettingsLayout>
</template>