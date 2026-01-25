import React, { useRef, useState } from "react";
import { motion, useReducedMotion, type Transition } from "framer-motion";

interface MagnetProps {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: Transition;
  inactiveTransition?: Transition;
  wrapperClassName?: string;
  innerClassName?: string;
}

const Magnet = ({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = { type: "spring", stiffness: 400, damping: 30 },
  inactiveTransition = { type: "spring", stiffness: 400, damping: 30 },
  wrapperClassName = "",
  innerClassName = "",
}: MagnetProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || shouldReduceMotion || !ref.current) return;

    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();

    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    setPosition({ x: middleX / magnetStrength, y: middleY / magnetStrength });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <div
      className={wrapperClassName}
      style={{ position: "relative", padding: padding }}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
    >
      <motion.div
        className={innerClassName}
        ref={ref}
        animate={{ x, y }}
        transition={
          x === 0 && y === 0 ? inactiveTransition : activeTransition
        }
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Magnet;
