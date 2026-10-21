import { useState, useCallback } from "react";

export const LAST_LOGIN_STORAGE_KEY = "threads_last_login_account";
export const LAST_USERNAME_KEY = "threads_last_username";

/**
 * Đọc tài khoản đã lưu từ localStorage (nếu có)
 */
export function readStoredAccount() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LAST_LOGIN_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && (parsed.identifier || parsed.username)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse last login account:", e);
  }
  return null;
}

/**
 * Đọc username của lần đăng nhập gần nhất
 */
export function readLastUsername() {
  if (typeof window === "undefined") return null;
  try {
    const stored = readStoredAccount();
    if (stored?.username) return stored.username;
    if (stored?.identifier) return stored.identifier;
    if (stored?.name) return stored.name;

    const username =
      localStorage.getItem(LAST_USERNAME_KEY) ||
      localStorage.getItem("last_username");
    if (username) return username;
  } catch (e) {
    console.error("Failed to read last username:", e);
  }
  return null;
}

/**
 * Custom Hook quản lý tài khoản đăng nhập gần nhất
 * Dùng chung cho LoginPage, SignUpToPostModal và Auth Flows
 */
export default function useLastLoginAccount() {
  const [savedAccount, setSavedAccount] = useState(() => readStoredAccount());

  const lastUsername =
    savedAccount?.username || savedAccount?.identifier || readLastUsername();
  const hasLoggedInBefore = Boolean(
    lastUsername || (savedAccount?.identifier || savedAccount?.username)
  );

  const saveAccount = useCallback((accountData) => {
    if (typeof window === "undefined") return;
    try {
      const existing = readStoredAccount() || {};
      const updated = {
        ...existing,
        ...accountData,
      };
      localStorage.setItem(LAST_LOGIN_STORAGE_KEY, JSON.stringify(updated));
      const targetUsername = updated.username || updated.identifier;
      if (targetUsername) {
        localStorage.setItem(LAST_USERNAME_KEY, targetUsername);
      }
      setSavedAccount(updated);
    } catch (err) {
      console.error("Failed to save account to localStorage:", err);
    }
  }, []);

  const clearAccount = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(LAST_LOGIN_STORAGE_KEY);
      localStorage.removeItem(LAST_USERNAME_KEY);
      localStorage.removeItem("last_username");
      setSavedAccount(null);
    } catch (err) {
      console.error("Failed to clear account from localStorage:", err);
    }
  }, []);

  const refresh = useCallback(() => {
    setSavedAccount(readStoredAccount());
  }, []);

  return {
    savedAccount,
    lastUsername,
    hasLoggedInBefore,
    saveAccount,
    clearAccount,
    refresh,
  };
}
