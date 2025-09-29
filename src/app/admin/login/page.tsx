"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, onAuthStateChanged, signInWithRedirect, getRedirectResult, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
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

  const handleLoginSuccess = useCallback(async (idToken: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        // Use full page navigation to ensure middleware sees the persisted cookie
        window.location.assign("/admin");
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
  }, [toast]);

  // ✅ Automatically redirect if already signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("onAuthStateChanged triggered. User:", user);
      if (user) {
        console.log("onAuthStateChanged: User is logged in.", user.email);
        const email = user.email || "";
        const allowedAdmins = [
          "neokudilonga@gmail.com",
          "anaruimelo@gmail.com",
          "joaonfmelo@gmail.com"
        ];
        if (allowedAdmins.includes(email)) {
          const idToken = await user.getIdToken();
          console.log("onAuthStateChanged: User is an allowed admin. Calling handleLoginSuccess.");
          await handleLoginSuccess(idToken);
        } else {
          console.log("onAuthStateChanged: User is not an allowed admin.");
          toast({
            title: "Access Denied",
            description: "You are not an admin.",
            variant: "destructive",
          });
        }
      } else {
        console.log("onAuthStateChanged: No user is logged in.");
      }
    });

    return () => unsubscribe();
  }, [handleLoginSuccess, toast]);

  // ✅ Process redirect result on mount to handle environments where popups are restricted
  useEffect(() => {
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        console.log("Firebase getRedirectResult result:", result); // ADDED LOG
        if (result?.user) {
          console.log("getRedirectResult: User found.", result.user.email);
          const email = result.user.email || "";
          const allowedAdmins = [
            "neokudilonga@gmail.com",
            "anaruimelo@gmail.com",
            "joaonfmelo@gmail.com"
          ];
          if (!allowedAdmins.includes(email)) {
            console.log("getRedirectResult: User is not an allowed admin.");
            toast({
              title: "Access Denied",
              description: "You are not an admin.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          const idToken = await result.user.getIdToken();
          console.log("getRedirectResult: User is an allowed admin. Calling handleLoginSuccess.");
          await handleLoginSuccess(idToken);
        } else {
          console.log("getRedirectResult: No user found.");
          setLoading(false);
        }
      } catch (error: any) {
        console.error("getRedirectResult error:", error);
        if (error.code !== "auth/no-auth-event") {
          toast({
            title: "Login Failed",
            description: error.message || "Sign-In failed.",
            variant: "destructive",
          });
        }
        setLoading(false);
      }
    })();
  }, [auth, handleLoginSuccess, toast]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    setLoading(true);
    try {
      console.log("Trying signInWithPopup...");
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        console.log("signInWithPopup: User found.", result.user.email);
        const email = result.user.email || "";
        const allowedAdmins = [
          "neokudilonga@gmail.com",
          "anaruimelo@gmail.com",
          "joaonfmelo@gmail.com"
        ];
        if (!allowedAdmins.includes(email)) {
          console.log("signInWithPopup: User is not an allowed admin.");
          toast({
            title: "Access Denied",
            description: "You are not an admin.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        const idToken = await result.user.getIdToken();
        console.log("signInWithPopup: Allowed admin. Calling handleLoginSuccess.");
        await handleLoginSuccess(idToken);
        return;
      }

      // If popup didn't yield a user, fall back to redirect
      console.log("signInWithPopup did not yield a user. Falling back to signInWithRedirect...");
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In popup error:", error);
      // Fallback to redirect for environments where popup isn't supported/blocklisted
      if (
        error?.code === "auth/operation-not-supported-in-this-environment" ||
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/popup-closed-by-user"
      ) {
        try {
          console.log("Falling back to signInWithRedirect due to popup error...");
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          console.error("Google Sign-In redirect error:", redirectError);
          if (redirectError.code !== "auth/cancelled-popup-request") {
            toast({
              title: "Login Failed",
              description: redirectError.message || "Google Sign-In failed.",
              variant: "destructive",
            });
          }
        }
      } else {
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
