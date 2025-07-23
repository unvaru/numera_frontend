# Question Components Testing Guide

## 📚 Overview

This guide provides comprehensive instructions for testing all question components in the Numera accounting learning platform.

## 🚀 Quick Start

### Option 1: Component Testing Page (Recommended)
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:5173/app/test-questions`
3. Use the sidebar to switch between different question types
4. Interact with each component to test functionality

### Option 2: Direct Component Testing
Import and test individual components in your own test files.

## 🎯 Question Types Available

### 1. **MCQ Question** (`MCQQuestion.vue`)
- **Purpose**: Multiple choice questions with single or multiple answers
- **Test Features**:
  - Single selection vs multiple selection modes
  - Visual feedback (correct/incorrect/missed)
  - Hints and explanations
  - Responsive design on mobile/desktop

**Sample Test Data**:
```javascript
{
  type: QuestionType.MCQ,
  text: 'Which of the following is the correct accounting equation?',
  options: [
    { id: 'A', text: 'Assets = Liabilities - Equity', isCorrect: false },
    { id: 'B', text: 'Assets = Liabilities + Equity', isCorrect: true }
    // ... more options
  ],
  allowMultipleAnswers: false
}
```

### 2. **Fill in Blank** (`FillInBlankQuestion.vue`)
- **Purpose**: Complete statements with missing words/numbers
- **Test Features**:
  - Multiple blanks in single question
  - Case-insensitive validation
  - Multiple accepted answers per blank
  - Real-time validation feedback

**Sample Test Data**:
```javascript
{
  type: QuestionType.FILL_IN_BLANK,
  template: 'In double-entry bookkeeping, every transaction affects at least {0} accounts.',
  blanks: [
    { id: 0, acceptedAnswers: ['two', '2', 'TWO'], caseSensitive: false }
  ]
}
```

### 3. **Numerical Question** (`NumericalQuestion.vue`)
- **Purpose**: Mathematical calculations with tolerance checking
- **Test Features**:
  - Number input validation
  - Tolerance-based answer checking
  - Working space for calculations
  - Unit support (currency, percentages, etc.)

**Sample Test Data**:
```javascript
{
  type: QuestionType.NUMERICAL,
  calculation: 'Gross Profit = Sales Revenue - Cost of Goods Sold',
  providedData: {
    'Sales Revenue': 250000,
    'Cost of Goods Sold': 150000
  },
  correctAnswer: 100000,
  tolerance: 500,
  unit: '$'
}
```

### 4. **True/False Question** (`TrueFalseQuestion.vue`)
- **Purpose**: Statement evaluation with optional justification
- **Test Features**:
  - True/False selection with radio buttons
  - Optional justification requirement
  - Statement highlighting
  - Responsive button layout

### 5. **Structured Question** (`StructuredQuestion.vue`)
- **Purpose**: Multi-part questions with different sub-types
- **Test Features**:
  - Part navigation (mobile/desktop)
  - Mixed question types within parts
  - Progress tracking across parts
  - Individual part validation

### 6. **Financial Statement** (`FinancialStatementQuestion.vue`)
- **Purpose**: Prepare accounting statements (Trading Account, P&L, Balance Sheet)
- **Test Features**:
  - Auto-calculation of derived values
  - Balance checking for Balance Sheets
  - Account grouping by statement sections
  - Responsive table layouts

### 7. **Scenario Question** (`ScenarioQuestion.vue`)
- **Purpose**: Complex real-world accounting problems
- **Test Features**:
  - Multiple task types (journal entries, trial balance, calculations)
  - Tab-based task navigation
  - Business scenario context
  - Progress tracking across tasks

## 🧪 Testing Procedures

### Manual Testing Checklist

#### For Each Component:
- [ ] **Responsiveness**: Test on mobile (< 768px), tablet (768px-1024px), and desktop (> 1024px)
- [ ] **Touch Targets**: Ensure buttons are ≥ 44px on mobile
- [ ] **Input Validation**: Test valid and invalid inputs
- [ ] **Visual Feedback**: Verify correct/incorrect state styling
- [ ] **Accessibility**: Test keyboard navigation and screen reader compatibility

#### Component-Specific Tests:

**MCQ Questions**:
- [ ] Single vs multiple selection modes
- [ ] Option selection/deselection
- [ ] Feedback display after submission
- [ ] Hint visibility toggle

**Fill in Blank**:
- [ ] Multiple blank completion
- [ ] Case sensitivity handling
- [ ] Alternative answer acceptance
- [ ] Template parsing accuracy

**Numerical**:
- [ ] Number input validation
- [ ] Tolerance checking (submit answers within and outside tolerance)
- [ ] Unit display and formatting
- [ ] Working space functionality

**True/False**:
- [ ] Statement reading comprehension
- [ ] Justification requirement enforcement
- [ ] Answer state visualization
- [ ] Mobile button layout

**Structured**:
- [ ] Part navigation (previous/next)
- [ ] Mixed sub-question types
- [ ] Progress bar accuracy
- [ ] Answer persistence across parts

**Financial Statement**:
- [ ] Auto-calculation accuracy
- [ ] Balance verification (for Balance Sheets)
- [ ] Section grouping and styling
- [ ] Data entry validation

**Scenario**:
- [ ] Task switching and navigation
- [ ] Journal entry addition/removal
- [ ] Trial balance input validation
- [ ] Task completion tracking

## 🔧 Development Testing

### Browser Console Testing
All components log their answers to the console. Open developer tools and check:
```javascript
// Console output example
{
  questionId: 'mcq-1',
  questionType: 'mcq',
  selectedOptions: ['B'],
  timestamp: '2023-12-07T10:30:00.000Z'
}
```

### Export Test Results
Use the "Export Results" button on the test page to download a JSON file with all test interactions:
```json
[
  {
    "questionId": "mcq-1",
    "questionType": "mcq",
    "answer": { "selectedOptions": ["B"] },
    "timestamp": "2023-12-07T10:30:00.000Z"
  }
]
```

### Component Props Testing
Test different prop combinations:
```vue
<MCQQuestion
  :question="testQuestion"
  :disabled="false"
  :show-result="false"
  @answer="handleAnswer"
  @next="handleNext"
