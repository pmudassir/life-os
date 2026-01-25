'use client'

import { motion } from 'framer-motion'


export const FadeIn = ({ children, className, delay = 0 }: { children: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay 
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export const StaggerContainer = ({ children, className, staggerDelay = 0.1 }: { children: React.ReactNode, className?: string, staggerDelay?: number }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export const StaggerItem = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 260,
          damping: 20
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
)

export const ScaleIn = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ 
      type: "spring",
      stiffness: 260,
      damping: 20
    }}
    className={className}
  >
    {children}
  </motion.div>
)
