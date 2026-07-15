import type { MDXComponents } from "mdx/types";

// styles MDX case-study prose to match the site's warm, airy editorial tone.
// required at the project root by @next/mdx (App Router).
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: ({ children }) => (
      <h2 className="font-serif mb-2 mt-8 text-[24px] italic text-[#5d6b50]">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif mb-2 mt-6 text-[20px] italic text-[#5d6b50]">{children}</h3>
    ),
    p: ({ children }) => <p className="mb-4 text-[14px] leading-[1.75] text-ink-dark">{children}</p>,
    ul: ({ children }) => <ul className="mb-4 list-disc pl-5 text-[14px] leading-[1.7] text-ink-dark">{children}</ul>,
    li: ({ children }) => <li className="mb-1">{children}</li>,
    a: ({ href, children }) => (
      <a href={href} className="text-[#7fa06e] underline underline-offset-2 hover:text-ink">
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-semibold text-ink-deep">{children}</strong>,
    ...components,
  };
}
