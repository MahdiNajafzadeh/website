---
version: alpha
name: Nike
website: "https://www.nike.com"
description: |
  A photography-first commerce system built on extreme typographic contrast — towering uppercase Futura display lockups burned into editorial campaign imagery, sitting above a dense, neutral, near-monochrome retail chrome of pill-shaped black CTAs, gray search and tag pills, and tight 8px-grid product cards. The brand's voice is athletic, kinetic, and absolute: pure black, pure white, a single soft surface gray, and a deliberately small set of semantic accents (sale red, success green, restrained category tints) — every chromatic moment is reserved for editorial photography or pricing signal, never decorative chrome.

seo:
  title: "Nike Design System for React — Futura ND, #111111 pill CTAs, 24 components"
  metaDescription: "Nike's design system as a DESIGN.md file. Ink #111111, Futura ND 96px, 22 colors, 24 components. For React, Next.js, and AI tools."
  highlights:
    - "Photography-first chrome — 95% of the surface is `#111111`, `#ffffff`, and `#f5f5f5`; color lives only in the imagery"
    - "Single typographic mountain — 96px uppercase Futura ND at line-height 0.9, then a hard cliff to 16px Helvetica Now"
    - "Pill geometry everywhere — every CTA, chip, and badge uses `{rounded.lg}` 30px or `{rounded.full}`; sharp corners are reserved for cards"
    - "Sale is the only color in chrome — `#d30005` price text with strike-through original, no badge background, never elsewhere"
    - "Zero drop shadows — depth comes from photography and a single 1px inset hairline on sticky bars"
  tags:
    - "E-commerce & Retail"
  lastUpdated: "2026-05-12"
  author:
    name: "Dov Azencot"
    url: "https://x.com/dovazencot"
  opening: |
    Nike's commerce system reads like a printed athletic catalog rendered for the browser. The chrome is almost violently restrained — pure ink `#111111`, pure canvas `#ffffff`, and a single soft cloud gray `#f5f5f5` carry roughly 95% of the surface area across `/men`, the PLP listings, the PDP, and `/membership`. Every chromatic moment in the page is reserved for the product photograph or a pricing signal. There is no decorative gradient, no soft shadow, no accent color used for tone. The brand's voice is loud, kinetic, and absolute, and the system earns that loudness by withholding color everywhere except where it has to scream.

    This page packages Nike's commerce surface into a single DESIGN.md file built on the Google Labs spec. Inside: 22 color tokens (one ink, one canvas, one soft cloud, five text grays, four semantic, six category accents), 13 type styles topped by a 96px Nike Futura ND campaign tier at line-height 0.9, 5 corner radii, 8 spacing values from 2px to 48px, and 24 components — pill CTAs, search pills, filter chips, swatch dots, badge promos, the campaign tile, the PDP disclosure row, the four-column footer. Every value is quoted and machine-readable.

    Feed the file to Claude, Cursor, or GitHub Copilot and the agent will produce React components that look like Nike: pill-shaped `#111111` buttons, square product cards on `#f5f5f5` swatches, sale prices in `#d30005`, an 8px grid that locks PLP and PDP to the same vertical rhythm. Or read it as a discipline study — the system's strength is that almost every component reuses the same pill plus flat card plus photography-on-cloud vocabulary, which is why Nike never has to introduce a new token to ship a new page.
  related:
    - href: "/design"
      title: "Browse all design systems"
      description: "The full directory of DESIGN.md files on shadcn.io, with live mockups for each."
    - href: "/design/airbnb"
      title: "Airbnb design system"
      description: "Another photography-led consumer system — compare Airbnb's soft Rausch coral against Nike's pure-black discipline."
    - href: "/blocks"
      title: "React blocks for shadcn/ui"
      description: "Production-ready hero, pricing, CTA, and dashboard sections built with the same Tailwind + shadcn primitives."
  questions:
    - id: "primary-color"
      title: "What is Nike's primary brand color?"
      answer: "Nike's only chrome color is ink `#111111` — a true near-black used for primary CTAs, swatch dots, active filter chips, headlines, and body text. Pure white `#ffffff` is its equal partner for canvas, on-image CTAs, and inverse text. The system has no secondary brand color. Every other chromatic moment is either a product photograph or a semantic signal (sale `#d30005`, success `#007d48`), and the six category accents like `#ed1aa0` or `#0a7281` are reserved for swatch dots and editorial tiles, never primary chrome."
    - id: "typography"
      title: "What typography does Nike use, and what should I substitute?"
      answer: "Nike runs a proprietary Nike Futura ND for the 96px uppercase campaign headlines burned into hero photography, with Helvetica Now Display Medium covering 16–32px section titles, Helvetica Now Text Medium handling 12–16px UI and buttons, and Helvetica Now Text carrying body and links. The closest open-source path is Bebas Neue or Anton at 96px / 0.9 / uppercase for the campaign tier, paired with Inter at weights 400 and 500 for everything else. Tighten letter-spacing roughly -0.5% on the substitute to approximate Futura ND's optical weight."
    - id: "dark-mode"
      title: "Does Nike have a dark mode in this DESIGN.md?"
      answer: "No — the spec captures Nike's public commerce surfaces (`/men`, PLPs, PDP, `/membership`, Jordan Golf), and those run on canvas `#ffffff` with ink `#111111`. The campaign tile component does use `#111111` as a full-bleed background with inverse white type, but that is an editorial moment inside a light-canvas page, not a system-wide dark theme. The token `accent-pink-deep` `#4c012d` is also a deep editorial overlay, not a dark surface."
    - id: "shape-language"
      title: "Why is everything pill-shaped except the product cards?"
      answer: "Nike has exactly two button shapes — the 30px pill (`{rounded.lg}`) for every CTA, filter chip, and badge, and the full circle (`{rounded.full}`) for swatch dots and icon buttons. Product cards, campaign tiles, and the footer carry `{rounded.none}` 0px because Nike wants the photograph to be the card. Soft corners would compete with the product silhouette; pills carry every interactive surface, sharp edges carry every container. There is no third button shape anywhere in the system."
    - id: "use-in-project"
      title: "Can I use this DESIGN.md to build my own React commerce surface?"
      answer: "Yes — the file is structured to feed Claude, Cursor, or any AI tool that reads design tokens. The agent will reproduce Nike's restraint (one accent, pill CTAs, square cards on `#f5f5f5`, sale red `#d30005` only on prices) rather than a generic e-commerce theme. Every color, type style, radius, and spacing value is a quoted token you can paste directly into Tailwind config, CSS variables, or your own component library. Reference `{component.button-primary}`, `{component.product-card}`, and `{component.campaign-tile}` in your prompts and the output stays disciplined."
    - id: "known-gaps"
      title: "What's missing from this DESIGN.md spec?"
      answer: "Five things, documented in the Known Gaps section: mobile screenshots were not captured (responsive behavior is synthesized from desktop evidence and breakpoint tokens), hover states are not documented by global policy, modal and dialog styling beyond the geo-selector is not present, full form field styling for checkout and sign-up is not captured (only the search pill is), and bag plus wishlist filled-count badges are not visible in the captured pages. The spec covers roughly the commerce surface front-of-funnel — listing, detail, and membership."

