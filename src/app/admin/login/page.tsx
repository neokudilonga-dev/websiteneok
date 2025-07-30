
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from "firebase/auth";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const firebaseConfig = {
  apiKey: "AIzaSyBnTpglZ_7KnlZxDb30aRKMikHBzb6rzF4",
  authDomain: "biblioangola.firebaseapp.com",
  projectId: "biblioangola",
  storageBucket: "biblioangola.appspot.com",
  messagingSenderId: "965265307414",
  appId: "1:965265307414:web:c32050e53982f9d8f70237",
  measurementId: "G-31QQ4L2L27"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLoginSuccess = async (idToken: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        // On success, redirect to the admin dashboard.
        router.push("/admin");
      } else {
        // If the server returns an error, display it.
        const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
        console.error('Server login error:', errorData);
        toast({
          title: "Login Failed",
          description: errorData.error || 'The server returned an error.',
          variant: "destructive",
        });
        setLoading(false); // Reset loading state on failure
      }
    } catch (error) {
      console.error("Failed to call login API:", error);
       toast({
        title: "Login Failed",
        description: "Could not connect to the login service. Please try again.",
        variant: "destructive",
      });
      setLoading(false); // Reset loading state on failure
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await handleLoginSuccess(idToken);
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const idToken = await userCredential.user.getIdToken();
      await handleLoginSuccess(idToken);
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
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
          <CardTitle className="pt-4 text-2xl">Admin Login</CardTitle>
          <CardDescription>
            Sign in to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign in"}
            </Button>
          </form>
          <Separator className="my-6" />
          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
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
