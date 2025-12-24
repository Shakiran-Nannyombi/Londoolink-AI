
import { motion } from "framer-motion"

const cardHoverVariants = {
    rest: { scale: 1 },
    hover: {
        scale: 1.02,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 10,
        },
    },
}

export function GlassCard({ children, className = "", ...props }: any) {
    return (
        <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
            className={`glass-card rounded-xl p-6 ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    )
}
