
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (theme: string) => void }) {
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
