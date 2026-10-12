# Contact form

How the contact page's email form works, why it's built this way, and how to set it up.

**In short:** the visitor fills out the form → our server checks that they're a real person → **Resend** emails the message to me. **Cloudflare Turnstile** plus a few cheap checks keep bots out. Everything here is free.

> **Status:** planned, not built yet.

---

## The flow

```
Visitor fills out form (+ invisible Turnstile check)
        │
        ▼
POST /api/contact  (our Next.js server)
        │
        ├─ 1. Honeypot filled?        → pretend success, drop it
        ├─ 2. Too many from this IP?  → reject (rate limit)
        ├─ 3. Fields valid?           → reject if missing / too long / bad email
        ├─ 4. Turnstile token valid?  → ask Cloudflare; reject if not
        │
        ▼
Resend sends the email
   from:     my address (never the visitor's)
   reply-to: the visitor's email
        │
        ▼
Lands in my inbox → I hit Reply → it goes straight to them
```

The cheap checks run first, so obvious junk gets thrown out before we bother Cloudflare or Resend.

---

## The pieces

| Piece | Job | Cost |
|---|---|---|
| Form (in `ContactLetter`) | Name, email, message, hidden honeypot, Turnstile widget | — |
| `src/app/api/contact/route.ts` | Runs the checks, then sends the email | — |
| [Resend](https://resend.com) | Actually delivers the email | Free: 3,000/mo, 100/day |
| [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) | Proves the visitor is human, usually invisibly | Free: 1M checks/mo |
| [React Email](https://react.email) | Styles the email that lands in my inbox | Free |

**Two different "looks":** the form on the site is our own React component, so we style it like any other part of the site. The email I receive is styled separately with React Email. Resend only handles delivery.

---

## Message format (MVP: plain text)

Visitors type into a normal `<textarea>`, so the message is plain text with no bold or bullets. Line breaks are kept: the server escapes the text, then turns newlines into `<br>` for the HTML email. Each email goes out in two versions, HTML and plain text.

**Why plain text first?** Most contact messages are a few sentences, so formatting adds little. Plain text also has no HTML risk once it's escaped. A formatting toolbar can come later (see [Later](#later-optional)).

---

## Keeping bots out

No single check stops everything, so we stack a few. Each one catches what the others miss.

- **Turnstile:** the main defense. It's a CAPTCHA that usually doesn't make people solve puzzles. Our server double-checks the result with Cloudflare, so bots can't just fake it.
- **Honeypot:** a hidden field that real people never see. Bots fill in every field, so if this one has a value, it's a bot. We return a fake "success" so the bot doesn't learn anything.
- **Rate limit:** max ~3 messages per IP per 10 minutes. This stops anyone (bot or person) from flooding my inbox. An in-memory counter is enough because the site runs as one Node process on Hostinger.
- **Validation:** name, email, and message are required, the email has to look like an email, and the message is capped at ~5,000 characters.

---

## Why these choices

**Why Resend instead of sending the email ourselves?**
Email sent straight from a random server usually lands in spam. A sending service handles deliverability for us. Resend has a simple API, a generous free tier, and good Next.js support.

**Why Resend over Web3Forms / Formspree / EmailJS?**
Those let you skip writing a backend, but messages pass through a third party, you get less control over spam checks, and the free tiers are smaller (Web3Forms 250/mo, Formspree ~50/mo). We already run a Node server, so owning the backend costs us very little.

**Why not Hostinger email over SMTP?**
It works, but setup is fiddlier and delivery is less reliable than a dedicated service. It's only worth it if we want zero third parties.

**Why Turnstile over reCAPTCHA or hCaptcha?**
It's free, it's usually invisible (no "click all the traffic lights"), and it doesn't track visitors for ads the way reCAPTCHA does.

**Why a server route instead of sending from the browser?**
Secret keys can't live in browser code, because anyone could read them. The server is also the only place where checks can't be skipped.

**Why is "from" my address and not the visitor's?**
Email providers check whether the sender is allowed to use that domain (SPF/DKIM/DMARC). Gmail, Outlook, and others would reject or spam-folder a message "from" `someone@gmail.com` sent by Resend. Resend won't even allow it. Putting the visitor in **reply-to** gives the same result: I hit Reply and it goes to them.

This is the standard setup. Formspree, Netlify Forms, and WordPress form plugins all do it this way.

---

## Safety rules

- **Secrets stay server-side.** Only the Turnstile *site key* is public (`NEXT_PUBLIC_`). Everything else lives in env vars.
- **Escape the message** before putting it in the email, so nobody can inject HTML or links.
- **Keep errors vague.** Tell visitors "something went wrong," never *which* check failed.
- **Never trust the browser.** Every check happens again on the server, even if the form already did it.

---

## Setup, step by step

1. **Resend:** sign up and create an API key.
2. **Turnstile:** in the Cloudflare dashboard, add a widget for `justjammy.me` only, using the **Managed** mode. Copy the site key and the secret key. (The domain doesn't need to be on Cloudflare.) Leave out `localhost`, as Cloudflare recommends for production keys. Use the test keys in `.env.local` instead:
   ```
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
   TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
   ```
3. **Env vars:** add these to `.env.local` (with the Turnstile test keys) and to Hostinger's environment settings (with the real keys):
   ```
   RESEND_API_KEY=...
   TURNSTILE_SECRET_KEY=...
   NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
   CONTACT_TO_EMAIL=...
   ```
4. **Install packages:** `npm i resend @marsidev/react-turnstile @react-email/components`
5. **Build the form** in `ContactLetter`: the fields, the hidden honeypot, the Turnstile widget, and sending / sent / error states.
6. **Build the email template** with React Email: the visitor's name and email, a divider, then the message.
7. **Build the route** at `src/app/api/contact/route.ts`, running the checks in the order shown in [the flow](#the-flow).
8. **Test locally** with Cloudflare's [test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) (always pass / always fail) to try both paths. Then deploy and send a real message.

### Later (optional)

- **Verify `justjammy.me` in Resend** by adding its DNS records in Hostinger. Emails then come from `contact@justjammy.me` instead of `onboarding@resend.dev`, and they land in inboxes more reliably. Until then, Resend can only send to my own account email, which is all a contact form needs anyway.
- **Save a copy of each message** (database or spreadsheet), so nothing gets lost if an email fails.
- **Formatting toolbar.** See below.

### Later: formatting toolbar (B, I, bullet list, numbered list)

This is safe, but only if **the server enforces the limits**. The toolbar only restricts honest visitors. A bot can skip the form and POST any HTML it wants to `/api/contact`, such as phishing links, tracking images, or scripts.

To build it safely:

1. **Editor:** use [Tiptap](https://tiptap.dev), built from just the pieces we need: Bold, Italic, BulletList, OrderedList, plus the basics (Document, Paragraph, Text, ListItem, HardBreak). **Don't use the StarterKit bundle.** It adds headings, code blocks, and in newer versions links.
2. **Allowlist on the server:** keep only `p`, `br`, `strong`, `em`, `ul`, `ol`, `li`, and strip everything else.
3. **No attributes at all.** That means no `href`, `style`, `class`, or `on*`. None of these formats need one.
4. **Sanitize** with `sanitize-html`, using that exact allowlist. Spell it out instead of relying on the library's defaults.
5. **Raise the length cap** to ~10,000 characters, since HTML tags add length.
6. **Keep sending a plain-text version** alongside the HTML.

**Stricter alternative:** have the editor submit its JSON document instead of HTML. The server builds the HTML itself, and only for those four formats, so unexpected content has no way to turn into HTML. It's a bit more code, but we never have to trust visitor HTML. Either approach is fine. Sanitizing is the more common one.
