"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type KonamiModeContextValue = {
  active: boolean;
  countdown: number;
  activate: () => void;
  deactivate: () => void;
};

const DURATION_SECONDS = 30;
const KonamiModeContext = createContext<KonamiModeContextValue | null>(null);

export function KonamiProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(DURATION_SECONDS);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const deactivate = useCallback(() => {
    clearTimer();
    setActive(false);
    setCountdown(DURATION_SECONDS);
    document.documentElement.classList.remove("konami-active");
    document.documentElement.removeAttribute("data-theme");
  }, [clearTimer]);

  const activate = useCallback(() => {
    clearTimer();
    setActive(true);
    setCountdown(DURATION_SECONDS);
    document.documentElement.classList.add("konami-active");
    document.documentElement.dataset.theme = "konami";

    intervalRef.current = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          deactivate();
          return DURATION_SECONDS;
        }

        return current - 1;
      });
    }, 1000);
  }, [clearTimer, deactivate]);

  useEffect(() => {
    return () => {
      clearTimer();
      document.documentElement.classList.remove("konami-active");
      document.documentElement.removeAttribute("data-theme");
    };
  }, [clearTimer]);

  const value = useMemo(
    () => ({ active, countdown, activate, deactivate }),
    [active, activate, countdown, deactivate]
  );

  return <KonamiModeContext.Provider value={value}>{children}</KonamiModeContext.Provider>;
}

export function useKonamiMode() {
  const context = useContext(KonamiModeContext);

  if (!context) {
    throw new Error("useKonamiMode must be used inside KonamiProvider");
  }

  return context;
}
