import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/router';
import { Navbar } from '../components/layout/Navbar';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

// Create a client
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Only show navbar on home page and dashboard
  const showNavbar = router.pathname === '/' || router.pathname === '/dashboard';

  return (
    <ClerkProvider {...pageProps}>
      <QueryClientProvider client={queryClient}>
        {showNavbar && <Navbar />}
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default MyApp;
