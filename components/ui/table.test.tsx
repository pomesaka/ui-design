import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

afterEach(cleanup);

test("the table and its scroll region are named by the caption, and headings keep their scope", () => {
  render(
    <Table caption="サイトごとのレート" hideCaption>
      <TableHeader>
        <TableRow>
          <TableHead>サイト</TableHead>
          <TableHead numeric>料金</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead scope="row">サイトA</TableHead>
          <TableCell numeric>12,000<span className="sr-only">円</span></TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  const region = screen.getByRole("region", { name: "サイトごとのレート" });
  expect(region.tabIndex).toBe(0);
  // relative keeps absolutely positioned sr-only text inside the scroll wrapper.
  expect(region.className).toContain("relative");
  expect(screen.getByRole("table", { name: "サイトごとのレート" })).toBeTruthy();
  expect(screen.getByRole("columnheader", { name: "料金" }).getAttribute("scope")).toBe("col");
  expect(screen.getByRole("rowheader", { name: "サイトA" }).getAttribute("scope")).toBe("row");
});
