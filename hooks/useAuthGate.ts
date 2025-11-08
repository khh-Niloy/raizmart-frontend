"use client";

import { useUserInfoQuery } from "@/app/redux/features/auth/auth.api";
import { useCallback } from "react";

/**
 * Simple global auth gate utilities.
 * - openAuth: closes any open dialogs and opens the AuthModal (via window events)
 * - requireAuth: returns true if authenticated; otherwise opens AuthModal and returns false
 */
export function useAuthGate() {
  const { data: userInfo } = useUserInfoQuery(undefined);

  const openAuth = useCallback(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("dialog:closeAll"));
    window.dispatchEvent(new CustomEvent("auth:open"));
  }, []);

  const requireAuth = useCallback(() => {
    const isAuthed = Boolean(userInfo);
    if (!isAuthed) {
      openAuth();
      return false;
    }
    return true;
  }, [userInfo, openAuth]);

  return { userInfo, openAuth, requireAuth };
}


