"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
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

const firebaseConfig = {
  apiKey: "AIzaSyBnTpglZ_7KnlZxDb30aRKMikHBzb6rzF4",
  authDomain: "biblioangola.firebaseapp.com",
  projectId: "biblioangola",
  storageBucket: "biblioangola.appspot.com",
  messagingSenderId: "965265307414",
  appId: "1:965265307414:web:c32050e53982f9d8f70237",
  measurementId: "G-31QQ4L2L27",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // ✅ Automatically redirect if already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const email = user.email || "";
        const allowedAdmins = [
          "neokudilonga@gmail.com",
          "anaruimelo@gmail.com",
          "ramanimahaveer4@gmail.com"
          // "joaonfmelo@gmail.com",
        ];
        if (allowedAdmins.includes(email)) {
          const idToken = await user.getIdToken();
          await handleLoginSuccess(idToken);
        } else {
          toast({
            title: "Access Denied",
            description: "You are not an admin.",
            variant: "destructive",
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLoginSuccess = async (idToken: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (response.ok) {
        router.push("/admin");
      } else {
        const errorData = await response.json().catch(() => ({
          error: "An unknown server error occurred.",
        }));
        toast({
          title: "Login Failed",
          description: errorData.error || "Server error occurred.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      console.error("Login API call failed:", error);
      toast({
        title: "Login Failed",
        description: "Could not reach the login service.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const email = userCredential.user.email;

      const allowedAdmins = [
        "neokudilonga@gmail.com",
        "anaruimelo@gmail.com",
        // "joaonfmelo@gmail.com",
        "ramanimahaveer4@gmail.com"
      ];

      if (!allowedAdmins.includes(email || "")) {
        toast({
          title: "Access Denied",
          description: "You are not an admin.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const idToken = await userCredential.user.getIdToken();
      await handleLoginSuccess(idToken);
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      if (error.code !== "auth/popup-closed-by-user") {
        toast({
          title: "Login Failed",
          description: error.message || "Google Sign-In failed.",
          variant: "destructive",
        });
      }
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
            Sign in with Google to access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
