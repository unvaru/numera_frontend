// Base API response interface
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
}

// API error interface
export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

// Pagination interface
export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

// Paginated response interface
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta
}

// Search parameters interface
export interface SearchParams {
  query?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  filters?: Record<string, any>
}

// File upload interface
export interface FileUpload {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
  url: string
  created_at: string
}

// Notification interface
export interface Notification {
  id: string
  user_id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  is_read: boolean
  created_at: string
  read_at?: string
}

// Activity log interface
export interface ActivityLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// System health interface
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  uptime: number
  memory_usage: number
  cpu_usage: number
  database_status: 'connected' | 'disconnected'
  cache_status: 'connected' | 'disconnected'
  last_check: string
}

// API rate limit interface
export interface RateLimit {
  limit: number
  remaining: number
  reset: number
  retry_after?: number
}

// Webhook interface
export interface Webhook {
  id: string
  url: string
  events: string[]
  is_active: boolean
  secret?: string
  created_at: string
  last_triggered?: string
}

// API key interface
export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  is_active: boolean
  last_used?: string
  created_at: string
  expires_at?: string
}

// Audit log interface
export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource_type: string
  resource_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// All types are already exported above 