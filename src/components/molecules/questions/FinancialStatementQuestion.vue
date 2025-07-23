<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FinancialStatementQuestion, FinancialStatementAnswer } from '@/types/questions'
import Button from '../../atoms/Button.vue'
import Input from '../../atoms/Input.vue'

interface Props {
  question: FinancialStatementQuestion
  showResult?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'answer', answer: FinancialStatementAnswer): void
  (e: 'next'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const statementData = ref<{ [key: string]: number | string }>({})
const showFeedback = ref(false)

// Initialize statement structure based on type
const initializeStatement = () => {
  const data: { [key: string]: number | string } = {}
  
  switch (props.question.statementType) {
    case 'trading_account':
      data['sales'] = 0
      data['opening_stock'] = 0
      data['purchases'] = 0
      data['closing_stock'] = 0
      data['gross_profit'] = 0
      break
    case 'profit_loss':
      data['gross_profit'] = 0
      data['total_expenses'] = 0
      data['net_profit'] = 0
      break
    case 'balance_sheet':
      data['total_assets'] = 0
      data['total_liabilities'] = 0
      data['capital'] = 0
      break
    case 'cash_flow':
      data['operating_activities'] = 0
      data['investing_activities'] = 0
      data['financing_activities'] = 0
      data['net_cash_flow'] = 0
      break
  }
  
  statementData.value = data
}

// Auto-calculate derived values
const calculateDerivedValues = () => {
  const data = { ...statementData.value }
  
  switch (props.question.statementType) {
    case 'trading_account':
      const costOfSales = (Number(data.opening_stock) || 0) + (Number(data.purchases) || 0) - (Number(data.closing_stock) || 0)
      data.cost_of_sales = costOfSales
      data.gross_profit = (Number(data.sales) || 0) - costOfSales
      break
    case 'profit_loss':
      data.net_profit = (Number(data.gross_profit) || 0) - (Number(data.total_expenses) || 0)
      break
    case 'balance_sheet':
      // Balance sheet should balance: Assets = Liabilities + Capital
      break
    case 'cash_flow':
      data.net_cash_flow = (Number(data.operating_activities) || 0) + 
                          (Number(data.investing_activities) || 0) + 
                          (Number(data.financing_activities) || 0)
      break
  }
  
  statementData.value = data
}

const statementStructure = computed(() => {
  switch (props.question.statementType) {
    case 'trading_account':
      return [
        { key: 'sales', label: 'Sales Revenue', type: 'input', section: 'revenue' },
        { key: 'opening_stock', label: 'Opening Stock', type: 'input', section: 'costs' },
        { key: 'purchases', label: 'Purchases', type: 'input', section: 'costs' },
        { key: 'closing_stock', label: 'Less: Closing Stock', type: 'input', section: 'costs' },
        { key: 'cost_of_sales', label: 'Cost of Sales', type: 'calculated', section: 'costs' },
        { key: 'gross_profit', label: 'Gross Profit', type: 'calculated', section: 'result' }
      ]
    case 'profit_loss':
      return [
        { key: 'gross_profit', label: 'Gross Profit (b/d)', type: 'input', section: 'revenue' },
        { key: 'total_expenses', label: 'Total Expenses', type: 'input', section: 'expenses' },
        { key: 'net_profit', label: 'Net Profit', type: 'calculated', section: 'result' }
      ]
    case 'balance_sheet':
      return [
        { key: 'current_assets', label: 'Current Assets', type: 'input', section: 'assets' },
        { key: 'fixed_assets', label: 'Fixed Assets', type: 'input', section: 'assets' },
        { key: 'total_assets', label: 'Total Assets', type: 'calculated', section: 'assets' },
        { key: 'current_liabilities', label: 'Current Liabilities', type: 'input', section: 'liabilities' },
        { key: 'long_term_liabilities', label: 'Long-term Liabilities', type: 'input', section: 'liabilities' },
        { key: 'capital', label: 'Capital', type: 'input', section: 'equity' }
      ]
    case 'cash_flow':
      return [
        { key: 'operating_activities', label: 'Cash from Operating Activities', type: 'input', section: 'operating' },
        { key: 'investing_activities', label: 'Cash from Investing Activities', type: 'input', section: 'investing' },
        { key: 'financing_activities', label: 'Cash from Financing Activities', type: 'input', section: 'financing' },
        { key: 'net_cash_flow', label: 'Net Cash Flow', type: 'calculated', section: 'result' }
      ]
    default:
      return []
  }
})

const groupedStructure = computed(() => {
  const groups: { [key: string]: any[] } = {}
  statementStructure.value.forEach(item => {
    if (!groups[item.section]) {
      groups[item.section] = []
    }
    groups[item.section].push(item)
  })
  return groups
})

const getSectionTitle = (section: string): string => {
  const titles: { [key: string]: string } = {
    revenue: 'Revenue',
    costs: 'Cost of Sales',
    expenses: 'Expenses', 
    result: 'Result',
    assets: 'Assets',
    liabilities: 'Liabilities',
    equity: 'Equity',
    operating: 'Operating Activities',
    investing: 'Investing Activities',
    financing: 'Financing Activities'
  }
  return titles[section] || section
}

const getSectionColor = (section: string): string => {
  const colors: { [key: string]: string } = {
    revenue: 'bg-green-50 border-green-200',
    costs: 'bg-red-50 border-red-200',
    expenses: 'bg-red-50 border-red-200',
    result: 'bg-blue-50 border-blue-200',
    assets: 'bg-purple-50 border-purple-200',
    liabilities: 'bg-orange-50 border-orange-200',
    equity: 'bg-indigo-50 border-indigo-200',
    operating: 'bg-green-50 border-green-200',
    investing: 'bg-yellow-50 border-yellow-200',
    financing: 'bg-blue-50 border-blue-200'
  }
  return colors[section] || 'bg-gray-50 border-gray-200'
}

const updateValue = (key: string, value: string | number) => {
  if (props.disabled || showFeedback.value) return
  statementData.value[key] = value
  calculateDerivedValues()
}

const hasRequiredItems = computed(() => {
  return props.question.requiredItems.every(item => 
    statementData.value[item] !== undefined && 
    statementData.value[item] !== '' &&
    statementData.value[item] !== 0
  )
})

const submitAnswer = () => {
  showFeedback.value = true
  
  const answer: FinancialStatementAnswer = {
    questionId: props.question.id,
    questionType: props.question.type,
    statementData: { ...statementData.value }
  }
  
  emit('answer', answer)
}

const nextQuestion = () => {
  emit('next')
}

// Initialize on mount
initializeStatement()

// Watch for disabled state to show results
watch(() => props.disabled, (disabled) => {
  if (disabled) {
    showFeedback.value = true
  }
})
</script>

<template>
  <div class="financial-statement-question">
    <!-- Question Header -->
    <div class="mb-6">
      <h3 class="text-lg lg:text-xl font-semibold text-gray-900 mb-4">{{ question.text }}</h3>
      
      <div class="p-4 bg-blue-50 rounded-lg mb-4">
        <h4 class="font-medium text-blue-900 mb-2">
          Prepare: {{ question.statementType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
        </h4>
        <p class="text-blue-800 text-sm">
          Use the provided account balances to complete the financial statement below.
        </p>
      </div>

      <!-- Hints -->
      <div v-if="question.hints && question.hints.length > 0" class="mb-4 p-3 lg:p-4 bg-yellow-50 rounded-lg">
        <div class="flex items-start gap-2">
          <font-awesome-icon :icon="['fas', 'lightbulb']" class="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p class="text-sm font-medium text-yellow-900 mb-1">Hints:</p>
            <ul class="text-sm text-yellow-800 space-y-1">
              <li v-for="hint in question.hints" :key="hint">• {{ hint }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Provided Data -->
    <div class="mb-6 p-4 lg:p-6 bg-gray-50 rounded-lg">
      <h4 class="font-medium text-gray-900 mb-4">Account Balances:</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <div
          v-for="account in question.providedData.accounts"
          :key="account.name"
          class="flex justify-between items-center p-3 bg-white rounded border"
        >
          <span class="font-medium text-gray-700">{{ account.name }}:</span>
          <span class="text-gray-900">${{ account.balance.toLocaleString() }}</span>
        </div>
      </div>

      <!-- Adjustments (if any) -->
      <div v-if="question.providedData.adjustments && question.providedData.adjustments.length > 0" class="mt-4">
        <h5 class="font-medium text-gray-900 mb-2">Adjustments:</h5>
        <div class="space-y-2">
          <div
            v-for="adjustment in question.providedData.adjustments"
            :key="adjustment.description"
            class="flex justify-between items-center p-2 bg-yellow-50 rounded border border-yellow-200 text-sm"
          >
            <span class="text-gray-700">{{ adjustment.description }}:</span>
            <span class="font-medium text-gray-900">${{ adjustment.amount.toLocaleString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Statement -->
    <div class="mb-6">
      <h4 class="text-lg font-semibold text-gray-900 mb-4">
        {{ question.statementType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
      </h4>
      
      <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div
          v-for="(items, section) in groupedStructure"
          :key="section"
          class="border-b border-gray-200 last:border-b-0"
        >
          <!-- Section Header -->
          <div :class="['px-4 py-3 font-medium text-gray-900', getSectionColor(section)]">
            {{ getSectionTitle(section) }}
          </div>
          
          <!-- Section Items -->
          <div class="p-4 space-y-3">
            <div
              v-for="item in items"
              :key="item.key"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <label class="font-medium text-gray-700 flex-1">
                {{ item.label }}:
                <span v-if="question.requiredItems.includes(item.key)" class="text-red-500 ml-1">*</span>
              </label>
              
              <div class="flex items-center gap-2">
                <span class="text-gray-600">$</span>
                <Input
                  v-if="item.type === 'input'"
                  :model-value="statementData[item.key] || ''"
                  @update:model-value="updateValue(item.key, $event)"
                  type="number"
                  step="0.01"
                  :disabled="disabled"
                  class="w-32 lg:w-40 text-right font-mono"
                  placeholder="0.00"
                />
                <div
                  v-else
                  class="w-32 lg:w-40 px-3 py-2 bg-gray-100 border border-gray-300 rounded text-right font-mono text-gray-900"
                >
                  {{ Number(statementData[item.key] || 0).toLocaleString() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Balance Check (for Balance Sheet) -->
    <div v-if="question.statementType === 'balance_sheet'" class="mb-6 p-4 rounded-lg border">
      <h5 class="font-medium text-gray-900 mb-2">Balance Check:</h5>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div class="flex justify-between">
          <span>Total Assets:</span>
          <span class="font-mono">${{ Number(statementData.total_assets || 0).toLocaleString() }}</span>
        </div>
        <div class="flex justify-between">
          <span>Liabilities + Capital:</span>
          <span class="font-mono">
            ${{ (Number(statementData.current_liabilities || 0) + 
                 Number(statementData.long_term_liabilities || 0) + 
                 Number(statementData.capital || 0)).toLocaleString() }}
          </span>
        </div>
      </div>
      <div 
        class="mt-2 text-center font-medium"
        :class="Number(statementData.total_assets || 0) === 
                (Number(statementData.current_liabilities || 0) + 
                 Number(statementData.long_term_liabilities || 0) + 
                 Number(statementData.capital || 0))
                ? 'text-green-600' : 'text-red-600'"
      >
        {{ Number(statementData.total_assets || 0) === 
           (Number(statementData.current_liabilities || 0) + 
            Number(statementData.long_term_liabilities || 0) + 
            Number(statementData.capital || 0))
           ? '✓ Balanced' : '✗ Not Balanced' }}
      </div>
    </div>

    <!-- Feedback -->
    <div v-if="showFeedback" class="mb-6 p-4 lg:p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h4 class="font-semibold text-blue-900 mb-3">Statement Submitted</h4>
      <p class="text-blue-800 text-sm">
        Your {{ question.statementType.replace('_', ' ') }} has been recorded. 
        Detailed feedback will be provided after the quiz is completed.
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-col sm:flex-row gap-3 justify-end">
      <Button
        v-if="!showFeedback"
        variant="primary"
        :disabled="!hasRequiredItems || disabled"
        @click="submitAnswer"
        class="w-full sm:w-auto"
      >
        <font-awesome-icon :icon="['fas', 'file-invoice']" class="mr-2" />
        Submit Statement
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
/* Ensure consistent table-like layout */
.financial-statement-question input {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

/* Mobile responsiveness */
@media (max-width: 640px) {
  .financial-statement-question .grid {
    grid-template-columns: 1fr;
  }
  
  .financial-statement-question input {
    width: 100%;
    max-width: 150px;
  }
}

/* Smooth transitions */
.financial-statement-question input {
  transition: all 0.2s ease-in-out;
}

.financial-statement-question input:focus {
  transform: scale(1.02);
}
</style> 