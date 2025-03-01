// lib/clerk.tsx
import { ClerkProvider } from '@clerk/nextjs'
import React from 'react'

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
    >
      {children}
    </ClerkProvider>
  )
}