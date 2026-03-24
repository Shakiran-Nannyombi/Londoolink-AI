"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-white/[0.08]",
    mouseX,
    mouseY,
    parallaxFactor = 1,
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
    mouseX?: any;
    mouseY?: any;
    parallaxFactor?: number;
}) {
    // Parallax transforms - assuming mouseX/Y are motion values
    const x = useTransform(mouseX || useMotionValue(0), [0, 1], [-20 * parallaxFactor, 20 * parallaxFactor]);
    const y = useTransform(mouseY || useMotionValue(0), [0, 1], [-20 * parallaxFactor, 20 * parallaxFactor]);

    return (
        <motion.div
            style={{ x, y }}
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[2px] border-2 border-white/[0.15]",
                        "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

function HeroGeometric({
    badge = "System Online v1.0",
    title1 = "Order emerging from",
    title2 = "Chaos",
    description = "The central nervous system for your digital life. Londoolink AI is stateful infrastructure that tracks, prioritizes, and executes—so you don't have to."
}: {
    badge?: string;
    title1?: string;
    title2?: string;
    description?: string;
}) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth out the mouse movement
    const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
    const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            mouseX.set(clientX / innerWidth);
            mouseY.set(clientY / innerHeight);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.05] via-transparent to-secondary/[0.05] blur-3xl" />

            <div className="absolute inset-0 overflow-hidden opacity-40 dark:opacity-60">
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="dark:from-primary/[0.15] from-primary/[0.6]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                    mouseX={smoothX}
                    mouseY={smoothY}
                    parallaxFactor={1.5}
                />

                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="dark:from-secondary/[0.15] from-secondary/[0.6]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                    mouseX={smoothX}
                    mouseY={smoothY}
                    parallaxFactor={2}
                />

                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="dark:from-accent/[0.15] from-accent/[0.6]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                    mouseX={smoothX}
                    mouseY={smoothY}
                    parallaxFactor={1.2}
                />

                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="dark:from-primary/[0.15] from-primary/[0.6]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                    mouseX={smoothX}
                    mouseY={smoothY}
                    parallaxFactor={1.8}
                />

                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="dark:from-secondary/[0.15] from-secondary/[0.6]"
                    className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
                    mouseX={smoothX}
                    mouseY={smoothY}
                    parallaxFactor={2.5}
                />
            </div>

            <div className="relative z-10 container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Badge Removed as per user request */}

                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                {title1}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary"
                                )}
                            >
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed font-light tracking-wide max-w-2xl mx-auto px-4">
                            {description}
                        </p>
                    </motion.div>

                    <motion.div
                        custom={3}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link href="/login">
                            <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                                Initialize System <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="/how-it-works">
                            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full backdrop-blur-md border-primary/20 hover:bg-primary/10">
                                View Architecture
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none" />
        </div>
    );
}

export { HeroGeometric }
