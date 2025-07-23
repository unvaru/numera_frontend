<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Button from '../../atoms/Button.vue'

interface Props {
  initialNotes?: string
  isMobile?: boolean
  isFloating?: boolean
}

interface Note {
  id: string
  content: string
  timestamp: number
  tags: string[]
  important: boolean
  color: string
}

interface ResizeState {
  x: number
  y: number
  width: number
  height: number
  left: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'save', notes: string): void
  (e: 'close'): void
}>()

const notes = ref('')
const notesEditor = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const isMinimized = ref(false)
const position = ref({ x: window.innerWidth - 420, y: 100 })
const size = ref({ width: 320, height: 400 })
const dragOffset = ref({ x: 0, y: 0 })
const resizeStart = ref<ResizeState>({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  left: 0
})
const notesContainer = ref<HTMLElement | null>(null)
const showFormatting = ref(false)
const selectedTags = ref<string[]>([])
const isImportant = ref(false)
type NoteColor = 'default' | 'yellow' | 'blue' | 'green' | 'purple'
const noteColor = ref<NoteColor>('default')
const wordCount = ref(0)

// Available tags for notes
const availableTags = [
  'Important',
  'Question',
  'Review',
  'Definition',
  'Example',
  'Formula'
]

// Color options for notes
const colorOptions: Record<NoteColor, string> = {
  default: 'bg-yellow-100',
  yellow: 'bg-yellow-100',
  blue: 'bg-yellow-100',
  green: 'bg-yellow-100',
  purple: 'bg-yellow-100'
}

// Format text functions
const formatText = (format: string) => {
  if (!notesEditor.value) return
  
  // Ensure the editor has focus
  notesEditor.value.focus()
  
  // Enable styleWithCSS for better formatting control
  document.execCommand('styleWithCSS', false, 'true')
  
  switch (format) {
    case 'bold':
      document.execCommand('bold', false)
      break
    case 'italic':
      document.execCommand('italic', false)
      break
    case 'bullet': {
      // If no text is selected, ensure we're on a new line
      const selection = window.getSelection()
      if (!selection?.toString().trim()) {
        document.execCommand('insertParagraph', false)
      }
      document.execCommand('insertUnorderedList', false)
      break
    }
    case 'number': {
      // If no text is selected, ensure we're on a new line
      const selection = window.getSelection()
      if (!selection?.toString().trim()) {
        document.execCommand('insertParagraph', false)
      }
      document.execCommand('insertOrderedList', false)
      break
    }
    case 'highlight':
      // Toggle highlight using background color
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return

      const range = selection.getRangeAt(0)
      if (!range.toString().trim()) return // Don't highlight empty selection

      // Check if already highlighted
      const parentSpan = range.commonAncestorContainer.parentElement
      if (parentSpan?.style.backgroundColor === 'rgb(254, 243, 199)') {
        // Remove highlight
        document.execCommand('backColor', false, 'transparent')
      } else {
        // Add highlight
        document.execCommand('backColor', false, '#fef3c7')
      }
      break
  }
  
  saveNotes()
}

// Helper function to find parent element by tag name
const findParentByTag = (node: Node, tagName: string): HTMLElement | null => {
  let current: Node | null = node
  
  while (current && current !== notesEditor.value) {
    if (current.nodeName === tagName) {
      return current as HTMLElement
    }
    current = current.parentNode
  }
  
  return null
}

// Check if format is active
const isFormatActive = (format: string): boolean => {
  if (!notesEditor.value) return false
  
  switch (format) {
    case 'bullet':
      return document.queryCommandState('insertUnorderedList')
    case 'number':
      return document.queryCommandState('insertOrderedList')
    case 'bold':
      return document.queryCommandState('bold')
    case 'italic':
      return document.queryCommandState('italic')
    default:
      return false
  }
}

// Toggle tag
const toggleTag = (tag: string) => {
  const index = selectedTags.value.indexOf(tag)
  if (index === -1) {
    selectedTags.value.push(tag)
  } else {
    selectedTags.value.splice(index, 1)
  }
  saveNotes()
}

