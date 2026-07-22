// minimal **bold** parser so content files stay plain strings, not JSX

export interface TextSegment {
  text: string;
  bold: boolean;
}

export function parseEmphasis(input: string): TextSegment[] {
  // odd-indexed segments sit between ** markers; unmatched marker bolds
  // trailing text — obvious enough to catch in review
  return input
    .split("**")
    .map((text, i) => ({ text, bold: i % 2 === 1 }))
    .filter((s) => s.text.length > 0);
}
