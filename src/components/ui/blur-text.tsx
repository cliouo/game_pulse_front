import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"

interface BlurTextProps {
  text: string
  className?: string
  variant?: {
    hidden: { filter: string; opacity: number; transform: string }
    visible: { filter: string; opacity: number; transform: string }
  }
  duration?: number
  delay?: number
  animateBy?: "words" | "letters"
  direction?: "top" | "bottom"
}

export const BlurText = ({
  text,
  className,
  variant,
  duration = 1,
  delay = 0.2,
  animateBy = "words",
  direction = "top",
}: BlurTextProps) => {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { once: true })

  const defaultVariants = {
    hidden: { filter: "blur(10px)", opacity: 0, transform: direction === 'top' ? 'translate3d(0,-50px,0)' : 'translate3d(0,50px,0)' },
    visible: { filter: "blur(0px)", opacity: 1, transform: 'translate3d(0,0,0)' },
  }

  const combinedVariants = variant || defaultVariants
  const safeText = typeof text === "string" ? text : String(text)
  const items = animateBy === "words" ? safeText.split(" ") : safeText.split("")

  if (shouldReduceMotion) {
      return <span className={className}>{safeText}</span>
  }

  return (
    <span ref={ref} className={cn("inline-flex flex-wrap", className)}>
      {items.map((item, index) => (
        <motion.span
          key={index}
          className="inline-block"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={combinedVariants}
          transition={{
            duration: duration,
            delay: delay + index * 0.1,
            ease: "easeOut",
          }}
        >
          {item}{animateBy === "words" && index < items.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  )
}