// Toggle important
const toggleImportant = () => {
  isImportant.value = !isImportant.value
  saveNotes()
}

// Change note color
const changeColor = (color: NoteColor) => {
  noteColor.value = color
  saveNotes()
}

// Count words
const updateWordCount = () => {
  if (!notesEditor.value) return
  const text = notesEditor.value.innerText || ''
  const words = text.trim().split(/\s+/)
  wordCount.value = words.length > 0 && words[0] !== '' ? words.length : 0
}

// Save notes with metadata
const saveNotes = () => {
  if (!notesEditor.value) return
  const noteData = {
    content: notesEditor.value.innerHTML,
    tags: selectedTags.value,
    important: isImportant.value,
    color: noteColor.value,
    timestamp: Date.now()
  }
  emit('save', JSON.stringify(noteData))
  updateWordCount()
}

// Load notes with metadata
onMounted(() => {
  try {
    if (props.initialNotes) {
      const noteData = JSON.parse(props.initialNotes)
      if (notesEditor.value) {
        notesEditor.value.innerHTML = noteData.content || ''
      }
      selectedTags.value = noteData.tags || []
      isImportant.value = noteData.important || false
      noteColor.value = noteData.color || 'default'
      updateWordCount()
    }
  } catch {
    if (notesEditor.value && props.initialNotes) {
      notesEditor.value.innerHTML = props.initialNotes
      updateWordCount()
    }
  }

  const savedPosition = localStorage.getItem('notesPosition')
  if (savedPosition) {
    position.value = JSON.parse(savedPosition)
  }
  
  adjustPosition()

  const savedSize = localStorage.getItem('notesSize')
  if (savedSize) {
    size.value = JSON.parse(savedSize)
  }
})

const startDrag = (e: MouseEvent) => {
  if (e.target instanceof HTMLTextAreaElement) return // Don't drag when clicking textarea
  
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return

  let newX = e.clientX - dragOffset.value.x
  let newY = e.clientY - dragOffset.value.y

  // Get container dimensions
  const container = notesContainer.value
  if (!container) return

  const rect = container.getBoundingClientRect()
  const maxX = window.innerWidth - rect.width
  const maxY = window.innerHeight - rect.height

  // Constrain to viewport
  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))

  position.value = { x: newX, y: newY }
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  savePosition()
}

const adjustPosition = () => {
  if (!notesContainer.value) return

  const rect = notesContainer.value.getBoundingClientRect()
  const maxX = window.innerWidth - rect.width
  const maxY = window.innerHeight - rect.height

  position.value = {
    x: Math.max(0, Math.min(position.value.x, maxX)),
    y: Math.max(0, Math.min(position.value.y, maxY))
  }
}

// Handle window resize
const onWindowResize = () => {
  adjustPosition()
  savePosition()
}

onMounted(() => {
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
})

// Resize handlers
const startResize = (e: MouseEvent, direction: 'se' | 'sw' | 'e' | 's') => {
  if (!notesContainer.value || isMinimized.value) return
  
  e.preventDefault()
  isResizing.value = true
  
  const rect = notesContainer.value.getBoundingClientRect()
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: rect.width,
    height: rect.height,
    left: rect.left // Store initial left position for sw resize
  }
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.userSelect = 'none'
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value || !notesContainer.value) return
  
  e.preventDefault()
  const deltaX = e.clientX - resizeStart.value.x
  const deltaY = e.clientY - resizeStart.value.y
  
  // Calculate new size with minimum constraints only
  let newWidth = resizeStart.value.width
  let newX = position.value.x
  
  // Handle horizontal resizing based on direction
  if (e.target instanceof Element) {
    if (e.target.classList.contains('resize-handle-se')) {
      newWidth = Math.max(280, resizeStart.value.width + deltaX)
    } else if (e.target.classList.contains('resize-handle-sw')) {
      newWidth = Math.max(280, resizeStart.value.width - deltaX)
      newX = resizeStart.value.left + deltaX
    }
  }
  
  const newHeight = Math.max(200, resizeStart.value.height + deltaY)
  
  // Update size without maximum constraints
  size.value = {
    width: newWidth,
    height: newHeight
  }
  
  // Update position for sw resize
  if (e.target instanceof Element && e.target.classList.contains('resize-handle-sw')) {
    position.value = {
      x: Math.max(0, newX), // Only constrain to prevent moving off-screen
      y: position.value.y
    }
  }
  
  // Save the new size
  localStorage.setItem('notesSize', JSON.stringify(size.value))
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.userSelect = ''
  
  // Save the new size
  localStorage.setItem('notesSize', JSON.stringify(size.value))
}

