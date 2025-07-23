<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    error.value = ''
    
    // Development fixed credentials
    const STUDENT_EMAIL = 'dev@numera.com'
    const STUDENT_PASSWORD = 'password123'
    const ADMIN_EMAIL = 'admin@numera.com'
    const ADMIN_PASSWORD = 'admin123'
    
    let devUser = null
    
    if (email.value === STUDENT_EMAIL && password.value === STUDENT_PASSWORD) {
      devUser = {
        id: 'dev-student-001',
        name: 'John Doe',
        email: STUDENT_EMAIL,
        role: 'student',
        subscriptionPlan: 'free',
        loginTime: new Date().toISOString()
      }
    } else if (email.value === ADMIN_EMAIL && password.value === ADMIN_PASSWORD) {
      devUser = {
        id: 'dev-admin-001',
        name: 'Admin User',
        email: ADMIN_EMAIL,
        role: 'admin',
        subscriptionPlan: 'premium', // Admins get premium by default
        loginTime: new Date().toISOString()
      }
    }
    
    if (devUser) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
    
      // Store authentication token in localStorage for development
      localStorage.setItem('authToken', 'dev-token-12345')
      localStorage.setItem('currentUser', JSON.stringify(devUser))
      
      // Redirect to subject selection
      router.push('/app/subjects')
    } else {
      error.value = 'Invalid credentials. Use the provided development credentials above.'
    }
  } catch (err) {
    error.value = 'Login failed. Please try again.'
  }
}

const navigateToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Or
        <button
          @click="navigateToRegister"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          create a new account
        </button>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Development Credentials Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 class="text-sm font-medium text-blue-800 mb-2">Development Mode</h3>
        <p class="text-sm text-blue-700 mb-2">Use these credentials to login:</p>
        <div class="text-sm font-mono bg-blue-100 p-2 rounded">
          <div class="mb-2">
            <div class="font-medium text-blue-800">Student Account:</div>
            <div>Email: dev@numera.com</div>
            <div>Password: password123</div>
          </div>
          <div>
            <div class="font-medium text-blue-800">Admin Account:</div>
            <div>Email: admin@numera.com</div>
            <div>Password: admin123</div>
          </div>
        </div>
      </div>
      
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div v-if="error" class="mt-4 text-red-600 text-sm text-center">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template> 