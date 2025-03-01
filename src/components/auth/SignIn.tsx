import { useSignIn } from '@clerk/nextjs'

export const SignIn = () => {
  const { signIn, isLoaded } = useSignIn()

  return (
    <div className="flex flex-col items-center p-8">
      <h1 className="text-2xl mb-4">Sign In</h1>
      {isLoaded && (
        <form onSubmit={(e) => {
          e.preventDefault()
          signIn.create({
            identifier: (e.target as any).email.value,
            password: (e.target as any).password.value
          })
        }}>
          <input type="email" name="email" placeholder="Email" className="p-2 mb-2" />
          <input type="password" name="password" placeholder="Password" className="p-2 mb-2" />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Sign In
          </button>
        </form>
      )}
    </div>
  )
}