// Load saved size on mount
onMounted(() => {
  const savedSize = localStorage.getItem('notesSize')
  if (savedSize) {
    size.value = JSON.parse(savedSize)
  }
  
  // ... existing onMounted code ...
})

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
  // Save minimized state
  localStorage.setItem('notesMinimized', isMinimized.value.toString())
}

// Save position to localStorage
const savePosition = () => {
  localStorage.setItem('notesPosition', JSON.stringify(position.value))
}
</script>

<template>
  <!-- Main Notes Component -->
  <div
    v-if="!isMobile"
    ref="notesContainer"
    :class="[
      'flex flex-col shadow-xl rounded-[12px] border border-yellow-200 sticky-note-effect natural-note',
      isDragging ? 'cursor-grabbing' : '',
      isResizing ? 'resizing' : '',
      isFloating ? 'fixed note-layer' : '',
      isMinimized ? 'minimized' : '',
      colorOptions[noteColor]
    ]"
    :style="isFloating ? {
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: isMinimized ? '180px' : `${size.width}px`,
      height: isMinimized ? 'auto' : `${size.height}px`,
      minHeight: isMinimized ? 'auto' : '200px',
      minWidth: isMinimized ? '180px' : '280px'
    } : {}"
    @mousedown.stop="isFloating && startDrag($event)"
  >
    <!-- Header -->
    <div 
      :class="[
        'flex items-center justify-between sticky top-0 z-10 flex-shrink-0 bg-yellow-200/80 border-b border-yellow-200 rounded-t-[12px] note-header-layer',
        isFloating ? 'cursor-grab' : '',
        isMinimized ? 'p-2' : 'p-3'
      ]"
      @mousedown.stop="isFloating && startDrag($event)"
    >
      <div class="flex items-center gap-2 min-w-0 " :class="{ 'flex-1': isMinimized }">
        <h3 
          class="font-notes text-indigo-900 select-none min-w-0"
          :class="{ 'text-lg': !isMinimized, 'text-sm': isMinimized }"
        >
          <span v-if="!isMinimized">Notes</span>
          <span 
            v-else 
            class="block truncate"
            :title="notes || 'My Notes'"
          >
            {{ notes || 'My Notes' }}
          </span>
        </h3>
      </div>
      <div class="flex items-center gap-1 flex-shrink-0">
        <Button
          v-if="isFloating && !isMinimized"
          variant="outline"
          size="sm"
          class="note-button-layer text-indigo-600 border-indigo-200"
          @click.stop="showFormatting = !showFormatting"
        >
          <font-awesome-icon :icon="['fas', 'palette']" />
        </Button>
        <Button
          v-if="isFloating"
          variant="outline"
          size="sm"
          class="note-button-layer text-indigo-600 border-indigo-200 relative"
          :class="{ 'p-1': isMinimized }"
          @click.stop="toggleMinimize"
        >
          <font-awesome-icon 
            :icon="['fas', isMinimized ? 'window-maximize' : 'window-minimize']" 
            :class="{ 'text-sm': isMinimized }"
          />
          <span v-if="!isMinimized" class="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Minimize</span>
          <span v-else class="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Expand</span>
        </Button>
        <Button
          v-if="isFloating && !isMinimized"
          variant="outline"
          size="sm"
          class="note-button-layer text-indigo-600 border-indigo-200"
          @click.stop="emit('close')"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
        </Button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div 
      v-if="!isMinimized"
      class="flex flex-col flex-1 min-h-0 overflow-hidden"
    >
      <!-- Editor Container -->
      <div class="flex-1 flex flex-col min-h-0 p-3">
        <div
          ref="notesEditor"
          contenteditable="true"
          :class="[
            'flex-1 min-h-0 w-full bg-white/50',
            'focus:ring-2 focus:ring-indigo-400 focus:outline-none',
            'border border-indigo-200 rounded-lg p-3',
            'font-notes text-indigo-900 leading-relaxed rich-text-editor',
            'placeholder-indigo-400',
            isMobile ? 'text-base' : 'text-lg'
          ]"
          @input="updateWordCount"
          @blur="saveNotes"
          @mousedown.stop
          data-placeholder="Write your notes here..."
        ></div>
      </div>

      <!-- Footer (Fixed) -->
      <div class="flex items-center justify-between mt-2 text-xs text-yellow-900 bg-yellow-200/80 py-2 border-t border-yellow-200 flex-shrink-0 rounded-b-[12px]">
        <div class="flex items-center gap-2">
          <!-- Formatting Bar -->
          <div 
            v-if="showFormatting"
            class="border-0 bg-transparent p-0 flex flex-wrap gap-1 flex-shrink-0"
          >
            <Button
              v-for="format in ['bold', 'italic', 'bullet', 'number', 'highlight']"
              :key="format"
              variant="outline"
              size="sm"
              class="hover:bg-indigo-50/50 text-indigo-600 border-indigo-200"
              :class="{
                'bg-indigo-100': isFormatActive(format)
              }"
              @click.stop="formatText(format)"
              @mousedown.prevent
            >
              <font-awesome-icon :icon="['fas', 
                format === 'bold' ? 'bold' :
                format === 'italic' ? 'italic' :
                format === 'bullet' ? 'list-ul' :
                format === 'number' ? 'list-ol' :
                'highlighter'
              ]" />
            </Button>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          class="hover:bg-indigo-100/50 border-indigo-200 text-indigo-600"
          @click.stop="saveNotes"
        >
          <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
          <!-- Save -->
        </Button>
      </div>
    </div>

    <!-- Resize handles -->
    <!-- Bottom-right corner -->
    <div 
      v-if="!isMinimized"
      class="absolute -bottom-2 -right-2 w-8 h-8 cursor-se-resize resize-handle-se z-[120]"
      @mousedown.stop.prevent="startResize($event, 'se')"
    >
      <div class="absolute right-2 bottom-2 w-4 h-4 border-r-2 border-b-2 border-indigo-400/70"></div>
    </div>
    
    <!-- Bottom-left corner -->
    <div 
      v-if="!isMinimized"
      class="absolute -bottom-2 -left-2 w-8 h-8 cursor-sw-resize resize-handle-sw z-[120]"
      @mousedown.stop.prevent="startResize($event, 'sw')"
    >
      <div class="absolute left-2 bottom-2 w-4 h-4 border-l-2 border-b-2 border-indigo-400/70"></div>
    </div>
    
    <!-- Bottom edge -->
    <div 
      v-if="!isMinimized"
      class="absolute -bottom-2 h-6 cursor-s-resize resize-handle-s z-[120]"
      style="left: 20px; right: 20px;"
      @mousedown.stop.prevent="startResize($event, 's')"
    >
      <div class="absolute left-0 right-0 bottom-2 h-1 bg-indigo-400/20 rounded hover:bg-indigo-400/40 transition-colors"></div>
    </div>
    
    <!-- Right edge -->
    <div 
      v-if="!isMinimized"
      class="absolute -right-2 w-6 cursor-e-resize resize-handle-e z-[120]"
      style="top: 20px; bottom: 20px;"
      @mousedown.stop.prevent="startResize($event, 'e')"
    >
      <div class="absolute top-0 bottom-0 right-2 w-1 bg-indigo-400/20 rounded hover:bg-indigo-400/40 transition-colors"></div>
    </div>
  </div>

  <!-- Mobile Version -->
  <div
    v-else
    class="note-mobile-layer bg-yellow-100 border border-yellow-200 rounded-[14px] shadow-xl p-4 mt-2"
  >
    <h3 class="font-notes text-yellow-900 mb-3 flex items-center gap-2 text-lg">
      <font-awesome-icon :icon="['fas', 'thumbtack']" class="text-yellow-500 rotate-45" />
      My Notes
    </h3>
    <textarea
      v-model="notes"
      class="w-full h-24 text-base p-3 resize-none bg-transparent focus:ring-0 focus:outline-none border-none font-notes text-gray-800 leading-relaxed placeholder-gray-400"
      placeholder="Write your notes here..."
      @blur="saveNotes"
    ></textarea>
    <div class="flex justify-end mt-2">
      <Button
        variant="outline"
        size="sm"
        class="bg-yellow-50/50 hover:bg-yellow-100/50 border-yellow-200/50"
        @click="saveNotes"
      >
        <font-awesome-icon :icon="['fas', 'save']" class="mr-2" />
        <!-- Save -->
      </Button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');

