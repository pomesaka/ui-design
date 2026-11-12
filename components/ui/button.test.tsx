import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";

afterEach(cleanup);

test("pending keeps the button focusable and labelled but ignores presses", () => {
  const onClick = mock();
  render(<Button pending onClick={onClick}>保存</Button>);
  const button = screen.getByRole("button", { name: "保存" });
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.hasAttribute("disabled")).toBe(false);
  button.focus();
  expect(document.activeElement).toBe(button);
  fireEvent.click(button);
  expect(onClick).not.toHaveBeenCalled();
});

test("disabled is a real disabled state, distinct from pending", () => {
  render(<Button disabled>保存</Button>);
  const button = screen.getByRole("button", { name: "保存" });
  expect(button.hasAttribute("disabled")).toBe(true);
  expect(button.getAttribute("aria-busy")).toBeNull();
});
