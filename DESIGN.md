---
version: alpha
name: Zenith
product: |
  Zenith is a domain-focused AI chatting agent. The first release deepens one specialty
  rather than chasing generalist breadth; later domains may expand the same shell.
  Marketing surfaces stay documentation-first. The product shell is conversation-first:
  a single reading column, a sacred composer, and chrome that disappears until needed.
description: |
  A monochrome, restraint-led system: paper (or near-black) canvas, Poppins, pill geometry,
  hairline borders, and almost no ornament. Chat UX prioritizes emptiness, transcript clarity,
  streaming presence, and state-driven composer morphs. Motion (formerly Framer Motion) powers
  subtle presence — never decorative noise.
personality:
  tone: calm, precise, quietly confident — expert without peacocking
  voice: plain language, short sentences, no hype; the agent knows its domain and shows it in answers, not in UI chrome
  feel: conversation as a clean transcript; marketing as a typeset README
  restraint: scarcity is the brand; one primary action per fold; chrome yields to content
  humor: dry and rare, never decorative
  ornament: none by default — at most one mark / line icon
  expertise: specialist-first; depth in one domain before breadth

colors:
  primary: "#000000"
  on-primary: "#ffffff"
  ink: "#000000"
  ink-deep: "#090909"
  charcoal: "#525252"
  body: "#737373"
  mute: "#a3a3a3"
  canvas: "#ffffff"
  surface-soft: "#fafafa"
  surface-1: "#f5f5f5"
  surface-card: "#ffffff"
  hairline: "#e5e5e5"
  hairline-strong: "#d4d4d4"
  on-dark: "#ffffff"
  on-dark-mute: "rgba(255,255,255,0.7)"
  surface-dark: "#171717"
  focus-ring: "rgba(59,130,246,0.5)"
  link: "#000000"
  link-mute: "#737373"
  success: "#16a34a"
  destructive: "#ff5f56"
  terminal-red: "#ff5f56"
  terminal-yellow: "#ffbd2e"
  terminal-green: "#27c93f"

colors-dark:
  primary: "#ffffff"
  on-primary: "#000000"
  ink: "#f4f4f5"
  ink-deep: "#fafafa"
  charcoal: "#a3a3a3"
  body: "#a1a1aa"
  mute: "#71717a"
  canvas: "#090909"
  surface-soft: "#171717"
  surface-1: "#141414"
  surface-card: "#171717"
  hairline: "#262626"
  hairline-strong: "#404040"
  on-dark: "#000000"
  on-dark-mute: "rgba(0,0,0,0.7)"
  surface-dark: "#ffffff"
  focus-ring: "rgba(59,130,246,0.5)"
  link: "#ffffff"
  link-mute: "#a3a3a3"
  success: "#22c55e"
  destructive: "#ff5f56"

typography:
  font-sans: Poppins
  font-mono: ui-monospace
  display-xl:
    fontFamily: Poppins
    fontSize: 36px
    fontWeight: 500
    lineHeight: 1.11
    letterSpacing: 0
  display-lg:
    fontFamily: Poppins
    fontSize: 30px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  heading-lg:
    fontFamily: Poppins
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.33
    letterSpacing: 0
  heading-md:
    fontFamily: Poppins
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0
  heading-sm:
    fontFamily: Poppins
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.56
    letterSpacing: 0
  body-md:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: 0
  body-strong:
    fontFamily: Poppins
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  body-sm-strong:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: 0
  caption-sm:
    fontFamily: Poppins
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: 0
  label-caps:
    fontFamily: Poppins
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.06em
  code-md:
    fontFamily: ui-monospace
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  code-sm:
    fontFamily: ui-monospace
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: 0
  button-md:
    fontFamily: Poppins
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0

rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  composer: 24px
  bubble: 20px
  bubble-tail: 6px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  turn: 24px
  turn-gap: 32px
  section: 88px