.font-notes {
  font-family: 'Patrick Hand', cursive;
}

/* Base styles */
.sticky-note {
  background: rgba(238, 242, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(79, 70, 229, 0.1);
  overflow: hidden;
}

.sticky-note::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    to bottom right,
    rgba(0,0,0,0.05),
    transparent 50%,
    rgba(0,0,0,0.05)
  );
  pointer-events: none;
  border-radius: 2px;
}

.sticky-note::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: 
    radial-gradient(
      circle at top left,
      rgba(0,0,0,0.05),
      transparent 50px
    ),
    radial-gradient(
      circle at bottom right,
      rgba(0,0,0,0.05),
      transparent 50px
    );
  pointer-events: none;
  border-radius: 2px;
}

/* Dragging state - remove transitions for smooth dragging */
.dragging {
  transition: none !important;
  box-shadow: 
    0 2px 8px rgba(0,0,0,0.15),
    0 15px 40px rgba(0,0,0,0.1);
}

.dragging * {
  cursor: grabbing !important;
  user-select: none !important;
}

.dragging textarea {
  pointer-events: none;
}

.sticky-note-mobile {
  background: #fff9c4;
  padding: 1rem;
  border-radius: 2px;
  box-shadow: 
    0 1px 4px rgba(0,0,0,0.1),
    0 5px 15px rgba(0,0,0,0.05);
  background-image: 
    repeating-linear-gradient(
      transparent,
      transparent 31px,
      #ece9b5 31px,
      #ece9b5 32px
    );
}

