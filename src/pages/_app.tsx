import { ClerkProvider, SignedIn, SignedOut } from '@clerk/nextjs'
import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { Navbar } from '@/components/layout/Navbar'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}>
      <Navbar />
      <main className="container mx-auto pt-4">
        <SignedIn>
          {/* Render content only for signed in users */}
          <Component {...pageProps} />
        </SignedIn>
        <SignedOut>
          {/* Render content only for signed out users */}
          <Component {...pageProps} />
        </SignedOut>
      </main>
    </ClerkProvider>
  )
}

export default MyApp
