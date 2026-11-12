import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Field, FieldDescription, FieldLabel, Input } from "./field";

afterEach(cleanup);

test("label, description and an external error are wired to the control", () => {
  render(
    <Field error="名前を入力してください">
      <FieldLabel>名前</FieldLabel>
      <Input />
      <FieldDescription>表示名に使います</FieldDescription>
    </Field>,
  );
  const input = screen.getByRole("textbox", { name: "名前" });
  expect(input.getAttribute("aria-invalid")).toBe("true");
  const describedBy = input.getAttribute("aria-describedby") ?? "";
  const described = describedBy.split(" ").map((id) => document.getElementById(id)?.textContent);
  expect(described).toContain("表示名に使います");
  expect(described).toContain("名前を入力してください");
});