/* Custom scrollbar for notes textarea */
textarea {
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.2) transparent;
}

textarea::-webkit-scrollbar {
  width: 4px;
}

textarea::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.2);
  border-radius: 2px;
}

textarea::-webkit-scrollbar-thumb:hover {
  background: rgba(0,0,0,0.3);
}

/* Prevent text selection while dragging */
.cursor-grab, .cursor-grabbing {
  user-select: none;
}

/* Scale transition */
.scale-102 {
  transform: scale(1.02) rotate(1deg);
}

/* Shadow transitions */
.shadow-2xl {
  box-shadow: 
    0 2px 8px rgba(0,0,0,0.15),
    0 15px 40px rgba(0,0,0,0.1);
}

/* Ensure the note stays above other content */
.z-50 {
  z-index: 50;
}

/* Z-index layers */
.note-layer {
  z-index: 110; /* Above the portal container */
  position: fixed;
  user-select: none;
  touch-action: none;
  will-change: transform;
  -webkit-user-drag: none;
  pointer-events: auto !important;
}

.note-header-layer {
  z-index: 111; /* Above note container */
  user-select: none;
  cursor: grab;
  pointer-events: auto !important;
}

.note-button-layer {
  z-index: 112; /* Above header */
  position: relative;
  pointer-events: auto !important;
}

.note-content-layer {
  z-index: 110; /* Same as container */
  position: relative;
  pointer-events: auto !important;
}

