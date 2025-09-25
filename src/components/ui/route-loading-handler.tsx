"use client";
import { useEffect } from "react";
import { useData } from "@/context/data-context";

export default function RouteLoadingHandler() {
  const { setLoading } = useData();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleStop = () => setLoading(false);

    const onStart = () => handleStart();
    const onStop = () => handleStop();

    window.addEventListener("next:router:loading", onStart);
    window.addEventListener("next:router:loaded", onStop);

    return () => {
      window.removeEventListener("next:router:loading", onStart);
      window.removeEventListener("next:router:loaded", onStop);
    };
  }, [setLoading]);

  return null;
}
