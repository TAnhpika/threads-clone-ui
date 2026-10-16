import { useState, useEffect, useRef } from "react";

export function useUsernameCheck({ usernameValue, trigger, clearErrors }) {
  const [status, setStatus] = useState("idle"); // 'idle' | 'typing' | 'checking' | 'success' | 'error'
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!usernameValue) return;
    }

    if (!usernameValue) {
      setStatus("idle");
      clearErrors?.("username");
      return;
    }

    // Đang gõ: hiện tick xanh nếu hợp lệ hoặc chờ kiểm tra
    setStatus("typing");

    const timer = setTimeout(async () => {
      // Dừng gõ đủ 800ms: bắt đầu check và xoay spinner
      setStatus("checking");
      const [isValid] = await Promise.all([
        trigger?.("username"),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);
      setStatus(isValid ? "success" : "error");
    }, 800);

    return () => clearTimeout(timer);
  }, [usernameValue, trigger, clearErrors]);

  const handleBlur = async () => {
    if (!usernameValue) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const [isValid] = await Promise.all([
      trigger?.("username"),
      new Promise((resolve) => setTimeout(resolve, 350)),
    ]);
    setStatus(isValid ? "success" : "error");
  };

  const resetStatus = () => {
    setStatus("idle");
  };

  return {
    status,
    setStatus,
    handleBlur,
    resetStatus,
  };
}

export default useUsernameCheck;