.note-mobile-layer {
  z-index: 85; /* Match mobile panel in LessonDetail */
}

.sticky-note {
  isolation: isolate;
  position: absolute;
  pointer-events: auto !important;
  touch-action: none;
  will-change: transform;
  -webkit-user-drag: none;
}

/* Minimized state */
.minimized {
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.1);
  background: rgba(238, 242, 255, 0.95);
  backdrop-filter: blur(8px);
  overflow: hidden;
}

.minimized:hover {
  box-shadow: 
    0 2px 4px rgba(79, 70, 229, 0.1),
    0 6px 16px rgba(79, 70, 229, 0.05);
  background: rgba(238, 242, 255, 0.98);
}

/* Sticky note base */
.sticky-note {
  background: rgba(238, 242, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(79, 70, 229, 0.1);
  transition: transform 0.2s ease-out;
  overflow: hidden;
}

/* Dragging state */
.dragging {
  transition: none !important;
  box-shadow: 
    0 2px 8px rgba(79, 70, 229, 0.15),
    0 15px 40px rgba(79, 70, 229, 0.1);
  cursor: grabbing !important;
}

/* Header buttons */
.note-button {
  transition: background-color 0.2s ease-out;
}

.note-button:hover {
  transform: none !important;
}

/* Minimize/maximize transition */
.minimized {
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.1);
  background: rgba(238, 242, 255, 0.95);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease-out;
}

.minimized:hover {
  box-shadow: 
    0 2px 4px rgba(79, 70, 229, 0.1),
    0 6px 16px rgba(79, 70, 229, 0.05);
  background: rgba(238, 242, 255, 0.98);
  transform: none !important;
}

/* Remove hover scale effect */
.hover\:scale-102:hover {
  transform: none !important;
}

/* Ensure content transitions smoothly */
.note-content-layer {
  transition: all 0.15s ease-out;
}

/* Prevent text from wrapping in minimized state */
.minimized h3 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Rich text formatting */
textarea {
  font-family: 'Patrick Hand', system-ui, -apple-system, sans-serif;
  white-space: pre-wrap;
}

/* Markdown-style formatting */
.note-content-layer textarea {
  white-space: pre-wrap;
}

/* Rich text editor styles */
.rich-text-editor {
  line-height: 1.6;
}

.rich-text-editor ul,
.rich-text-editor ol {
  padding-left: 2rem !important;
  margin: 0.5rem 0 !important;
}

.rich-text-editor ul {
  list-style: disc outside !important;
}

.rich-text-editor ol {
  list-style: decimal outside !important;
}

.rich-text-editor li {
  padding-left: 0.5rem;
  margin: 0.25rem 0;
}

.rich-text-editor li:first-child {
  margin-top: 0;
}

.rich-text-editor li:last-child {
  margin-bottom: 0;
}

/* Ensure list markers are visible */
.rich-text-editor ul > li::marker {
  color: #4B5563;
  font-size: 1.2em;
}

.rich-text-editor ol > li::marker {
  color: #4B5563;
}

/* Fix list spacing */
.rich-text-editor ul + p,
.rich-text-editor ol + p {
  margin-top: 1rem;
}

.rich-text-editor p + ul,
.rich-text-editor p + ol {
  margin-top: 1rem;
}

/* Ensure proper list nesting */
.rich-text-editor ul ul,
.rich-text-editor ol ol,
.rich-text-editor ul ol,
.rich-text-editor ol ul {
  margin: 0.25rem 0 0.25rem 1rem !important;
}

/* Fix empty list items */
.rich-text-editor li:empty::after {
  content: '\200B'; /* Zero-width space to maintain height */
}

/* Fix list appearance in WebKit */
.rich-text-editor ul::-webkit-list-marker,
.rich-text-editor ol::-webkit-list-marker {
  color: #4B5563;
}