/>
```

## 📱 Mobile Testing Guidelines

### Essential Mobile Tests:
1. **Navigation**: Swipe/scroll navigation works smoothly
2. **Touch Targets**: All interactive elements are easily tappable
3. **Text Readability**: Font sizes scale appropriately
4. **Input Fields**: Virtual keyboard doesn't obscure content
5. **Layout**: No horizontal scrolling required
6. **Performance**: Smooth animations and transitions

### Responsive Breakpoints:
- **Mobile**: < 640px (sm)
- **Tablet**: 768px - 1024px (md/lg)
- **Desktop**: > 1024px (xl)

## 🐛 Common Issues to Test

### Input Validation:
- Empty submissions
- Invalid number formats
- Special characters in text fields
- Extremely long text inputs

### State Management:
- Answer persistence when navigating between questions
- Component resets after submission
- Disabled state behavior

### Performance:
- Large question sets (20+ options)
- Complex financial statements
- Multiple scenario tasks

## 📊 Test Data Variations

The test page includes realistic accounting scenarios:
- **Basic Level**: Fundamental concepts, simple calculations
- **Intermediate Level**: Application problems, multi-step processes  
- **Advanced Level**: Complex scenarios, integrated problems

## 🎯 Success Criteria

A component passes testing when:
- ✅ All user interactions work as expected
- ✅ Visual feedback is clear and immediate
- ✅ Mobile responsiveness is seamless
- ✅ Answer data is captured correctly
- ✅ Accessibility standards are met
- ✅ Performance is smooth across devices

## 🚀 Production Readiness

Before deploying:
1. Remove the "Test Questions" link from navigation
2. Delete or secure the test route
3. Verify all console.log statements are removed
4. Test with real question data from your backend
5. Validate all TypeScript interfaces match your API

---

**Happy Testing! 🎉**

For questions or issues, refer to the component source files in `/src/components/molecules/questions/` 