"use client"

import React, { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { transformBackendBriefing, transformUserData, transformError, type BriefingItem, type User, type AppError } from "@/lib/transformers"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  Sun
  Moon,
  ArrowRight,
  Filter,
  BarChart3,
  X,
  ExternalLink,
  UserIcon,
  Tag,
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

// Mock data for demo
const mockBriefing: BriefingItem[] = [
  {
    id: "1",
    type: "email",
    title: "Urgent: Q4 Budget Review",
    description: "Finance team needs your approval on the revised budget proposal",
    priority: "high",
    time: "2 hours ago",
    fullDescription:
      "The finance team has completed the Q4 budget review and identified several areas requiring immediate attention. The revised proposal includes cost optimization strategies and resource reallocation to maximize ROI. Your approval is needed to proceed with the implementation timeline.",
    sender: "Sarah Chen (Finance Director)",
    tags: ["Budget", "Finance", "Q4", "Urgent"],
    actionItems: [
      "Review the revised budget spreadsheet",
      "Approve or request changes by EOD",
      "Schedule follow-up meeting with finance team",
    ],
    relatedLinks: [
      { label: "Budget Spreadsheet", url: "#" },
      { label: "Previous Quarter Comparison", url: "#" },
    ],
  },
  {
    id: "2",
    type: "event",
    title: "Team Standup",
    description: "Daily sync with the engineering team",
    priority: "medium",
    time: "In 30 minutes",
    fullDescription:
      "Daily standup meeting to discuss progress, blockers, and coordinate on ongoing projects. This is a quick 15-minute sync to ensure everyone is aligned and no one is blocked.",
    sender: "Engineering Team",
    tags: ["Meeting", "Daily", "Engineering"],
    actionItems: ["Prepare your updates", "List any blockers", "Join the video call on time"],
    relatedLinks: [
      { label: "Meeting Link", url: "#" },
      { label: "Sprint Board", url: "#" },
    ],
  },
  {
    id: "3",
    type: "task",
    title: "Complete Project Documentation",
    description: "Finalize the API documentation for the new release",
    priority: "high",
    time: "Due today",
    fullDescription:
      "The API documentation needs to be completed before the v2.0 release. This includes endpoint descriptions, authentication flows, error handling, and code examples for all major use cases.",
    sender: "Product Team",
    tags: ["Documentation", "API", "Release", "v2.0"],
    actionItems: [
      "Document all new endpoints",
      "Add code examples for each language",
      "Review with the dev team",
      "Publish to docs site",
    ],
    relatedLinks: [
      { label: "Documentation Draft", url: "#" },
      { label: "API Changelog", url: "#" },
    ],
  },
  {
    id: "4",
    type: "reminder",
    title: "Follow up with Client",
    description: "Check in on the implementation progress",
    priority: "medium",
    time: "Tomorrow",
    fullDescription:
      "It's been two weeks since the last client check-in. Reach out to see how the implementation is going, if they need any support, and gather feedback on the onboarding process.",
    sender: "Customer Success",
    tags: ["Client", "Follow-up", "Implementation"],
    actionItems: ["Send follow-up email", "Schedule call if needed", "Update CRM with notes"],
    relatedLinks: [
      { label: "Client Profile", url: "#" },
      { label: "Implementation Timeline", url: "#" },
    ],
  },
  {
    id: "5",
    type: "email",
    title: "Weekly Newsletter",
    description: "Industry insights and updates from your subscriptions",
    priority: "low",
    time: "1 day ago",
    fullDescription:
      "Your weekly digest of industry news, trends, and insights. This week covers AI developments, market analysis, and upcoming tech conferences.",
    sender: "Tech Insights Weekly",
    tags: ["Newsletter", "Industry", "Updates"],
    actionItems: ["Read key articles", "Share relevant insights with team"],
    relatedLinks: [
      { label: "Full Newsletter", url: "#" },
      { label: "Archive", url: "#" },
    ],
  },
]

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
function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: Math.random() * 300 + 200,
            height: Math.random() * 300 + 200,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: i % 3 === 0 ? "var(--primary)" : i % 3 === 1 ? "var(--secondary)" : "var(--accent)",
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 3,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// DetailModal component
function DetailModal({ item, onClose }: { item: BriefingItem; onClose: () => void }) {
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
        onClick={(e) => e.stopPropagation()}
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
          <p className="text-muted-foreground leading-relaxed text-pretty">
            {item.fullDescription || item.description}
          </p>
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
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">Mark as Complete</Button>
          <Button variant="outline" className="flex-1 bg-transparent">
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
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "medium" | "low">("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<BriefingItem | null>(null)
  const [error, setError] = useState<AppError | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("londoolink_token")
    const userEmail = localStorage.getItem("londoolink_email")
    if (token && userEmail) {
      setUser({ email: userEmail, token })
      setIsAuthenticated(true)
      loadBriefing()
    }
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem("londoolink_theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList.toggle("dark", savedTheme === "dark")
  }, [])

  useEffect(() => {
    localStorage.setItem("londoolink_theme", theme)
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const loadBriefing = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getDailyBriefing()
      
      if (response.briefing) {
        const transformedBriefing = transformBackendBriefing(response.briefing)
        setBriefing(transformedBriefing)
      } else {
        // Fallback to mock data if no real data available
        setBriefing(mockBriefing)
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
      
      // Fallback to mock data on error
      setBriefing(mockBriefing)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let response
      
      if (isLogin) {
        response = await apiClient.login({ email, password })
      } else {
        response = await apiClient.register({ email, password })
        // After successful registration, login automatically
        if (response.message?.includes('successfully')) {
          response = await apiClient.login({ email, password })
        }
      }

      if (response.access_token) {
        const userData = transformUserData({ email }, response.access_token)
        
        localStorage.setItem("londoolink_token", response.access_token)
        localStorage.setItem("londoolink_email", email)

        setUser(userData)
        setIsAuthenticated(true)
        
        // Load briefing after successful authentication
        await loadBriefing()
      } else {
        throw new Error(response.message || 'Authentication failed')
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
    localStorage.removeItem("londoolink_token")
    localStorage.removeItem("londoolink_email")
    setUser(null)
    setIsAuthenticated(false)
    setBriefing([])
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Search query:", searchQuery)
  }

  const filteredBriefing = briefing.filter((item) => {
    if (activeFilter === "all") return true
    return item.priority === activeFilter
  })

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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-5xl font-bold text-balance mb-2 text-foreground">Your Daily Briefing</h2>
                <p className="text-muted-foreground text-pretty text-xl">
                  Prioritized insights to keep you focused and in control
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
                          { value: "all", label: "All Items", count: briefing.length },
                          {
                            value: "high",
                            label: "High Priority",
                            count: briefing.filter((b) => b.priority === "high").length,
                          },
                          {
                            value: "medium",
                            label: "Medium Priority",
                            count: briefing.filter((b) => b.priority === "medium").length,
                          },
                          {
                            value: "low",
                            label: "Low Priority",
                            count: briefing.filter((b) => b.priority === "low").length,
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
                className="pl-14 pr-5 py-7 bg-card border-border text-lg shadow-md hover:shadow-lg focus:shadow-xl focus:border-primary transition-all rounded-2xl"
              />
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

          {/* Briefing Items */}
          <motion.div variants={itemVariants} className="space-y-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-foreground">Priority Items</h3>
              <span className="text-sm text-muted-foreground">
                {filteredBriefing.length} {activeFilter !== "all" && `${activeFilter} priority`} item
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
        {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      </AnimatePresence>
    </div>
  )
}
