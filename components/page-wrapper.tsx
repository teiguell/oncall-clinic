'use client'

import { ReactNode } from 'react'

/**
 * PageWrapper — adds a page-transition fade + slide-up on mount.
 * Wrap the main content of each page.tsx with this for consistent entry motion.
 */
export function PageWrapper({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>
}
