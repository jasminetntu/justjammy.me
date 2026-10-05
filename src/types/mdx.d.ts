// `.mdx` content files export a default component (the compiled body) plus
// whatever named consts the file declares (e.g. `meta`). TS can't see inside
// an .mdx file, so `meta` is untyped here — each content index.ts validates
// it against its real type (DesignPiece / ProjectMeta) at load time instead.
declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const meta: Record<string, unknown>;
  const MDXComponent: ComponentType;
  export default MDXComponent;
}
