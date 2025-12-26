"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settingsStore'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
    const { theme, updateTheme } = useSettingsStore()
    const [scrolled, setScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        updateTheme(newTheme)
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    // Variants for mobile menu animation
    const menuVariants = {
        closed: {
            opacity: 0,
            y: "-100%",
            borderRadius: "0 0 100% 100%",
            transition: {
                duration: 0.5,
                ease: [0.76, 0, 0.24, 1]
            }
        },
        open: {
            opacity: 1,
            y: "0%",
            borderRadius: "0 0 0% 0%",
            transition: {
                duration: 0.7,
                ease: [0.76, 0, 0.24, 1]
            }
        }
    }

    const linkVariants = {
        closed: { opacity: 0, y: 20 },
        open: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.3 + (i * 0.1),
                duration: 0.5,
                ease: "easeOut"
            }
        })
    }

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            scrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 py-3" : "bg-transparent py-5"
        )}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 z-50 relative" onClick={closeMobileMenu}>
                    <img
                        src={theme === 'dark' ? "/logoDark.png" : "/logoLondo.png"}
                        alt="Londoolink AI"
                        className="h-10 w-auto object-contain"
                    />
                    <span className="text-xl font-bold tracking-tight">Londoolink AI</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
                    <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How It Works</Link>
                    <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
                    <a
                        href="https://shakiran-nannyombi.github.io/Londoolink-AI/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:text-primary transition-colors"
                    >
                        Docs
                    </a>

                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <Link href="/login">
                        <Button className="rounded-full px-6">Login</Button>
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden z-50 flex items-center gap-4">
                    {/* Theme toggle mobile */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-primary/10 transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 text-foreground focus:outline-none"
                    >
                        {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>

                {/* Mobile Full Screen Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            variants={menuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed inset-0 bg-background/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center space-y-8 md:hidden"
                        >
                            <nav className="flex flex-col items-center gap-8">
                                {[
                                    { href: "/", label: "Home" },
                                    { href: "/how-it-works", label: "How It Works" },
                                    { href: "/about", label: "About" },
                                    { href: "https://shakiran-nannyombi.github.io/Londoolink-AI/", label: "Docs", isExternal: true },
                                ].map((link, i) => (
                                    <motion.div
                                        key={link.href}
                                        custom={i}
                                        variants={linkVariants}
                                    >
                                        {link.isExternal ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={closeMobileMenu}
                                                className="text-3xl font-bold tracking-tight hover:text-primary transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                onClick={closeMobileMenu}
                                                className="text-3xl font-bold tracking-tight hover:text-primary transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </motion.div>
                                ))}

                                <motion.div
                                    custom={4}
                                    variants={linkVariants}
                                >
                                    <Link href="/login" onClick={closeMobileMenu}>
                                        <Button size="lg" className="rounded-full px-12 text-lg h-14 mt-4">
                                            Login
                                        </Button>
                                    </Link>
                                </motion.div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    )
}
