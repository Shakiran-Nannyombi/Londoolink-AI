
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AnimatedBackground } from "@/components/auth/AnimatedBackground"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { apiClient } from "@/lib/api"
import { transformUserData, transformError, type AppError } from "@/lib/transformers"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState<AppError | null>(null)
    const [theme, setTheme] = useState<string>("light")

    useEffect(() => {
        // Basic theme initialization for login page
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem("londoolink_theme") || "light"
            setTheme(savedTheme)
            document.documentElement.classList.toggle("dark", savedTheme === "dark")
        }
    }, [])

    useEffect(() => {
        // Check if already authenticated
        const token = localStorage.getItem("londoolink_token")
        if (token) {
            router.push("/")
        }
    }, [router])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()

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
            } else {
                response = await apiClient.register({ email, password })
                if (response.message?.includes('successfully') || response.message?.includes('created')) {
                    response = await apiClient.login({ email, password })
                }
            }

            if (response.access_token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem("londoolink_token", response.access_token)
                    localStorage.setItem("londoolink_email", email)
                }
                router.push("/")
            } else {
                throw new Error(response.message || response.detail || 'Authentication failed')
            }
        } catch (err: any) {
            console.error('Authentication failed:', err)
            setError(transformError(err))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10 relative overflow-hidden">
            <AnimatedBackground />

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 right-6 z-50"
            >
                <ThemeToggle theme={theme} setTheme={(t) => {
                    setTheme(t)
                    localStorage.setItem("londoolink_theme", t)
                    document.documentElement.classList.toggle("dark", t === "dark")
                }} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="p-10 bg-card/80 backdrop-blur-xl border-border shadow-2xl">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-10"
                    >
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 bg-primary/20 rounded-2xl rotate-6 backdrop-blur-sm" />
                            <div className="absolute inset-0 bg-secondary/20 rounded-2xl -rotate-6 backdrop-blur-sm" />
                            <div className="relative w-full h-full bg-background/50 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                                <span className="text-4xl">🤖</span>
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent mb-3">
                            Londoolink AI
                        </h1>
                        <p className="text-muted-foreground text-lg">Your Intelligent Digital Twin</p>
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
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {isLogin ? "Sign In" : "Create Account"}
                                    <motion.span
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                                    >
                                        →
                                    </motion.span>
                                </span>
                            )}
                        </Button>
                    </motion.form>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mt-6 p-4 rounded-lg text-sm text-center ${error.type === 'validation' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'
                                }`}
                        >
                            {error.message}
                        </motion.div>
                    )}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin)
                                setError(null)
                            }}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </button>
                    </motion.div>
                </Card>
            </motion.div>
        </div>
    )
}