colors:
  primary: "#111111"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  soft-cloud: "#f5f5f5"
  ink: "#111111"
  charcoal: "#39393b"
  ash: "#4b4b4d"
  mute: "#707072"
  stone: "#9e9ea0"
  hairline: "#cacacb"
  hairline-soft: "#e5e5e5"
  sale: "#d30005"
  sale-deep: "#780700"
  success: "#007d48"
  success-bright: "#1eaa52"
  info: "#1151ff"
  info-deep: "#0034e3"
  accent-pink: "#ed1aa0"
  accent-pink-soft: "#ffb0dd"
  accent-purple-soft: "#beaffd"
  accent-purple-pale: "#d6d1ff"
  accent-teal: "#0a7281"
  accent-pink-deep: "#4c012d"

typography:
  display-campaign:
    fontFamily: Nike Futura ND
    fontSize: 96px
    fontWeight: 500
    lineHeight: 0.9
    letterSpacing: 0
    textTransform: uppercase
  heading-xl:
    fontFamily: Helvetica Now Display Medium
    fontSize: 32px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  heading-lg:
    fontFamily: Helvetica Now Display Medium
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  heading-md:
    fontFamily: Helvetica Now Display Medium
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.75
    letterSpacing: 0
  body-md:
    fontFamily: Helvetica Now Text
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-strong:
    fontFamily: Helvetica Now Text Medium
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  button-lg:
    fontFamily: Helvetica Now Display Medium
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  button-md:
    fontFamily: Helvetica Now Text Medium
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  button-sm:
    fontFamily: Helvetica Now Text Medium
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  link-md:
    fontFamily: Helvetica Now Text
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.75
    letterSpacing: 0
    textDecoration: underline
  caption-md:
    fontFamily: Helvetica Now Text Medium
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  caption-sm:
    fontFamily: Helvetica Now Text Medium
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  utility-xs:
    fontFamily: Helvetica Neue
    fontSize: 9px
    fontWeight: 500
    lineHeight: 1.75
    letterSpacing: 0

