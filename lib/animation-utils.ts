"use client"

import type { Variants } from "framer-motion"

// Fade in animation
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
}

// Slide up animation
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

// Slide in from left animation
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

// Slide in from right animation
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

// Scale up animation
export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
}

// Staggered children animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Pulse animation
export const pulse: Variants = {
  hidden: { scale: 1 },
  visible: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    },
  },
}

// Typing indicator animation
export const typingIndicator: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

export const typingDot: Variants = {
  hidden: { opacity: 0.3, y: 0 },
  visible: {
    opacity: 1,
    y: [0, -5, 0],
    transition: {
      duration: 0.6,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    },
  },
}

// Futuristic glow effect
export const glowEffect: Variants = {
  hidden: {
    boxShadow: "0 0 0 rgba(66, 153, 225, 0)",
  },
  visible: {
    boxShadow: [
      "0 0 5px rgba(66, 153, 225, 0.3)",
      "0 0 20px rgba(66, 153, 225, 0.5)",
      "0 0 5px rgba(66, 153, 225, 0.3)",
    ],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    },
  },
}

// Futuristic border animation
export const borderAnimation: Variants = {
  hidden: {
    backgroundPosition: "0% 0%",
  },
  visible: {
    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
    transition: {
      duration: 5,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
    },
  },
}

