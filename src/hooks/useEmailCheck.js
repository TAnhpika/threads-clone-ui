import { useState, useEffect, useRef } from "react";

export function useEmailCheck({ emailValue, trigger, clearErrors }) {
  const [status, setStatus] = useState("idle"); // 'idle' | 'typing' | 'checking' | 'success' | 'error'
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!emailValue) return;
    }

    if (!emailValue) {
      setStatus("idle");
      clearErrors?.("email");
      return;
    }

    // Đang gõ: hiện tick xanh
    setStatus("typing");

    const timer = setTimeout(async () => {
      // Dừng gõ đủ 800ms: bắt đầu check và xoay spinner
      setStatus("checking");
      const [isValid] = await Promise.all([
        trigger?.("email"),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);
      setStatus(isValid ? "success" : "error");
    }, 800);

    return () => clearTimeout(timer);
  }, [emailValue, trigger, clearErrors]);

  const handleBlur = async () => {
    if (!emailValue) {
      setStatus("idle");
      return;
    }
    setStatus("checking");
    const [isValid] = await Promise.all([
      trigger?.("email"),
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

export default useEmailCheck;