motion:
  library: motion
  duration-instant: 120ms
  duration-fast: 150ms
  duration-base: 200ms
  duration-slow: 280ms
  duration-presence: 350ms
  ease-out: [0.16, 1, 0.3, 1]
  ease-in-out: [0.4, 0, 0.2, 1]
  spring-snappy:
    type: spring
    stiffness: 420
    damping: 32
    mass: 0.8
  spring-soft:
    type: spring
    stiffness: 280
    damping: 28
    mass: 0.9
  reduced-motion: respect prefers-reduced-motion — replace springs with opacity fades at duration-fast

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 8px 20px
    height: 36px
  button-primary-active:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 8px 20px
    height: 36px
  button-pill-on-dark:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 8px 20px
  button-disabled:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.mute}"
    rounded: "{rounded.full}"
  send-button:
    size: 32px
    hitArea: 44px
    rounded: "{rounded.full}"
    enabledBackground: "{colors.primary}"
    enabledForeground: "{colors.on-primary}"
    disabledBackground: "{colors.surface-1}"
    disabledForeground: "{colors.mute}"
  search-pill:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 36px
  text-input:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 40px
  composer:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.composer}"
    border: "1px solid {colors.hairline}"
    minHeight: 48px
    maxLines: 5
    padding: 8px 12px
  suggestion-chip:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    border: "1px solid {colors.hairline}"
    padding: 10px 14px
  user-message:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.bubble}"
    tailCorner: "{rounded.bubble-tail}"
    maxWidth: 78%
    align: end
    padding: 12px 16px
  assistant-message:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    maxWidth: 100%
    align: start
  thinking-panel:
    backgroundColor: transparent
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.hairline}"
    padding: 12px 16px
  source-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    border: "1px solid {colors.hairline}"
    padding: 14px
  install-snippet:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.code-md}"
    rounded: "{rounded.full}"
    padding: 12px 20px
    height: 48px
  command-tag:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.ink}"
    typography: "{typography.code-sm}"
    rounded: "{rounded.full}"
    padding: 6px 12px
  terminal-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.code-sm}"
    rounded: "{rounded.lg}"
    padding: 16px
  surface-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  surface-card-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  feature-bullet:
    textColor: "{colors.charcoal}"
    typography: "{typography.body-sm}"
  faq-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.none}"
    padding: 16px 0px
  link-inline:
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
  link-mute:
    textColor: "{colors.body}"
    typography: "{typography.body-sm}"
  primary-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm-strong}"
    rounded: "{rounded.none}"
    height: 56px
  chat-top-bar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 56px
    borderBottom: "transparent until scroll, then 1px {colors.hairline}"
  history-sidebar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    widthExpanded: 280px
    widthCollapsed: 56px
  footer-section:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.body}"
    typography: "{typography.caption-sm}"
    rounded: "{rounded.none}"
    padding: 32px 24px
  cta-strip-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.heading-lg}"
    rounded: "{rounded.lg}"
    padding: 24px 32px
---

# Zenith Design System

## Product

Zenith is an **AI chatting agent** built for **one domain first**. The product promise is depth and fluency in that specialty — not a kitchen-sink general assistant. Marketing pages stay documentation-first; the live product is conversation-first. When domains expand later, they inherit this shell rather than inventing a new aesthetic.

## Vibe & Personality

Zenith should feel like a tool that got out of its own way. Confidence comes from clarity, whitespace, and fast feedback — not from color, chrome, or marketing noise.

**Personality traits**
- **Understated** — if an element does not earn its place, remove it
- **Transcript-first** — the conversation is the product; chrome is scaffolding
- **Specialist** — expertise shows in answers and domain affordances, not badges
- **Geometric** — pills for interaction; soft rectangles for rare cards and composer
- **Monochrome-led** — black, white, and a few neutrals carry hierarchy and state
- **Alive, not flashy** — motion confirms state changes; it never performs

**Emotional target:** calm competence and flow. Open the app → you are already in a conversation (or one keystroke from starting one). No onboarding theater.

## Why the chat UX works (principles)

These are the interaction principles Zenith optimizes for. They explain the *feel*, not a competitor checklist.

1. **Emptiness is the design**  
   Most of the viewport is canvas + text. Generous turn gaps and body leading (~1.55) make long answers readable. Dense “feeds” of cards fight the reading experience.

