"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AnimatedBackground } from "@/components/auth/AnimatedBackground"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { apiClient } from "@/lib/api"
import { transformUserData, transformError, type AppError } from "@/lib/transformers"
import { Check } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { ConsentForm } from "@/components/consent/ConsentForm"

function LoginPageContent() {
    const router = useRouter()
    const { login } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState(1) // 1: Login/Register basic, 2: Consent (only for Signup)
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
            if (step === 1) {
                setStep(2)
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
                // This branch shouldn't be hit anymore because step state handles it, 
                // but kept for safety if we ever skip step 2
                response = await apiClient.register({
                    email,
                    password,
                    full_name: fullName,
                    phone_number: phoneNumber || undefined
                })
                if (response.message?.includes('successfully') || response.message?.includes('created')) {
                    response = await apiClient.login({ email, password })
                }
            }

            if (response.access_token) {
                // Set token manually so getProfile is authenticated
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

    const handleRegistrationComplete = async (consents: Record<string, boolean>) => {
        setIsLoading(true)
        setError(null)

        try {
            // 1. Register
            const regResponse = await apiClient.register({
                email,
                password,
                full_name: fullName,
                phone_number: phoneNumber || undefined
            })

            // 2. Login to get token
            const loginResponse = await apiClient.login({ email, password })

            if (loginResponse.access_token) {
                if (typeof window !== 'undefined') {
                    localStorage.setItem("londoolink_token", loginResponse.access_token)
                }

                // 3. Grant consents
                const serviceMapping: Record<string, string> = {
                    dataProcessing: 'data_processing',
                    emailAccess: 'email',
                    whatsappAccess: 'whatsapp',
                    smsAccess: 'sms'
                }

                for (const [key, value] of Object.entries(consents)) {
                    await apiClient.grantConsent({
                        service_type: serviceMapping[key] || key,
                        consent_given: value
                    })
                }

                // 4. Get profile and redirect
                const userProfile = await apiClient.getProfile() as any
                login(loginResponse.access_token, userProfile)
                router.push("/dashboard")
            } else {
                throw new Error('Registration successful but login failed')
            }
        } catch (err: any) {
            console.error('Registration failed:', err)
            setError(transformError(err))
            setStep(1) // Move back to step 1 on error
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/google-login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_token: credentialResponse.credential
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Google login failed')
            }

            if (data.access_token) {
                // Set token manually so getProfile is authenticated
                if (typeof window !== 'undefined') {
                    localStorage.setItem("londoolink_token", data.access_token)
                }

                // Get user info to store in state
                const userProfile = await apiClient.getProfile() as any
                login(data.access_token, userProfile)
                router.push("/dashboard")
            } else {
                throw new Error('No access token received')
            }
        } catch (err: any) {
            console.error('Google login failed:', err)
            setError({
                type: 'auth',
                message: err.message || 'Google login failed. Please try again.'
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError({
            type: 'auth',
            message: 'Google login was cancelled or failed'
        })
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
                className="absolute top-6 right-6 z-50 flex items-center gap-4"
            >
                <Link href="/">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                        Return to Home
                    </Button>
                </Link>
                <ThemeToggle theme={theme} setTheme={(t) => {
                    setTheme(t)
                    localStorage.setItem("londoolink_theme", t)
                    document.documentElement.classList.toggle("dark", t === "dark")
                }} />
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
                                        src={theme === "dark" ? "/logoDark.png" : "/logoLondo.png"}
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
                                        src={theme === "dark" ? "/logoDark.png" : "/logoLondo.png"}
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
                                        setStep(1)
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
                                        setStep(1)
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

                            {/* Form */}
                            {/* Form Content */}
                            <AnimatePresence mode="wait">
                                {isLogin || step === 1 ? (
                                    <motion.div
                                        key="auth-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <form onSubmit={handleAuth} className="space-y-4">
                                            <AnimatePresence mode="wait">
                                                {!isLogin && (
                                                    <motion.div
                                                        key="full-name-field"
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
                                                    </motion.div>
                                                )}
                                                {!isLogin && (
                                                    <motion.div
                                                        key="phone-number-field"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2, delay: 0.05 }}
                                                    >
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
                                                        key="confirm-password-field"
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
                                                    <span>{isLogin ? "Sign In" : "Next Step"}</span>
                                                )}
                                            </Button>
                                        </form>

                                        {/* Divider */}
                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-border"></div>
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                            </div>
                                        </div>

                                        {/* Google Login */}
                                        <div className="flex justify-center">
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={handleGoogleError}
                                                useOneTap
                                                use_fedcm_for_prompt={false}
                                                theme={theme === 'dark' ? 'filled_black' : 'outline'}
                                                size="large"
                                            />
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="consent-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-6">
                                            <Button
                                                variant="ghost"
                                                onClick={() => setStep(1)}
                                                className="p-0 h-auto text-muted-foreground hover:text-primary mb-2"
                                            >
                                                &larr; Back to account details
                                            </Button>
                                        </div>
                                        <ConsentForm
                                            onSubmit={handleRegistrationComplete}
                                            isLoading={isLoading}
                                        />
                                    </motion.div>
                                )}
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
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!googleClientId) {
        console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google login will not work.')
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId || ''}>
            <LoginPageContent />
        </GoogleOAuthProvider>
    )
}
