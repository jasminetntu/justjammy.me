import type { Metadata } from "next";

import { ContactLetter } from "@/components/sections/contact-letter";

export const metadata: Metadata = {
  title: "Contact",
  description: "Say hello — reach Jasmine Tu by email, LinkedIn, GitHub, or grab her resume.",
};

export default function ContactPage() {
  return <ContactLetter />;
}
