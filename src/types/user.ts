// User interface
export interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'admin' | 'instructor'
  subscription_plan?: string
  subscription_expiry?: string
  language_preference?: string
  timezone?: string
  avatar_url?: string
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

// User profile interface
export interface UserProfile {
  id: string
  user_id: string
  bio?: string
  location?: string
  website?: string
  social_links?: {
    twitter?: string
    linkedin?: string
    github?: string
  }
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

// User preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  email_notifications: {
    lessons: boolean
    quizzes: boolean
    achievements: boolean
    marketing: boolean
  }
  push_notifications: {
    lessons: boolean
    quizzes: boolean
    achievements: boolean
  }
  privacy: {
    profile_visible: boolean
    progress_visible: boolean
    achievements_visible: boolean
  }
  accessibility: {
    high_contrast: boolean
    large_text: boolean
    screen_reader: boolean
  }
}

// User settings interface
export interface UserSettings {
  id: string
  user_id: string
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

// User session interface
export interface UserSession {
  id: string
  user_id: string
  token: string
  ip_address?: string
  user_agent?: string
  expires_at: string
  created_at: string
  last_activity: string
}

// User activity interface
export interface UserActivity {
  id: string
  user_id: string
  type: 'login' | 'logout' | 'lesson_completed' | 'quiz_taken' | 'achievement_earned'
  details: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: string
}

// User achievement interface
export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  progress?: number
  is_completed: boolean
}

// User badge interface
export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  level: number
  points: number
}

// User certificate interface
export interface UserCertificate {
  id: string
  user_id: string
  subject_id: string
  certificate_number: string
  issued_at: string
  expires_at?: string
  pdf_url?: string
  is_valid: boolean
}

// User enrollment interface
export interface UserEnrollment {
  id: string
  user_id: string
  subject_id: string
  enrolled_at: string
  completed_at?: string
  progress: number
  is_active: boolean
}

// User feedback interface
export interface UserFeedback {
  id: string
  user_id: string
  type: 'bug_report' | 'feature_request' | 'general' | 'lesson_feedback'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  category?: string
  tags?: string[]
  created_at: string
  updated_at: string
  resolved_at?: string
}

// User support ticket interface
export interface UserSupportTicket {
  id: string
  user_id: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed'
  category: string
  assigned_to?: string
  created_at: string
  updated_at: string
  resolved_at?: string
  closed_at?: string
}

// User notification settings interface
export interface UserNotificationSettings {
  id: string
  user_id: string
  email: {
    lessons: boolean
    quizzes: boolean
    achievements: boolean
    marketing: boolean
    system: boolean
  }
  push: {
    lessons: boolean
    quizzes: boolean
    achievements: boolean
    system: boolean
  }
  sms: {
    lessons: boolean
    quizzes: boolean
    achievements: boolean
  }
  frequency: 'immediate' | 'daily' | 'weekly'
  quiet_hours: {
    enabled: boolean
    start_time?: string
    end_time?: string
  }
  created_at: string
  updated_at: string
}

// User privacy settings interface
export interface UserPrivacySettings {
  id: string
  user_id: string
  profile_visibility: 'public' | 'private' | 'friends_only'
  progress_visibility: 'public' | 'private' | 'friends_only'
  achievements_visibility: 'public' | 'private' | 'friends_only'
  allow_messages: boolean
  allow_friend_requests: boolean
  show_online_status: boolean
  data_sharing: {
    analytics: boolean
    marketing: boolean
    third_party: boolean
  }
  created_at: string
  updated_at: string
}

// User security settings interface
export interface UserSecuritySettings {
  id: string
  user_id: string
  two_factor_enabled: boolean
  two_factor_method?: 'sms' | 'email' | 'authenticator'
  login_notifications: boolean
  suspicious_activity_alerts: boolean
  session_timeout: number // in minutes
  password_changed_at: string
  last_security_review?: string
  created_at: string
  updated_at: string
}