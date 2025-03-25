import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const { isSignedIn } = useAuth();

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-[family-name:var(--font-geist-sans)] bg-gray-50 dark:bg-gray-900`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Allo
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mb-8">
            A minimal Kanban board for organizing tasks and boosting productivity
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="default" variant="default" className="px-6">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <Button size="default" variant="default" className="px-6">
                    Sign Up
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button variant="outline" size="default" className="px-6">
                    Sign In
                  </Button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-2">Organize</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Create boards and columns to organize your work efficiently.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-2">Collaborate</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Work together with your team on shared boards.</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-md border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-medium mb-2">Track</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Visualize workflow and track progress with intuitive boards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
