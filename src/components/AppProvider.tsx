"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { round2 } from "@/lib/format";

const STORAGE_KEY = "donutup.state.v1";
const START_BALANCE = 5000;
const DAILY_AMOUNT = 250;
const DAILY_COOLDOWN = 60_000;
const TOP_UP_AMOUNT = 1000;

export type ToastTone = "info" | "win" | "loss" | "gold";
export type TxKind = "deposit" | "withdraw" | "bet" | "payout" | "bonus" | "topup" | "rakeback";
export type AuthMode = "signin" | "register";

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

export interface Transaction {
  id: string;
  kind: TxKind;
  amount: number;
  label: string;
  ts: number;
}

export interface User {
  name: string;
  since: number;
}

export interface Stats {
  bets: number;
  wagered: number;
  won: number;
  biggestWin: number;
}

interface PersistedState {
  balance: number;
  user: User | null;
  transactions: Transaction[];
  stats: Stats;
  lastDaily: number;
  lastRake: number;
  wageredSinceRake: number;
}

const INITIAL_STATE: PersistedState = {
  balance: START_BALANCE,
  user: null,
  transactions: [],
  stats: { bets: 0, wagered: 0, won: 0, biggestWin: 0 },
  lastDaily: 0,
  lastRake: 0,
  wageredSinceRake: 0,
};

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function addTransaction(list: Transaction[], tx: Omit<Transaction, "id" | "ts">): Transaction[] {
  return [{ ...tx, id: makeId(), ts: Date.now() }, ...list].slice(0, 60);
}

interface AppContextValue {
  balance: number;
  user: User | null;
  transactions: Transaction[];
  stats: Stats;
  hydrated: boolean;
  toasts: Toast[];
  authMode: AuthMode | null;
  chatOpen: boolean;
  dailyAmount: number;
  dailyCooldown: number;
  dailyReadyAt: number;
  rakeback: number;
  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
  bet: (amount: number, game: string) => boolean;
  payout: (amount: number, game: string, label?: string) => void;
  tip: (amount: number, label?: string) => boolean;
  deposit: (amount: number) => boolean;
  withdraw: (amount: number) => boolean;
  topUp: () => void;
  claimDaily: () => { ok: boolean; wait: number };
  claimRakeback: () => { ok: boolean; amount: number };
  signIn: (name: string) => void;
  signOut: () => void;
  resetAccount: () => void;
  openAuth: (mode: AuthMode) => void;
  closeAuth: () => void;
  setChatOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(INITIAL_STATE);
  const stateRef = useRef<PersistedState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const commit = useCallback((updater: (current: PersistedState) => PersistedState) => {
    const next = updater(stateRef.current);
    stateRef.current = next;
    setState(next);
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        if (typeof parsed.balance === "number" && Number.isFinite(parsed.balance)) {
          const next: PersistedState = {
            ...INITIAL_STATE,
            ...parsed,
            balance: round2(Math.max(0, parsed.balance)),
            stats: { ...INITIAL_STATE.stats, ...(parsed.stats ?? {}) },
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
            user: parsed.user ?? null,
          };
          stateRef.current = next;
          setState(next);
        }
      }
    } catch {
      /* corrupted or unavailable storage — keep the fresh account */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [hydrated, state]);

