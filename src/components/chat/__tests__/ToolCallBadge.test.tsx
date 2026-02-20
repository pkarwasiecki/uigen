import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

test("str_replace_editor + create renders 'Creating App.jsx'", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("str_replace_editor + str_replace renders 'Editing App.jsx'", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "str_replace", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor + insert renders 'Editing App.jsx'", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "insert", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Editing App.jsx")).toBeDefined();
});

test("str_replace_editor + view renders 'Reading App.jsx'", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "view", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Reading App.jsx")).toBeDefined();
});

test("str_replace_editor + undo_edit renders 'Undoing edit to App.jsx'", () => {
  render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "undo_edit", path: "/App.jsx" }}
      state="call"
    />
  );
  expect(screen.getByText("Undoing edit to App.jsx")).toBeDefined();
});

test("unknown tool name renders raw tool name as fallback", () => {
  render(
    <ToolCallBadge
      toolName="file_manager"
      args={{}}
      state="call"
    />
  );
  expect(screen.getByText("file_manager")).toBeDefined();
});

test("state !== 'result' shows spinner and no green dot", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="call"
    />
  );
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeNull();
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeDefined();
});

test("state === 'result' shows green dot and no spinner", () => {
  const { container } = render(
    <ToolCallBadge
      toolName="str_replace_editor"
      args={{ command: "create", path: "/App.jsx" }}
      state="result"
    />
  );
  const greenDot = container.querySelector(".bg-emerald-500");
  expect(greenDot).toBeDefined();
  const spinner = container.querySelector(".animate-spin");
  expect(spinner).toBeNull();
});