2. **Conversation as transcript**  
   Speaker identity comes from layout, not decoration. Assistant replies are full-width plain text on the canvas (no bubble). User turns sit in a soft right-aligned surface. Nothing frames the model’s words except the words.

3. **The composer is sacred**  
   A pinned bottom composer is always reachable. It never scrolls away. It morphs by state (empty → typing → streaming) so the primary action is always obvious without extra UI.

4. **Streaming = presence**  
   Tokens arrive left-to-right like a teletype. A quiet trailing cursor (or equivalent) signals “alive.” No bounce-per-character. Completion fades the cursor and reveals hover actions.

5. **Chrome collapses**  
   Single-surface app: history lives in a slide-over / collapsible sidebar, not a tab bar. Message actions (copy, regenerate, feedback) are hover/focus-revealed — invisible until needed.

6. **Elevation by value, not shadow**  
   In-conversation depth uses surface steps + 1px hairlines. Shadows appear only on overlays (sheets, sidebars) that truly float above the thread.

7. **State-driven controls**  
   One send slot swaps affordances (attach / send / stop) via shared-layout or crossfade — not separate buttons fighting for space.

8. **Thinking is optional transparency**  
   When the agent reasons or searches, a collapsible thinking / sources strip appears inline — useful when opened, quiet when closed.

9. **Empty state is a prompt, not a brochure**  
   Centered mark + short domain cue + composer + a few suggestion chips. No hero photography, no feature grids inside the chat shell.

**Zenith twist:** keep light *and* dark (marketing + product share one token system); Poppins for a slightly warmer specialist voice; domain starters and source cards tuned to the specialty instead of generic “ask anything” theater.

---

## Overview

**Marketing surfaces** — narrow reading column, paper canvas, one primary pill CTA, optional install/command pill, rare hairline cards. Documentation energy.

**Chat shell** — full-height transcript, pinned composer, optional history sidebar, minimal top bar (menu / new chat / model or mode). Conversation energy.

**Shared DNA**
- `{colors.canvas}` continuous field — no alternating bands
- Pill / near-pill geometry on interactive controls
- `{colors.primary}` for decisive actions (send, primary CTAs)
- No gradients, no glow, no decorative drop shadows in-content
- Dark mode inverts the canvas; personality stays the same

Runtime tokens: `src/styles.css` → shadcn semantic variables. Motion: `motion` package.

---

## Colors

### Brand & Accent
- **Primary** — decisive fills (send enabled, primary CTAs). Light: black. Dark: white.
- **Ink Deep** — pressed primary.

No decorative brand hue. Focus blue is accessibility-only.

### Surface ladder (chat)
| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#ffffff` | `#090909` | Page / thread backdrop |
| `surface-1` | `#f5f5f5` | `#141414` | User bubble, composer field |
| `surface-soft` / `surface-card` | `#fafafa` / `#fff` | `#171717` | Soft fills, cards |
| `hairline` | `#e5e5e5` | `#262626` | Borders, dividers |

### Text
- **Ink** — assistant body, titles, user text
- **Body / Mute** — placeholders, timestamps, meta, thinking collapsed labels
- Emphasize with **weight**, not color

### Semantic (sparse)
- **Success** — copy-confirmed, brief
- **Destructive** — hard errors / stop emphasis when needed
- Terminal RGB — terminal mockups only (marketing)

---

## Typography

**Face:** Poppins 400 / 500 / 600. **Mono:** `ui-monospace` for code.

| Token | Size | Weight | Use |
|---|---|---|---|
| `display-xl` | 36px | 500 | Marketing hero only |
| `display-lg` | 30px | 500 | Marketing section titles |
| `heading-lg` | 24px | 600 | Empty-state brand line (chat) / section heads |
| `heading-md` | 20px | 500 | Card titles |
| `heading-sm` | 18px | 500 | FAQ / panel titles |
| `body-md` | 16px | 400 | Assistant + user message body (LH ~1.55) |
| `body-sm` | 14px | 400 | Chips, thinking, meta |
| `caption-sm` | 12px | 400 | Timestamps, disclaimers |
| `label-caps` | 11px | 600 | `SOURCES`, model badges |
| `code-md` / `code-sm` | 16 / 14 | 400 | Code + commands |
| `button-md` | 14px | 500 | Buttons |

