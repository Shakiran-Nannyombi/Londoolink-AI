"use client"

import React from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background relative flex overflow-hidden transition-colors duration-300">

            {/* Sidebar Navigation */}
            <Sidebar />

            <div className="flex-1 relative flex flex-col h-screen overflow-hidden">
                {/* Background gradients */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex-1 overflow-y-auto p-6 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
