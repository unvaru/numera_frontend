<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ScenarioQuestion, ScenarioAnswer } from '@/types/questions'
import Button from '../../atoms/Button.vue'
import Input from '../../atoms/Input.vue'

interface Props {
  question: ScenarioQuestion
  showResult?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'answer', answer: ScenarioAnswer): void
  (e: 'next'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const taskAnswers = ref<{ [key: string]: any }>({})
const showFeedback = ref(false)
const activeTab = ref(0)

const hasAnswerForTask = (taskId: string, taskType: string): boolean => {
  const answer = taskAnswers.value[taskId]
  if (!answer) return false
  
  switch (taskType) {
    case 'journal_entries':
      return answer.entries && answer.entries.length > 0
    case 'trial_balance':
      return answer.accounts && Object.keys(answer.accounts).length > 0
    case 'financial_statements':
      return answer.statement && Object.keys(answer.statement).length > 0
    case 'calculations':
      return answer.result !== undefined && answer.result !== null && answer.result !== ''
    default:
      return false
  }
}

const allTasksCompleted = computed(() => {
  return props.question.tasks.every(task => 
    hasAnswerForTask(task.id, task.type)
  )
})

const addJournalEntry = (taskId: string) => {
  if (!taskAnswers.value[taskId]) {
    taskAnswers.value[taskId] = { entries: [] }
  }
  if (!taskAnswers.value[taskId].entries) {
    taskAnswers.value[taskId].entries = []
  }
  
  taskAnswers.value[taskId].entries.push({
    id: Date.now(),
    date: '',
    account: '',
    debit: null,
    credit: null,
    description: ''
  })
}

const removeJournalEntry = (taskId: string, entryId: number) => {
  if (taskAnswers.value[taskId]?.entries) {
    taskAnswers.value[taskId].entries = taskAnswers.value[taskId].entries.filter(
      (entry: any) => entry.id !== entryId
    )
  }
}

const updateJournalEntry = (taskId: string, entryId: number, field: string, value: any) => {
  if (props.disabled || showFeedback.value) return
  
  const entry = taskAnswers.value[taskId]?.entries?.find((e: any) => e.id === entryId)
  if (entry) {
    entry[field] = value
  }
}

const updateTrialBalance = (taskId: string, accountName: string, type: 'debit' | 'credit', value: number) => {
  if (props.disabled || showFeedback.value) return
  
  if (!taskAnswers.value[taskId]) {
    taskAnswers.value[taskId] = { accounts: {} }
  }
  if (!taskAnswers.value[taskId].accounts) {
    taskAnswers.value[taskId].accounts = {}
  }
  if (!taskAnswers.value[taskId].accounts[accountName]) {
    taskAnswers.value[taskId].accounts[accountName] = { debit: 0, credit: 0 }
  }
  
  taskAnswers.value[taskId].accounts[accountName][type] = value
}

const updateStatement = (taskId: string, key: string, value: any) => {
  if (props.disabled || showFeedback.value) return
  
  if (!taskAnswers.value[taskId]) {
    taskAnswers.value[taskId] = { statement: {} }
  }
  if (!taskAnswers.value[taskId].statement) {
    taskAnswers.value[taskId].statement = {}
  }
  
  taskAnswers.value[taskId].statement[key] = value
}

const updateCalculation = (taskId: string, field: string, value: any) => {
  if (props.disabled || showFeedback.value) return
  
  if (!taskAnswers.value[taskId]) {
    taskAnswers.value[taskId] = {}
  }
  
  taskAnswers.value[taskId][field] = value
}

const getTaskIcon = (taskType: string): string[] => {
  const icons: { [key: string]: string[] } = {
    journal_entries: ['fas', 'book'],
    trial_balance: ['fas', 'balance-scale'],
    financial_statements: ['fas', 'file-invoice'],
    calculations: ['fas', 'calculator']
  }
  return icons[taskType] || ['fas', 'tasks']
}

const getTaskColor = (taskType: string): string => {
  const colors: { [key: string]: string } = {
    journal_entries: 'bg-blue-50 border-blue-200 text-blue-800',
    trial_balance: 'bg-green-50 border-green-200 text-green-800',
    financial_statements: 'bg-purple-50 border-purple-200 text-purple-800',
    calculations: 'bg-orange-50 border-orange-200 text-orange-800'
  }
  return colors[taskType] || 'bg-gray-50 border-gray-200 text-gray-800'
}

const submitAnswer = () => {
  showFeedback.value = true
  
  const answer: ScenarioAnswer = {
    questionId: props.question.id,
    questionType: props.question.type,
    taskAnswers: props.question.tasks.map(task => ({
      taskId: task.id,
      answer: taskAnswers.value[task.id] || {}
    }))
  }
  
  emit('answer', answer)
}

const nextQuestion = () => {
  emit('next')
}

// Watch for disabled state to show results
watch(() => props.disabled, (disabled) => {
  if (disabled) {
    showFeedback.value = true
  }
})
</script>

<template>
  <div class="scenario-question">
    <!-- Question Header -->
    <div class="mb-6">
      <h3 class="text-lg lg:text-xl font-semibold text-gray-900 mb-4">{{ question.text }}</h3>
      
      <!-- Hints -->
      <div v-if="question.hints && question.hints.length > 0" class="mb-4 p-3 lg:p-4 bg-blue-50 rounded-lg">
        <div class="flex items-start gap-2">
          <font-awesome-icon :icon="['fas', 'lightbulb']" class="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-sm font-medium text-blue-900 mb-1">Hints:</p>
            <ul class="text-sm text-blue-800 space-y-1">
              <li v-for="hint in question.hints" :key="hint">• {{ hint }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Scenario Description -->
    <div class="mb-6 p-4 lg:p-6 bg-amber-50 rounded-lg border border-amber-200">
      <h4 class="font-medium text-amber-900 mb-3 flex items-center gap-2">
        <font-awesome-icon :icon="['fas', 'building']" />
        Business Scenario
      </h4>
      <p class="text-amber-800 leading-relaxed">{{ question.scenario }}</p>
    </div>

    <!-- Provided Data -->
    <div v-if="question.providedData" class="mb-6 p-4 lg:p-6 bg-gray-50 rounded-lg">
      <h4 class="font-medium text-gray-900 mb-4">Provided Information:</h4>
      
      <!-- Accounts -->
      <div v-if="question.providedData.accounts" class="mb-4">
        <h5 class="text-sm font-medium text-gray-700 mb-2">Account Balances:</h5>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          <div
            v-for="account in question.providedData.accounts"
            :key="account.name"
            class="flex justify-between items-center p-2 bg-white rounded border text-sm"
          >
            <span class="font-medium">{{ account.name }}:</span>
            <span>${{ account.balance.toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Transactions -->
      <div v-if="question.providedData.transactions" class="mb-4">
        <h5 class="text-sm font-medium text-gray-700 mb-2">Transactions:</h5>
        <div class="space-y-2">
          <div
            v-for="(transaction, index) in question.providedData.transactions"
            :key="index"
            class="p-3 bg-white rounded border text-sm"
          >
            {{ transaction }}
          </div>
        </div>
      </div>
    </div>

    <!-- Task Tabs (Mobile) -->
    <div class="mb-6 lg:hidden">
      <div class="flex gap-2 overflow-x-auto pb-2">
        <button
          v-for="(task, index) in question.tasks"
          :key="task.id"
          @click="activeTab = index"
          :class="[
            'flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors border-2',
            activeTab === index
              ? 'bg-blue-600 text-white border-blue-600'
              : hasAnswerForTask(task.id, task.type)
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-gray-50 text-gray-600 border-gray-200'
          ]"
        >
          <font-awesome-icon :icon="getTaskIcon(task.type)" class="mr-1" />
          Task {{ index + 1 }}
        </button>
      </div>
    </div>

    <!-- Desktop Task Grid -->
    <div class="hidden lg:block mb-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          v-for="(task, index) in question.tasks"
          :key="task.id"
          @click="activeTab = index"
          :class="[
            'p-4 rounded-lg text-left transition-all duration-200 border-2',
            activeTab === index
              ? 'bg-blue-600 text-white border-blue-600 transform scale-105'
              : hasAnswerForTask(task.id, task.type)
              ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
          ]"
        >
          <div class="flex items-center gap-2 mb-2">
            <font-awesome-icon :icon="getTaskIcon(task.type)" />
            <span class="font-semibold">Task {{ index + 1 }}</span>
          </div>
          <p class="text-sm opacity-90">{{ task.description }}</p>
        </button>
      </div>
    </div>

    <!-- Active Task Content -->
    <div class="mb-6">
      <div
        v-for="(task, index) in question.tasks"
        :key="task.id"
        v-show="activeTab === index"
        class="bg-white rounded-xl border border-gray-200 p-4 lg:p-6"
      >
        <div class="flex items-start justify-between mb-4">
          <h4 class="text-lg font-semibold text-gray-900">
            Task {{ index + 1 }}: {{ task.description }}
          </h4>
          <span :class="['px-3 py-1 rounded-full text-xs font-medium border', getTaskColor(task.type)]">
            {{ task.type.replace('_', ' ').toUpperCase() }}
          </span>
        </div>

        <!-- Journal Entries Task -->
        <div v-if="task.type === 'journal_entries'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h5 class="font-medium text-gray-700">Journal Entries:</h5>
            <Button
              variant="outline"
              size="sm"
              @click="addJournalEntry(task.id)"
              :disabled="disabled"
            >
              <font-awesome-icon :icon="['fas', 'plus']" class="mr-1" />
              Add Entry
            </Button>
          </div>

          <div class="space-y-3">
            <div
              v-for="entry in taskAnswers[task.id]?.entries || []"
              :key="entry.id"
              class="grid grid-cols-1 lg:grid-cols-6 gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <Input
                :model-value="entry.date"
                @update:model-value="updateJournalEntry(task.id, entry.id, 'date', $event)"
                type="date"
                :disabled="disabled"
                placeholder="Date"
                class="lg:col-span-1"
              />
              <Input
                :model-value="entry.account"
                @update:model-value="updateJournalEntry(task.id, entry.id, 'account', $event)"
                :disabled="disabled"
                placeholder="Account Name"
                class="lg:col-span-2"
              />
              <Input
                :model-value="entry.debit || ''"
                @update:model-value="updateJournalEntry(task.id, entry.id, 'debit', $event)"
                type="number"
                step="0.01"
                :disabled="disabled"
                placeholder="Debit"
                class="lg:col-span-1"
              />
              <Input
                :model-value="entry.credit || ''"
                @update:model-value="updateJournalEntry(task.id, entry.id, 'credit', $event)"
                type="number"
                step="0.01"
                :disabled="disabled"
                placeholder="Credit"
                class="lg:col-span-1"
              />
              <Button
                variant="outline"
                size="sm"
                @click="removeJournalEntry(task.id, entry.id)"
                :disabled="disabled"
                class="lg:col-span-1"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Trial Balance Task -->
        <div v-else-if="task.type === 'trial_balance'" class="space-y-4">
          <h5 class="font-medium text-gray-700">Trial Balance:</h5>
          <div class="overflow-x-auto">
            <table class="w-full text-sm border border-gray-200 rounded-lg">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-3 text-left font-medium text-gray-700 border-b">Account</th>
                  <th class="p-3 text-center font-medium text-gray-700 border-b">Debit ($)</th>
                  <th class="p-3 text-center font-medium text-gray-700 border-b">Credit ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="account in question.providedData?.accounts || []"
                  :key="account.name"
                  class="border-b"
                >
                  <td class="p-3 font-medium">{{ account.name }}</td>
                  <td class="p-2">
                    <Input
                      :model-value="taskAnswers[task.id]?.accounts?.[account.name]?.debit || ''"
                      @update:model-value="updateTrialBalance(task.id, account.name, 'debit', Number($event))"
                      type="number"
                      step="0.01"
                      :disabled="disabled"
                      class="text-center w-full"
                      placeholder="0.00"
                    />
                  </td>
                  <td class="p-2">
                    <Input
                      :model-value="taskAnswers[task.id]?.accounts?.[account.name]?.credit || ''"
                      @update:model-value="updateTrialBalance(task.id, account.name, 'credit', Number($event))"
                      type="number"
                      step="0.01"
                      :disabled="disabled"
                      class="text-center w-full"
                      placeholder="0.00"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Financial Statements Task -->
        <div v-else-if="task.type === 'financial_statements'" class="space-y-4">
          <h5 class="font-medium text-gray-700">Financial Statement Items:</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="item in ['revenue', 'expenses', 'assets', 'liabilities', 'capital']"
              :key="item"
              class="flex items-center gap-3"
            >
              <label class="font-medium text-gray-700 capitalize flex-1">{{ item }}:</label>
              <div class="flex items-center gap-2">
                <span class="text-gray-600">$</span>
                <Input
                  :model-value="taskAnswers[task.id]?.statement?.[item] || ''"
                  @update:model-value="updateStatement(task.id, item, $event)"
                  type="number"
                  step="0.01"
                  :disabled="disabled"
                  class="w-32 text-right"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Calculations Task -->
        <div v-else-if="task.type === 'calculations'" class="space-y-4">
          <h5 class="font-medium text-gray-700">Required Calculation:</h5>
          <div class="p-4 bg-blue-50 rounded-lg">
            <p class="text-blue-800">{{ task.data?.instruction || 'Perform the required calculations based on the scenario.' }}</p>
          </div>
          
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Calculation Result:
              </label>
              <div class="flex items-center gap-2">
                <span class="text-gray-600">$</span>
                <Input
                  :model-value="taskAnswers[task.id]?.result || ''"
                  @update:model-value="updateCalculation(task.id, 'result', $event)"
                  type="number"
                  step="0.01"
                  :disabled="disabled"
                  class="w-48 text-right font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Show Your Working:
              </label>
              <textarea
                :value="taskAnswers[task.id]?.working || ''"
                @input="updateCalculation(task.id, 'working', ($event.target as HTMLTextAreaElement).value)"
                :disabled="disabled"
                class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Show your calculation steps..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress Summary -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
      <h4 class="font-medium text-gray-900 mb-3">Progress Summary:</h4>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="(task, index) in question.tasks"
          :key="task.id"
          :class="[
            'p-3 rounded-lg text-center border-2 transition-colors',
            hasAnswerForTask(task.id, task.type)
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-gray-100 border-gray-200 text-gray-600'
          ]"
        >
          <div class="font-medium text-sm">Task {{ index + 1 }}</div>
          <div class="text-xs mt-1">
            {{ hasAnswerForTask(task.id, task.type) ? 'Completed' : 'Pending' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Feedback -->
    <div v-if="showFeedback" class="mb-6 p-4 lg:p-6 bg-green-50 rounded-lg border border-green-200">
      <h4 class="font-semibold text-green-900 mb-3">Scenario Completed</h4>
      <p class="text-green-800 text-sm">
        All tasks have been submitted. Detailed feedback and evaluation will be provided after the quiz is completed.
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-end">
      <Button
        v-if="!showFeedback"
        variant="primary"
        :disabled="!allTasksCompleted || disabled"
        @click="submitAnswer"
        class="w-full sm:w-auto"
      >
        <font-awesome-icon :icon="['fas', 'check-circle']" class="mr-2" />
        Submit All Tasks
      </Button>
      
      <Button
        v-else
        variant="primary"
        @click="nextQuestion"
        class="w-full sm:w-auto"
      >
        <font-awesome-icon :icon="['fas', 'arrow-right']" class="mr-2" />
        Next Question
      </Button>
    </div>
  </div>
</template>

<style scoped>
/* Ensure proper mobile scrolling for tables */
@media (max-width: 768px) {
  .scenario-question table {
    min-width: 500px;
  }
  
  .scenario-question .grid {
    grid-template-columns: 1fr;
  }
}

/* Smooth transitions */
.scenario-question button {
  transition: all 0.2s ease-in-out;
}

.scenario-question button:active {
  transform: scale(0.98);
}

/* Table styling */
.scenario-question table input {
  border: none;
  background: transparent;
  font-family: monospace;
}

.scenario-question table input:focus {
  background: white;
  border: 1px solid #3b82f6;
  border-radius: 4px;
}
</style> 