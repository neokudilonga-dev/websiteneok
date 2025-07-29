
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { NeokudilongaLogo } from "@/components/logo";

// Define the config object structure
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize app and auth inside the component or a function that runs on the client
const getClientAuth = () => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    return getAuth(app);
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const auth = getClientAuth(); // Get auth instance here
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during Google Sign-In. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <NeokudilongaLogo className="h-20" />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in with your Google account to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGoogleSignIn} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign in with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
