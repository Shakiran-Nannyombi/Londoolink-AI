"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    User,
    Settings,
    Bell,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Moon,
    Sun,
    Shield,
    Link2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useNotificationStore } from '@/store/notificationStore'
import { apiClient } from '@/lib/api'

export function Sidebar({ className }: { className?: string }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [integrationsMissing, setIntegrationsMissing] = useState(false)

    // Global stores
    const { user, logout } = useAuthStore()
    const { theme, updateTheme } = useSettingsStore()
    const { notifications } = useNotificationStore()

    // Derived state
    const notificationsCount = notifications.length

    useEffect(() => {
        apiClient.getIntegrationsStatus().then((response) => {
            const list: Array<{ service_type: string; is_connected: boolean }> = Array.isArray(response)
                ? response
                : (response.data ?? [])
            const missing = ['google', 'notion'].some(
                (svc) => !list.find((s) => s.service_type === svc)?.is_connected
            )
            setIntegrationsMissing(missing)
        }).catch(() => { /* non-critical */ })
    }, [])

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Shield, label: 'Security', path: '/security' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ]

    const handleThemeToggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        updateTheme(newTheme)
    }

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    return (
        <motion.div
            className={cn(
                "relative h-screen bg-background border-r border-border flex flex-col z-50 transition-all duration-300",
                isCollapsed ? "w-20" : "w-64",
                className
            )}
            initial={false}
        >
            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 z-50 border border-background"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            </Button>

            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 shrink-0">
                    <Logo className="w-full h-full object-contain" />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-bold text-lg bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary whitespace-nowrap"
                    >
                        Londoolink AI
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => (
                    <Button
                        key={item.path}
                        variant={pathname === item.path ? "secondary" : "ghost"}
                        className={cn(
                            "w-full justify-start h-12 relative group",
                            isCollapsed ? "justify-center px-0" : "px-4"
                        )}
                        onClick={() => router.push(item.path)}
                        title={isCollapsed ? item.label : undefined}
                    >
                        <item.icon className={cn("w-5 h-5 shrink-0", isCollapsed ? "" : "mr-3")} />

                        {!isCollapsed && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="truncate"
                            >
                                {item.label}
                            </motion.span>
                        )}
                    </Button>
                ))}

                {/* Integrations Item */}
                <Button
                    variant={pathname === '/settings' ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start h-12 relative group",
                        isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                    title="Integrations"
                    onClick={() => router.push('/settings?tab=integrations')}
                >
                    <div className="relative">
                        <Link2 className={cn("w-5 h-5 shrink-0", isCollapsed ? "" : "mr-3")} />
                        {integrationsMissing && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-background" />
                        )}
                    </div>
                    {!isCollapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                            Integrations
                        </motion.span>
                    )}
                </Button>

                {/* Notifications Item */}
                <Button
                    variant={pathname === '/notifications' ? "secondary" : "ghost"}
                    className={cn(
                        "w-full justify-start h-12 relative group",
                        isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                    title="Notifications"
                    onClick={() => router.push('/notifications')}
                >
                    <div className="relative">
                        <Bell className={cn("w-5 h-5 shrink-0", isCollapsed ? "" : "mr-3")} />
                        {notificationsCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
                        )}
                    </div>

                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="truncate"
                        >
                            Notifications
                        </motion.span>
                    )}
                </Button>
            </nav>

            {/* Footer Actions */}
            <div className="p-3 border-t border-border mt-auto space-y-2">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start h-12",
                        isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                    onClick={handleThemeToggle}
                    title={isCollapsed ? "Toggle Theme" : undefined}
                >
                    {theme === 'dark' ? (
                        <Moon className={cn("w-5 h-5 shrink-0", isCollapsed ? "" : "mr-3")} />
                    ) : (
                        <Sun className={cn("w-5 h-5 shrink-0", isCollapsed ? "" : "mr-3")} />
                    )}

                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        </motion.span>
                    )}
                </Button>

                {/* Logout */}
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start h-12 text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                        isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                    onClick={handleLogout}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className={cn("w-5 h-5 shrink-0", isCollapsed ? "" : "mr-3")} />

                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            Logout
                        </motion.span>
                    )}
                </Button>

                {!isCollapsed && user && (
                    <div className="px-4 py-2 mt-2 flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-medium truncate">{user.full_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
