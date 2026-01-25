import { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className,
  startOnView = true,
  separator = "",
  onStart,
  onEnd,
}: {
  to: number;
  from?: number;
  direction?: "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  startOnView?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);
  const shouldReduceMotion = useReducedMotion();

  const effectiveTo = direction === "down" ? from : to;

  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (startOnView && !isInView) return;

    if (shouldReduceMotion) {
        motionValue.set(effectiveTo);
        return;
    }

    onStart?.();

    const controls = animate(motionValue, effectiveTo, {
      delay: delay,
      duration: duration,
      onComplete: onEnd,
      ease: "easeOut",
    });

    return controls.stop;
  }, [isInView, startOnView, motionValue, effectiveTo, delay, duration, onStart, onEnd, shouldReduceMotion]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (ref.current) {
        const value = Math.round(latest);
        const formatted = separator 
            ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator) 
            : value.toString();
        ref.current.textContent = formatted;
      }
    });
    
    // Initialize content
    const initial = Math.round(motionValue.get());
    const formatted = separator 
            ? initial.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator) 
            : initial.toString();
    if (ref.current) ref.current.textContent = formatted;

    return unsubscribe;
  }, [motionValue, separator]);

  return <span className={cn(className)} ref={ref} />;
}