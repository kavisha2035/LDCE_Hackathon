# GlobeTrotter — Frontend Design

Companion to `design.md` (architecture/schema/API). This doc is the visual and UX contract: color, type, layout, component behavior, and copy voice — so all 13 screens look like one product no matter which of the three of you builds them.

---

## 1. Direction

**The subject is a route, not a dashboard.** GlobeTrotter's real material is itineraries — stops, dates, distances, costs stacked day by day. Most travel-app UIs default to either a glossy destination-marketing look (hero photos, gradient overlays) or a generic SaaS dashboard (cards, soft shadows, one accent color). Neither comes from what this product actually *is*: a document that tracks a journey.

**Chosen identity: itinerary-as-document.** Think a well-printed boarding pass, a cartographer's route sheet, a customs declaration form — objects that exist specifically to represent a trip in structured, legible form. This gives us a real reason for perforated edges, mono-spaced data (dates, costs, times), and stamp/ticket motifs, instead of decoration bolted onto a generic template.

**Explicitly avoiding:** cream background + serif + terracotta accent, near-black + neon accent, and broadsheet hairline-newspaper layouts. None of these come from travel — they're the three patterns every AI-generated design defaults to regardless of subject, and terracotta in particular reads as an obvious AI tell.

---

## 2. Design tokens

### Color — inked map palette

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F6F3EC` | Base background — aged paper, not stark white or cream-as-cliché |
| `--ink` | `#1F2B2E` | Primary text, borders, line art — deep chart-ink, not pure black |
| `--route-blue` | `#2C5F7C` | Primary actions, links, active states, stop markers |
| `--ochre` | `#B8823A` | Cost/budget data, secondary accents, currency figures |
| `--sea` | `#7FA69C` | Success states, confirmed bookings, muted supporting fills |
| `--stamp-red` | `#B84A3E` | **Reserved exclusively** for over-budget alerts and destructive actions — never decorative, so it stays meaningful when it appears |

Do not add a 7th color. If a screen seems to need one, reuse an existing token at a different opacity first.

### Typography

- **Display (headings, trip names, screen titles):** a condensed, slightly geometric sans with real character — **Fraunces** (its condensed cut) or, if unavailable, **Barlow Condensed** at a heavy weight. Used large and sparingly — trip names, screen headers, the total budget figure. Never body text.
- **Body (descriptions, labels, buttons, nav):** **Inter** or **IBM Plex Sans** — quiet, legible, does the actual work of the interface.
- **Data/mono (dates, times, costs, city codes, share slugs):** **IBM Plex Mono** or **JetBrains Mono**. This is the typographic signature — every number in the product (a date, a price, a duration) renders in mono, the way a boarding pass or itinerary slip sets its data fields apart from its prose. This single consistent rule is what makes the "document" identity read as intentional rather than decorative.

Type scale (rem, 16px base):
`0.75` caption/mono data · `0.875` body small · `1` body · `1.25` subhead · `2` screen title · `3.5` hero/trip-name display

### Layout

- Base spacing unit: **8px**. Section padding: 24/32/48 at mobile/tablet/desktop.
- Border radius: **2px** on containers (documents have corners, not bubbles), but **12px pill** on the one signature element — the ticket-stub stop card's tear-edge notches — so the contrast is deliberate, not inconsistent.
- Structural device: a **left-edge vertical timeline rule** connecting stop cards in Itinerary Builder/View/Calendar — this is the one place a "numbered sequence" device is earned, because a multi-city trip genuinely *is* an ordered sequence where order carries meaning. Don't add numbering elsewhere (e.g. don't number Dashboard cards or Profile fields — those aren't sequences).

### Signature element: the stop card as ticket stub

Each `trip_stop` renders as a card styled like a torn ticket: a solid-fill left stub (city name, dates, in mono/display mix) separated from the body (activities list) by a dashed perforation line rendered in CSS (repeating-linear-gradient or a border-image), with small semi-circle notches cut into the top and bottom edges at the perforation using `border-radius` on pseudo-elements. This is the one place we spend real visual boldness — everywhere else stays quiet and disciplined.

---

## 3. Motion

