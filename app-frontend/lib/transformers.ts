// Data transformation layer to convert backend responses to frontend format

import type { BackendBriefing } from './api'

// Frontend interface for briefing items
export interface BriefingItem {
  id: string
  type: "email" | "event" | "reminder" | "task"
  title: string
  description: string
  priority: "high" | "medium" | "low"
  time?: string
  fullDescription?: string
  sender?: string
  tags?: string[]
  actionItems?: string[]
  relatedLinks?: { label: string; url: string }[]
}

// Transform backend briefing data to frontend format
export function transformBackendBriefing(backendData: BackendBriefing): BriefingItem[] {
  const items: BriefingItem[] = []
  const timestamp = new Date(backendData.generated_at).toLocaleString()

  // Transform email insights
  if (backendData.email_insights && Object.keys(backendData.email_insights).length > 0) {
    const emailInsight = backendData.email_insights
    items.push({
      id: `email-${backendData.user_id}-${Date.now()}`,
      type: 'email',
      title: emailInsight.title || 'Email Analysis',
      description: emailInsight.summary || emailInsight.analysis || 'Email insights available',
      priority: determinePriority(emailInsight),
      time: timestamp,
      fullDescription: emailInsight.detailed_analysis || emailInsight.analysis,
      sender: emailInsight.key_sender || 'Multiple senders',
      tags: emailInsight.categories || ['email', 'communication'],
      actionItems: emailInsight.action_items || [],
      relatedLinks: emailInsight.related_links || []
    })
  }

  // Transform calendar insights
  if (backendData.calendar_insights && Object.keys(backendData.calendar_insights).length > 0) {
    const calendarInsight = backendData.calendar_insights
    items.push({
      id: `calendar-${backendData.user_id}-${Date.now()}`,
      type: 'event',
      title: calendarInsight.title || 'Calendar Analysis',
      description: calendarInsight.summary || calendarInsight.analysis || 'Calendar insights available',
      priority: determinePriority(calendarInsight),
      time: timestamp,
      fullDescription: calendarInsight.detailed_analysis || calendarInsight.analysis,
      tags: calendarInsight.categories || ['calendar', 'meetings'],
      actionItems: calendarInsight.action_items || calendarInsight.upcoming_events || [],
      relatedLinks: calendarInsight.meeting_links || []
    })
  }

  // Transform social insights
  if (backendData.social_insights && Object.keys(backendData.social_insights).length > 0) {
    const socialInsight = backendData.social_insights
    items.push({
      id: `social-${backendData.user_id}-${Date.now()}`,
      type: 'reminder',
      title: socialInsight.title || 'Social Media Analysis',
      description: socialInsight.summary || socialInsight.analysis || 'Social media insights available',
      priority: determinePriority(socialInsight),
      time: timestamp,
      fullDescription: socialInsight.detailed_analysis || socialInsight.analysis,
      tags: socialInsight.platforms || ['social', 'messages'],
      actionItems: socialInsight.action_items || [],
      relatedLinks: socialInsight.platform_links || []
    })
  }

  // Transform priority recommendations as tasks
  if (backendData.priority_recommendations && Object.keys(backendData.priority_recommendations).length > 0) {
    const priorityRec = backendData.priority_recommendations
    items.push({
      id: `priority-${backendData.user_id}-${Date.now()}`,
      type: 'task',
      title: priorityRec.title || 'Priority Recommendations',
      description: priorityRec.summary || backendData.summary || 'AI-generated priority recommendations',
      priority: 'high',
      time: timestamp,
      fullDescription: priorityRec.detailed_recommendations || backendData.summary,
      tags: ['ai-recommendations', 'priority'],
      actionItems: priorityRec.top_priorities || priorityRec.recommendations || [],
      relatedLinks: []
    })
  }

  // If no specific insights, create a general summary item
  if (items.length === 0 && backendData.summary) {
    items.push({
      id: `summary-${backendData.user_id}-${Date.now()}`,
      type: 'task',
      title: 'Daily Summary',
      description: backendData.summary,
      priority: 'medium',
      time: timestamp,
      fullDescription: backendData.summary,
      tags: ['daily-summary', 'ai-generated'],
      actionItems: [],
      relatedLinks: []
    })
  }

  return items
}

// Determine priority based on backend data
function determinePriority(insight: any): 'high' | 'medium' | 'low' {
  // Check for explicit priority
  if (insight.priority) {
    return insight.priority.toLowerCase()
  }

  // Check for urgency indicators
  if (insight.urgent === true || insight.urgency === 'high') {
    return 'high'
  }

  // Check for error status
  if (insight.status === 'error' || insight.error) {
    return 'low'
  }

  // Check for keywords indicating high priority
  const highPriorityKeywords = ['urgent', 'asap', 'deadline', 'important', 'critical', 'emergency']
  const text = (insight.analysis || insight.summary || '').toLowerCase()
  
  if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
    return 'high'
  }

  // Check for medium priority indicators
  const mediumPriorityKeywords = ['meeting', 'appointment', 'reminder', 'follow-up']
  if (mediumPriorityKeywords.some(keyword => text.includes(keyword))) {
    return 'medium'
  }

  // Default to medium priority
  return 'medium'
}

// Transform user data from backend
export interface User {
  email: string
  token: string
  id?: number
}

export function transformUserData(backendUser: any, token: string): User {
  return {
    email: backendUser.email,
    token: token,
    id: backendUser.id
  }
}

// Error transformation
export interface AppError {
  message: string
  type: 'auth' | 'network' | 'server' | 'validation'
  details?: string
}

export function transformError(error: any): AppError {
  if (error.message) {
    // Determine error type based on message content
    const message = error.message.toLowerCase()
    
    if (message.includes('401') || message.includes('unauthorized') || message.includes('token')) {
      return {
        message: 'Authentication failed. Please login again.',
        type: 'auth',
        details: error.message
      }
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        message: 'Network error. Please check your connection.',
        type: 'network',
        details: error.message
      }
    }
    
    if (message.includes('500') || message.includes('server')) {
      return {
        message: 'Server error. Please try again later.',
        type: 'server',
        details: error.message
      }
    }
    
    if (message.includes('400') || message.includes('validation')) {
      return {
        message: 'Invalid data. Please check your input.',
        type: 'validation',
        details: error.message
      }
    }
  }

  return {
    message: error.message || 'An unexpected error occurred',
    type: 'server',
    details: error.toString()
  }
}

export type { BackendBriefing }