  const pushToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = makeId();
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3400);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const bet = useCallback(
    (amount: number, game: string) => {
      const value = round2(amount);
      const current = stateRef.current;
      if (!Number.isFinite(value) || value <= 0 || value > current.balance) return false;
      commit((prev) => ({
        ...prev,
        balance: round2(prev.balance - value),
        stats: {
          ...prev.stats,
          bets: prev.stats.bets + 1,
          wagered: round2(prev.stats.wagered + value),
        },
        wageredSinceRake: round2(prev.wageredSinceRake + value),
        transactions: addTransaction(prev.transactions, {
          kind: "bet",
          amount: -value,
          label: game,
        }),
      }));
      return true;
    },
    [commit],
  );

  const payout = useCallback(
    (amount: number, game: string, label = "Win") => {
      const value = round2(amount);
      if (!Number.isFinite(value) || value <= 0) return;
      commit((prev) => ({
        ...prev,
        balance: round2(prev.balance + value),
        stats: {
          ...prev.stats,
          won: round2(prev.stats.won + value),
          biggestWin: Math.max(prev.stats.biggestWin, value),
        },
        transactions: addTransaction(prev.transactions, {
          kind: "payout",
          amount: value,
          label: `${game} — ${label}`,
        }),
      }));
    },
    [commit],
  );

  const deposit = useCallback(
    (amount: number) => {
      const value = round2(amount);
      if (!Number.isFinite(value) || value <= 0 || value > 1_000_000) return false;
      commit((prev) => ({
        ...prev,
        balance: round2(prev.balance + value),
        transactions: addTransaction(prev.transactions, {
          kind: "deposit",
          amount: value,
          label: "Simulated deposit",
        }),
      }));
      return true;
    },
    [commit],
  );

  const withdraw = useCallback(
    (amount: number) => {
      const value = round2(amount);
      const current = stateRef.current;
      if (!Number.isFinite(value) || value <= 0 || value > current.balance) return false;
      commit((prev) => ({
        ...prev,
        balance: round2(prev.balance - value),
        transactions: addTransaction(prev.transactions, {
          kind: "withdraw",
          amount: -value,
          label: "Simulated withdrawal",
        }),
      }));
      return true;
    },
    [commit],
  );

  const tip = useCallback(
    (amount: number, label = "Chat rain tip") => {
      const value = round2(amount);
      const current = stateRef.current;
      if (!Number.isFinite(value) || value <= 0 || value > current.balance) return false;
      commit((prev) => ({
        ...prev,
        balance: round2(prev.balance - value),
        transactions: addTransaction(prev.transactions, {
          kind: "withdraw",
          amount: -value,
          label,
        }),
      }));
      return true;
    },
    [commit],
  );

  const topUp = useCallback(() => {
    commit((prev) => ({
      ...prev,
      balance: round2(prev.balance + TOP_UP_AMOUNT),
      transactions: addTransaction(prev.transactions, {
        kind: "topup",
        amount: TOP_UP_AMOUNT,
        label: "Demo top-up",
      }),
    }));
    pushToast(`+${TOP_UP_AMOUNT.toLocaleString("en-US")} demo coins added`, "gold");
  }, [commit, pushToast]);

  const claimDaily = useCallback(() => {
    const now = Date.now();
    const current = stateRef.current;
    const elapsed = now - current.lastDaily;
    if (current.lastDaily && elapsed < DAILY_COOLDOWN) {
      return { ok: false, wait: DAILY_COOLDOWN - elapsed };
    }
    commit((prev) => ({
      ...prev,
      balance: round2(prev.balance + DAILY_AMOUNT),
      lastDaily: now,
      transactions: addTransaction(prev.transactions, {
        kind: "bonus",
        amount: DAILY_AMOUNT,
        label: "Daily bonus",
      }),
    }));
    pushToast(`Daily bonus claimed: +${DAILY_AMOUNT} demo coins`, "gold");
    return { ok: true, wait: DAILY_COOLDOWN };
  }, [commit, pushToast]);

  const claimRakeback = useCallback(() => {
    const current = stateRef.current;
    const amount = Math.floor(current.wageredSinceRake * 0.01 * 100) / 100;
    if (amount < 1) return { ok: false, amount: 0 };
    commit((prev) => ({
      ...prev,
      balance: round2(prev.balance + amount),
      wageredSinceRake: 0,
      lastRake: Date.now(),
      transactions: addTransaction(prev.transactions, {
        kind: "rakeback",
        amount,
        label: "Rakeback (1%)",
      }),
    }));
    pushToast(`Rakeback claimed: +${amount.toLocaleString("en-US")} demo coins`, "win");
    return { ok: true, amount };
  }, [commit, pushToast]);

  const signIn = useCallback(
    (name: string) => {
      const cleaned = name.trim().slice(0, 18);
      if (!cleaned) return;
      commit((prev) => ({
        ...prev,
        user: { name: cleaned, since: prev.user?.since ?? Date.now() },
      }));
      setAuthMode(null);
      pushToast(`Welcome to DonutUp, ${cleaned}!`, "win");
    },
    [commit, pushToast],
  );

  const signOut = useCallback(() => {
    commit((prev) => ({ ...prev, user: null }));
    pushToast("Signed out — your demo balance is still here.", "info");
  }, [commit, pushToast]);

  const resetAccount = useCallback(() => {
    const fresh: PersistedState = {
      ...INITIAL_STATE,
      lastDaily: 0,
      lastRake: 0,
    };
    stateRef.current = fresh;
    setState(fresh);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    pushToast("Demo account reset. Balance restored to 5,000.", "info");
  }, [pushToast]);

  const value = useMemo<AppContextValue>(
    () => ({
      balance: state.balance,
      user: state.user,
      transactions: state.transactions,
      stats: state.stats,
      hydrated,
      toasts,
      authMode,
      chatOpen,
      dailyAmount: DAILY_AMOUNT,
      dailyCooldown: DAILY_COOLDOWN,
      dailyReadyAt: state.lastDaily ? state.lastDaily + DAILY_COOLDOWN : 0,
      rakeback: Math.floor(state.wageredSinceRake * 0.01 * 100) / 100,
      pushToast,
      dismissToast,
      bet,
      payout,
      tip,
      deposit,
      withdraw,
      topUp,
      claimDaily,
      claimRakeback,
      signIn,
      signOut,
      resetAccount,
      openAuth: (mode: AuthMode) => setAuthMode(mode),
      closeAuth: () => setAuthMode(null),
      setChatOpen,
    }),
    [
      state,
      hydrated,
      toasts,
      authMode,
      chatOpen,
      pushToast,
      dismissToast,
      bet,
      payout,
      tip,
      deposit,
      withdraw,
      topUp,
      claimDaily,
      claimRakeback,
      signIn,
      signOut,
      resetAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}
