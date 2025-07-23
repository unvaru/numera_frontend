<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '../atoms/Input.vue'
import Button from '../atoms/Button.vue'

interface Lesson {
  id?: number
  title: string
  topic: string
  content: string
  videoUrl: string
  order: number
  published: boolean
}

// Sample data - in real app this would come from API
const topics = [
  'Basics',
  'Double Entry',
  'Financial Statements',
  'Advanced Topics'
]

const lesson = ref<Lesson>({
  title: '',
  topic: '',
  content: '',
  videoUrl: '',
  order: 1,
  published: false
})

const isEditing = computed(() => !!lesson.value.id)

const errors = ref<Partial<Record<keyof Lesson, string>>>({})

function validateForm() {
  const newErrors: Partial<Record<keyof Lesson, string>> = {}

  if (!lesson.value.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!lesson.value.topic) {
    newErrors.topic = 'Topic is required'
  }

  if (!lesson.value.content.trim()) {
    newErrors.content = 'Content is required'
  }

  if (lesson.value.videoUrl && !isValidUrl(lesson.value.videoUrl)) {
    newErrors.videoUrl = 'Please enter a valid URL'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function handleSubmit() {
  if (validateForm()) {
    // In real app, this would make an API call
    console.log('Saving lesson:', lesson.value)
  }
}

function handlePreview() {
  // In real app, this would show a preview modal
  console.log('Preview lesson:', lesson.value)
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Lesson' : 'Create New Lesson' }}
        </h1>
        <p class="mt-1 text-gray-600">
          {{ isEditing ? 'Update the lesson content and settings' : 'Add a new lesson to your course' }}
        </p>
      </div>
      <div class="space-x-3">
        <Button
          variant="outline"
          @click="handlePreview"
        >
          Preview
        </Button>
        <Button
          variant="primary"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Save Changes' : 'Create Lesson' }}
        </Button>
      </div>
    </div>

    <!-- Form -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-6 space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Input
              v-model="lesson.title"
              label="Lesson Title"
              placeholder="Enter lesson title"
              required
              :error="errors.title"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Topic
              <span class="text-red-500">*</span>
            </label>
            <select
              v-model="lesson.topic"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-lg"
              :class="{ 'border-red-300': errors.topic }"
            >
              <option value="">Select Topic</option>
              <option v-for="topic in topics" :key="topic">{{ topic }}</option>
            </select>
            <p v-if="errors.topic" class="mt-1 text-sm text-red-600">
              {{ errors.topic }}
            </p>
          </div>
        </div>

        <!-- Content -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Lesson Content
            <span class="text-red-500">*</span>
          </label>
          <div class="mt-1">
            <textarea
              v-model="lesson.content"
              rows="8"
              class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              :class="{ 'border-red-300': errors.content }"
              placeholder="Enter lesson content (supports markdown)"
            ></textarea>
            <p v-if="errors.content" class="mt-1 text-sm text-red-600">
              {{ errors.content }}
            </p>
          </div>
          <p class="mt-2 text-sm text-gray-500">
            Write your lesson content using markdown for formatting.
          </p>
        </div>

        <!-- Video URL -->
        <div>
          <Input
            v-model="lesson.videoUrl"
            type="text"
            label="Video URL (optional)"
            placeholder="Enter video URL"
            :error="errors.videoUrl"
          />
          <p class="mt-2 text-sm text-gray-500">
            Add a video to supplement your lesson content.
          </p>
        </div>

        <!-- Order and Publishing -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Input
              v-model="lesson.order"
              type="number"
              label="Display Order"
              placeholder="1"
            />
            <p class="mt-2 text-sm text-gray-500">
              Set the order in which this lesson appears.
            </p>
          </div>
          <div>
            <label class="flex items-center space-x-3">
              <input
                type="checkbox"
                v-model="lesson.published"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span class="text-sm font-medium text-gray-700">
                Publish this lesson
              </span>
            </label>
            <p class="mt-2 text-sm text-gray-500">
              When published, this lesson will be visible to students.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-end space-x-4">
      <Button
        variant="outline"
        @click="$router.push('/admin/lessons')"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        @click="handleSubmit"
      >
        {{ isEditing ? 'Save Changes' : 'Create Lesson' }}
      </Button>
    </div>
  </div>
</template> 