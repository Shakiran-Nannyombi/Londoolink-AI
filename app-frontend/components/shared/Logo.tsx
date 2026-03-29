"use client"

interface LogoProps {
    className?: string
}

export function Logo({ className = "h-8 w-auto object-contain" }: LogoProps) {
    return (
        <>
            {/* Light mode logo — hidden in dark mode */}
            <img
                src="/logoLondo.png"
                alt="Londoolink AI"
                className={`${className} dark:hidden`}
            />
            {/* Dark mode logo — hidden in light mode */}
            <img
                src="/logoDark.png"
                alt="Londoolink AI"
                className={`${className} hidden dark:block`}
            />
        </>
    )
}
