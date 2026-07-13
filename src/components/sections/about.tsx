import Image from "next/image";

import { PagePanel } from "@/components/layout/page-panel";
import { Kaomoji } from "@/components/sections/kaomoji";
import { BackLink } from "@/components/ui/back-link";
import { about } from "@/content/about";
import { parseEmphasis } from "@/lib/emphasis";

// chip tints rotate green → pink → violet, like the prototype
const CHIP_TINTS = [
  "border-[rgba(127,160,110,.3)] bg-[rgba(166,194,147,.2)] text-[#5d7a4c]",
  "border-[rgba(201,127,166,.3)] bg-[rgba(226,167,196,.2)] text-[#a35b85]",
  "border-[rgba(160,135,210,.3)] bg-[rgba(192,169,221,.22)] text-[#7a64a6]",
];

function Emphasized({ text }: { text: string }) {
  return (
    <>
      {parseEmphasis(text).map((seg, i) =>
        seg.bold ? (
          <b key={i} className="font-semibold">
            {seg.text}
          </b>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

export function About() {
  return (
    <main className="mx-auto max-w-[1020px] px-[clamp(24px,5vw,60px)] pb-[90px] pt-32">
      <PagePanel>
        <div className="mb-3.5">
          <BackLink />
        </div>
        <div className="font-serif text-[17px] italic uppercase tracking-[.18em] text-pink-soft">about</div>

        <div className="mt-[18px] grid grid-cols-1 items-start gap-[clamp(28px,5vw,64px)] md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div>
            <h2 className="font-serif mb-[.5em] text-[clamp(30px,4vw,52px)] font-medium leading-[1.08] text-ink-dark">
              Hello! <Kaomoji />
            </h2>
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className={`text-[clamp(15px,1.4vw,18px)] leading-[1.75] text-ink ${i < about.paragraphs.length - 1 ? "mb-[1.1em]" : ""}`}
              >
                <Emphasized text={p} />
              </p>
            ))}
          </div>

          <div>
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[200px_200px_18px_18px] border border-[rgba(154,127,107,.18)] bg-gradient-to-br from-[#fbe7f0] to-[#eef4e6] shadow-[0_18px_50px_rgba(154,127,107,.18)]">
              {about.portrait ? (
                <Image
                  src={about.portrait}
                  alt="Portrait of Jasmine Tu"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover"
                />
              ) : (
                <span className="font-serif px-[18px] text-center text-[17px] italic text-[#b89db0]">
                  your portrait
                  <br />
                  <span className="text-[13px] text-[#bcae9f]">(add a photo here)</span>
                </span>
              )}
            </div>
            <div className="mt-[18px] flex flex-wrap gap-[7px]">
              {about.skills.map((skill, i) => (
                <span
                  key={skill}
                  className={`rounded-[30px] border px-[11px] py-[5px] text-[12.5px] ${CHIP_TINTS[i % CHIP_TINTS.length]}`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-[46px] border-t border-[rgba(154,127,107,.18)] pt-[30px]">
          <div className="font-serif mb-4 text-[18px] italic text-ink-muted">Highlights</div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
            {about.highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-[14px] border border-[rgba(154,127,107,.14)] bg-white/50 px-[18px] py-4"
              >
                <div className="text-[16px] font-semibold text-ink-dark">{h.title}</div>
                <div className="text-[13px] text-ink-muted">{h.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </PagePanel>
    </main>
  );
}
