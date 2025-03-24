import { ClerkAuthProvider } from '../lib/clerk';
import { ReactQueryProvider } from '../lib/react-query';
import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkAuthProvider>
      <ReactQueryProvider>
        <Component {...pageProps} />
      </ReactQueryProvider>
    </ClerkAuthProvider>
  );
}

export default MyApp;
