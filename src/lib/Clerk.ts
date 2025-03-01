// lib/clerk.ts
import { ClerkProvider } from '@clerk/nextjs'
import { useRouter } from 'next/router'

export const ClerkAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      navigate={(to) => router.push(to)}
    >
      {children}
    </ClerkProvider>
  )
}