import type { ContentBlock } from '@/services/ContentService'
import basicAccountingImg from '@/assets/images/basicAccounting.jpg'

export interface MockLesson {
  id: string
  title: string
  description: string
  blocks: ContentBlock[]
  learningObjectives: string[]
  keyPoints: string[]
  metadata: {
    author: string
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
    duration: string
    image: string
    lastUpdated: string
    prerequisites: string[]
    tags: string[]
  }
}

export const mockLessons: Record<string, MockLesson> = {
  '1': {
    id: '1',
    title: 'Introduction to Accounting',
    description: 'Learn the fundamentals of accounting and its importance in business.',
    learningObjectives: [
      'Understand the basic definition and purpose of accounting',
      'Learn the fundamental accounting equation (Assets = Liabilities + Owner\'s Equity)',
      'Identify the different types of accounting and their purposes',
      'Recognize the normal balance for different account types',
      'Apply basic accounting principles to simple transactions'
    ],
    keyPoints: [
      'Accounting is the systematic recording, measuring, and communication of financial information',
      'The fundamental accounting equation must always balance: Assets = Liabilities + Owner\'s Equity',
      'Financial accounting serves external users while management accounting serves internal decision-makers',
      'Assets and expenses have normal debit balances; liabilities, equity, and revenue have normal credit balances',
      'Every transaction affects at least two accounts in the double-entry system'
    ],
    blocks: [
      {
        id: 'intro-1',
        type: 'text',
        content: `
          <h2>What is Accounting?</h2>
          <p>Accounting is the systematic recording, measuring, and communication of financial information about a business or organization. It serves as the "language of business" and provides crucial data for decision-making.</p>
        `
      },
      {
        id: 'equation-1',
        type: 'equation',
        content: 'Assets = Liabilities + Owner\'s Equity',
        metadata: {
          description: 'The fundamental accounting equation'
        }
      },
      {
        id: 'types-1',
        type: 'text',
        content: `
          <h3>Types of Accounting</h3>
          <ul>
            <li><strong>Financial Accounting:</strong> Reports to external users (investors, creditors)</li>
            <li><strong>Management Accounting:</strong> Internal reporting for management decisions</li>
            <li><strong>Tax Accounting:</strong> Compliance with tax regulations</li>
          </ul>
        `
      },
      {
        id: 'table-1',
        type: 'table',
        content: {
          headers: ['Account Type', 'Normal Balance', 'Increases With', 'Decreases With'],
          rows: [
            ['Assets', 'Debit', 'Debit', 'Credit'],
            ['Liabilities', 'Credit', 'Credit', 'Debit'],
            ['Owner\'s Equity', 'Credit', 'Credit', 'Debit'],
            ['Revenue', 'Credit', 'Credit', 'Debit'],
            ['Expenses', 'Debit', 'Debit', 'Credit']
          ]
        },
        metadata: {
          title: 'Account Types and Their Normal Balances'
        }
      },
      {
        id: 'quote-1',
        type: 'quote',
        content: 'Accounting is not just about numbers; it\'s about understanding the story behind the numbers and making informed business decisions.',
        metadata: {
          author: 'Warren Buffett'
        }
      },
      {
        id: 'journal-1',
        type: 'journal_entry',
        content: {
          description: 'Example: Recording office supplies purchase',
          date: '2024-01-30',
          entries: [
            { account: 'Office Supplies', debit: 500 },
            { account: 'Cash', credit: 500 }
          ]
        }
      },
      {
        id: 'code-1',
        type: 'code',
        content: `
// Example of calculating depreciation
function calculateStraightLineDepreciation(assetCost, salvageValue, usefulLife) {
    const annualDepreciation = (assetCost - salvageValue) / usefulLife;
    return annualDepreciation;
}

const equipment = {
    cost: 10000,
    salvageValue: 2000,
    usefulLife: 5
};

const yearlyDepreciation = calculateStraightLineDepreciation(
    equipment.cost,
    equipment.salvageValue,
    equipment.usefulLife
);

console.log(\`Annual Depreciation: $\${yearlyDepreciation}\`);
        `,
        metadata: {
          language: 'javascript',
          description: 'Calculating straight-line depreciation'
        }
      }
    ],
    metadata: {
      author: 'John Smith',
      difficulty: 'Beginner',
      duration: '30 minutes',
      image: basicAccountingImg,
      lastUpdated: '2024-01-30',
      prerequisites: [],
      tags: ['accounting', 'finance', 'basics']
    }
  },
  
  '2': {
    id: '2',
    title: 'Double Entry Bookkeeping',
    description: 'Master the fundamental principle of accounting - double entry system.',
    learningObjectives: [
      'Understand the concept and importance of double entry bookkeeping',
      'Learn the golden rule: Debits = Credits',
      'Master the process of recording transactions in journal entries',
      'Apply double entry principles to various business transactions',
      'Develop skills in analyzing transaction effects on accounts'
    ],
    keyPoints: [
      'Double entry bookkeeping ensures every transaction affects at least two accounts',
      'The system maintains the fundamental equation: Assets = Liabilities + Owner\'s Equity',
      'Debits and credits must always equal in every transaction',
      'Journal entries provide a chronological record of all business transactions',
      'Understanding normal balances helps determine whether to debit or credit an account'
    ],
    blocks: [
      {
        id: 'intro-2',
        type: 'text',
        content: `
          <h2>The Double Entry System</h2>
          <p>Double entry bookkeeping is a method of recording financial transactions where every entry to an account requires a corresponding and opposite entry to a different account. This system ensures that the accounting equation always stays in balance.</p>
        `
      },
      {
        id: 'equation-2',
        type: 'equation',
        content: 'Debits = Credits',
        metadata: {
          description: 'The golden rule of double entry'
        }
      },
      {
        id: 'journal-2',
        type: 'journal_entry',
        content: {
          description: 'Example: Recording revenue from services',
          date: '2024-01-31',
          entries: [
            { account: 'Cash', debit: 1000 },
            { account: 'Service Revenue', credit: 1000 }
          ]
        }
      }
    ],
    metadata: {
      author: 'Jane Doe',
      difficulty: 'Intermediate',
      duration: '45 minutes',
      image: basicAccountingImg,
      lastUpdated: '2024-01-31',
      prerequisites: ['Introduction to Accounting'],
      tags: ['accounting', 'bookkeeping', 'double-entry']
    }
  }
} 