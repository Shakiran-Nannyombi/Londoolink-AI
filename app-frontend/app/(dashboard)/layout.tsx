"use client"

import React from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { MobileNav } from '@/components/dashboard/MobileNav'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background relative flex transition-colors duration-300">

            {/* Navigation */}
            <Sidebar className="hidden lg:flex" />

            <div className="flex-1 relative flex flex-col min-h-screen lg:h-screen lg:overflow-hidden">
                {/* Mobile Navigation */}
                <MobileNav />

                {/* Background gradients */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-linear-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-20 lg:pt-6 relative">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
