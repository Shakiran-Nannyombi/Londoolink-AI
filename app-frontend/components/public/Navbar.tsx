"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settingsStore'
import { Moon, Sun } from 'lucide-react'

export function Navbar() {
    const { theme, updateTheme } = useSettingsStore()

    const handleThemeToggle = () => {
        updateTheme(theme === 'dark' ? 'light' : 'dark')
    }

    return (
        <motion.header
            className="fixed top-0 left-0 right-0 z-50 px-6 py-4 glass-card border-b border-white/5 bg-background/50 backdrop-blur-md"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img
                        src={theme === 'dark' ? "/logoDark.png" : "/logoLondo.png"}
                        alt="Londoolink AI"
                        className="h-10 w-auto object-contain"
                    />
                    <span className="text-xl font-bold tracking-tight">Londoolink AI</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                        How It Works
                    </Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleThemeToggle}
                        className="rounded-full w-9 h-9"
                    >
                        {theme === 'dark' ? (
                            <Moon className="w-4 h-4" />
                        ) : (
                            <Sun className="w-4 h-4" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>

                    <Link href="/login">
                        <Button variant="ghost" size="sm">
                            Login
                        </Button>
                    </Link>
                    <Link href="/login">
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.header>
    )
}
