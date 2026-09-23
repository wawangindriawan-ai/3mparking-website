# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page company-profile website for **PT Tiga Marka Utama (3M Parking)** — an Indonesian parking-management, parking-technology, and staffing company operating in Jakarta and Bandung. All body copy is in **Indonesian**; headings and the tagline mix in English. Keep new copy in Indonesian unless it is a brand phrase.

The site is a web adaptation of the company's 8-page printed company profile (cover, tentang, layanan, produk, kenapa memilih kami, 2× galeri, kontak). The deck is the design source of truth: the page follows its palette, logo, two-tone headings, red pill labels, halftone field and diagonal ribbons, but uses modern web layout rather than copying the print pages one-to-one.

There is no build step, package manager, framework, test suite, or dependency install — three hand-written files plus a flat `images/` folder, deployable by copying the directory to any static host.

## Running it

Open [index.html](index.html) directly in a browser, or serve the directory so relative paths and fonts behave like production:

```powershell
python -m http.server 8000   # then http://localhost:8000
```

No lint or test commands exist. Verification is visual, and the mobile path carries most of the behaviour — check in a narrow viewport that the drawer opens and closes (toggle, backdrop, Esc, tapping a link), the gallery lightbox navigates by arrows/swipe, the navbar auto-hides on scroll down, and the WhatsApp FAB appears.

### Screenshotting it with headless Chrome

Two traps make naive captures misleading:

- **`--window-size` has a ~500px minimum width on Windows**, so `--window-size=390,844` silently renders a 500px viewport and crops the image. To capture a real phone layout, load a tiny wrapper page holding `<iframe src="…" width="390">` and screenshot that instead — media queries then resolve against the iframe.
- A tall window makes `100svh` tall, so the hero alone fills the shot, and `.reveal` elements are still at `opacity: 0` until observed.

The workflow that works: generate a throwaway `_preview.html` from `index.html` with `loading="lazy"` stripped and an injected override (`html{scroll-behavior:auto}`, `.hero{min-height:640px}`, `.reveal{opacity:1;animation:none}`, hero animations off), capture it, then delete the temp files. Add `?v=<timestamp>` to the stylesheet link — Chrome caches it across runs and will happily show you stale CSS.

## Architecture

Everything lives in three files:

- [index.html](index.html) — the entire page. Sections are delimited by `<!-- ==== NAME ==== -->` banner comments, ordered: navbar, hero, tentang, layanan, produk, kenapa, galeri, kontak, footer, floating WhatsApp, lightbox. Each section's `id` is also a nav anchor target, so renaming an `id` means updating the nav list and the footer nav list.
- [css/style.css](css/style.css) — all styling, in the same order as the HTML sections, each under a `/* ---------------- Name ---------------- */` banner. All responsive rules are collected at the bottom under `/* Responsive */`, **not** co-located with their components.
- [js/script.js](js/script.js) — one IIFE with a single `DOMContentLoaded` handler, split into commented blocks: navbar-height sync, mobile drawer, scroll behaviour, scrollspy, scroll reveal, hero count-up, gallery lightbox, footer year.

### Design system

Tokens live on `:root` in [css/style.css](css/style.css). Use them rather than literal values — `--blue-900…--blue-50`, `--red`, `--gold`, the `--r-*` radii, `--shadow-*`, and `--ease`/`--ease-out`.

Colour rules taken from the printed deck:

- **Royal blue is the brand colour**, not navy-black. `--blue-700` is primary, `--blue-900` is the logo/footer/deep end, `--blue-500` the bright accent. Earlier revisions of this site used a dark navy plus caution yellow; that was wrong and was removed.
- **`--gold` is reserved for dark backgrounds.** It colours the "Kenapa Memilih Kami" icon tiles and the accent phrase in the hero headline (`.hero-title .hl`) — it is the only brand accent with enough contrast on the blue hero, since red drops to roughly 3.5:1 there. Never use it on light backgrounds, in the logo, or as a fill.
- **Red is for accents and calls to action**: the `.rule-accent` bar above headings, `.card-pill` service labels, gallery card borders and caption pills, the primary button, and the 3px `body::before` edge line that mirrors the deck's page border.
- Light sections alternate white and `.section--tint` (a cool `--tint` wash carrying the deck's halftone dot pattern as a `radial-gradient` background image).

Recurring patterns worth reusing: `.container`, `.section` / `.section--tint`, `.section-head` (+ `--center`) holding `.rule-accent` → `.section-title` → `.section-desc`, and `.btn` with `.btn-primary` / `.btn-blue` / `.btn-outline` / `.btn-ghost` / `.btn-block`.

**Headings are two-tone**: `<h2 class="section-title"><span class="t-lead">Tentang</span> Kami</h2>` renders the first word blue and the rest ink, uppercased via CSS. The hero title is the deliberate exception — it stays sentence case, because the tagline is long and condensed caps at hero size shout rather than read.

**The logo is built from text**, not an image file: `.logo` is an `inline-grid` with `justify-items: end` so PARKING sits under the M. It must be a grid — a flex column pushes the M away from the 3, because PARKING is the wider of the two rows. Replace the markup with an `<img>` once a real logo file exists.

### Things that will bite you

- **Never put `backdrop-filter`, `filter`, or a `transform` on `.navbar` itself.** Any of those makes it the containing block for its `position: fixed` descendants, which traps the mobile drawer inside the header bar. The scrolled background is therefore painted by `.navbar::before`, and `.navbar.is-hidden`'s `translateY` is cleared in JS before the drawer opens.
- **`img { max-width: 100% }` silently clamps any `width` over 100%.** `.service-photo img.is-pdf-crop` needs an explicit `max-width: none` to widen past its box. Same applies to any future crop-by-overflow trick.
- **Scroll reveal is an animation, not a transition.** Cards and gallery tiles own a `transform`/`box-shadow` transition for hover, and a reveal transition on the same element would overwrite it. `animation-fill-mode: backwards` means nothing lingers afterwards.
- **`:hover` rules live in one `@media (hover: hover) and (pointer: fine)` block** at the top of the Responsive section. Touch devices either never fire them or leave them stuck after a tap.
- **`--nav-h` is written by JS** from the navbar's real height; `scroll-padding-top` and the hero's top padding derive from it. Don't hardcode a header height.
- **The hero count-up must not zero out its element up front.** The real figure stays in the markup until the first `requestAnimationFrame` actually runs, with a 3s `setTimeout` fallback that forces the final value — otherwise throttled rAF leaves a visitor staring at "0+".
- **A class selector outranks the UA's `[hidden]` rule.** `.nav-backdrop` and `.lightbox` restate `display: none` for `[hidden]`; any new element toggled by `hidden` plus a class needs the same.
- Gallery tiles are `<button>` elements because the lightbox is the real interaction; the hover zoom is decorative and never fires on touch.
- **A `padding` shorthand on an element that also carries `.container` wipes out the page gutter.** `.hero-content` uses `padding-top`/`padding-bottom` for exactly this reason; the bug is invisible on desktop, where the container's `max-width` supplies a margin anyway, and only shows up as text touching the screen edge on phones.
- **Use the real WhatsApp glyph**, not a hand-drawn approximation — a rough path renders as a featureless white blob at FAB size. The same official path appears in the drawer, the contact button, and the FAB.

### Layout and breakpoints

CSS Grid and Flexbox, no framework. Spacing and type are mostly fluid via `clamp()` (`--gutter`, `--section-y`, per-component font sizes), so prefer widening a `clamp()` over adding a media query. Breakpoints, all `max-width`:

- **1020px** — `.about-grid` / `.why-grid` collapse to one column; contact and footer go 2-up.
- **880px** — the mobile switch, and it must stay in sync with `MOBILE_BP` in [js/script.js](js/script.js) (which gates the navbar auto-hide, the FAB threshold, and closing the drawer on resize). `.nav-links` becomes a fixed off-canvas drawer, `.nav-cta` is hidden, `.nav-toggle` appears, and the hero switches to a full vertical scrim.
- **760px** — service cards, product grid, ticket strip, contact and footer go single-column; gallery 2-up.
- **560px** — hero stats 2×2, full-width buttons, FAB collapses to icon only.
- **380px** — gallery single-column.
- Plus `(max-height: 520px) and (orientation: landscape)`, because the `100svh` hero would otherwise fill a landscape phone entirely.

`.nav-links` doubles as the desktop nav row and the mobile drawer panel, so its link styles are scoped with `>` (`.nav-links > a`) to leave the drawer-only `.nav-drawer-foot` buttons alone. JS queries the same selector for scrollspy and stagger.

## Content conventions

- **Images** are plain `<img>` cropped by `object-fit: cover` on a fixed-height or `aspect-ratio` parent (which is what prevents layout shift — there are no `width`/`height` attributes). Everything below the fold carries `loading="lazy" decoding="async"`; the hero is preloaded with `fetchpriority="high"`. Filenames are prefixed by role: `gal-*` (gallery, each a lightbox slide), `svc-*` (service cards), plus `hero`, `gate-photo`, `guards-photo`. Keep new files under ~180 KB.
- **The four `svc-*.jpg` files are crops lifted from the company profile PDF** and still contain the deck's blue card and its text baked into the pixels. `.service-photo img.is-pdf-crop` widens the image and lets the parent clip it so only the photograph shows. This is temporary: when real photographs arrive, drop the `is-pdf-crop` class from the four `<img>` tags and delete the matching CSS block, both of which are flagged with `SEMENTARA` comments.
- **Floating buttons** live in one `.fab-stack` (back-to-top above WhatsApp). Both share `.fab`; JS toggles `.is-visible` per button, with WhatsApp appearing early on phones and back-to-top only after 1.4 viewport heights.
- **Product cards carry `data-num="01"…"04"`**, rendered as an oversized ghost numeral by `.product-item::after`. This stands in for photography — every image in `images/` is already used by another section, so adding photos here would duplicate the Layanan cards directly above.
- **Icons** are inline `<svg viewBox="0 0 24 24">` — stroke icons in `.icon-badge` / `.why-icon` / `.vismis-icon` / `.contact-icon`, plus a filled WhatsApp glyph repeated in the drawer, contact section, and FAB. Do not add an icon library.
- **Business facts** (founded 2017, 5+ years, 12+ locations, phone 0813-1793-5303, email tigamarkautama@gmail.com, the Bandung address, the motto "Membangun dengan Perencanaan, Mengawal dengan Pengawasan", and the gallery's client names) appear in several places — hero stats, about copy, contact cards, footer. Change them everywhere at once. Hero stat numbers also live in `data-count`/`data-suffix` attributes driving the count-up (`data-plain="true"` opts a value out, as the founding year does). WhatsApp links use `wa.me/62…` international form.
