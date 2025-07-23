<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { QuestionType, DifficultyLevel } from '@/types/questions'
import type { Question } from '@/types/questions'

// Import all question components
import MCQQuestion from '../components/molecules/questions/MCQQuestion.vue'
import FillInBlankQuestion from '../components/molecules/questions/FillInBlankQuestion.vue'
import NumericalQuestion from '../components/molecules/questions/NumericalQuestion.vue'
import TrueFalseQuestion from '../components/molecules/questions/TrueFalseQuestion.vue'
import StructuredQuestion from '../components/molecules/questions/StructuredQuestion.vue'
import FinancialStatementQuestion from '../components/molecules/questions/FinancialStatementQuestion.vue'
import ScenarioQuestion from '../components/molecules/questions/ScenarioQuestion.vue'
import EnhancedQuizPlayer from '../components/organisms/EnhancedQuizPlayer.vue'

import Button from '../components/atoms/Button.vue'

const activeTab = ref(0)
const showQuizPlayer = ref(false)
const testResults = ref<any[]>([])

// Sample questions for each type
const sampleQuestions = [
  // MCQ Question
  {
    id: 'mcq-1',
    type: QuestionType.MCQ,
    text: 'Which of the following is the correct accounting equation?',
    points: 5,
    difficulty: DifficultyLevel.BASIC,
    options: [
      { id: 'A', text: 'Assets = Liabilities - Equity', isCorrect: false },
      { id: 'B', text: 'Assets = Liabilities + Equity', isCorrect: true },
      { id: 'C', text: 'Assets + Liabilities = Equity', isCorrect: false },
      { id: 'D', text: 'Assets - Equity = Liabilities', isCorrect: false }
    ],
    explanation: 'The fundamental accounting equation states that Assets = Liabilities + Equity. This equation must always balance and represents the relationship between what a company owns (assets) and how those assets are financed (through liabilities and equity).',
    hints: ['Think about what a company owns versus what it owes', 'The equation must always balance'],
    allowMultipleAnswers: false
  },

  // Fill in Blank Question
  {
    id: 'fib-1',
    type: QuestionType.FILL_IN_BLANK,
    text: 'Complete the following statements about double-entry bookkeeping:',
    points: 8,
    difficulty: DifficultyLevel.BASIC,
    template: 'In double-entry bookkeeping, every transaction affects at least {0} accounts. For every debit entry, there must be a corresponding {1} entry of equal amount. The total of all {2} must equal the total of all {3}.',
    blanks: [
      { id: 0, acceptedAnswers: ['two', '2', 'TWO'], caseSensitive: false },
      { id: 1, acceptedAnswers: ['credit', 'CREDIT'], caseSensitive: false },
      { id: 2, acceptedAnswers: ['debits', 'DEBITS'], caseSensitive: false },
      { id: 3, acceptedAnswers: ['credits', 'CREDITS'], caseSensitive: false }
    ],
    explanation: 'Double-entry bookkeeping is based on the principle that every transaction affects at least two accounts, with total debits always equaling total credits.',
    hints: ['Remember the fundamental principle of double-entry', 'Think about the two sides of every transaction']
  },

  // Numerical Question
  {
    id: 'num-1',
    type: QuestionType.NUMERICAL,
    text: 'Calculate the gross profit for ABC Trading Company using the following information:',
    points: 10,
    difficulty: DifficultyLevel.INTERMEDIATE,
    calculation: 'Gross Profit = Sales Revenue - Cost of Goods Sold',
    providedData: {
      'Sales Revenue': 250000,
      'Opening Stock': 35000,
      'Purchases': 150000,
      'Purchase Returns': 5000,
      'Closing Stock': 30000
    },
    correctAnswer: 100000,
    tolerance: 500,
    unit: '$',
    explanation: 'Gross Profit = Sales Revenue - Cost of Goods Sold. Cost of Goods Sold = Opening Stock + Net Purchases - Closing Stock = 35,000 + (150,000 - 5,000) - 30,000 = 150,000. Therefore, Gross Profit = 250,000 - 150,000 = $100,000.',
    hints: ['First calculate the Cost of Goods Sold', 'Remember to account for purchase returns', 'Net Purchases = Purchases - Purchase Returns']
  },

  // True/False Question
  {
    id: 'tf-1',
    type: QuestionType.TRUE_FALSE,
    text: 'Evaluate the following accounting principle:',
    points: 5,
    difficulty: DifficultyLevel.INTERMEDIATE,
    statement: 'The matching principle requires that expenses be recorded in the same period as the revenues they help to generate, regardless of when cash is paid.',
    correctAnswer: true,
    justificationRequired: true,
    explanation: 'True. The matching principle is a fundamental accounting concept that requires expenses to be matched with the revenues they help generate in the same accounting period, following the accrual basis of accounting.',
    hints: ['Think about the accrual basis of accounting', 'Consider the relationship between revenues and expenses']
  },

  // Structured Question
  {
    id: 'struct-1',
    type: QuestionType.STRUCTURED,
    text: 'XYZ Manufacturing Company: Financial Analysis',
    points: 25,
    difficulty: DifficultyLevel.ADVANCED,
    parts: [
      {
        id: 'part-a',
        partNumber: '(a)',
        text: 'Which type of account is "Accounts Receivable"?',
        points: 5,
        subType: 'mcq',
        data: {
          options: [
            { id: 'A', text: 'Asset', isCorrect: true },
            { id: 'B', text: 'Liability', isCorrect: false },
            { id: 'C', text: 'Equity', isCorrect: false },
            { id: 'D', text: 'Revenue', isCorrect: false }
          ]
        }
      },
      {
        id: 'part-b',
        partNumber: '(b)',
        text: 'Calculate the current ratio if current assets are $80,000 and current liabilities are $32,000.',
        points: 8,
        subType: 'numerical',
        data: {
          unit: ':1'
        }
      },
      {
        id: 'part-c',
        partNumber: '(c)',
        text: 'Using the provided data, calculate the return on investment (ROI).',
        points: 12,
        subType: 'calculation',
        data: {
          providedData: {
            'Net Income': 45000,
            'Total Investment': 300000
          }
        }
      }
    ],
    totalPoints: 25,
    explanation: 'This structured question tests understanding of account classification, ratio analysis, and financial performance metrics.'
  },

  // Financial Statement Question
  {
    id: 'fs-1',
    type: QuestionType.FINANCIAL_STATEMENT,
    text: 'Prepare a Trading Account for DEF Retailers for the year ended December 31, 2023:',
    points: 20,
    difficulty: DifficultyLevel.ADVANCED,
    statementType: 'trading_account',
    providedData: {
      accounts: [
        { name: 'Sales', balance: 180000 },
        { name: 'Opening Stock', balance: 25000 },
        { name: 'Purchases', balance: 110000 },
        { name: 'Closing Stock', balance: 20000 },
        { name: 'Carriage Inwards', balance: 3000 },
        { name: 'Purchase Returns', balance: 2000 }
      ],
      adjustments: [
        { description: 'Goods taken for personal use', amount: 1000 }
      ]
    },
    requiredItems: ['sales', 'opening_stock', 'purchases', 'closing_stock', 'gross_profit'],
    explanation: 'The Trading Account shows the gross profit calculation by matching sales revenue with the cost of goods sold.',
    hints: ['Start with sales revenue', 'Calculate net purchases', 'Remember the closing stock reduces cost of sales']
  },

  // Scenario Question
  {
    id: 'scenario-1',
    type: QuestionType.SCENARIO,
    text: 'GHI Services Ltd: Month-end Accounting Tasks',
    points: 30,
    difficulty: DifficultyLevel.ADVANCED,
    scenario: 'GHI Services Ltd is a consulting company. At the end of March 2023, the following transactions occurred: (1) Provided consulting services worth $15,000 on credit to ABC Corp, (2) Received $8,000 cash from previous credit sales, (3) Paid $3,000 for office rent, (4) Purchased office equipment for $12,000 on credit.',
    tasks: [
      {
        id: 'task-1',
        description: 'Record journal entries for all transactions',
        type: 'journal_entries',
        points: 15,
        data: {
          requiredEntries: 4
        }
      },
      {
        id: 'task-2',
        description: 'Prepare a trial balance extract',
        type: 'trial_balance',
        points: 10,
        data: {
          accounts: ['Cash', 'Accounts Receivable', 'Equipment', 'Accounts Payable', 'Service Revenue', 'Rent Expense']
        }
      },
      {
        id: 'task-3',
        description: 'Calculate the net effect on cash',
        type: 'calculations',
        points: 5,
        data: {
          instruction: 'Calculate the total change in cash position from all transactions'
        }
      }
    ],
    providedData: {
      accounts: [
        { name: 'Cash', balance: 25000 },
        { name: 'Accounts Receivable', balance: 12000 },
        { name: 'Equipment', balance: 35000 },
        { name: 'Accounts Payable', balance: 8000 },
        { name: 'Capital', balance: 64000 }
      ],
      transactions: [
        'Provided consulting services worth $15,000 on credit to ABC Corp',
        'Received $8,000 cash from previous credit sales',
        'Paid $3,000 for office rent',
        'Purchased office equipment for $12,000 on credit'
      ]
    },
    explanation: 'This scenario tests practical application of journal entries, trial balance preparation, and cash flow analysis.',
    hints: ['Remember the accounting equation must balance', 'Each transaction affects at least two accounts', 'Cash transactions directly affect the cash account']
  }
]

