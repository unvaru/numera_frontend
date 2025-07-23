<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    title: 'Interactive Learning',
    description: 'Engage with dynamic accounting lessons designed for modern learners',
    icon: '📚'
  },
  {
    title: 'Practice Exercises',
    description: 'Strengthen your skills with hands-on ledger practice and quizzes',
    icon: '✏️'
  },
  {
    title: 'Past Papers',
    description: 'Prepare for exams with our comprehensive collection of past papers',
    icon: '📝'
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your learning journey with detailed progress analytics',
    icon: '📊'
  }
]

const navigateToLogin = () => {
  router.push('/login')
}

const navigateToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Header/Navigation -->
    <header class="p-6">
      <nav class="max-w-7xl mx-auto flex justify-between items-center">
        <div class="text-2xl font-bold text-blue-600">Numera</div>
        <div class="space-x-4">
          <button 
            @click="navigateToLogin"
            class="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            Login
          </button>
          <button 
            @click="navigateToRegister"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>
    </header>

    <!-- Hero Section -->
    <main>
      <div class="max-w-7xl mx-auto px-6 py-20">
        <div class="text-center">
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Accounting<br/>
            <span class="text-blue-600">The Smart Way</span>
          </h1>
          <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your journey to accounting excellence starts here. Interactive lessons, 
            practical exercises, and comprehensive learning tools designed for modern students.
          </p>
          <button 
            @click="navigateToRegister"
            class="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700 
            transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Start Learning Now
          </button>
        </div>

        <!-- Features Grid -->
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
          >
            <div class="text-4xl mb-4">{{ feature.icon }}</div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ feature.title }}</h3>
            <p class="text-gray-600">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-50 mt-20">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <div class="text-center text-gray-600">
          <p>© {{ new Date().getFullYear() }} Numera. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template> 