rounded:
  none: 0px
  sm: 18px
  md: 24px
  lg: 30px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 18px
  xl: 24px
  xxl: 30px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 16px 32px
    height: 48px
  button-primary-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
  button-secondary:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 16px 32px
    height: 48px
  button-outline-on-image:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 12px 24px
  button-icon-circular:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 40px
  search-pill:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 40px
  search-pill-focused:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
  filter-chip:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  filter-chip-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
  badge-promo:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-sm}"
    rounded: "{rounded.full}"
    padding: 4px 12px
  badge-sale-text:
    textColor: "{colors.sale}"
    typography: "{typography.caption-md}"
  product-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
    padding: 0px
  product-card-image:
    backgroundColor: "{colors.soft-cloud}"
    rounded: "{rounded.none}"
  swatch-dot:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 12px
  swatch-dot-active:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: 12px
  campaign-tile:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.display-campaign}"
    rounded: "{rounded.none}"
  category-icon-card:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-md}"
    rounded: "{rounded.none}"
  member-benefit-card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-primary}"
    typography: "{typography.heading-lg}"
    rounded: "{rounded.none}"
  faq-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.none}"
    padding: 24px 0px
  pdp-disclosure-row:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
    padding: 24px 0px
  utility-bar:
    backgroundColor: "{colors.soft-cloud}"
    textColor: "{colors.ink}"
    typography: "{typography.caption-sm}"
    rounded: "{rounded.none}"
    height: 36px
  primary-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
    height: 56px
  filter-sidebar:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.none}"
  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.mute}"
    typography: "{typography.caption-md}"
    rounded: "{rounded.none}"
---

## Overview

Nike's commerce system is built on a single, almost violently simple idea: photography speaks, the chrome doesn't. Every page reads as an athletic editorial — towering uppercase Futura display lockups (`{typography.display-campaign}`) burned into full-bleed campaign imagery, with everything else (nav, filters, buttons, cards, footer) reduced to neutral typography and pill geometry on `{colors.canvas}` and `{colors.soft-cloud}`. There is no decorative gradient, no soft shadow nostalgia, no accent color used for "tone" — the system saves all chromatic energy for product photography and the small handful of moments that actually need to signal (sale price `{colors.sale}`, success `{colors.success}`, swatch dots).

The result is a layout that feels physical — campaign hero, product grid, sport tile, footer — stacked like a printed catalog rather than animated like a typical SaaS landing page. Density is high but never crowded, because the system relies on three relentless devices: square or near-square 1:1 product imagery on `{colors.soft-cloud}`, pill-shaped black CTAs (`{rounded.full}`) anchoring every actionable surface, and a tight 8px-base spacing scale that keeps cards and filters mathematically aligned across PLP, PDP, and editorial pages.

Across `/men`, the trail-running listing, the Zegama PDP, `/membership`, and Jordan Golf, the same chrome appears in identical proportions — only the photography and copy change. That is the system's signature: maximum editorial expression in the imagery, maximum mechanical restraint everywhere else.

## Known Gaps

- **Mobile screenshots not captured** — responsive behavior described above synthesizes Nike's known mobile pattern (hamburger drawer, 1-up grid, headline downscale) from desktop evidence and the breakpoint list extracted from tokens.
- **Hover states not documented** by system policy — Nike's CSS uses `--pds-color-element-hover` and `--pds-color-text-hover` tokens but these are not included here.
- **Dialog / modal styling** beyond the geo-selector and the country-confirmation pill pair could not be confirmed from the captured surfaces; bag, wishlist, and login overlays are not documented.
- **Form field styling** for checkout, sign-up, and address forms is not present in the captured surfaces — only the search pill is documented.
- **Bag and wishlist** icon-state variants (filled count badges) not visible in the captured pages.

