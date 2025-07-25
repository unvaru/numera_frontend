import apiClient, { apiUtils } from '@/config/api'
import type { ApiResponse } from '@/config/api'

// Subscription plan interface
export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  features: string[]
  is_popular?: boolean
  is_active: boolean
}

// User subscription interface
export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'pending'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

// Billing information interface
export interface BillingInfo {
  id: string
  user_id: string
  card_last4?: string
  card_brand?: string
  card_exp_month?: number
  card_exp_year?: number
  billing_email: string
  billing_name: string
  billing_address?: {
    line1: string
    line2?: string
    city: string
    state: string
    postal_code: string
    country: string
  }
}

// Payment method interface
export interface PaymentMethod {
  id: string
  user_id: string
  type: 'card' | 'bank_account'
  last4: string
  brand?: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
  created_at: string
}

// Invoice interface
export interface Invoice {
  id: string
  user_id: string
  subscription_id: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'failed' | 'refunded'
  billing_reason: 'subscription_create' | 'subscription_cycle' | 'subscription_update'
  created_at: string
  paid_at?: string
  pdf_url?: string
}

class SubscriptionService {
  // Get available subscription plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get<ApiResponse<SubscriptionPlan[]>>('/api/v1/subscriptions/plans')
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get user's current subscription
  async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      const response = await apiClient.get<ApiResponse<UserSubscription>>('/api/v1/subscriptions/current')
      return apiUtils.extractData(response)
    } catch (error: any) {
      if (error.status === 404) {
        return null // No active subscription
      }
      throw apiUtils.handleError(error)
    }
  }

  // Create subscription
  async createSubscription(planId: string, paymentMethodId: string): Promise<UserSubscription> {
    try {
      const response = await apiClient.post<ApiResponse<UserSubscription>>('/api/v1/subscriptions', {
        plan_id: planId,
        payment_method_id: paymentMethodId
      })
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Cancel subscription
  async cancelSubscription(cancelAtPeriodEnd: boolean = true): Promise<UserSubscription> {
    try {
      const response = await apiClient.put<ApiResponse<UserSubscription>>('/api/v1/subscriptions/cancel', {
        cancel_at_period_end: cancelAtPeriodEnd
      })
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Reactivate subscription
  async reactivateSubscription(): Promise<UserSubscription> {
    try {
      const response = await apiClient.put<ApiResponse<UserSubscription>>('/api/v1/subscriptions/reactivate')
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Update subscription
  async updateSubscription(planId: string): Promise<UserSubscription> {
    try {
      const response = await apiClient.put<ApiResponse<UserSubscription>>('/api/v1/subscriptions', {
        plan_id: planId
      })
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get billing information
  async getBillingInfo(): Promise<BillingInfo> {
    try {
      const response = await apiClient.get<ApiResponse<BillingInfo>>('/api/v1/subscriptions/billing')
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Update billing information
  async updateBillingInfo(billingInfo: Partial<BillingInfo>): Promise<BillingInfo> {
    try {
      const response = await apiClient.put<ApiResponse<BillingInfo>>('/api/v1/subscriptions/billing', billingInfo)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get<ApiResponse<PaymentMethod[]>>('/api/v1/subscriptions/payment-methods')
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Add payment method
  async addPaymentMethod(paymentMethodData: any): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post<ApiResponse<PaymentMethod>>('/api/v1/subscriptions/payment-methods', paymentMethodData)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`/api/v1/subscriptions/payment-methods/${paymentMethodId}`)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Set default payment method
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.put<ApiResponse<void>>(`/api/v1/subscriptions/payment-methods/${paymentMethodId}/default`)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get invoices
  async getInvoices(): Promise<Invoice[]> {
    try {
      const response = await apiClient.get<ApiResponse<Invoice[]>>('/api/v1/subscriptions/invoices')
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Get invoice by ID
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await apiClient.get<ApiResponse<Invoice>>(`/api/v1/subscriptions/invoices/${invoiceId}`)
      return apiUtils.extractData(response)
    } catch (error) {
      throw apiUtils.handleError(error)
    }
  }

  // Development helper methods (for testing)
  // These methods provide mock data when backend is not available
  
  // Get mock subscription plans
  async getMockSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return [
      {
        id: 'free',
        name: 'Free',
        description: 'Basic access to core features',
        price: 0,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Access to 3 subjects',
          '5 quizzes per day',
          'Basic progress tracking',
          'Community support'
        ],
        is_active: true
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'Full access to all features',
        price: 9.99,
        currency: 'USD',
        interval: 'monthly',
        features: [
          'Unlimited subjects',
          'Unlimited quizzes',
          'Advanced analytics',
          'Priority support',
          'Download certificates',
          'Offline access'
        ],
        is_popular: true,
        is_active: true
      },
      {
        id: 'premium-yearly',
        name: 'Premium (Yearly)',
        description: 'Full access with 2 months free',
        price: 99.99,
        currency: 'USD',
        interval: 'yearly',
        features: [
          'Unlimited subjects',
          'Unlimited quizzes',
          'Advanced analytics',
          'Priority support',
          'Download certificates',
          'Offline access',
          '2 months free'
        ],
        is_active: true
      }
    ]
  }

  // Get mock user subscription
  async getMockUserSubscription(): Promise<UserSubscription | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Return null for free users, or mock subscription for premium users
    const user = localStorage.getItem('currentUser')
    if (user) {
      const userData = JSON.parse(user)
      if (userData.subscription_plan === 'premium') {
        return {
          id: 'sub-001',
          user_id: userData.id,
          plan_id: 'premium',
          status: 'active',
          current_period_start: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
          current_period_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
          cancel_at_period_end: false,
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          updated_at: new Date().toISOString()
        }
      }
    }
    
    return null
  }

  // Get mock billing info
  async getMockBillingInfo(): Promise<BillingInfo> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return {
      id: 'billing-001',
      user_id: 'dev-student-001',
      card_last4: '4242',
      card_brand: 'visa',
      card_exp_month: 12,
      card_exp_year: 2025,
      billing_email: 'dev@numera.com',
      billing_name: 'John Doe',
      billing_address: {
        line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US'
      }
    }
  }

  // Get mock payment methods
  async getMockPaymentMethods(): Promise<PaymentMethod[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return [
      {
        id: 'pm-001',
        user_id: 'dev-student-001',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        exp_month: 12,
        exp_year: 2025,
        is_default: true,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }

  // Get mock invoices
  async getMockInvoices(): Promise<Invoice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return [
      {
        id: 'inv-001',
        user_id: 'dev-student-001',
        subscription_id: 'sub-001',
        amount: 999, // $9.99
        currency: 'USD',
        status: 'paid',
        billing_reason: 'subscription_cycle',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        pdf_url: 'https://example.com/invoice.pdf'
      },
      {
        id: 'inv-002',
        user_id: 'dev-student-001',
        subscription_id: 'sub-001',
        amount: 999,
        currency: 'USD',
        status: 'paid',
        billing_reason: 'subscription_create',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        paid_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        pdf_url: 'https://example.com/invoice.pdf'
      }
    ]
  }

  // Check if we should use development mode
  private shouldUseDevMode(): boolean {
    return import.meta.env.DEV
  }
}

export const subscriptionService = new SubscriptionService()
export default subscriptionService 