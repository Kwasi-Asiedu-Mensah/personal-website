"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Z } from "@/lib/z-index";

type Props = { onClose: () => void };

export default function AboutThisMac({ onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center"
        style={{ zIndex: Z.popover }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.4)" }} />

        {/* Dialog */}
        <motion.div
          className="relative rounded-[14px] overflow-hidden shadow-2xl"
          style={{ width: 380, background: "var(--window-bg)", border: "1px solid var(--window-border)" }}
          initial={{ scale: 0.88, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 12 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top section — macOS brand */}
          <div
            className="flex flex-col items-center pt-8 pb-6 px-8"
            style={{ background: "var(--titlebar-bg)", borderBottom: "1px solid var(--window-divider)" }}
          >
            {/* macOS icon */}
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" className="mb-3">
              <rect width="72" height="72" rx="16" fill="url(#mac_grad)"/>
              <defs>
                <linearGradient id="mac_grad" x1="0" y1="0" x2="72" y2="72" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4facfe"/>
                  <stop offset="100%" stopColor="#00f2fe"/>
                </linearGradient>
              </defs>
              {/* Apple logo path */}
              <path d="M44.5 24.5c1.8-2.2 3-5.2 2.7-8.2-2.6.1-5.7 1.7-7.6 3.9-1.7 1.9-3.1 5-2.7 7.9 2.9.2 5.8-1.5 7.6-3.6zM47.2 29c-4.2-.2-7.7 2.4-9.7 2.4-2 0-5-2.3-8.3-2.2-4.3.1-8.2 2.5-10.4 6.3-4.5 7.7-1.2 19.2 3.2 25.5 2.1 3.1 4.7 6.5 8 6.4 3.2-.1 4.4-2.1 8.3-2.1 3.9 0 5 2.1 8.3 2 3.4-.1 5.6-3.1 7.7-6.2 2.4-3.5 3.4-6.9 3.5-7.1-.1 0-6.7-2.6-6.7-10.3 0-6.5 5.3-9.5 5.6-9.7-3.1-4.5-7.8-5-9.5-5z" fill="white" opacity="0.95"/>
            </svg>
            <div className="text-[20px] font-semibold" style={{ color: "var(--window-text)" }}>macOS Sequoia</div>
            <div className="text-[13px] mt-0.5" style={{ color: "var(--window-text-muted)" }}>Version 15.4.1</div>
          </div>

          {/* Specs */}
          <div className="px-8 py-5 space-y-3">
            {[
              { label: "Chip", value: "Apple M3 Pro" },
              { label: "Memory", value: "24 GB" },
              { label: "Storage", value: "412 GB of 1 TB used" },
              { label: "Serial Number", value: "C02XG2JVJGH5" },
              { label: "User", value: "Kwasi Asiedu-Mensah" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-[13px]">
                <span style={{ color: "var(--window-text-muted)" }}>{label}</span>
                <span style={{ color: "var(--window-text)" }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Close button */}
          <div className="px-8 pb-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-1.5 rounded-md text-[13px] font-medium"
              style={{ background: "var(--row-hover)", color: "var(--window-text)", border: "1px solid var(--window-divider)" }}
            >
              OK
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
