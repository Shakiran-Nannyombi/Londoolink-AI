"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Settings as SettingsIcon,
    Bell,
    Shield,
    Link,
    Lock,
    Moon,
    Sun,
    Languages,
    Clock,
    Check
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { EmailIntegrationCard, SMSIntegrationCard } from '@/components/integrations/ServiceIntegrationCard'
import { apiClient } from '@/lib/api'

type Tab = 'general' | 'notifications' | 'privacy' | 'integrations' | 'security'

export default function SettingsPage() {
    const router = useRouter()
    const { isAuthenticated } = useAuthStore()
    const {
        theme,
        language,
        timezone,
        notifications,
        updateTheme,
        updateLanguage,
        updateTimezone,
        updateNotifications
    } = useSettingsStore()

    const [activeTab, setActiveTab] = useState<Tab>('general')
    const [integrationStatus, setIntegrationStatus] = useState<{
        email: boolean
        sms: boolean
    }>({ email: false, sms: false })

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, router])

    // Fetch integration status
    useEffect(() => {
        const fetchIntegrationStatus = async () => {
            try {
                const response = await apiClient.getIntegrationsStatus()
                if (response && Array.isArray(response)) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const statusMap: any = {}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    response.forEach((item: any) => {
                        statusMap[item.service_type] = item.is_connected
                    })
                    setIntegrationStatus(statusMap)
                }
            } catch (error) {
                console.error('Failed to fetch integration status:', error)
            }
        }

        if (isAuthenticated) {
            fetchIntegrationStatus()
        }
    }, [isAuthenticated])

    const tabs = [
        { id: 'general' as Tab, name: 'General', icon: SettingsIcon },
        { id: 'notifications' as Tab, name: 'Notifications', icon: Bell },
        { id: 'privacy' as Tab, name: 'Privacy', icon: Shield },
        { id: 'integrations' as Tab, name: 'Integrations', icon: Link },
        { id: 'security' as Tab, name: 'Security', icon: Lock },
    ]

    const timezones = [
        'UTC',
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Africa/Kampala',
    ]

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' },
        { code: 'de', name: 'Deutsch' },
    ]

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">Manage your account preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Tabs - Sidebar on Desktop, Horizontal Scroll on Mobile */}
                <div className="lg:col-span-1">
                    <Card className="p-1 lg:p-2 bg-background/50 backdrop-blur-sm border-border/50 sticky top-20 z-20">
                        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-hide">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[0.98]'
                                            : 'hover:bg-muted text-muted-foreground'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                                        <span className="font-medium text-sm lg:text-base">{tab.name}</span>
                                    </button>
                                )
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* General Settings */}
                            {activeTab === 'general' && (
                                <Card className="p-6">
                                    <h2 className="text-xl font-semibold mb-6 text-foreground">General Settings</h2>

                                    <div className="space-y-6">
                                        {/* Theme */}
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                                Theme
                                            </label>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => updateTheme('light')}
                                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${theme === 'light'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                        }`}
                                                >
                                                    <Sun className="w-6 h-6 mx-auto mb-2" />
                                                    <p className="text-sm font-medium">Light</p>
                                                </button>
                                                <button
                                                    onClick={() => updateTheme('dark')}
                                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${theme === 'dark'
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                        }`}
                                                >
                                                    <Moon className="w-6 h-6 mx-auto mb-2" />
                                                    <p className="text-sm font-medium">Dark</p>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Language */}
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                                <Languages className="w-4 h-4" />
                                                Language
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {languages.map((lang) => (
                                                    <button
                                                        key={lang.code}
                                                        onClick={() => updateLanguage(lang.code)}
                                                        className={`p-3 rounded-lg border-2 transition-all text-left flex items-center justify-between ${language === lang.code
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-border hover:border-primary/50'
                                                            }`}
                                                    >
                                                        <p className="font-medium">{lang.name}</p>
                                                        {language === lang.code && (
                                                            <Check className="w-4 h-4 text-primary" />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Timezone */}
                                        <div>
                                            <label className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Timezone
                                            </label>
                                            <select
                                                value={timezone}
                                                onChange={(e) => updateTimezone(e.target.value)}
                                                className="w-full p-3 rounded-lg border-2 border-border bg-background hover:border-primary/50 transition-colors"
                                            >
                                                {timezones.map((tz) => (
                                                    <option key={tz} value={tz}>{tz}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Notifications Settings */}
                            {activeTab === 'notifications' && (
                                <Card className="p-6">
                                    <h2 className="text-xl font-semibold mb-6 text-foreground">Notification Preferences</h2>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                                            { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser' },
                                            { key: 'inApp', label: 'In-App Notifications', description: 'Show notifications within the app' },
                                            { key: 'dailyBriefing', label: 'Daily Briefing', description: 'Receive daily summary of your tasks' },
                                            { key: 'urgentOnly', label: 'Urgent Only', description: 'Only notify for high-priority items' },
                                        ].map((notif) => (
                                            <div key={notif.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                                <div>
                                                    <p className="font-medium text-foreground">{notif.label}</p>
                                                    <p className="text-sm text-muted-foreground">{notif.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => updateNotifications({
                                                        [notif.key]: !notifications[notif.key as keyof typeof notifications]
                                                    })}
                                                    className={`relative w-12 h-6 rounded-full transition-colors ${notifications[notif.key as keyof typeof notifications]
                                                        ? 'bg-primary'
                                                        : 'bg-muted'
                                                        }`}
                                                >
                                                    <span
                                                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[notif.key as keyof typeof notifications]
                                                            ? 'translate-x-6'
                                                            : 'translate-x-0'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* Privacy Settings */}
                            {activeTab === 'privacy' && (
                                <Card className="p-6">
                                    <h2 className="text-xl font-semibold mb-6 text-foreground">Privacy & Data</h2>

                                    <div className="space-y-6">
                                        <div className="p-4 rounded-lg bg-purple-500/10 dark:bg-blue-500/10 border border-purple-500/20 dark:border-blue-500/20">
                                            <p className="text-sm text-foreground mb-2">
                                                <strong>Your data is encrypted and secure.</strong>
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                All your personal information and connected services are protected with industry-standard encryption.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="font-medium text-foreground">Data Management</h3>
                                            <Button variant="outline" className="w-full justify-start">
                                                Download My Data
                                            </Button>
                                            <Button variant="outline" className="w-full justify-start">
                                                Manage Consents
                                            </Button>
                                            <Button variant="destructive" className="w-full justify-start">
                                                Delete All Data
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Integrations Settings */}
                            {activeTab === 'integrations' && (
                                <Card className="p-6">
                                    <h2 className="text-xl font-semibold mb-6 text-foreground">Connected Services</h2>

                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Connect your accounts to enable Londoolink AI to analyze and prioritize your communications.
                                        </p>

                                        <EmailIntegrationCard
                                            isConnected={integrationStatus.email}
                                            onConnect={async () => {
                                                try {
                                                    const response = await apiClient.connectEmail('gmail')

                                                    if (response.oauth_url) {
                                                        // Open OAuth popup
                                                        const width = 600
                                                        const height = 700
                                                        const left = window.screen.width / 2 - width / 2
                                                        const top = window.screen.height / 2 - height / 2

                                                        window.open(
                                                            response.oauth_url,
                                                            'Gmail OAuth',
                                                            `width=${width},height=${height},left=${left},top=${top}`
                                                        )

                                                        // Prompt user to refresh after auth
                                                        // In a full implementation, we would use window.postMessage 
                                                        // or polling to detect completion
                                                        alert("Please complete authentication in the popup window. Afterwards, refresh this page to see the updated status.")
                                                    } else {
                                                        setIntegrationStatus(prev => ({ ...prev, email: true }))
                                                    }
                                                } catch (error) {
                                                    console.error('Failed to connect email:', error)
                                                    throw error
                                                }
                                            }}
                                            onDisconnect={async () => {
                                                try {
                                                    await apiClient.disconnectEmail()
                                                    setIntegrationStatus(prev => ({ ...prev, email: false }))
                                                } catch (error) {
                                                    console.error('Failed to disconnect email:', error)
                                                    throw error
                                                }
                                            }}
                                        />


                                        <SMSIntegrationCard
                                            isConnected={integrationStatus.sms}
                                            onConnect={async () => {
                                                try {
                                                    // Now using backend-managed secrets from .env
                                                    await apiClient.connectSMS('twilio')
                                                    setIntegrationStatus(prev => ({ ...prev, sms: true }))
                                                } catch (error) {
                                                    console.error('Failed to connect SMS:', error)
                                                    throw error
                                                }
                                            }}
                                            onDisconnect={async () => {
                                                try {
                                                    await apiClient.disconnectSMS()
                                                    setIntegrationStatus(prev => ({ ...prev, sms: false }))
                                                } catch (error) {
                                                    console.error('Failed to disconnect SMS:', error)
                                                    throw error
                                                }
                                            }}
                                        />
                                    </div>
                                </Card>
                            )}

                            {/* Security Settings */}
                            {activeTab === 'security' && (
                                <Card className="p-6">
                                    <h2 className="text-xl font-semibold mb-6 text-foreground">Security Settings</h2>

                                    <TwoFactorAuth />

                                    <div className="mt-8 pt-8 border-t border-border">
                                        <h3 className="font-medium text-foreground mb-4">Password</h3>
                                        <Button variant="outline">Change Password</Button>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-border">
                                        <h3 className="font-medium text-foreground mb-2">Active Sessions</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Manage devices where you're currently logged in
                                        </p>
                                        <Button variant="outline">View Sessions</Button>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

// 2FA Component
function TwoFactorAuth() {
    const [enabled, setEnabled] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showSetup, setShowSetup] = useState(false)
    const [qrCode, setQrCode] = useState('')
    const [secret, setSecret] = useState('')
    const [backupCodes, setBackupCodes] = useState<string[]>([])
    const [verificationCode, setVerificationCode] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            const response = await apiClient.get2FAStatus()
            setEnabled(response.enabled || false)
        } catch (err) {
            console.error('Failed to fetch 2FA status:', err)
        }
    }

    const handleEnable = async () => {
        if (!password) {
            setError('Please enter your password')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await apiClient.enable2FA(password)
            setQrCode(response.qr_code)
            setSecret(response.secret)
            setBackupCodes(response.backup_codes || [])
            setShowSetup(true)
            setPassword('')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Failed to enable 2FA')
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code')
            return
        }

        setLoading(true)
        setError('')

        try {
            await apiClient.verify2FASetup(verificationCode)
            setEnabled(true)
            setShowSetup(false)
            setVerificationCode('')
            setQrCode('')
            setSecret('')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Invalid verification code')
        } finally {
            setLoading(false)
        }
    }

    const handleDisable = async () => {
        if (!password || !verificationCode) {
            setError('Please enter your password and verification code')
            return
        }

        setLoading(true)
        setError('')

        try {
            await apiClient.disable2FA(password, verificationCode)
            setEnabled(false)
            setPassword('')
            setVerificationCode('')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Failed to disable 2FA')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Add an extra layer of security to your account
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${enabled
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-muted text-muted-foreground'
                    }`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                </div>
            </div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {error}
                </div>
            )}

            {!enabled && !showSetup && (
                <div className="space-y-4">
                    <Input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="max-w-md"
                    />
                    <Button onClick={handleEnable} disabled={loading}>
                        {loading ? 'Setting up...' : 'Enable 2FA'}
                    </Button>
                </div>
            )}

            {showSetup && (
                <div className="space-y-6 p-6 border border-border rounded-lg">
                    <div>
                        <h4 className="font-medium mb-2">Step 1: Scan QR Code</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </p>
                        {qrCode && (
                            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border border-border rounded-lg" />
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            Or enter this code manually: <code className="bg-muted px-2 py-1 rounded">{secret}</code>
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium mb-2">Step 2: Verify Code</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            Enter the 6-digit code from your authenticator app
                        </p>
                        <div className="flex gap-2 max-w-md">
                            <Input
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            />
                            <Button onClick={handleVerify} disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify'}
                            </Button>
                        </div>
                    </div>

                    {backupCodes.length > 0 && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <h4 className="font-medium text-yellow-600 dark:text-yellow-500 mb-2">
                                Save Your Backup Codes
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Store these codes in a safe place. Each code can only be used once.
                            </p>
                            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                                {backupCodes.map((code, i) => (
                                    <div key={i} className="bg-background px-3 py-2 rounded border border-border">
                                        {code}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {enabled && (
                <div className="space-y-4 p-6 border border-green-500/20 bg-green-500/5 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">2FA is active on your account</span>
                    </div>

                    <div className="pt-4 border-t border-border space-y-4">
                        <h4 className="font-medium">Disable 2FA</h4>
                        <Input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="max-w-md"
                        />
                        <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            className="max-w-md"
                        />
                        <Button variant="destructive" onClick={handleDisable} disabled={loading}>
                            {loading ? 'Disabling...' : 'Disable 2FA'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
