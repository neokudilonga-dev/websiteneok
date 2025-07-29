
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
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

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const provider = new GoogleAuthProvider();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
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
          <NeokudilongaLogo className="mx-auto h-20" />
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