Minimal, purposeful only:
- **Stop cards entering** (Itinerary Builder, after Add Stop): a quick slide-up + fade, 150ms — like a ticket sliding out of a printer. This is the one orchestrated moment; don't add competing animations elsewhere.
- **Hover states:** route-blue underline draw on links, subtle 1px lift on interactive cards. No shadow-heavy hover effects.
- Respect `prefers-reduced-motion` — disable the slide-up, keep instant state changes.
- No page-load sequences, no scroll-triggered reveals, no ambient background motion. This is a planning tool used repeatedly, not a marketing page — motion earns its place only where it clarifies an action (something was just added), never as atmosphere.

---

## 4. Voice and copy

Plain, direct, in the traveler's own vocabulary — never system vocabulary.

- Buttons say the action's result: **"Add stop"**, not "Submit." **"Share trip"**, not "Publish." **"Save changes"**, not "Update."
- Empty states are invitations, not apologies: My Trips with zero trips reads *"No trips yet — plan your first one."* not *"You have no data to display."*
- Errors state what happened and what to do, without apologizing: *"That date range overlaps your Kyoto stop. Adjust the dates or remove it first."* not *"Error: invalid input."*
- Budget language stays concrete: *"₹42,000 over your Tokyo budget"*, not *"Budget exceeded."*
- Never use system/developer nouns in the UI — a trip has "stops," not "records"; a person "shares" a trip, they don't "publish an object."

---

## 5. Screen-by-screen layout notes

Only noting what's distinctive per screen — shared chrome (nav, header) is one component, built once by whoever owns the shared layout shell.

**1. Login/Signup** — centered single card on the paper background, no split-screen hero image (that's the travel-marketing default we're avoiding). Tab toggle rendered as two ticket-stub-style tabs, reinforcing the motif from the first screen the user sees.

**2. Dashboard** — trip cards use the ticket-stub treatment at reduced size; recommended-cities row is a horizontal scroll of small stamp-shaped chips (circular, like a passport stamp), not square image cards.

**3. Create Trip** — a plain document-style form, mono date fields, no card chrome around the form itself — it's a form, not a card.

**4. My Trips** — full-size ticket-stub cards in a vertical list (not a grid — a grid fights the document identity; a list reads like a ticket wallet).

**5. Itinerary Builder** — the centerpiece. Vertical timeline rule down the left, one ticket-stub card per stop attached to it, activity chips inside each stub's body in a horizontal wrap. "Add Stop" is a dashed-outline ticket-stub placeholder at the bottom of the list — it should look like a blank ticket waiting to be filled in, not a generic "+" button.

**6. Itinerary View** — same ticket-stub cards as Builder, but static: no edit affordances, activities shown as a simple day-grouped list rather than chips (reading mode vs. editing mode should look visibly different).

**7. City Search** — results as compact horizontal rows (name, country, cost-index shown as a small ochre dot-scale, not a number), search bar styled with a mono placeholder ("e.g. Lisbon, Portugal").

**8. Activity Search** — grid of activity cards, category shown as a small colored tag (sightseeing/food/adventure/culture/nightlife each get a fixed tag color from the existing palette — reuse sea/ochre/route-blue, don't invent new hues).

**9. Budget Breakdown** — the ochre and route-blue tokens do the chart work; stamp-red appears only on the over-budget indicator, never in the base chart palette, so it reads as a genuine alert.

**10. Trip Calendar/Timeline** — reuses the Itinerary View's timeline rule but horizontal instead of vertical, months/weeks as mono-labeled segments.

**11. Shared Public View** — identical to Itinerary View, plus a header banner stating whose trip this is and a "Copy this trip" ticket-stub-shaped button — no watermarking or "powered by" branding needed.

**12. Profile/Settings** — plain document-style form like Create Trip; saved destinations list reuses the stamp-chip style from Dashboard.

**13. Admin Dashboard** — the one screen allowed a denser, spreadsheet-like table layout, since its audience is internal, not a traveler — mono type throughout for all figures, ochre/route-blue chart colors matching screen 9 for consistency.

---

## 6. Build note for the 7-hour window

Don't hand-build the ticket-stub perforation from scratch on every screen — build it once as a shared `StopCard` / `TicketCard` component (CSS only, no images) in Hour 1, and every screen that needs it (2, 4, 5, 6, 11) imports it. This is both the fastest path and the reason the product will look cohesive across three people's work.