In chat, skip display sizes — the reading surface is `body-md`.

---

## Layout

### Marketing
- Content ~720px; section air `{spacing.section}` (88px)
- Whitespace replaces decorative dividers

### Chat shell
- Single column, horizontal inset `{spacing.lg}` (16px)
- Max reading width ~720–800px centered on wide screens
- Turn spacing: `{spacing.turn}` (24px) user→assistant; `{spacing.turn-gap}` (32px) between full turns
- User bubble max-width **78%**, end-aligned
- Assistant: **100%** content width, no bubble
- Composer: pinned above safe area; keyboard lifts composer; thread sticks to latest turn
- History: collapsible sidebar (desktop) / slide-over (mobile) — **no bottom tab bar**

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 Flat | No border, no shadow | Assistant text, empty canvas |
| 1 Surface | Fill + optional 1px hairline | User bubble, composer |
| 2 Card | Fill + hairline + `rounded.xl` | Source / citation cards |
| 3 Overlay | Scrim + soft shadow ok | Sidebar, sheets, menus |

In-thread: value + border only. Overlays may use a deep soft shadow so they separate from the void/canvas.

---

## Shapes

| Token | Value | Use |
|---|---|---|
| `none` | 0 | Structural rules, assistant text |
| `sm` / `md` | 6 / 8 | Inline code, small panels |
| `lg` / `xl` | 12 / 16 | Cards, thinking panels, chips |
| `composer` | 24px | Prompt bar container |
| `bubble` / `bubble-tail` | 20 / 6 | User message (tail toward sender) |
| `full` | 9999px | Buttons, send, pills |

---

## Motion

Library: **`motion`** (Motion One / former Framer Motion). Prefer declarative `animate` / `layout` / `AnimatePresence` over ad-hoc CSS keyframes for UI chrome. Streaming text stays data-driven (token append), not spring-per-glyph.

### Timing tokens
| Token | Value | Use |
|---|---|---|
| `duration-instant` | 120ms | Press tint, border focus |
| `duration-fast` | 150ms | Icon swaps, copy confirm in |
| `duration-base` | 200ms | Crossfades, send↔stop, panel expand |
| `duration-slow` | 280ms | Sidebar width, empty-state enter |
| `duration-presence` | 350ms | First paint of a new turn |
| `spring-snappy` | stiff ~420 / damp ~32 | Send press scale, chip tap |
| `spring-soft` | stiff ~280 / damp ~28 | Sidebar, mode pill indicator, layout shared elements |

### Approved motion recipes
- **Presence** — new messages: opacity 0→1 + translateY 6→0 (`duration-presence`, `ease-out`). Stagger only for suggestion chips (40–60ms).
- **Composer state** — shared-layout or opacity/scale crossfade between mic/idle affordance, send, and stop (`duration-base`). Collapse secondary labels (e.g. model name) while typing.
- **Send press** — scale 1 → 0.92 → 1 with `spring-snappy`.
- **Streaming cursor** — blink ~530ms on/off; fade out 200ms on complete; then fade in action row.
- **Thinking panel** — height auto + opacity via `AnimatePresence`; no bounce.
- **Sidebar** — width spring-soft; overlay scrim opacity `duration-base`.
- **Hover actions** — action bar opacity 0→1 at `duration-fast` on message hover/focus-within.
- **Copy confirm** — glyph→check + brief success color; revert after ~1.2s.
- **Status pulse** — searching/working glyph opacity 0.4↔1 over ~900ms ease-in-out until resolved.

### Motion don’ts
- No parallax, no continuous ambient loops on the canvas
- No elastic overshoot on message list scroll
- No per-character bounce on tokens
- Always honor `prefers-reduced-motion`: opacity-only, `duration-fast`

---

## Components

### Marketing (unchanged DNA)
Primary / secondary pills, install snippet, command tags, surface cards, FAQ rows, nav, footer — see front matter. Scarcity still rules: one black (or inverted) primary per fold.

