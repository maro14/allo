import { ClerkAuthProvider } from '../lib/clerk'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <ClerkAuthProvider>
      <Component {...pageProps} />
    </ClerkAuthProvider>
  )
}

export default MyApp