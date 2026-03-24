
import { motion } from "framer-motion"

export const AnimatedBackground = () => {
    // Use fixed values to avoid hydration mismatch
    const orbConfigs = [
        { width: 300, height: 250, left: 10, top: 20, x: 30, y: 40, duration: 20 },
        { width: 400, height: 350, left: 70, top: 10, x: -20, y: 30, duration: 25 },
        { width: 250, height: 300, left: 30, top: 60, x: 40, y: -25, duration: 18 },
        { width: 350, height: 280, left: 80, top: 40, x: -30, y: 35, duration: 22 },
        { width: 280, height: 320, left: 50, top: 80, x: 25, y: -40, duration: 19 },
    ]

    const particleConfigs = Array.from({ length: 20 }, (_, i) => ({
        left: (i * 5.26) % 100, // Distribute evenly
        top: (i * 3.14) % 100,
        duration: 5 + (i % 3),
        delay: i * 0.25,
    }))

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating orbs */}
            {orbConfigs.map((config, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full blur-3xl opacity-20"
                    style={{
                        width: config.width,
                        height: config.height,
                        left: `${config.left}%`,
                        top: `${config.top}%`,
                        background: i % 3 === 0 ? "var(--primary)" : i % 3 === 1 ? "var(--secondary)" : "var(--accent)",
                    }}
                    animate={{
                        x: [0, config.x, 0],
                        y: [0, config.y, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: config.duration,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Floating particles */}
            {particleConfigs.map((config, i) => (
                <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 bg-primary/30 rounded-full"
                    style={{
                        left: `${config.left}%`,
                        top: `${config.top}%`,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: config.duration,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: config.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}
