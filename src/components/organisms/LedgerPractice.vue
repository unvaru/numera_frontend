<script setup lang="ts">
import { ref, computed } from 'vue'
import Input from '../atoms/Input.vue'
import Button from '../atoms/Button.vue'

interface LedgerEntry {
  id: number
  date: string
  account: string
  debit: number | null
  credit: number | null
}

const entries = ref<LedgerEntry[]>([
  {
    id: 1,
    date: '',
    account: '',
    debit: null,
    credit: null
  }
])

const currentScenario = {
  title: 'Record Business Transactions',
  description: 'A business made the following transactions. Record them in the ledger.',
  transactions: [
    'Received $5,000 cash from owner as capital',
    'Purchased office equipment for $2,000 cash',
    'Received $3,000 from customers for services rendered'
  ]
}

const newEntry = ref({
  date: '',
  account: '',
  debit: null as number | null,
  credit: null as number | null
})

const accounts = [
  'Cash',
  'Capital',
  'Equipment',
  'Service Revenue',
  'Accounts Receivable',
  'Accounts Payable',
  'Expenses'
]

const isBalanced = computed(() => {
  const totalDebits = entries.value.reduce((sum, entry) => sum + (entry.debit || 0), 0)
  const totalCredits = entries.value.reduce((sum, entry) => sum + (entry.credit || 0), 0)
  return totalDebits === totalCredits
})

const totals = computed(() => {
  return {
    debits: entries.value.reduce((sum, entry) => sum + (entry.debit || 0), 0),
    credits: entries.value.reduce((sum, entry) => sum + (entry.credit || 0), 0)
  }
})

function addEntry() {
  if (newEntry.value.account && (newEntry.value.debit || newEntry.value.credit)) {
    entries.value.push({
      id: entries.value.length + 1,
      ...newEntry.value
    })
    newEntry.value = {
      date: '',
      account: '',
      debit: null,
      credit: null
    }
  }
}

function removeEntry(id: number) {
  entries.value = entries.value.filter(entry => entry.id !== id)
}

function validateEntry() {
  // Add validation logic here
  return true
}
</script>

<template>
  <div class="space-y-8">
    <!-- Scenario -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-bold text-gray-900">{{ currentScenario.title }}</h2>
      <p class="mt-2 text-gray-600">{{ currentScenario.description }}</p>
      
      <div class="mt-4 space-y-2">
        <div
          v-for="(transaction, index) in currentScenario.transactions"
          :key="index"
          class="flex items-center text-sm text-gray-600"
        >
          <span class="material-icons-outlined text-gray-400 mr-2">assignment</span>
          {{ transaction }}
        </div>
      </div>
    </div>

    <!-- Ledger Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">General Journal</h3>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debit
                </th>
                <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Credit
                </th>
                <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="entry in entries" :key="entry.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ entry.date }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ entry.account }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ entry.debit?.toFixed(2) || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ entry.credit?.toFixed(2) || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    @click="removeEntry(entry.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>

              <!-- New Entry Form -->
              <tr class="bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <Input
                    v-model="newEntry.date"
                    type="text"
                    placeholder="YYYY-MM-DD"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    v-model="newEntry.account"
                    class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 rounded-lg"
                  >
                    <option value="">Select Account</option>
                    <option v-for="account in accounts" :key="account">
                      {{ account }}
                    </option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Input
                    :modelValue="newEntry.debit || ''"
                    @update:modelValue="val => newEntry.debit = val ? Number(val) : null"
                    type="number"
                    placeholder="0.00"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <Input
                    :modelValue="newEntry.credit || ''"
                    @update:modelValue="val => newEntry.credit = val ? Number(val) : null"
                    type="number"
                    placeholder="0.00"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <Button
                    variant="primary"
                    size="sm"
                    @click="addEntry"
                  >
                    Add Entry
                  </Button>
                </td>
              </tr>

              <!-- Totals -->
              <tr class="bg-gray-100 font-medium">
                <td colspan="2" class="px-6 py-4 text-right">
                  Totals
                </td>
                <td class="px-6 py-4 text-right">
                  {{ totals.debits.toFixed(2) }}
                </td>
                <td class="px-6 py-4 text-right">
                  {{ totals.credits.toFixed(2) }}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Balance Status -->
        <div class="mt-4 flex items-center" :class="isBalanced ? 'text-green-600' : 'text-red-600'">
          <span class="material-icons-outlined mr-2">
            {{ isBalanced ? 'check_circle' : 'error' }}
          </span>
          {{ isBalanced ? 'Entries are balanced' : 'Entries are not balanced' }}
        </div>

        <!-- Actions -->
        <div class="mt-6 flex justify-end space-x-4">
          <Button variant="outline" @click="entries = [{ id: 1, date: '', account: '', debit: null, credit: null }]">
            Clear All
          </Button>
          <Button
            variant="primary"
            :disabled="!isBalanced"
            @click="validateEntry"
          >
            Submit Entries
          </Button>
        </div>
      </div>
    </div>

    <!-- T-Accounts View (Optional) -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">T-Accounts View</h3>
      <p class="text-sm text-gray-500">
        Coming soon: Visual representation of T-accounts for better understanding.
      </p>
    </div>
  </div>
</template> 