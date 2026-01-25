"use client";
import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  showRadialGradient?: boolean;
  colorStops?: string[];
  speed?: number;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  colorStops = ["#3b82f6", "#6366f1", "#8b5cf6"],
  speed = 1.0,
  ...props
}: AuroraBackgroundProps) => {
  // Construct the gradient from colorStops
  const gradient = `repeating-linear-gradient(100deg, ${colorStops[0]} 10%, ${colorStops[1]} 15%, ${colorStops[2]} 20%, ${colorStops[2]} 25%, ${colorStops[0]} 30%)`;
  
  // Calculate duration based on speed. speed 1.0 = 60s. speed 0.5 = 120s.
  const duration = `${60 / speed}s`;

  return (
    <div
      className={cn(
        "relative flex flex-col h-full w-full bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          style={{
            "--aurora-gradient": gradient,
            "--aurora-duration": duration,
          } as React.CSSProperties}
          className={cn(
            `
            [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
            [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
            
            [background-image:var(--white-gradient),var(--aurora-gradient)]
            dark:[background-image:var(--dark-gradient),var(--aurora-gradient)]
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0
            
            after:content-[""] after:absolute after:inset-0 
            after:[background-image:var(--white-gradient),var(--aurora-gradient)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora-gradient)]
            after:[background-size:200%,_100%] 
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            after:[animation-duration:var(--aurora-duration)]
            
            absolute -inset-[10px] opacity-50 will-change-transform
            motion-reduce:hidden`,

            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        ></div>
        
        {/* Fallback for reduced motion */}
        <div 
          className="hidden motion-reduce:block absolute inset-0 opacity-50"
          style={{
            background: `linear-gradient(to bottom right, ${colorStops[0]}, ${colorStops[1]}, ${colorStops[2]})`
          }}
        ></div>
      </div>
      {children}
    </div>
  );
};
