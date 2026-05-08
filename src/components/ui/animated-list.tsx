"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";

export function AnimatedList({
  className,
  children,
  delay = 1000,
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const [index, setIndex] = useState(0);
  const childrenArray = React.Children.toArray(children);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev < childrenArray.length ? prev + 1 : prev));
    }, delay);

    return () => clearInterval(interval);
  }, [childrenArray.length, delay]);

  const itemsToShow = useMemo(
    () => childrenArray.slice(0, index + 1),
    [index, childrenArray]
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <AnimatePresence mode="popLayout">
        {itemsToShow.map((item, itemIndex) => {
          const itemKey =
            React.isValidElement(item) && item.key != null
              ? item.key
              : `item-${itemIndex}`;

          return <AnimatedListItem key={itemKey}>{item}</AnimatedListItem>;
        })}
      </AnimatePresence>
    </div>
  );
}

function AnimatedListItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, originY: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 40 }}
      layout
    >
      {children}
    </motion.div>
  );
}
