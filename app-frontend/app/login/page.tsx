"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AnimatedBackground } from "@/components/auth/AnimatedBackground"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { apiClient } from "@/lib/api"
import { transformError, type AppError } from "@/lib/transformers"
import { Check } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState<AppError | null>(null)
    const [theme, setTheme] = useState<string>("light")

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem("londoolink_theme") || "light"
            setTheme(savedTheme)
            document.documentElement.classList.toggle("dark", savedTheme === "dark")
        }
    }, [])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email || !password) {
            setError({ type: 'validation', message: 'Please enter both email and password' })
            return
        }

        if (!isLogin) {
            if (!fullName) {
                setError({ type: 'validation', message: 'Please enter your full name' })
                return
            }
            if (password !== confirmPassword) {
                setError({ type: 'validation', message: 'Passwords do not match' })
                return
            }
        }

        setIsLoading(true)
        setError(null)

        try {
            let response

            if (isLogin) {
                response = await apiClient.login({ email, password })
            } else {
                // Register
                const regResponse = await apiClient.register({
                    email,
                    password,
                    full_name: fullName,
                    phone_number: phoneNumber || undefined
                })

                // Automatically login after successful registration
                response = await apiClient.login({ email, password })
            }

            if (response.access_token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem("londoolink_token", response.access_token)
                }

                // Get user info to store in state
                const userProfile = await apiClient.getProfile() as any
                login(response.access_token, userProfile)
                router.push("/dashboard")
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

    const features = [
        "Never miss important emails or events",
        "AI-powered insights and summaries",
        "Secure and private by design",
        "Seamless calendar integration"
    ]

    return (
        <div className="min-h-screen flex relative overflow-hidden bg-background">
            <AnimatedBackground />

            {/* Top Navigation */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-6 left-0 right-0 px-6 z-50 flex items-center justify-between lg:w-auto lg:left-auto lg:right-6 lg:px-0 lg:gap-4 lg:justify-end pointer-events-none"
            >
                <Link href="/" className="pointer-events-auto">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        Return to Home
                    </Button>
                </Link>
                <div className="pointer-events-auto">
                    <ThemeToggle theme={theme} setTheme={(t) => {
                        setTheme(t)
                        localStorage.setItem("londoolink_theme", t)
                        document.documentElement.classList.toggle("dark", t === "dark")
                    }} />
                </div>
            </motion.div>

            {/* Two Column Layout */}
            <div className="flex flex-col lg:flex-row w-full">
                {/* Left Column - Brand */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-12 flex-col justify-center relative"
                >
                    <div className="relative z-10 max-w-md">
                        {/* Logo */}
                        <div className="mb-8">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-2xl rotate-6 backdrop-blur-sm" />
                                <div className="absolute inset-0 bg-secondary/20 rounded-2xl -rotate-6 backdrop-blur-sm" />
                                <div className="relative w-full h-full bg-background/50 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner">
                                    <img
                                        src={theme === 'dark' ? '/logoDark.png' : '/logoLondo.png'}
                                        alt="Londoolink Logo"
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                            </div>
                            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent mb-4">
                                Londoolink AI
                            </h1>
                            <p className="text-xl text-muted-foreground mb-8">
                                Your Intelligent Digital Twin
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-foreground/80">{feature}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right Column - Auth Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex-1 flex items-center justify-center p-6 lg:p-12"
                >
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-8">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 bg-primary/20 rounded-2xl rotate-6" />
                                <div className="absolute inset-0 bg-secondary/20 rounded-2xl -rotate-6" />
                                <div className="relative w-full h-full bg-background/50 rounded-2xl flex items-center justify-center border border-primary/20">
                                    <img
                                        src={theme === 'dark' ? '/logoDark.png' : '/logoLondo.png'}
                                        alt="Londoolink Logo"
                                        className="w-12 h-12 object-contain"
                                    />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                                Londoolink AI
                            </h1>
                        </div>

                        <Card className="p-8 bg-card/80 backdrop-blur-xl border-border shadow-2xl">
                            {/* Toggle Tabs */}
                            <div className="flex gap-2 mb-8 p-1 bg-muted/50 rounded-lg">
                                <button
                                    onClick={() => {
                                        setIsLogin(true)
                                        setError(null)
                                    }}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${isLogin
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => {
                                        setIsLogin(false)
                                        setError(null)
                                    }}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${!isLogin
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {/* Form Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isLogin ? "login" : "signup"}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={handleAuth} className="space-y-4">
                                        <AnimatePresence mode="wait">
                                            {!isLogin && (
                                                <motion.div
                                                    key="signup-fields"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        required={!isLogin}
                                                        className="bg-muted/50 border-border h-11 mb-4"
                                                    />
                                                    <Input
                                                        type="tel"
                                                        placeholder="Phone Number (Optional)"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        className="bg-muted/50 border-border h-11 mb-4"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <Input
                                            type="email"
                                            placeholder="Email address"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="bg-muted/50 border-border h-11"
                                        />

                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-muted/50 border-border h-11"
                                        />

                                        <AnimatePresence mode="wait">
                                            {!isLogin && (
                                                <motion.div
                                                    key="confirm-password"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Input
                                                        type="password"
                                                        placeholder="Confirm Password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required={!isLogin}
                                                        className="bg-muted/50 border-border h-11 mb-4"
                                                    />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <Button
                                            type="submit"
                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 h-11 font-semibold"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                            )}
                                        </Button>
                                    </form>
                                </motion.div>
                            </AnimatePresence>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 p-3 rounded-lg text-sm text-center ${error.type === 'validation' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'
                                        }`}
                                >
                                    {error.message}
                                </motion.div>
                            )}

                            {/* Divider */}
                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground">or</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {/* Google Login */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11 gap-3 font-medium"
                                onClick={() => {
                                    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
                                    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
                                    const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
                                    const redirectUri = `${window.location.origin}/auth/callback`
                                    const params = new URLSearchParams({
                                        response_type: 'code',
                                        client_id: clientId!,
                                        redirect_uri: redirectUri,
                                        scope: 'openid profile email',
                                        audience: audience!,
                                        connection: 'google-oauth2',
                                    })
                                    window.location.href = `https://${domain}/authorize?${params}`
                                }}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
