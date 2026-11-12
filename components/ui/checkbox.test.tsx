import type { ReactElement } from "react";
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";

afterEach(cleanup);

const cases: { role: "checkbox" | "switch"; element: () => ReactElement }[] = [
  { role: "checkbox", element: () => <Checkbox>通知を受け取る</Checkbox> },
  { role: "switch", element: () => <Switch>通知を受け取る</Switch> },
];

test.each(cases)("$role: the visible text names the control and toggles it", ({ role, element }) => {
  render(element());
  const control = screen.getByRole(role, { name: "通知を受け取る" });
  expect(control.getAttribute("aria-checked")).toBe("false");
  fireEvent.click(screen.getByText("通知を受け取る"));
  expect(control.getAttribute("aria-checked")).toBe("true");
});
