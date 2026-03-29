"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnimatedBackground } from "@/components/auth/AnimatedBackground"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { Check } from "lucide-react"
import { useAuthStore } from "@/store/authStore"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuthStore()
    const [theme, setTheme] = useState<string>("light")
    const [demoLoading, setDemoLoading] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem("londoolink_theme") || "light"
            setTheme(savedTheme)
            document.documentElement.classList.toggle("dark", savedTheme === "dark")
        }
    }, [])

    const handleDemoLogin = async () => {
        setDemoLoading(true)
        try {
            const res = await fetch(`${API_BASE}/api/v1/auth/demo-login`, { method: 'POST' })
            const data = await res.json()
            if (data.access_token) {
                localStorage.setItem("londoolink_token", data.access_token)
                const profileRes = await fetch(`${API_BASE}/api/v1/auth/me`, {
                    headers: { Authorization: `Bearer ${data.access_token}` }
                })
                const profile = profileRes.ok ? await profileRes.json() : { email: "demodev708@gmail.com" }
                login(data.access_token, profile)
                router.push("/dashboard")
            }
        } catch (e) {
            console.error('Demo login failed:', e)
        } finally {
            setDemoLoading(false)
        }
    }

    const handleAuth0Login = () => {
        const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
        const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
        const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
        const redirectUri = `${window.location.origin}/auth/callback`
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId!,
            redirect_uri: redirectUri,
            scope: 'openid profile email offline_access',
            audience: audience!,
        })
        window.location.href = `https://${domain}/authorize?${params}`
    }

    const handleGoogleLogin = () => {
        const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
        const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID
        const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
        const redirectUri = `${window.location.origin}/auth/callback`
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId!,
            redirect_uri: redirectUri,
            scope: 'openid profile email offline_access',
            audience: audience!,
            connection: 'google-oauth2',
        })
        window.location.href = `https://${domain}/authorize?${params}`
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

            <div className="flex flex-col lg:flex-row w-full">
                {/* Left Column - Brand */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-12 flex-col justify-center relative"
                >
                    <div className="relative z-10 max-w-md">
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

                {/* Right Column - Auth */}
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
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome</h2>
                                <p className="text-muted-foreground text-sm">Sign in or create an account to continue</p>
                            </div>

                            <div className="space-y-4">
                                {/* Google Login */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-12 gap-3 font-medium text-base"
                                    onClick={handleGoogleLogin}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Continue with Google
                                </Button>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs text-muted-foreground">or</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>

                                {/* Email Login via Auth0 */}
                                <Button
                                    type="button"
                                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-base"
                                    onClick={handleAuth0Login}
                                >
                                    Continue with Email
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center mt-6">
                                By continuing, you agree to our Terms of Service and Privacy Policy.
                                Your credentials are secured by Auth0.
                            </p>

                            <div className="mt-4 pt-4 border-t border-border">
                                <button
                                    onClick={handleDemoLogin}
                                    disabled={demoLoading}
                                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center py-2 disabled:opacity-50"
                                >
                                    {demoLoading ? 'Loading demo...' : 'Try Demo Account →'}
                                </button>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
