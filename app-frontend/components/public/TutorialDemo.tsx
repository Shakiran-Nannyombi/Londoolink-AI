"use client"

import { motion } from "framer-motion"
import { MousePointer2, Send, BarChart3, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function TutorialDemo() {
    const [step, setStep] = useState(0)

    // Sequence controller
    useEffect(() => {
        const sequence = async () => {
            // Reset
            setStep(0)
            await new Promise(r => setTimeout(r, 1000))

            // Step 1: Cursor moves to input
            setStep(1)
            await new Promise(r => setTimeout(r, 1500))

            // Step 2: Typing
            setStep(2)
            await new Promise(r => setTimeout(r, 2000))

            // Step 3: Processing
            setStep(3)
            await new Promise(r => setTimeout(r, 1500))

            // Step 4: Result
            setStep(4)
            await new Promise(r => setTimeout(r, 4000))

            // Loop
            sequence()
        }
        sequence()
    }, [])

    return (
        <div className="w-full h-full bg-slate-950 rounded-xl overflow-hidden relative font-sans select-none border border-slate-800 shadow-2xl">
            {/* Mock Browser Header */}
            <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                <div className="ml-4 h-5 px-3 rounded-md bg-slate-800 text-[10px] text-slate-400 flex items-center w-64 border border-slate-700/50">
                    londoolink.ai/dashboard
                </div>
            </div>

            {/* Content Area */}
            <div className="p-6 h-[calc(100%-2rem)] flex gap-6">

                {/* Sidebar */}
                <div className="w-48 hidden md:flex flex-col gap-3 py-2 border-r border-dashed border-slate-800/50 pr-6">
                    <div className="h-8 w-24 bg-slate-800/50 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-slate-800/30 rounded mt-4" />
                    <div className="h-4 w-28 bg-slate-800/30 rounded" />
                    <div className="h-4 w-36 bg-slate-800/30 rounded" />
                </div>

                {/* Main View */}
                <div className="flex-1 flex flex-col relative">

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col gap-4 mt-8">
                        {/* AI Greeting */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4 items-start max-w-[80%]"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                            </div>
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-sm text-slate-300">
                                System ready. How can I help you optimize your workflow today?
                            </div>
                        </motion.div>

                        {/* User Query */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 10 }}
                            className="flex gap-4 items-center self-end max-w-[80%] flex-row-reverse"
                        >
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                                <div className="w-4 h-4 bg-secondary rounded-full" />
                            </div>
                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tr-none text-sm text-primary-foreground/90">
                                <Typewriter text="Analyze last month's meeting efficiency." start={step === 2} />
                            </div>
                        </motion.div>

                        {/* AI Response Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: step >= 3 ? 1 : 0, scale: step >= 3 ? 1 : 0.95 }}
                            className="mt-4"
                        >
                            {step === 3 && (
                                <div className="flex items-center gap-2 text-slate-500 text-sm ml-12">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Processing context...
                                </div>
                            )}

                            {step >= 4 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="ml-12 bg-slate-900/50 border border-slate-800 p-6 rounded-xl w-full max-w-md backdrop-blur-sm"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-semibold text-slate-200">Efficiency Report</h4>
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex gap-2 items-end h-32 pb-2 border-b border-slate-800">
                                        <motion.div initial={{ height: 0 }} animate={{ height: "60%" }} className="flex-1 bg-slate-800 rounded-t hover:bg-primary/50 transition-colors" />
                                        <motion.div initial={{ height: 0 }} animate={{ height: "80%" }} className="flex-1 bg-slate-800 rounded-t hover:bg-primary/50 transition-colors" />
                                        <motion.div initial={{ height: 0 }} animate={{ height: "40%" }} className="flex-1 bg-primary rounded-t shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                                        <motion.div initial={{ height: 0 }} animate={{ height: "70%" }} className="flex-1 bg-slate-800 rounded-t hover:bg-primary/50 transition-colors" />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                                        <span className="text-red-400 font-medium">+15%</span> time spent in redundant meetings. Suggest moving "Standup" to async.
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    {/* Input Bar */}
                    <div className="h-14 bg-slate-900 border-t border-slate-800 flex items-center px-4 gap-3 mt-auto absolute bottom-0 left-0 right-0">
                        <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center">
                            <span className="text-xs text-slate-500">+</span>
                        </div>
                        <div className="flex-1 h-2 bg-slate-800/30 rounded-full" />
                        <Send className={cn("w-4 h-4 transition-colors", step >= 2 ? "text-primary" : "text-slate-600")} />
                    </div>

                    {/* Cursor Animation */}
                    <motion.div
                        className="absolute z-50 pointer-events-none drop-shadow-xl"
                        animate={{
                            x: step === 0 ? "50%" : step === 1 ? "80%" : step === 2 ? "90%" : "20%",
                            y: step === 0 ? "80%" : step === 1 ? "90%" : step === 2 ? "90%" : "30%",
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                    >
                        <MousePointer2 className="w-6 h-6 fill-white text-black" />
                    </motion.div>

                </div>
            </div>
        </div>
    )
}

function Typewriter({ text, start }: { text: string, start: boolean }) {
    const [displayed, setDisplayed] = useState("")

    useEffect(() => {
        if (!start) {
            setDisplayed("")
            return
        }

        let i = 0
        const interval = setInterval(() => {
            setDisplayed(text.substring(0, i))
            i++
            if (i > text.length) clearInterval(interval)
        }, 50)

        return () => clearInterval(interval)
    }, [start, text])

    return <span>{displayed}{start && displayed.length < text.length && <span className="animate-pulse">|</span>}</span>
}