### Chat — Composer (`composer`)
- Pinned bottom; `rounded.composer`; `surface-1` + hairline
- Min height 48px; grow to ~5 lines then internal scroll
- Leading: attach / tools (mute icon)
- Trailing: **send-button** circle 32px (44px hit)
  - Empty → muted / secondary affordance
  - Has text → primary fill + send glyph
  - Streaming → stop morph (`duration-base`)
- Optional model / mode pill that **collapses to icon while typing**

### Chat — Messages
- **`user-message`** — end-aligned, max 78%, `surface-1`, bubble radius with tail corner; no avatar required
- **`assistant-message`** — full width, no bubble, `body-md` ~1.55 LH; markdown with weight for emphasis; code blocks on `surface-1` + hairline
- **Action row** — copy / regenerate / feedback; mute icons; hover/focus only; 44px hits

### Chat — Thinking & sources
- **`thinking-panel`** — collapsed by default when possible; expand to show steps; hairline, quiet type
- **`source-card`** — domain citations / references; stacked with `sm` gaps; whole card tappable
- **`label-caps`** strip for `SOURCES` / step labels

### Chat — Empty state
- Centered mark + one short domain line (`heading-lg` / `heading-md`)
- Composer centered beneath
- 3–4 **`suggestion-chip`** starters (domain-specific)
- No illustration collage

### Chat — Chrome
- **`chat-top-bar`** — 56px; history trigger, new chat, optional mode; hairline only after scroll
- **`history-sidebar`** — expanded ~280px / collapsed icon rail; conversation rows with mute timestamps; pin optional

---

## Do's and Don'ts

### Do
- Open into chat — composer ready, history one click away
- Keep assistant replies bubble-free; let the transcript breathe
- Pin the composer; morph send↔stop; stream like a teletype
- Reveal message actions on hover/focus
- Use Motion for state and presence only
- Show domain expertise in starters, sources, and answers
- Share tokens between marketing and chat so the product feels like one brand

### Don't
- Don't build a tabbed “app shell” around chat — stay single-surface
- Don't wrap assistant text in cards or colored bubbles
- Don't decorate with gradients, glow, glass, or in-thread shadows
- Don't invent a second accent color for “AI energy”
- Don't animate tokens with springs or confetti
- Don't pack the empty state with feature marketing
- Don't ship a generalist tone in UI copy while the agent is domain-specialized

---

## Responsive

| Breakpoint | Width | Chat behavior |
|---|---|---|
| desktop-large | 1280px+ | Centered column; sidebar can stay open |
| desktop | 1024px | Sidebar open or icon rail |
| tablet | 850px | Sidebar collapses to overlay |
| tablet-narrow | 768px | Overlay history; composer full width |
| mobile | 640px | Full-bleed transcript; 16px inset; chips wrap |

Touch: send and icon actions meet ~44px hit areas. Composer rises with the virtual keyboard.

---

## Iteration Guide

1. Treat chat shell and marketing as one system — extend front-matter tokens before one-offs.
2. Optimize for reading speed and composer clarity before adding panels.
3. Keep `{colors.primary}` scarce: send + one marketing CTA per fold.
4. Add domain vocabulary (starters, source types, tools) without changing the chrome language.
5. Prototype motion with `duration-base` / `spring-soft` first; remove any animation that doesn’t clarify state.
6. Runtime colors: `src/styles.css`. Motion constants: colocate a small `motion` tokens module when implementation starts.
7. When adding a second domain, fork starters/tools — not the visual system.

## Open Questions / Expansion Hooks

- Domain-specific tool rail (upload, domain search, calculators) — keep inside composer leading cluster or a quiet overflow; don’t spawn a second nav.
- Auth, billing, rate-limit toasts — use sparse success/destructive; still monochrome-first.
- Voice / multimodal — reuse send-slot morph pattern; don’t add a floating orb.
- Dense expert views (tables, diffs) — may need a tighter spacing tier; define it here before inventing it in JSX.
- Multi-agent or multi-domain switcher — mode pill pattern, not a new color per agent.
