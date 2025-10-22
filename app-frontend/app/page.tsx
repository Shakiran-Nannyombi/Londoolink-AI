"use client"

import React, { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { transformBackendBriefing, transformUserData, transformError, type BriefingItem, type User, type AppError, type BackendBriefing } from "@/lib/transformers"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import {
  Mail,
  Calendar,
  Bell,
  LogOut,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Sun,
  Moon,
  ArrowRight,
  Filter,
  BarChart3,
  X,
  ExternalLink,
  UserIcon,
  Tag,
  BookOpen,
} from "lucide-react"

// Note: Types are now imported from transformers.ts

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
}

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
}

// No mock data - all data will come from real backend agents

// Reusable Components
function GlassCard({ children, className = "", ...props }: any) {
  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      className={`glass-card rounded-xl p-6 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-secondary/20 text-secondary border-secondary/30",
    medium: "bg-accent/20 text-accent border-accent/30",
    low: "bg-success/20 text-success border-success/30",
  }

  return (
    <Badge variant="outline" className={`${colors[priority]} capitalize font-medium`}>
      {priority}
    </Badge>
  )
}

function TypeIcon({ type }: { type: BriefingItem["type"] }) {
  const icons = {
    email: Mail,
    event: Calendar,
    reminder: Bell,
    task: CheckCircle2,
  }

  const Icon = icons[type]
  return <Icon className="w-5 h-5 text-primary" />
}

// ThemeToggle component
function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (theme: string) => void }) {
  const isDark = theme === "dark"

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-7 rounded-full bg-muted border border-border flex items-center px-1 cursor-pointer"
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-3 h-3 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  )
}

// Animated Background component for auth pages
const AnimatedBackground = () => {
  // Use fixed values to avoid hydration mismatch
  const orbConfigs = [
    { width: 300, height: 250, left: 10, top: 20, x: 30, y: 40, duration: 20 },
    { width: 400, height: 350, left: 70, top: 10, x: -20, y: 30, duration: 25 },
    { width: 250, height: 300, left: 30, top: 60, x: 40, y: -25, duration: 18 },
    { width: 350, height: 280, left: 80, top: 40, x: -30, y: 35, duration: 22 },
    { width: 280, height: 320, left: 50, top: 80, x: 25, y: -40, duration: 19 },
  ]

  const particleConfigs = Array.from({ length: 20 }, (_, i) => ({
    left: (i * 5.26) % 100, // Distribute evenly
    top: (i * 3.14) % 100,
    duration: 5 + (i % 3),
    delay: i * 0.25,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      {orbConfigs.map((config, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: config.width,
            height: config.height,
            left: `${config.left}%`,
            top: `${config.top}%`,
            background: i % 3 === 0 ? "var(--primary)" : i % 3 === 1 ? "var(--secondary)" : "var(--accent)",
          }}
          animate={{
            x: [0, config.x, 0],
            y: [0, config.y, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: config.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
      {particleConfigs.map((config, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${config.left}%`,
            top: `${config.top}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: config.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: config.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// FormattedContent component to display structured text
function FormattedContent({ content }: { content: string }) {
  // Decode HTML entities
  const decodeHtml = (text: string) => {
    const entities: { [key: string]: string } = {
      '&#39;': "'",
      '&quot;': '"',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>'
    }
    return Object.entries(entities).reduce((str, [entity, char]) => 
      str.replace(new RegExp(entity, 'g'), char), text
    )
  }

  const formatContent = (text: string) => {
    const decoded = decodeHtml(text)
    const sections = decoded.split(/(?=^[A-Z][A-Z\s]+:)/m).filter(Boolean)
    
    return sections.map((section, index) => {
      const lines = section.trim().split('\n').filter(Boolean)
      if (lines.length === 0) return null
      
      const firstLine = lines[0]
      const titleMatch = firstLine.match(/^([A-Z][A-Z\s]+):/)
      
      if (titleMatch) {
        const title = titleMatch[1].trim()
        const content = lines.slice(1).join('\n')
        const icon = getIconForSection(title)
        
        return (
          <div key={index} className="mb-6 bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{icon}</span>
              <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                {title}
              </h4>
            </div>
            <div className="space-y-2">
              {content.split('\n').map((line, i) => {
                const trimmed = line.trim()
                if (!trimmed) return null
                
                if (trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
                  return (
                    <div key={i} className="flex items-start gap-3 p-2 bg-background/50 rounded">
                      <span className="text-primary text-sm mt-0.5">•</span>
                      <span className="flex-1 text-sm">{trimmed.replace(/^[•\d\.\s]+/, '')}</span>
                    </div>
                  )
                }
                
                return (
                  <p key={i} className="text-sm leading-relaxed p-2 bg-background/50 rounded">
                    {trimmed}
                  </p>
                )
              })}
            </div>
          </div>
        )
      }
      
      return (
        <div key={index} className="mb-4 p-3 bg-muted/20 rounded">
          <p className="text-sm leading-relaxed">{section.trim()}</p>
        </div>
      )
    })
  }

  const getIconForSection = (title: string) => {
    const icons: { [key: string]: string } = {
      'TOP PRIORITIES': '🔥',
      'TODAY\'S SCHEDULE': '📅',
      'ACTION ITEMS': '✅',
      'COMMUNICATIONS': '💬',
      'PREPARATION NEEDED': '📋',
      'STRATEGIC INSIGHTS': '💡',
      'RECOMMENDATIONS': '⭐',
      'NEXT STEPS': '➡️'
    }
    return icons[title] || '📌'
  }

  return <div className="space-y-4">{formatContent(content)}</div>
}

// DetailModal component
function DetailModal({ 
  item, 
  onClose, 
  onMarkComplete, 
  onSnooze 
}: { 
  item: BriefingItem; 
  onClose: () => void;
  onMarkComplete: (itemId: string) => void;
  onSnooze: (itemId: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl p-8 shadow-2xl"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TypeIcon type={item.type} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-balance text-foreground mb-2">{item.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={item.priority} />
                <Badge variant="outline" className="capitalize">
                  {item.type}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted rounded-full flex-shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Time and Sender */}
        <div className="space-y-3 mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{item.time}</span>
          </div>
          {item.sender && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserIcon className="w-4 h-4" />
              <span className="text-sm">{item.sender}</span>
            </div>
          )}
        </div>

        {/* Full Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Details</h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <FormattedContent content={item.fullDescription || item.description} />
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-muted/50">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Items */}
        {item.actionItems && item.actionItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Action Items
            </h3>
            <ul className="space-y-2">
              {item.actionItems.map((action, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{action}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Related Links */}
        {item.relatedLinks && item.relatedLinks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Related Links
            </h3>
            <div className="space-y-2">
              {item.relatedLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors group"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{link.label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 pt-6 border-t border-border">
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => onMarkComplete(item.id)}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark as Complete
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-transparent"
            onClick={() => onSnooze(item.id)}
          >
            <Clock className="w-4 h-4 mr-2" />
            Snooze
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main Component
export default function LondoolinkAI() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [briefing, setBriefing] = useState<BriefingItem[]>([])
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [theme, setTheme] = useState<string>("light")
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "medium" | "low" | "completed" | "snoozed">("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BriefingItem | null>(null)
  const [error, setError] = useState<AppError | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'completed' | 'snoozed'>('dashboard')
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'info' | 'warning'}>>([])
  
  // Agent chat states
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<string>("email")
  const [agentChats, setAgentChats] = useState<Record<string, Array<{id: string, type: 'user' | 'agent', content: string, timestamp: Date}>>>({
    email: [],
    calendar: [],
    priority: [],
    social: []
  })
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [availableAgents, setAvailableAgents] = useState<Array<{id: string, name: string, description: string, icon: string}>>([
    { id: "email", name: "Email Agent", description: "Analyze and manage your emails", icon: "📧" },
    { id: "calendar", name: "Calendar Agent", description: "Manage your schedule and events", icon: "📅" },
    { id: "priority", name: "Priority Agent", description: "Help prioritize your tasks", icon: "⚡" },
    { id: "social", name: "Social Agent", description: "Monitor social media insights", icon: "🌐" }
  ])
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [snoozedItems, setSnoozedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      setIsHydrated(true)
      const token = localStorage.getItem("londoolink_token")
      const userEmail = localStorage.getItem("londoolink_email")
      if (token && userEmail) {
        setUser({ email: userEmail, token })
        setIsAuthenticated(true)
        loadBriefing()
      }

      // Remove debugging buttons that might be injected by browser extensions
      const removeDebugButtons = () => {
        const debugButtons = document.querySelectorAll('button, div')
        debugButtons.forEach(element => {
          const text = element.textContent || ''
          if (text.includes('Send element') || text.includes('Send console') || text.includes('debug')) {
            if (element instanceof HTMLElement) {
              element.style.display = 'none'
              element.remove()
            }
          }
        })
      }

      // Run immediately and then periodically to catch dynamically added elements
      removeDebugButtons()
      const interval = setInterval(removeDebugButtons, 1000)

      return () => clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("londoolink_theme") || "light"
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window !== 'undefined') {
      localStorage.setItem("londoolink_theme", theme)
      document.documentElement.classList.toggle("dark", theme === "dark")
    }
  }, [theme])

  const loadBriefing = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getDailyBriefing()
      
      // The backend returns the briefing data directly in the response
      if (response && (response.briefing || response.data)) {
        const briefingData = (response.briefing || response.data) as any
        const transformedBriefing = transformBackendBriefing(briefingData)
        setBriefing(transformedBriefing)
      } else {
        // No real data available - show empty state
        setBriefing([])
      }
    } catch (err: any) {
      console.error('Failed to load briefing:', err)
      const transformedError = transformError(err)
      setError(transformedError)
      
      // If it's an auth error, logout the user
      if (transformedError.type === 'auth') {
        handleLogout()
        return
      }
      
      // Show empty state on error
      setBriefing([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!email || !password) {
      setError({ type: 'validation', message: 'Please enter both email and password' })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log(`Attempting ${isLogin ? 'login' : 'registration'} for:`, email)
      let response
      
      if (isLogin) {
        response = await apiClient.login({ email, password })
        console.log('Login response:', response)
      } else {
        response = await apiClient.register({ email, password })
        console.log('Registration response:', response)
        // After successful registration, login automatically
        if (response.message?.includes('successfully') || response.message?.includes('created')) {
          console.log('Registration successful, attempting login...')
          response = await apiClient.login({ email, password })
          console.log('Auto-login response:', response)
        }
      }

      if (response.access_token) {
        console.log('Authentication successful, setting user data')
        const userData = transformUserData({ email }, response.access_token)
        
        // Only access localStorage on client side
        if (typeof window !== 'undefined') {
          localStorage.setItem("londoolink_token", response.access_token)
          localStorage.setItem("londoolink_email", email)
        }

        setUser(userData)
        setIsAuthenticated(true)
        
        // Load briefing after successful authentication
        console.log('Loading briefing...')
        await loadBriefing()
      } else {
        console.log('No access token in response:', response)
        throw new Error(response.message || response.detail || 'Authentication failed - no access token received')
      }
    } catch (err: any) {
      console.error('Authentication failed:', err)
      const transformedError = transformError(err)
      setError(transformedError)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem("londoolink_token")
      localStorage.removeItem("londoolink_email")
    }
    setUser(null)
    setIsAuthenticated(false)
    setBriefing([])
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    setIsLoading(true)
    try {
      const response = await apiClient.chatWithAgent('general', searchQuery)
      addNotification(`Londoolink: ${response.message?.substring(0, 50)}...`, 'info')
      setSearchQuery('')
    } catch (error) {
      addNotification('Failed to get response from Londoolink', 'warning')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isChatLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput.trim(),
      timestamp: new Date()
    }

    setAgentChats(prev => ({
      ...prev,
      [selectedAgent]: [...prev[selectedAgent], userMessage]
    }))
    setChatInput("")
    setIsChatLoading(true)

    try {
      const response = await apiClient.chatWithAgent(selectedAgent, userMessage.content)
      
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent' as const,
        content: response.message || response.analysis || "I'm here to help! How can I assist you?",
        timestamp: new Date()
      }

      setAgentChats(prev => ({
        ...prev,
        [selectedAgent]: [...prev[selectedAgent], agentMessage]
      }))
    } catch (error) {
      console.error('Chat failed:', error)
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent' as const,
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date()
      }
      setAgentChats(prev => ({
        ...prev,
        [selectedAgent]: [...prev[selectedAgent], errorMessage]
      }))
    } finally {
      setIsChatLoading(false)
    }
  }

  const filteredBriefing = briefing.filter((item) => {
    if (currentPage === 'completed') return completedItems.has(item.id)
    if (currentPage === 'snoozed') return snoozedItems.has(item.id)
    
    // Dashboard page - exclude completed and snoozed items
    if (currentPage === 'dashboard') {
      if (completedItems.has(item.id) || snoozedItems.has(item.id)) return false
      if (activeFilter === "all") return true
      return item.priority === activeFilter
    }
    
    return false
  })

  const handleMarkComplete = (itemId: string) => {
    setCompletedItems(prev => new Set([...prev, itemId]))
    setSelectedItem(null)
    addNotification('Task marked as complete!', 'success')
  }

  const handleSnooze = (itemId: string) => {
    setSnoozedItems(prev => new Set([...prev, itemId]))
    setSelectedItem(null)
    addNotification('Task snoozed for later', 'info')
  }

  const addNotification = (message: string, type: 'success' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }

  // Skip hydration loading screen - render immediately

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10 relative overflow-hidden">
        <AnimatedBackground />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 right-6 z-50"
        >
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="w-full max-w-md relative z-10"
        >
          <Card className="p-10 bg-card/80 backdrop-blur-xl border-border shadow-2xl">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-10"
            >
              <div className="flex items-center justify-center mb-6">
                <motion.div
                  className="relative"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="w-16 h-16 text-primary" />
                  <motion.div
                    className="absolute inset-0"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Sparkles className="w-16 h-16 text-primary" />
                  </motion.div>
                </motion.div>
              </div>
              <h1 className="text-4xl font-bold text-balance mb-3 text-foreground">Londoolink AI</h1>
              <p className="text-muted-foreground text-pretty text-lg">Your intelligent command center</p>
            </motion.div>

            <motion.form
              onSubmit={handleAuth}
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted/50 border-border h-12 text-base"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/50 border-border h-12 text-base"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 h-12 text-base font-semibold group"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </motion.form>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <p className="text-sm text-destructive text-center">{error.message}</p>
              </motion.div>
            )}

            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-card/95 border-b border-border shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              <Sparkles className="w-7 h-7 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Londoolink AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Command Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage('dashboard')}
            >
              Dashboard
            </Button>
            <Button
              variant={currentPage === 'completed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage('completed')}
              className="relative"
            >
              Completed
              {completedItems.size > 0 && (
                <Badge className="ml-1 bg-success text-success-foreground px-1.5 py-0 text-xs">
                  {completedItems.size}
                </Badge>
              )}
            </Button>
            <Button
              variant={currentPage === 'snoozed' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentPage('snoozed')}
              className="relative"
            >
              Snoozed
              {snoozedItems.size > 0 && (
                <Badge className="ml-1 bg-warning text-warning-foreground px-1.5 py-0 text-xs">
                  {snoozedItems.size}
                </Badge>
              )}
            </Button>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">{user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-3 rounded-lg shadow-lg border ${
                notification.type === 'success' ? 'bg-success/10 border-success/20 text-success' :
                notification.type === 'warning' ? 'bg-warning/10 border-warning/20 text-warning' :
                'bg-info/10 border-info/20 text-info'
              }`}
            >
              <p className="text-sm font-medium">{notification.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-5xl font-bold text-balance mb-2 text-foreground">
                  {currentPage === 'dashboard' ? 'Your Daily Briefing' :
                   currentPage === 'completed' ? 'Completed Tasks' :
                   'Snoozed Tasks'}
                </h2>
                <p className="text-muted-foreground text-pretty text-xl">
                  {currentPage === 'dashboard' ? 'Prioritized insights to keep you focused and in control' :
                   currentPage === 'completed' ? 'Tasks you\'ve successfully completed' :
                   'Tasks you\'ve snoozed for later'}
                </p>
              </div>
              <div className="relative">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    {activeFilter !== "all" && (
                      <Badge className="ml-1 bg-primary text-primary-foreground px-1.5 py-0 text-xs">
                        {activeFilter}
                      </Badge>
                    )}
                  </Button>
                </motion.div>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 glass-card rounded-xl shadow-xl border border-border overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {[
                          { value: "all", label: "All Items", count: briefing.filter(b => !completedItems.has(b.id) && !snoozedItems.has(b.id)).length },
                          {
                            value: "high",
                            label: "High Priority",
                            count: briefing.filter((b) => b.priority === "high" && !completedItems.has(b.id) && !snoozedItems.has(b.id)).length,
                          },
                          {
                            value: "medium",
                            label: "Medium Priority",
                            count: briefing.filter((b) => b.priority === "medium" && !completedItems.has(b.id) && !snoozedItems.has(b.id)).length,
                          },
                          {
                            value: "low",
                            label: "Low Priority",
                            count: briefing.filter((b) => b.priority === "low" && !completedItems.has(b.id) && !snoozedItems.has(b.id)).length,
                          },
                          {
                            value: "completed",
                            label: "Completed",
                            count: completedItems.size,
                          },
                          {
                            value: "snoozed",
                            label: "Snoozed",
                            count: snoozedItems.size,
                          },
                        ].map((filter) => (
                          <motion.button
                            key={filter.value}
                            onClick={() => {
                              setActiveFilter(filter.value as any)
                              setIsFilterOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                              activeFilter === filter.value
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted text-foreground"
                            }`}
                            whileHover={{ x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="font-medium text-sm">{filter.label}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                activeFilter === filter.value
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {filter.count}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div variants={itemVariants}>
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="Ask Londoolink anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-20 py-7 bg-card border-border text-lg shadow-md hover:shadow-lg focus:shadow-xl focus:border-primary transition-all rounded-2xl"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!searchQuery.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}>
                    <Zap className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </form>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="text-center hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-3xl font-bold text-foreground">{briefing.length}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="text-center hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-secondary/10">
                  <AlertCircle className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-left">
                  <div className="text-3xl font-bold text-foreground">
                    {briefing.filter((b) => b.priority === "high").length}
                  </div>
                  <div className="text-sm text-muted-foreground">High Priority</div>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="text-center hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-accent/10">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div className="text-left">
                  <div className="text-3xl font-bold text-foreground">
                    {briefing.filter((b) => b.time?.includes("today") || b.time?.includes("minutes")).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Due Today</div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* AI Agents Interface */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground">AI Agents</h3>
              <Button
                onClick={() => setIsChatOpen(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <span className="mr-2">💬</span>
                Chat with Agents
              </Button>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableAgents.map((agent) => (
                <motion.div
                  key={agent.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-4 glass-card cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => {
                      setSelectedAgent(agent.id)
                      setIsChatOpen(true)
                    }}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{agent.icon}</div>
                      <h4 className="font-semibold text-foreground mb-1">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Agent Chat Modal */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsChatOpen(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-full max-w-2xl max-h-[80vh] glass-card rounded-2xl p-6 shadow-2xl"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                >
                  {/* Chat Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {availableAgents.find(a => a.id === selectedAgent)?.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {availableAgents.find(a => a.id === selectedAgent)?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {availableAgents.find(a => a.id === selectedAgent)?.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsChatOpen(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Agent Selector */}
                  <div className="flex gap-2 mb-4 p-2 bg-muted/30 rounded-lg">
                    {availableAgents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent.id)}
                        className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedAgent === agent.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        <span>{agent.icon}</span>
                        <span>{agent.name.replace(' Agent', '')}</span>
                        {agentChats[agent.id].length > 0 && (
                          <span className={`absolute -top-1 -right-1 w-4 h-4 text-xs rounded-full flex items-center justify-center ${
                            selectedAgent === agent.id ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground'
                          }`}>
                            {agentChats[agent.id].length}
                          </span>
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => setAgentChats(prev => ({ ...prev, [selectedAgent]: [] }))}
                      className="ml-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      title="Clear chat"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Chat Messages */}
                  <div className="h-96 overflow-y-auto mb-4 p-4 bg-muted/20 rounded-lg space-y-4">
                    {agentChats[selectedAgent].length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <div className="text-4xl mb-2">
                          {availableAgents.find(a => a.id === selectedAgent)?.icon}
                        </div>
                        <p>Start a conversation with the {availableAgents.find(a => a.id === selectedAgent)?.name}!</p>
                        <p className="text-sm mt-2">Ask questions about your data, get insights, or request analysis.</p>
                      </div>
                    ) : (
                      agentChats[selectedAgent].map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] p-3 rounded-lg ${
                              message.type === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card text-foreground border border-border'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    {isChatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card text-foreground border border-border p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="text-sm">Agent is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleChatSubmit} className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Ask the ${availableAgents.find(a => a.id === selectedAgent)?.name} anything...`}
                      className="flex-1"
                      disabled={isChatLoading}
                    />
                    <Button 
                      type="submit" 
                      disabled={!chatInput.trim() || isChatLoading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Briefing Items */}
          <motion.div variants={itemVariants} className="space-y-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-foreground">Priority Items</h3>
              <span className="text-sm text-muted-foreground">
                {filteredBriefing.length} {activeFilter !== "all" && activeFilter} item
                {filteredBriefing.length !== 1 && "s"}
              </span>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="p-7 glass-card">
                      <div className="flex items-start gap-5">
                        <Skeleton className="w-14 h-14 rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-7 w-3/4" />
                          <Skeleton className="h-5 w-full" />
                          <div className="flex gap-3">
                            <Skeleton className="h-7 w-24" />
                            <Skeleton className="h-7 w-28" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {filteredBriefing.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                    >
                      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">No items found</h3>
                      <p className="text-muted-foreground">Try adjusting your filter to see more items</p>
                    </motion.div>
                  ) : (
                    filteredBriefing.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        layout
                      >
                        <GlassCard className="hover:shadow-xl transition-shadow">
                          <div className="flex items-start gap-5">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-sm">
                              <TypeIcon type={item.type} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <h3 className="font-semibold text-xl text-balance text-foreground">{item.title}</h3>
                                <PriorityBadge priority={item.priority} />
                              </div>

                              <p className="text-muted-foreground text-pretty mb-4 text-base leading-relaxed">
                                {item.description}
                              </p>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted/50">
                                  <Clock className="w-4 h-4" />
                                  <span>{item.time}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary/80"
                                  onClick={() => setSelectedItem(item)}
                                >
                                  View Details
                                  <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <DetailModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)}
            onMarkComplete={handleMarkComplete}
            onSnooze={handleSnooze}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
