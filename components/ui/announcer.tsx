import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type Announce = (message: string, options?: { priority?: "polite" | "assertive" }) => void;

const AnnounceContext = createContext<Announce | null>(null);

/**
 * Screen reader announcements without visual UI. Live regions only speak
 * changes made after they exist, so the provider renders both regions once,
 * near the root, and messages are written into them.
 */
export function AnnouncerProvider({ children }: { children: ReactNode }) {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");
  const timers = useRef<Partial<Record<"polite" | "assertive", ReturnType<typeof setTimeout>>>>({});

  const announce = useCallback<Announce>((message, { priority = "polite" } = {}) => {
    const set = priority === "assertive" ? setAssertive : setPolite;
    // Clear first so repeating the same message is announced again.
    set("");
    clearTimeout(timers.current[priority]);
    timers.current[priority] = setTimeout(() => set(message), 50);
  }, []);

  return (
    <AnnounceContext value={announce}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{polite}</div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{assertive}</div>
    </AnnounceContext>
  );
}

/**
 * Tell assistive technology the result of an action. Use it when the result
 * is visible on screen (the edited text, a removed row) and needs no extra
 * visual message, and alongside a Banner or Notice that appears after an
 * action. "assertive" interrupts: keep it for failures that block the task.
 */
export function useAnnounce(): Announce {
  const announce = useContext(AnnounceContext);
  if (!announce) throw new Error("useAnnounce needs an AnnouncerProvider above it");
  return announce;
}
