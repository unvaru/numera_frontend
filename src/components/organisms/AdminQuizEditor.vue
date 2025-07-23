<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '../atoms/Input.vue'
import Button from '../atoms/Button.vue'

interface Question {
  id: number
  text: string
  options: {
    id: string
    text: string
  }[]
  correctAnswer: string
  explanation: string
}

interface Quiz {
  id?: number
  title: string
  topic: string
  description: string
  timeLimit?: number
  questions: Question[]
  published: boolean
}

// Sample data - in real app this would come from API
const topics = [
  'Basics',
  'Double Entry',
  'Financial Statements',
  'Advanced Topics'
]

const quiz = ref<Quiz>({
  title: '',
  topic: '',
  description: '',
  timeLimit: undefined,
  questions: [],
  published: false
})

const currentQuestion = ref<Partial<Question>>({
  text: '',
  options: [
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' }
  ],
  correctAnswer: '',
  explanation: ''
})

const isEditing = computed(() => !!quiz.value.id)
const errors = ref<Record<string, string>>({})

function validateQuiz() {
  const newErrors: Record<string, string> = {}

  if (!quiz.value.title.trim()) {
    newErrors.title = 'Title is required'
  }

  if (!quiz.value.topic) {
    newErrors.topic = 'Topic is required'
  }

  if (!quiz.value.description.trim()) {
    newErrors.description = 'Description is required'
  }

  if (quiz.value.questions.length === 0) {
    newErrors.questions = 'At least one question is required'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function validateQuestion() {
  const newErrors: Record<string, string> = {}

  if (!currentQuestion.value.text?.trim()) {
    newErrors.questionText = 'Question text is required'
  }

  const emptyOptions = currentQuestion.value.options?.filter(opt => !opt.text.trim())
  if (emptyOptions?.length) {
    newErrors.options = 'All options must have text'
  }

  if (!currentQuestion.value.correctAnswer) {
    newErrors.correctAnswer = 'Correct answer must be selected'
  }

  if (!currentQuestion.value.explanation?.trim()) {
    newErrors.explanation = 'Explanation is required'
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function addQuestion() {
  if (validateQuestion()) {
    quiz.value.questions.push({
      id: quiz.value.questions.length + 1,
      text: currentQuestion.value.text!,
      options: [...currentQuestion.value.options!],
      correctAnswer: currentQuestion.value.correctAnswer!,
      explanation: currentQuestion.value.explanation!
    })

    // Reset form
    currentQuestion.value = {
      text: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' }
      ],
      correctAnswer: '',
      explanation: ''
    }
  }
}

function removeQuestion(id: number) {
  quiz.value.questions = quiz.value.questions.filter(q => q.id !== id)
}

function handleSubmit() {
  if (validateQuiz()) {
    // In real app, this would make an API call
    console.log('Saving quiz:', quiz.value)
  }
}

function handlePreview() {
  // In real app, this would show a preview modal
  console.log('Preview quiz:', quiz.value)
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Quiz' : 'Create New Quiz' }}
        </h1>
        <p class="mt-1 text-gray-600">
          {{ isEditing ? 'Update the quiz content and settings' : 'Add a new quiz to your course' }}
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
          {{ isEditing ? 'Save Changes' : 'Create Quiz' }}
        </Button>
      </div>
    </div>

    <!-- Quiz Settings -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-6 space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Input
              v-model="quiz.title"
              label="Quiz Title"
              placeholder="Enter quiz title"
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
              v-model="quiz.topic"
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

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Description
            <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="quiz.description"
            rows="3"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            :class="{ 'border-red-300': errors.description }"
            placeholder="Enter quiz description"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">
            {{ errors.description }}
          </p>
        </div>

        <!-- Time Limit -->
        <div>
          <Input
            :modelValue="quiz.timeLimit || ''"
            @update:modelValue="val => quiz.timeLimit = val ? Number(val) : undefined"
            type="number"
            label="Time Limit (minutes)"
            placeholder="Leave empty for no time limit"
          />
        </div>
      </div>
    </div>

    <!-- Questions List -->
    <div class="bg-white rounded-xl shadow-sm">
      <div class="p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Questions</h2>

        <!-- Existing Questions -->
        <div v-if="quiz.questions.length > 0" class="mb-8 space-y-4">
          <div
            v-for="(question, index) in quiz.questions"
            :key="question.id"
            class="border rounded-lg p-4"
          >
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium text-gray-900">
                  Question {{ index + 1 }}
                </h3>
                <p class="mt-1 text-gray-600">{{ question.text }}</p>
              </div>
              <button
                @click="removeQuestion(question.id)"
                class="text-red-600 hover:text-red-900"
              >
                Remove
              </button>
            </div>

            <div class="mt-4 space-y-2">
              <div
                v-for="option in question.options"
                :key="option.id"
                class="flex items-center"
              >
                <span
                  class="w-6 h-6 flex items-center justify-center rounded-full border"
                  :class="option.id === question.correctAnswer ? 'bg-green-100 border-green-500 text-green-500' : 'border-gray-300'"
                >
                  {{ option.id }}
                </span>
                <span class="ml-2 text-gray-600">{{ option.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Question -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Add New Question</h3>
          
          <div class="space-y-6">
            <!-- Question Text -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Question Text
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="currentQuestion.text"
                rows="2"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                :class="{ 'border-red-300': errors.questionText }"
                placeholder="Enter your question"
              ></textarea>
              <p v-if="errors.questionText" class="mt-1 text-sm text-red-600">
                {{ errors.questionText }}
              </p>
            </div>

            <!-- Options -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Options
                <span class="text-red-500">*</span>
              </label>
              <div class="space-y-3">
                <div
                  v-for="option in currentQuestion.options"
                  :key="option.id"
                  class="flex items-center space-x-3"
                >
                  <input
                    type="radio"
                    :value="option.id"
                    v-model="currentQuestion.correctAnswer"
                    name="correct-answer"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span class="w-8 text-gray-500">{{ option.id }}.</span>
                  <Input
                    v-model="option.text"
                    placeholder="Enter option text"
                    class="flex-1"
                  />
                </div>
              </div>
              <p v-if="errors.options || errors.correctAnswer" class="mt-1 text-sm text-red-600">
                {{ errors.options || errors.correctAnswer }}
              </p>
            </div>

            <!-- Explanation -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Explanation
                <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="currentQuestion.explanation"
                rows="2"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                :class="{ 'border-red-300': errors.explanation }"
                placeholder="Explain why the correct answer is right"
              ></textarea>
              <p v-if="errors.explanation" class="mt-1 text-sm text-red-600">
                {{ errors.explanation }}
              </p>
            </div>

            <div>
              <Button
                variant="primary"
                @click="addQuestion"
              >
                Add Question
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Publishing -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <label class="flex items-center space-x-3">
            <input
              type="checkbox"
              v-model="quiz.published"
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span class="text-sm font-medium text-gray-700">
              Publish this quiz
            </span>
          </label>
          <p class="mt-1 text-sm text-gray-500">
            When published, this quiz will be visible to students.
          </p>
        </div>
        <div class="space-x-4">
          <Button
            variant="outline"
            @click="$router.push('/admin/quizzes')"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            @click="handleSubmit"
          >
            {{ isEditing ? 'Save Changes' : 'Create Quiz' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template> 