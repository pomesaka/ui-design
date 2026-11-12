import { afterEach, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";
import { Field, FieldError, FieldLabel, Input } from "./field";
import { Form, FormActions } from "./form";

afterEach(cleanup);

function Sample({ onSubmit, emailError }: { onSubmit: () => void; emailError?: string }) {
  return (
    <Form onFormSubmit={onSubmit}>
      <Field name="name">
        <FieldLabel>名前</FieldLabel>
        <Input required />
        <FieldError match="valueMissing">名前を入力してください</FieldError>
      </Field>
      <Field name="email" error={emailError}>
        <FieldLabel>メール</FieldLabel>
        <Input defaultValue="a@example.com" />
      </Field>
      <FormActions>
        <Button type="submit">保存</Button>
      </FormActions>
    </Form>
  );
}

test("submitting with a missing value shows only our message, focuses it and does not submit", async () => {
  const onSubmit = mock();
  render(<Sample onSubmit={onSubmit} />);
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "保存" })));
  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByText("名前を入力してください")).toBeTruthy();
  // Only the matched message: no browser default text next to it.
  expect(screen.getByRole("textbox", { name: "名前" }).closest("div")?.textContent).toBe("名前名前を入力してください");
  expect(document.activeElement).toBe(screen.getByRole("textbox", { name: "名前" }));
});

test("an error from elsewhere marks the field invalid and is read with it", () => {
  render(<Sample onSubmit={mock()} emailError="このアドレスは既に招待されています" />);
  const email = screen.getByRole("textbox", { name: "メール" });
  expect(email.getAttribute("aria-invalid")).toBe("true");
  const describedBy = (email.getAttribute("aria-describedby") ?? "").split(" ");
  expect(describedBy.map((id) => document.getElementById(id)?.textContent)).toContain("このアドレスは既に招待されています");
});
