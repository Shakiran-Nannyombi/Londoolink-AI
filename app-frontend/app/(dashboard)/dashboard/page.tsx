"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"
import { transformBackendBriefing, transformError, type BriefingItem, type User, type AppError } from "@/lib/transformers"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  LogOut,
  Search,
  Sparkles,
  Filter,
  BarChart3,
  BookOpen,
  Send,
  Link2,
} from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import { GlassCard } from "@/components/shared/GlassCard"
import { PriorityBadge } from "@/components/shared/PriorityBadge"
import { TypeIcon } from "@/components/shared/TypeIcon"
import { DetailModal } from "@/components/dashboard/DetailModal"
import { ChatbotWidget } from "@/components/chat/ChatbotWidget"
import { useNotificationStore } from "@/store/notificationStore"
import { WelcomeScreen } from "@/components/dashboard/WelcomeScreen"

interface IntegrationStatus {
  service_type: string
  is_connected: boolean
}

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

export default function DashboardPage() {
  const router = useRouter()
  const { addNotification } = useNotificationStore()
  const { user: authUser } = useAuthStore()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [briefing, setBriefing] = useState<BriefingItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [integrationStatuses, setIntegrationStatuses] = useState<Record<string, boolean>>({})

  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "medium" | "low" | "completed" | "snoozed">("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BriefingItem | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<AppError | null>(null)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'completed' | 'snoozed'>('dashboard')

  // Agent chat states
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedAgent] = useState<string>("email") // Simplified: only support email agent defaulting for now or keep generic
  // Keep selectedAgent state if we want to expand back to multiple agents later

  const [agentChats, setAgentChats] = useState<Record<string, Array<{ id: string, type: 'user' | 'agent', content: string, timestamp: Date }>>>({
    email: [],
    calendar: [],
    priority: [],
    social: []
  })
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [availableAgents] = useState<Array<{ id: string, name: string, description: string, icon: string }>>([
    { id: "email", name: "Email Agent", description: "Analyze and manage your emails", icon: "📧" },
    { id: "calendar", name: "Calendar Agent", description: "Manage your schedule and events", icon: "📅" },
    { id: "priority", name: "Priority Agent", description: "Help prioritize your tasks", icon: "⚡" },
    { id: "social", name: "Social Agent", description: "Monitor social media insights", icon: "🌐" }
  ])
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [snoozedItems, setSnoozedItems] = useState<Set<string>>(new Set())
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('londoolink_welcome_seen')
      if (!seen) setShowWelcome(true)
    }
  }, [])

  const handleDismissWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('londoolink_welcome_seen', '1')
  }

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("londoolink_token")
      const userEmail = localStorage.getItem("londoolink_email")

      if (!token || !userEmail) {
        router.push("/login")
        return
      }

      setUser({ email: userEmail, token })
      setIsAuthenticated(true)
      loadBriefing()
      loadIntegrationStatuses()
    }
  }, [router])

  const loadIntegrationStatuses = async () => {
    try {
      const response = await apiClient.getIntegrationsStatus()
      const list: IntegrationStatus[] = Array.isArray(response) ? response : (response.data ?? [])
      const map: Record<string, boolean> = {}
      for (const item of list) {
        map[item.service_type] = item.is_connected
      }
      setIntegrationStatuses(map)
    } catch {
      // silently fail — non-critical
    }
  }

  // Removed Theme initialization useEffect - handled by Sidebar/Layout

  const loadBriefing = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.getDailyBriefing()

      if (response && (response.briefing || response.data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const briefingData = (response.briefing || response.data) as any
        const transformedBriefing = transformBackendBriefing(briefingData)
        setBriefing(transformedBriefing)
      } else {
        setBriefing([])
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Failed to load briefing:', err)
      const transformedError = transformError(err)
      setError(transformedError)

      if (transformedError.type === 'auth') {
        handleLogout()
        return
      }
      setBriefing([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("londoolink_token")
      localStorage.removeItem("londoolink_email")
    }
    router.push("/login")
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
      console.error(error)
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

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      {/* Top Bar: Search & Greeting */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Good afternoon, {authUser?.full_name || authUser?.email?.split('@')[0] || user?.email?.split('@')[0]}
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Ask Londoolink..."
              className="pl-9 h-10 bg-muted/50 border-transparent hover:bg-muted transition-colors focus:bg-background focus:border-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
      </header>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <GlassCard className="p-4 flex items-center justify-between group cursor-pointer" onClick={() => setCurrentPage('dashboard')}>
          <div>
            <p className="text-sm text-muted-foreground">Active Tasks</p>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {isLoading ? <Skeleton className="h-8 w-12" /> : briefing.filter(i => !completedItems.has(i.id) && !snoozedItems.has(i.id)).length}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors ${currentPage === 'dashboard' ? 'ring-2 ring-primary' : ''}`}>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between group cursor-pointer" onClick={() => setCurrentPage('completed')}>
          <div>
            <p className="text-sm text-muted-foreground">Completed</p>
            <h3 className="text-2xl font-bold text-success/80">
              {isLoading ? <Skeleton className="h-8 w-12" /> : completedItems.size}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors ${currentPage === 'completed' ? 'ring-2 ring-success' : ''}`}>
            <Sparkles className="w-5 h-5 text-success" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between group cursor-pointer" onClick={() => setCurrentPage('snoozed')}>
          <div>
            <p className="text-sm text-muted-foreground">Snoozed</p>
            <h3 className="text-2xl font-bold text-orange-500/80">
              {isLoading ? <Skeleton className="h-8 w-12" /> : snoozedItems.size}
            </h3>
          </div>
          <div className={`w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors ${currentPage === 'snoozed' ? 'ring-2 ring-orange-500' : ''}`}>
            <BookOpen className="w-5 h-5 text-orange-500" />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center justify-between group">
          <div>
            <p className="text-sm text-muted-foreground">Productivity</p>
            <h3 className="text-2xl font-bold text-secondary">
              {isLoading ? <Skeleton className="h-8 w-12" /> : `${briefing.length > 0 ? Math.round((completedItems.size / briefing.length) * 100) : 0}%`}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
            <Sparkles className="w-5 h-5 text-secondary" />
          </div>
        </GlassCard>
      </motion.div>

      {/* Connected Services Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-xl bg-muted/40 border border-border/50"
      >
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Link2 className="w-4 h-4" />
          Connected Services
        </span>
        {(['google', 'notion'] as const).map((svc) => {
          const connected = integrationStatuses[svc] ?? false
          return (
            <span
              key={svc}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${connected
                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
              {svc.charAt(0).toUpperCase() + svc.slice(1)}
              {connected ? ' Connected' : ' Disconnected'}
            </span>
          )
        })}
        {(!integrationStatuses['google'] || !integrationStatuses['notion']) && (
          <Link
            href="/settings?tab=integrations"
            className="ml-auto text-xs text-primary hover:underline"
          >
            {!integrationStatuses['google'] && !integrationStatuses['notion']
              ? 'Connect Google & Notion →'
              : !integrationStatuses['google']
                ? 'Connect Google →'
                : 'Connect Notion →'}
          </Link>
        )}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Briefing & Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">
                {currentPage === 'dashboard' ? 'Daily Briefing' :
                  currentPage === 'completed' ? 'Completed Tasks' : 'Snoozed Items'}
              </h2>
              {currentPage === 'dashboard' && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFilter("all")}
                    className={activeFilter === "all" ? "bg-muted text-foreground" : "text-muted-foreground"}
                  >
                    All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveFilter("high")}
                    className={activeFilter === "high" ? "bg-secondary/20 text-secondary" : "text-muted-foreground"}
                  >
                    High Priority
                  </Button>
                </div>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredBriefing.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredBriefing.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    layout
                    onClick={() => setSelectedItem(item)}
                  >
                    <GlassCard className="hover:shadow-lg transition-shadow cursor-pointer group border-border/50">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <TypeIcon type={item.type} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate pr-4">{item.title}</h3>
                            <PriorityBadge priority={item.priority} />
                          </div>

                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                              {item.time}
                            </span>
                            {item.sender && <span>Please review details</span>}
                            {item.tags && (
                              <div className="flex gap-2">
                                {item.tags.slice(0, 2).map((tag, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded bg-muted">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 opacity-50" />
              </div>
              <p>No items found</p>
              <Button variant="link" onClick={loadBriefing} className="mt-2">
                Refresh Briefing
              </Button>
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant Chat */}
        <div className="lg:col-span-1">
          <div className={`fixed inset-y-0 right-0 w-full md:w-[400px] bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl transform transition-transform duration-300 z-40 ${isChatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:relative lg:w-full lg:bg-transparent lg:border-none lg:shadow-none lg:backdrop-blur-none'}`}>
            <div className="h-full flex flex-col p-6 lg:p-0">
              <div className="flex items-center justify-between lg:hidden mb-6">
                <h2 className="text-xl font-bold">AI Assistant</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                  <LogOut className="w-5 h-5 rotate-180" />
                </Button>
              </div>

              <GlassCard className="flex-1 flex flex-col h-[600px] lg:h-[calc(100vh-200px)] p-0 overflow-hidden border-border/50">
                {/* Chat Header removed: agent tab/selector no longer needed */}

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {agentChats[selectedAgent]?.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-xl flex items-center justify-center text-2xl">
                        {availableAgents.find(a => a.id === selectedAgent)?.icon}
                      </div>
                      <p className="font-medium">{availableAgents.find(a => a.id === selectedAgent)?.name}</p>
                      <p className="text-sm opacity-70 mt-1">{availableAgents.find(a => a.id === selectedAgent)?.description}</p>
                    </div>
                  )}

                  {agentChats[selectedAgent]?.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.type === 'user'
                          ? 'bg-primary text-primary-foreground rounded-tr-none'
                          : 'bg-muted text-foreground rounded-tl-none'
                          }`}
                      >
                        {msg.content}
                        <div className={`text-[10px] mt-1 opacity-50 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-100" />
                          <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-border bg-muted/20">
                  <form onSubmit={handleChatSubmit} className="relative">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Message ${availableAgents.find(a => a.id === selectedAgent)?.name}...`}
                      className="pr-10 bg-background border-transparent shadow-sm focus:border-primary/20"
                      disabled={isChatLoading}
                    />
                    <Button
                      size="icon"
                      type="submit"
                      className="absolute right-1 top-1 h-8 w-8"
                      disabled={!chatInput.trim() || isChatLoading}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

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

      {/* Floating Chatbot Widget */}
      <ChatbotWidget />

      {/* Welcome Screen */}
      <AnimatePresence>
        {showWelcome && <WelcomeScreen onDismiss={handleDismissWelcome} />}
      </AnimatePresence>
    </>
  )
}