/* Rich text editor styles */
[contenteditable=true] {
  min-height: 10rem;
  max-height: 20rem;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

[contenteditable=true]:empty:before {
  content: attr(data-placeholder);
  color: #818cf8;
  opacity: 0.5;
  pointer-events: none;
}

[contenteditable=true]:focus {
  outline: none;
}

/* List styles */
[contenteditable=true] ul,
[contenteditable=true] ol {
  padding-left: 1.5rem !important;
  margin: 0.5rem 0 !important;
  list-style-position: outside !important;
}

[contenteditable=true] ul {
  list-style-type: disc !important;
}

[contenteditable=true] ol {
  list-style-type: decimal !important;
}

[contenteditable=true] li {
  margin: 0.25rem 0;
  display: list-item !important;
  min-height: 1.5em;
}

/* Ensure list markers are visible */
[contenteditable=true] ul > li::marker {
  content: "•" !important;
  color: #4B5563 !important; /* gray-600 */
}

[contenteditable=true] ol > li::marker {
  color: #4B5563 !important; /* gray-600 */
}

/* Fix list spacing */
[contenteditable=true] ul + p,
[contenteditable=true] ol + p {
  margin-top: 1rem !important;
}

[contenteditable=true] p + ul,
[contenteditable=true] p + ol {
  margin-top: 1rem !important;
}

/* Ensure proper list nesting */
[contenteditable=true] ul ul,
[contenteditable=true] ol ol,
[contenteditable=true] ul ol,
[contenteditable=true] ol ul {
  margin-top: 0.25rem !important;
  margin-bottom: 0.25rem !important;
}

/* Highlight styles */
[contenteditable=true] span[style*="background-color: rgb(254, 243, 199)"],
[contenteditable=true] font[style*="background-color: rgb(254, 243, 199)"] {
  background-color: #fef3c7 !important;
  border-radius: 2px;
  padding: 0 2px;
  margin: 0 -2px;
  display: inline;
  position: relative;
  cursor: text;
}

/* Selection color */
[contenteditable=true]::selection {
  background-color: rgba(99, 102, 241, 0.2);
}

/* Ensure proper text formatting */
[contenteditable=true] b,
[contenteditable=true] strong {
  font-weight: 600 !important;
}

[contenteditable=true] i,
[contenteditable=true] em {
  font-style: italic !important;
}

/* Fix list appearance in WebKit browsers */
[contenteditable=true] ul:not([class]),
[contenteditable=true] ol:not([class]) {
  margin-left: 1rem !important;
  padding-left: 1rem !important;
}

[contenteditable=true] li:not([class]) {
  list-style: inherit !important;
}

/* Ensure proper spacing between paragraphs */
[contenteditable=true] p {
  margin: 0.5rem 0;
}

/* Fix list behavior when empty */
[contenteditable=true] li:empty {
  min-height: 1.5em;
}

/* Prevent list style from disappearing */
[contenteditable=true] ul > li::marker {
  content: "•";
}

[contenteditable=true] ol > li::marker {
  content: counter(list-item) ".";
}

/* Resize styles */
.sticky-note {
  display: flex;
  flex-direction: column;
  resize: none; /* Disable default resize */
  transition: none; /* Remove transitions for smoother resizing */
  position: relative;
  overflow: visible !important;
}

.resizing {
  user-select: none !important;
  cursor: inherit !important;
}

.resizing * {
  pointer-events: none !important;
}

/* Resize handles */
.resize-handle-se,
.resize-handle-sw,
.resize-handle-s,
.resize-handle-e {
  position: absolute;
  background-color: transparent;
  opacity: 0;
  transition: opacity 0.2s;
}

.sticky-note:hover .resize-handle-se,
.sticky-note:hover .resize-handle-sw,
.sticky-note:hover .resize-handle-s,
.sticky-note:hover .resize-handle-e {
  opacity: 1;
}

/* Make resize areas larger for better touch targets */
.resize-handle-se,
.resize-handle-sw {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-handle-s {
  height: 12px;
}

.resize-handle-e {
  width: 12px;
}

/* Visual indicators for resize handles */
.resize-handle-se > div,
.resize-handle-sw > div {
  opacity: 0.7;
  transition: all 0.2s;
}

.resize-handle-s > div,
.resize-handle-e > div {
  opacity: 0.2;
  transition: all 0.2s;
}

.resize-handle-se:hover > div,
.resize-handle-sw:hover > div {
  opacity: 1;
  transform: scale(1.1);
}

.resize-handle-s:hover > div,
.resize-handle-e:hover > div {
  opacity: 0.4;
}

/* Ensure resize handles are above other content */
.resize-handle-se,
.resize-handle-sw,
.resize-handle-s,
.resize-handle-e {
  z-index: 120;
  pointer-events: auto !important;
}

/* Ensure content stays within bounds */
.note-content-layer {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Layout styles */
.sticky-note {
  display: flex;
  flex-direction: column;
  resize: none;
  transition: none;
}

/* Content area styles */
.note-content-layer {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

/* Rich text editor styles */
.rich-text-editor {
  min-height: 100px;
  height: 100%;
  overflow-y: auto;
  word-break: break-word;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Ensure footer stays at bottom */
.sticky-note:not(.minimized) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Flex layout */
.sticky-note {
  display: flex;
  flex-direction: column;
  resize: none;
  position: relative;
  overflow: visible !important;
  min-height: 0;
}

/* Content area */
.note-content-layer {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 auto;
}

/* Editor styles */
.rich-text-editor {
  flex: 1 1 auto;
  min-height: 100px;
  overflow-y: auto;
  word-break: break-word;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* Ensure proper flex behavior */
.flex-auto {
  flex: 1 1 auto !important;
  min-height: 0;
}

.flex-shrink-0 {
  flex-shrink: 0 !important;
}

/* Remove any height constraints */
[contenteditable=true] {
  height: 100% !important;
  max-height: none !important;
  min-height: 0 !important;
}

.sticky-note-effect {
  box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10), 0 1.5px 0 0 #fef08a;
  position: relative;
}
.sticky-note-effect::before {
  content: '';
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  height: 16px;
  background: repeating-linear-gradient(135deg, #fef08a 0 8px, #fde047 8px 16px);
  border-radius: 6px 6px 12px 12px;
  box-shadow: 0 2px 6px 0 rgba(0,0,0,0.08);
  z-index: 20;
  opacity: 0.7;
}

.natural-note {
  background: linear-gradient(135deg, #fdf6b2 0%, #fef9c3 100%);
  box-shadow:
    0 6px 32px 0 rgba(0,0,0,0.13),
    0 2px 0 0 #fef08a,
    0 1.5px 0 0 #fde047;
  position: relative;
  transform: rotate(-1.5deg);
  overflow: visible;
}
.natural-note::before {
  content: '';
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 56px;
  height: 20px;
  background: repeating-linear-gradient(135deg, #fef08a 0 10px, #fde047 10px 20px);
  border-radius: 8px 8px 18px 18px/12px 12px 18px 18px;
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  z-index: 20;
  opacity: 0.8;
  border-bottom: 2px dashed #facc15;
}
.natural-note::after {
  content: '';
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 1;
  opacity: 0.18;
  background-image: url('data:image/svg+xml;utf8,<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" fill="%23fffbe7"/><path d="M0 60 Q30 65 60 60 T120 60" stroke="%23fef08a" stroke-width="2" fill="none"/><path d="M0 90 Q30 95 60 90 T120 90" stroke="%23fde047" stroke-width="1.5" fill="none"/></svg>');
  background-size: 120px 120px;
  background-repeat: repeat;
  border-radius: 16px;
}

/* Slightly torn bottom edge */
.natural-note {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 95%,
    98% 98%, 95% 100%, 90% 98%, 85% 100%, 80% 98%, 75% 100%, 70% 98%, 65% 100%, 60% 98%, 55% 100%, 50% 98%, 45% 100%, 40% 98%, 35% 100%, 30% 98%, 25% 100%, 20% 98%, 15% 100%, 10% 98%, 5% 100%, 2% 98%, 0% 95%
  );
}
</style> 