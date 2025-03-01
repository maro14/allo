import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-full max-w-md">
        <SignIn 
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
};

export default SignInPage;