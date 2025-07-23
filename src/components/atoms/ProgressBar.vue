<script setup lang="ts">
interface Props {
  value: number
  color?: 'blue' | 'green' | 'yellow' | 'red'
  size?: 'sm' | 'md'
  showLabel?: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  size: 'md',
  showLabel: true,
  label: 'Progress'
})

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500'
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2'
}

const roundedValue = Math.round(props.value)
</script>

<template>
  <div>
    <div v-if="showLabel" class="flex justify-between text-sm text-gray-600 mb-1">
      <span>{{ label }}</span>
      <span>{{ roundedValue }}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full" :class="sizeClasses[size]">
      <div
        class="rounded-full transition-all duration-300"
        :class="[colorClasses[color], sizeClasses[size]]"
        :style="{ width: `${roundedValue}%` }"
      ></div>
    </div>
  </div>
</template> 