const questionTypes = [
  { id: 0, name: 'MCQ Question', icon: ['fas', 'list-ul'] },
  { id: 1, name: 'Fill in Blank', icon: ['fas', 'edit'] },
  { id: 2, name: 'Numerical', icon: ['fas', 'calculator'] },
  { id: 3, name: 'True/False', icon: ['fas', 'question-circle'] },
  { id: 4, name: 'Structured', icon: ['fas', 'tasks'] },
  { id: 5, name: 'Financial Statement', icon: ['fas', 'file-invoice'] },
  { id: 6, name: 'Scenario', icon: ['fas', 'building'] }
]

const currentQuestion = computed(() => sampleQuestions[activeTab.value])

const handleAnswer = (answer: any) => {
  console.log('Answer received:', answer)
  testResults.value.push({
    questionId: answer.questionId,
    questionType: answer.questionType,
    answer: answer,
    timestamp: new Date().toISOString()
  })
}

const handleNext = () => {
  console.log('Next question requested')
  if (activeTab.value < sampleQuestions.length - 1) {
    activeTab.value++
  }
}

const resetTest = () => {
  testResults.value = []
  activeTab.value = 0
}

const exportResults = () => {
  const dataStr = JSON.stringify(testResults.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'question-test-results.json'
  link.click()
  URL.revokeObjectURL(url)
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  // ESC to exit full screen
  if (event.key === 'Escape' && showQuizPlayer.value) {
    showQuizPlayer.value = false
  }
  // F11 or F to toggle full screen
  if ((event.key === 'F11' || event.key === 'f') && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    showQuizPlayer.value = !showQuizPlayer.value
  }
}
</script>

<template>
  <div class="question-test-page">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Question Component Testing</h1>
            <p class="text-gray-600 mt-1">Test all question types with sample accounting data</p>
          </div>
          
          <div class="flex gap-3">
            <Button variant="outline" @click="resetTest">
              <font-awesome-icon :icon="['fas', 'refresh']" class="mr-2" />
              Reset
            </Button>
            <Button variant="outline" @click="exportResults" :disabled="testResults.length === 0">
              <font-awesome-icon :icon="['fas', 'download']" class="mr-2" />
              Export Results
            </Button>
            <Button variant="primary" @click="showQuizPlayer = !showQuizPlayer">
              <font-awesome-icon :icon="['fas', showQuizPlayer ? 'grid-3x3' : 'expand']" class="mr-2" />
              {{ showQuizPlayer ? 'Component View' : 'Quiz Player' }}
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Quiz Player Mode - Full Screen -->
    <div v-if="showQuizPlayer" class="fixed inset-0 bg-gray-50 z-50 overflow-auto">
      <!-- Full Screen Header with Exit Button -->
      <!-- <div class="bg-white shadow-sm border-b sticky top-0 z-10">
        <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 class="text-lg font-semibold text-gray-900">Quiz Player Mode</h1>
          <Button variant="outline" size="sm" @click="showQuizPlayer = false">
            <font-awesome-icon :icon="['fas', 'times']" class="mr-2" />
            Exit
          </Button>
        </div>
      </div> -->
      
      <!-- Quiz Player Content -->
      <EnhancedQuizPlayer quiz-id="test-quiz" />
    </div>

    <!-- Component Testing Mode -->
    <div v-else class="max-w-6xl mx-auto p-4 lg:p-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar - Question Type Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm p-4 sticky top-24">
            <h3 class="font-semibold text-gray-900 mb-4">Question Types</h3>
            
            <div class="space-y-2">
              <button
                v-for="(type, index) in questionTypes"
                :key="type.id"
                @click="activeTab = index"
                :class="[
                  'w-full text-left px-3 py-3 rounded-lg transition-colors border-2',
                  activeTab === index
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center gap-3">
                  <font-awesome-icon :icon="type.icon" class="flex-shrink-0" />
                  <span class="font-medium text-sm">{{ type.name }}</span>
                </div>
              </button>
            </div>

            <!-- Test Results Summary -->
            <div class="mt-6 pt-4 border-t border-gray-200">
              <h4 class="font-medium text-gray-900 mb-2">Test Results</h4>
              <div class="text-sm text-gray-600">
                <div>Answered: {{ testResults.length }} / {{ sampleQuestions.length }}</div>
                <div class="mt-2">
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-green-500 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${(testResults.length / sampleQuestions.length) * 100}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content - Current Question -->
        <div class="lg:col-span-3">
          <div class="bg-white rounded-xl shadow-sm p-6">
            <!-- Question Type Header -->
            <div class="mb-6 pb-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <font-awesome-icon :icon="questionTypes[activeTab].icon" class="text-blue-600" />
                  </div>
                  <div>
                    <h2 class="text-lg font-semibold text-gray-900">{{ questionTypes[activeTab].name }}</h2>
                    <p class="text-sm text-gray-600">
                      Question {{ activeTab + 1 }} of {{ sampleQuestions.length }} • 
                      {{ currentQuestion.points }} points • 
                      {{ currentQuestion.difficulty }} level
                    </p>
                  </div>
                </div>
                
                <div class="flex gap-2">
                  <Button
                    v-if="activeTab > 0"
                    variant="outline"
                    size="sm"
                    @click="activeTab--"
                  >
                    <font-awesome-icon :icon="['fas', 'arrow-left']" />
                  </Button>
                  <Button
                    v-if="activeTab < sampleQuestions.length - 1"
                    variant="outline"
                    size="sm"
                    @click="activeTab++"
                  >
                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                  </Button>
                </div>
              </div>
            </div>

            <!-- Question Component -->
            <div class="question-wrapper">
              <!-- MCQ Question -->
              <MCQQuestion
                v-if="currentQuestion.type === QuestionType.MCQ"
                :question="currentQuestion"
                @answer="handleAnswer"
                @next="handleNext"
              />
              
              <!-- Fill in Blank Question -->
              <FillInBlankQuestion
                v-else-if="currentQuestion.type === QuestionType.FILL_IN_BLANK"
                :question="currentQuestion"
                @answer="handleAnswer"
                @next="handleNext"
              />
              
              <!-- Numerical Question -->
              <NumericalQuestion
                v-else-if="currentQuestion.type === QuestionType.NUMERICAL"
                :question="currentQuestion"
                @answer="handleAnswer"
                @next="handleNext"
              />
              
              <!-- True/False Question -->
              <TrueFalseQuestion
                v-else-if="currentQuestion.type === QuestionType.TRUE_FALSE"
                :question="currentQuestion"
                @answer="handleAnswer"
                @next="handleNext"
              />
              
              <!-- Structured Question -->
              <StructuredQuestion
                v-else-if="currentQuestion.type === QuestionType.STRUCTURED"
                :question="currentQuestion"
                @answer="handleAnswer"
                @next="handleNext"
              />
              
              <!-- Financial Statement Question -->
              <FinancialStatementQuestion
                v-else-if="currentQuestion.type === QuestionType.FINANCIAL_STATEMENT"
                :question="currentQuestion"
                @answer="handleAnswer"
                @next="handleNext"
              />
              
              <!-- Scenario Question -->
              <ScenarioQuestion
                v-else-if="currentQuestion.type === QuestionType.SCENARIO"
                :question="currentQuestion"
                @answer="handleAnswer"
                @next="handleNext"
              />
            </div>
          </div>

          <!-- Test Info Panel -->
          <div class="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 class="font-medium text-blue-900 mb-2">Testing Information</h3>
            <div class="text-sm text-blue-800 space-y-1">
              <p>• All answers are logged to console and test results</p>
              <p>• Use browser dev tools to inspect component props and events</p>
              <p>• Switch between components using the sidebar navigation</p>
              <p>• Export results as JSON for analysis</p>
              <p>• Toggle to Quiz Player mode to test the complete experience</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure proper mobile responsiveness */
@media (max-width: 1024px) {
  .question-test-page .grid {
    grid-template-columns: 1fr;
  }
  
  .question-test-page .sticky {
    position: relative;
    top: auto;
  }
}

/* Smooth transitions */
.question-test-page button {
  transition: all 0.2s ease-in-out;
}

.question-test-page button:active {
  transform: scale(0.98);
}

/* Custom scrollbar for sidebar */
.question-test-page .space-y-2 {
  max-height: 400px;
  overflow-y: auto;
}

.question-test-page .space-y-2::-webkit-scrollbar {
  width: 4px;
}

.question-test-page .space-y-2::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 2px;
}

.question-test-page .space-y-2::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.question-test-page .space-y-2::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style> 