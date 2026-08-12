# Product

## Register

brand

## Users

Two audiences arrive on the same page, usually on a phone, usually mid-decision.

**Families and carers** researching NDIS support for someone they love, often in a
stressful window: a plan has just been approved, a current provider has fallen
through, or a diagnosis is recent. They are comparing three or four providers in a
browser tab each. They are not fluent in NDIS jargon and they are tired of being sold
to. What they need to establish in under a minute: are these people registered, are
they nearby, are they kind, and can I talk to a human today.

**Participants themselves**, some using assistive technology, some with cognitive
load or motion sensitivity that makes a busy page genuinely unusable rather than
merely annoying.

**Support coordinators and plan managers** doing a fast credibility check before
referring a client. They want registration status, coverage area, and service scope
without scrolling through story copy.

The job to be done is the same for all three: *decide whether to make contact.* Every
section either advances that decision or is in the way.

## Product Purpose

A single-page site for WE R ABLE, an NDIS registered disability support provider in
Caroline Springs, Victoria, serving Metro Melbourne.

It exists to convert a stranger's cautious interest into a phone call or an enquiry.
It is not a brochure, not a portfolio, and not a content marketing surface. Success is
measured in enquiries received and calls placed, and in nobody bouncing because they
could not tell whether the service covers their suburb.

## Brand Personality

**Warm, human, quietly professional.**

Warmth carries the trust here, not polish. These are people making a hard decision
about someone vulnerable; a site that feels slick reads as a sales funnel, and a site
that feels amateur reads as risky. The target is the register of a good support
worker: calm, plain-spoken, evidently competent, never performing.

Voice is second person, short sentences, no NDIS acronym soup without a plain-English
gloss. Never "empowering journeys" or "person-centred solutions" — say what actually
happens and who it happens with.

Confidence should come from specificity (a named suburb, a real phone number answered
by a real person, registration stated plainly) rather than from superlatives.

## Anti-references

- **Corporate healthcare / aged-care provider sites.** Stock photography of smiling
  strangers, teal-and-white gradients, "Our Commitment To Care" boilerplate. Reads as
  a call centre.
- **SaaS landing-page grammar.** Hero metrics, feature-card grids, tiny uppercase
  tracked eyebrows above every section, gradient text. This is not a product launch.
- **Charity-pity framing.** Imagery and copy that position participants as recipients
  of goodwill rather than people directing their own support.
- **Motion-heavy agency showreel.** Scroll-jacking, aggressive parallax, cinematic
  section transitions. Actively hostile to a meaningful share of this audience.

## Design Principles

1. **The phone number is the product.** Contact is never more than a thumb away, at
   every scroll depth, on every device. Any change that pushes it further away is
   wrong regardless of how it looks.

2. **Plain before persuasive.** If a sentence needs a second read, rewrite it. Clarity
   is the trust signal in this category; polish is not.

3. **Access is the brief, not a checklist item.** The audience includes the people
   WCAG was written for. Contrast, focus, target size, and reduced motion are design
   inputs at the start, not remediation at the end.

4. **Motion must be survivable.** Vestibular disorders and motion sensitivity are
   common among this audience. Every effect needs a resting state that is already
   correct and a reduced-motion path that is genuinely still — not merely faster.

5. **Specific beats aspirational.** Name the suburb, name the service, name the
   person. Generic warmth is indistinguishable from every competitor.

## Accessibility & Inclusion

**Target: WCAG 2.2 Level AA, with AAA contrast where it costs nothing.**

Known user needs in this audience, treated as requirements:

- **Screen reader and keyboard-only use.** Full keyboard operability, visible focus,
  correct landmarks and heading order, skip link.
- **Motion sensitivity and vestibular disorders.** `prefers-reduced-motion` must
  produce a genuinely static page, not a faster animated one. Any auto-playing motion
  over five seconds needs a visible pause control (WCAG 2.2.2).
- **Low vision.** Text contrast at AA minimum throughout; layouts must survive 200%
  zoom and increased text size without clipping or horizontal scroll.
- **Motor impairment.** Touch targets ≥44×44px, generous hit areas, no
  precision-dependent interactions, no hover-only affordances.
- **Cognitive load.** Short line lengths, one idea per section, no timed interactions,
  error messages that say what to do rather than what went wrong.
