import { useCallback, useState, type ReactNode } from "react";
import mappingCss from "../tailwind/tokens.css?raw";
import contractText from "../tokens/contract.json?raw";
import { parseContract, parseMapping, usedTokens } from "./token-usage";

export const contract = parseContract(contractText);
export const mapping = parseMapping(mappingCss);

const colors = new Set(contract.color ?? []);
export const isColor = (name: string) => colors.has(name);

/**
 * Tokens of the pinned specimens under an element, read from the classes the
 * real parts rendered. The list follows the parts without being written by
 * hand; popups that are closed in a specimen are not part of it.
 */
export function useAppliedTokens(): [(element: HTMLElement | null) => void, string[]] {
  const [tokens, setTokens] = useState<string[]>([]);
  const read = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    // `data-legend="skip"` marks a part placed as another part's content (a button in a list row).
    const classes = [...element.querySelectorAll("[inert] *")]
      .filter((node) => node.closest('[data-legend="skip"]') === null)
      .map((node) => node.getAttribute("class") ?? "");
    setTokens(usedTokens(classes, mapping, contract));
  }, []);
  return [read, tokens];
}

export function TokenList({ tokens }: { tokens: string[] }) {
  if (tokens.length === 0) return null;
  return (
    <ul aria-label="使うtoken" className="m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0">
      {tokens.map((name) => (
        <li key={name} className="flex items-center gap-1 font-control text-caption text-reading-secondary">
          {isColor(name) && (
            <span aria-hidden className="size-3 shrink-0 rounded-full border border-border" style={{ background: `var(--${name})` }} />
          )}
          {name}
        </li>
      ))}
    </ul>
  );
}

/** One row of specimens, named and followed on the same line by the colors it applies. */
export function Uses({ label, children }: { label: string; children: ReactNode }) {
  const [read, tokens] = useAppliedTokens();
  return (
    <div ref={read} className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-control text-caption text-foreground">{label}</span>
        <TokenList tokens={tokens.filter(isColor)} />
      </div>
      {children}
    </div>
  );
}

/** The value the surrounding theme gives a token, as the browser computed it. */
export function TokenValue({ name }: { name: string }) {
  const [value, setValue] = useState("");
  const read = useCallback(
    (element: HTMLElement | null) => {
      if (element) setValue(getComputedStyle(element).getPropertyValue(`--${name}`).trim());
    },
    [name],
  );
  return (
    <span ref={read} className="min-w-0 wrap-anywhere font-control text-caption text-reading-secondary">
      {value}
    </span>
  );
}
