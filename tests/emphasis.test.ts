import { describe, expect, it } from "vitest";

import { parseEmphasis } from "@/lib/emphasis";

describe("parseEmphasis", () => {
  it("bolds text between ** markers", () => {
    expect(parseEmphasis("studying at **UC Irvine** now")).toEqual([
      { text: "studying at ", bold: false },
      { text: "UC Irvine", bold: true },
      { text: " now", bold: false },
    ]);
  });

  it("handles multiple bold spans", () => {
    const segs = parseEmphasis("**a** and **b**");
    expect(segs.filter((s) => s.bold).map((s) => s.text)).toEqual(["a", "b"]);
  });

  it("returns plain text untouched", () => {
    expect(parseEmphasis("no markers here")).toEqual([{ text: "no markers here", bold: false }]);
  });

  it("drops empty segments from adjacent markers", () => {
    expect(parseEmphasis("**lead** text")).toEqual([
      { text: "lead", bold: true },
      { text: " text", bold: false },
    ]);
  });
});
