import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

export interface ContentBlock {
  id: string
  type: 'text' | 'equation' | 'table' | 'quote' | 'journal_entry' | 'code' | 'image' | 'video'
  content: any
  metadata?: {
    title?: string
    description?: string
    language?: string
    source?: string
    timestamp?: string
    [key: string]: any
  }
}

export interface LessonContent {
  id: string
  title: string
  description: string
  blocks: ContentBlock[]
  version: string
  lastUpdated: string
  metadata?: {
    author?: string
    tags?: string[]
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    prerequisites?: string[]
    [key: string]: any
  }
}

class ContentService {
  private baseUrl: string
  private apiKey?: string

  constructor(baseUrl: string = '/api', apiKey?: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  private async request<T>(endpoint: string, options: Partial<AxiosRequestConfig> = {}): Promise<T> {
    const config: AxiosRequestConfig = {
      url: `${this.baseUrl}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        ...(options.headers || {})
      },
      ...options
    }

    try {
      const response = await axios(config)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Content API Error: ${error.response?.data?.message || error.message}`)
      }
      throw error
    }
  }

  async getLessonContent(lessonId: string): Promise<LessonContent> {
    return this.request<LessonContent>(`/lessons/${lessonId}/content`)
  }

  async getContentBlock(blockId: string): Promise<ContentBlock> {
    return this.request<ContentBlock>(`/content-blocks/${blockId}`)
  }

  async searchContent(query: string, filters?: {
    type?: string[]
    tags?: string[]
    difficulty?: string
    dateRange?: { start: string; end: string }
  }): Promise<ContentBlock[]> {
    return this.request<ContentBlock[]>('/content/search', {
      method: 'POST',
      data: { query, filters }
    })
  }

  async updateContentBlock(blockId: string, content: Partial<ContentBlock>): Promise<ContentBlock> {
    return this.request<ContentBlock>(`/content-blocks/${blockId}`, {
      method: 'PATCH',
      data: content
    })
  }

  async createContentBlock(content: Omit<ContentBlock, 'id'>): Promise<ContentBlock> {
    return this.request<ContentBlock>('/content-blocks', {
      method: 'POST',
      data: content
    })
  }

  // Content transformation helpers
  transformToHTML(block: ContentBlock): string {
    switch (block.type) {
      case 'text':
        return `<div class="content-text">${block.content}</div>`
      
      case 'equation':
        return `<content-equation :equation="'${block.content}'"></content-equation>`
      
      case 'table':
        return `<content-table 
          :headers='${JSON.stringify(block.content.headers)}' 
          :rows='${JSON.stringify(block.content.rows)}'
        ></content-table>`
      
      case 'quote':
        return `<content-quote :quote="'${block.content}'" 
          :author="'${block.metadata?.author || ''}'"
        ></content-quote>`
      
      case 'journal_entry':
        return `<journal-entry 
          :entries='${JSON.stringify(block.content.entries)}'
          :description="'${block.content.description}'"
          :date="'${block.content.date}'"
        ></journal-entry>`
      
      case 'code':
        return `<code-block 
          :code="'${block.content}'"
          :language="'${block.metadata?.language || 'text'}'"
        ></code-block>`
      
      case 'image':
        return `<content-image 
          :src="'${block.content}'"
          :alt="'${block.metadata?.description || ''}'"
          :caption="'${block.metadata?.caption || ''}'"
        ></content-image>`
      
      case 'video':
        return `<content-video 
          :src="'${block.content}'"
          :title="'${block.metadata?.title || ''}'"
          :poster="'${block.metadata?.poster || ''}'"
        ></content-video>`
      
      default:
        return block.content.toString()
    }
  }
}

export const contentService = new ContentService()
export default contentService 