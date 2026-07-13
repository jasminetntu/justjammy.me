import { describe, expect, it } from "vitest";

import { pathToView, VIEW_ACCENT, VIEWS } from "@/lib/views";

describe("pathToView", () => {
  it("maps each top-level route to its view", () => {
    expect(pathToView("/")).toBe("garden");
    expect(pathToView("/about")).toBe("about");
    expect(pathToView("/experience")).toBe("experience");
    expect(pathToView("/design")).toBe("design");
    expect(pathToView("/contact")).toBe("contact");
  });

  it("maps detail routes to their detail views", () => {
    expect(pathToView("/projects/cool-project")).toBe("project");
    expect(pathToView("/design/bloom-series")).toBe("piece");
  });

  it("falls back to garden for unknown paths", () => {
    expect(pathToView("/nope")).toBe("garden");
  });

  it("has an accent color for every view", () => {
    for (const v of VIEWS) {
      expect(VIEW_ACCENT[v]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
