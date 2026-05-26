# Design System Specification: The Digital Sanctuary (Donation Platform RTL V2)

## 1. Overview & Creative North Star
The visual identity of this design system is rooted in a concept we call **"The Digital Sanctuary."** In the context of charity and donation, the UI must move beyond a simple transaction tool to become a space of quiet confidence, transparency, and radical empathy.

To achieve a high-end editorial feel, we reject the "template" look of rigid grids and heavy borders. Instead, we embrace **Intentional Asymmetry** and **Weightless Depth**. By utilizing generous whitespace (the "breathing room" of luxury) and high-contrast typography scales, we create a sense of importance around every story and every dollar. The goal is to make the donor feel they are entering a curated gallery of impact, not a cold financial dashboard.

---

## 2. Colors: Tonal Depth & The No-Line Rule
Our palette balances the growth-oriented vitality of **Emerald Green** with the authoritative stability of **Deep Ocean Blue**.

### The "No-Line" Rule
To maintain a premium aesthetic, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through background color shifts or tonal transitions.
*   **Surface Hierarchy:** Use `surface` (#f8f9fa) for the main canvas.
*   **Nesting:** Place a `surface_container_lowest` (#ffffff) card on top of a `surface_container_low` (#f3f4f5) section. This creates a natural "lift" that feels architectural rather than graphical.

### Glass & Gradient
*   **Signature CTAs:** Use a subtle linear gradient on `primary` buttons, transitioning from `primary` (#006c49) to `primary_container` (#10b981) at a 135-degree angle. This adds a "soul" to the action button, making it feel tactile and premium.
*   **Floating Elements:** For top navigation or sticky donation bars, utilize Glassmorphism. Use the `surface` color at 80% opacity with a `24px` backdrop-blur.

---

## 3. Typography: Editorial Authority
The typography uses a high-contrast scale to guide the eye in an RTL (Right-to-Left) environment. While the tokens specify *Plus Jakarta Sans* and *Inter*, these must be paired with high-end Arabic equivalents (e.g., *IBM Plex Sans Arabic* or *29LT Azat*) that mirror their geometric and humanist qualities.

*   **Display (Display-LG/MD):** Reserved for impact statements and hero titles. Use `secondary` (#266291) to convey trust.
*   **Headlines:** Use `headline-sm` (#1.5rem) for campaign titles. The increased line height (1.4) is essential for Arabic script legibility.
*   **Labels:** Use `label-md` with `0.05rem` letter-spacing (for English) or slightly increased weight (for Arabic) to create an "organized" editorial look for metadata like "Time Remaining" or "Donor Count."

---

## 4. Elevation & Depth: The Layering Principle
We convey hierarchy through **Tonal Layering** rather than structural lines.

*   **Ambient Shadows:** Traditional drop shadows are too "dirty" for this system. If a floating effect is required (e.g., a high-priority donation card), use a shadow with a `32px` blur and `4%` opacity, tinted with the `secondary` color (#1D5C8A) instead of pure black.
*   **The Ghost Border:** If a boundary is required for accessibility in input fields, use a "Ghost Border"—the `outline_variant` token (#bbcabf) at **20% opacity**.
*   **RTL Flow:** In RTL layouts, depth should feel like it is "unfolding" from the right. Ensure that shadows and overlaps follow the light source coming from the top-right of the screen.

---

## 5. Components

### Buttons (The Pulse of the Platform)
*   **Primary:** Emerald Green (`primary`) with a slight `xl` (1.5rem) corner radius. Use the signature gradient.
*   **Secondary:** `secondary_container` (#96cbff) with `on_secondary_container` (#145684) text. This provides a soft, trustworthy alternative to the high-energy emerald.
*   **Interaction:** On hover, increase the elevation through a subtle shift to `primary_fixed` (#6ffbbe) rather than a dark overlay.

### Impact Progress Bars
*   **Visual Style:** Avoid the "battery" look. Use a slim `4px` height bar using `surface_container_highest`. The progress fill should be the `primary` Emerald.
*   **Context:** Place the "percentage raised" as a `title-sm` aligned to the right (in RTL), while the "goal amount" sits on the left as a `label-md` in `on_surface_variant`.

### Impact Cards
*   **Structure:** No dividers. Use `md` (0.75rem) spacing between the image and the content. The card itself should be `surface_container_lowest` (#ffffff) with an `lg` (1rem) corner radius.
*   **Trust Elements:** Statistics should be grouped in a nested container of `surface_container_low` to separate them from the narrative text without using lines.

### Input Fields
*   **Style:** Minimalist. Use a `surface_container_highest` background with a `none` border. Upon focus, transition to a `Ghost Border` using the `primary` color.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace White Space:** If a section feels crowded, double the padding. "The Digital Sanctuary" thrives on air.
*   **RTL Integrity:** Ensure all icons are mirrored (except those that are direction-neutral, like clocks or checkmarks). The flow of "Progress" must move from Right to Left.
*   **Tonal Consistency:** Use `on_surface_variant` (#3c4a42) for secondary text to maintain a soft, sophisticated contrast rather than using harsh grays.

### Don't:
*   **No "Boxy" Grids:** Avoid putting everything in a container. Let images bleed to the edge of a section or overlap container boundaries slightly to create a bespoke, custom feel.
*   **No Pure Black:** Never use #000000 for text. Use `on_background` (#191c1d) to keep the reading experience soft and high-end.
*   **No High-Contrast Dividers:** If you feel the need to add a line, try adding `16px` of vertical space instead. If you must use a line, it should be the `outline_variant` at 10% opacity.
