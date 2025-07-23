// Question Types for Numera Accounting Platform
// Based on Cambridge O-Level Accounting Requirements

export enum QuestionType {
  MCQ = 'mcq',
  FILL_IN_BLANK = 'fill_in_blank',
  STRUCTURED = 'structured',
  LEDGER_ENTRY = 'ledger_entry',
  SCENARIO = 'scenario',
  FINANCIAL_STATEMENT = 'financial_statement',
  NUMERICAL = 'numerical',
  TRUE_FALSE = 'true_false'
}

export enum DifficultyLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

// Base Question Interface
export interface BaseQuestion {
  id: string
  type: QuestionType
  text: string
  points: number
  difficulty: DifficultyLevel
  explanation?: string
  hints?: string[]
  imageUrl?: string
  tags?: string[]
}

// MCQ Question (Already implemented but enhanced)
export interface MCQQuestion extends BaseQuestion {
  type: QuestionType.MCQ
  options: {
    id: string
    text: string
    isCorrect: boolean
  }[]
  allowMultipleAnswers?: boolean
}

// Fill-in-the-blank Questions
export interface FillInBlankQuestion extends BaseQuestion {
  type: QuestionType.FILL_IN_BLANK
  template: string // Text with placeholders like "The accounting equation is {0} = {1} + {2}"
  blanks: {
    id: number
    acceptedAnswers: string[] // Multiple acceptable answers
    caseSensitive?: boolean
    isNumerical?: boolean
    tolerance?: number // For numerical answers
  }[]
}

// Structured Questions (Multi-part)
export interface StructuredQuestion extends BaseQuestion {
  type: QuestionType.STRUCTURED
  parts: {
    id: string
    partNumber: string // e.g., "(a)", "(b)", "(i)", "(ii)"
    text: string
    points: number
    subType: 'mcq' | 'numerical' | 'text' | 'calculation'
    data?: any // Specific data for each sub-type
  }[]
  totalPoints: number
}

// Ledger Entry Questions
export interface LedgerEntryQuestion extends BaseQuestion {
  type: QuestionType.LEDGER_ENTRY
  scenario: string
  transactions: {
    id: string
    description: string
    amount?: number
    date?: string
  }[]
  requiredEntries: {
    account: string
    debitAmount?: number
    creditAmount?: number
  }[]
  availableAccounts: string[]
}

// Scenario-based Problems
export interface ScenarioQuestion extends BaseQuestion {
  type: QuestionType.SCENARIO
  scenario: string
  tasks: {
    id: string
    description: string
    type: 'journal_entries' | 'trial_balance' | 'financial_statements' | 'calculations'
    data?: any
  }[]
  providedData?: {
    accounts?: { name: string; balance: number; type: string }[]
    transactions?: any[]
    ratios?: any[]
  }
}

// Financial Statement Questions
export interface FinancialStatementQuestion extends BaseQuestion {
  type: QuestionType.FINANCIAL_STATEMENT
  statementType: 'trading_account' | 'profit_loss' | 'balance_sheet' | 'cash_flow'
  providedData: {
    accounts: { name: string; balance: number; type: string }[]
    adjustments?: { description: string; amount: number }[]
  }
  requiredItems: string[] // Items that must be included
}

// Numerical Questions (Calculations)
export interface NumericalQuestion extends BaseQuestion {
  type: QuestionType.NUMERICAL
  calculation: string // Description of what to calculate
  providedData: { [key: string]: number | string }
  correctAnswer: number
  tolerance: number // Acceptable range (e.g., ±0.01)
  unit?: string // e.g., "$", "%", "units"
  showWorkingRequired?: boolean
}

// True/False Questions
export interface TrueFalseQuestion extends BaseQuestion {
  type: QuestionType.TRUE_FALSE
  statement: string
  correctAnswer: boolean
  justificationRequired?: boolean
}

// Union type for all questions
export type Question = 
  | MCQQuestion 
  | FillInBlankQuestion 
  | StructuredQuestion 
  | LedgerEntryQuestion 
  | ScenarioQuestion 
  | FinancialStatementQuestion 
  | NumericalQuestion 
  | TrueFalseQuestion

// Answer Types
export interface BaseAnswer {
  questionId: string
  questionType: QuestionType
  timeSpent?: number
}

export interface MCQAnswer extends BaseAnswer {
  questionType: QuestionType.MCQ
  selectedOptions: string[]
}

export interface FillInBlankAnswer extends BaseAnswer {
  questionType: QuestionType.FILL_IN_BLANK
  answers: { blankId: number; value: string }[]
}

export interface StructuredAnswer extends BaseAnswer {
  questionType: QuestionType.STRUCTURED
  partAnswers: { partId: string; answer: any }[]
}

export interface LedgerEntryAnswer extends BaseAnswer {
  questionType: QuestionType.LEDGER_ENTRY
  entries: { account: string; debit?: number; credit?: number; date?: string }[]
}

export interface ScenarioAnswer extends BaseAnswer {
  questionType: QuestionType.SCENARIO
  taskAnswers: { taskId: string; answer: any }[]
}

export interface FinancialStatementAnswer extends BaseAnswer {
  questionType: QuestionType.FINANCIAL_STATEMENT
  statementData: { [key: string]: number | string }
}

export interface NumericalAnswer extends BaseAnswer {
  questionType: QuestionType.NUMERICAL
  answer: number
  workingShown?: string
}

export interface TrueFalseAnswer extends BaseAnswer {
  questionType: QuestionType.TRUE_FALSE
  answer: boolean
  justification?: string
}

export type Answer = 
  | MCQAnswer 
  | FillInBlankAnswer 
  | StructuredAnswer 
  | LedgerEntryAnswer 
  | ScenarioAnswer 
  | FinancialStatementAnswer 
  | NumericalAnswer 
  | TrueFalseAnswer

// Question Evaluation Results
export interface QuestionResult {
  questionId: string
  score: number
  maxScore: number
  isCorrect: boolean
  feedback: string[]
  partialScores?: { partId: string; score: number; maxScore: number }[]
}

// Quiz Interface
export interface Quiz {
  id: string
  title: string
  description: string
  timeLimit?: number // in minutes
  questions: Question[]
  passingScore?: number
  allowReview?: boolean
  shuffleQuestions?: boolean
  showResults?: 'immediate' | 'after_submission' | 'never'
}

// Quiz Attempt
export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  startTime: Date
  endTime?: Date
  answers: Answer[]
  score?: number
  maxScore: number
  results?: QuestionResult[]
  isCompleted: boolean
} 