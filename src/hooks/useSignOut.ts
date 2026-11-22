"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/auth-fetch";

export function useSignOut() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    if (signingOut) return;

    try {
      setSigningOut(true);

      const { error } = await authClient.signOut();

      if (error) {
        toast.error(error.message || "Unable to logout.");
        return;
      }

      clearAuthToken();
      toast.success("Logged out successfully");
      router.replace("/sign-in");
      router.refresh();
    } catch {
      toast.error("Unable to logout. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return { signOut, signingOut };
}
