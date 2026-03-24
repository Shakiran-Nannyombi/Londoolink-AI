"use client"

import Spline from '@splinetool/react-spline'
import { useState } from 'react'

interface SplineSceneProps {
    scene: string
    className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div className={`relative w-full h-full ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
            )}
            <Spline
                scene={scene}
                onLoad={() => setIsLoading(false)}
                className="w-full h-full"
            />
        </div>
    )
}
