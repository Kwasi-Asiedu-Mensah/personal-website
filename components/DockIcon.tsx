"use client";

import {
  motion,
  useSpring,
  useTransform,
  useAnimation,
  type MotionValue,
} from "framer-motion";
import { useRef, useState } from "react";

const BASE_SIZE = 48;
const MAX_SCALE = 1.4; // 48 * 1.4 = ~67px

type Props = {
  label: string;
  active?: boolean;
  open?: boolean;
  minimized?: boolean;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  children: React.ReactNode;
};

export default function DockIcon({
  label,
  active,
  open,
  minimized,
  onClick,
  mouseX,
  children,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const bounceControls = useAnimation();

  const distance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - (rect.x + rect.width / 2);
  });

  const scaleTransform = useTransform(
    distance,
    [-130, -60, 0, 60, 130],
    [1, 1.15, MAX_SCALE, 1.15, 1]
  );
  const scale = useSpring(scaleTransform, {
    mass: 0.1,
    stiffness: 220,
    damping: 16,
  });

  return (
    <div className="relative flex flex-col items-center">
      {hovered && (
        <div className="absolute -top-9 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur text-[11px] text-white whitespace-nowrap shadow-lg pointer-events-none">
          {label}
        </div>
      )}
      <motion.button
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => {
          bounceControls.start({
            y: [0, -14, 0, -7, 0],
            transition: { duration: 0.45, times: [0, 0.3, 0.6, 0.8, 1], ease: "easeOut" },
          });
          onClick?.();
        }}
        animate={bounceControls}
        style={{
          width: BASE_SIZE,
          height: BASE_SIZE,
          scale,
          transformOrigin: "center bottom",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.35))",
          opacity: minimized ? 0.6 : 1,
        }}
        className="flex items-center justify-center bg-transparent"
        aria-label={label}
      >
        {children}
      </motion.button>
      <span
        className="mt-1 w-1 h-1 rounded-full"
        style={{
          background: active || open
            ? "rgba(255,255,255,0.85)"
            : minimized
            ? "rgba(255,255,255,0.35)"
            : "transparent",
        }}
      />
    </div>
  );
}
