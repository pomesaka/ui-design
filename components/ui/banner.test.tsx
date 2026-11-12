import { afterEach, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AnnouncerProvider, useAnnounce } from "./announcer";
import { Banner } from "./banner";

afterEach(cleanup);

test("a banner without onDismiss cannot be closed; with it, the close button is named", () => {
  const onDismiss = mock();
  const { rerender } = render(<Banner tone="error" title="保存できませんでした" />);
  expect(screen.queryByRole("button")).toBeNull();
  rerender(<Banner tone="success" title="招待しました" onDismiss={onDismiss} />);
  fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

function Trigger({ message, assertive = false }: { message: string; assertive?: boolean }) {
  const announce = useAnnounce();
  return <button type="button" onClick={() => announce(message, { priority: assertive ? "assertive" : "polite" })}>go</button>;
}

test("announcements land in the live region that exists before the change, even when repeated", async () => {
  render(
    <AnnouncerProvider>
      <Trigger message="保存しました" />
    </AnnouncerProvider>,
  );
  const status = screen.getByRole("status");
  expect(status.textContent).toBe("");
  for (let i = 0; i < 2; i++) {
    fireEvent.click(screen.getByRole("button"));
    expect(status.textContent).toBe("");
    await act(() => new Promise((resolve) => setTimeout(resolve, 80)));
    expect(status.textContent).toBe("保存しました");
  }
  expect(screen.getByRole("alert").textContent).toBe("");
});

test("useAnnounce outside the provider fails loudly", () => {
  const spy = mock();
  const original = console.error;
  console.error = spy;
  expect(() => render(<Trigger message="x" />)).toThrow("AnnouncerProvider");
  console.error = original;
});
