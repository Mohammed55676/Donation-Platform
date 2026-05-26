# Design System: Donation Platform V2

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
*   **Signature CTAs:** Use a subtle linear gradient on `primary` buttons, transitioning from `primary` (#006c49) to `primary_container` (#10b981) at a 135-degree angle.
*   **Floating Elements:** For top navigation or sticky donation bars, utilize Glassmorphism. Use the `surface` color at 80% opacity with a `24px` backdrop-blur.

---

## 3. Typography: Editorial Authority
The typography uses a high-contrast scale to guide the eye in an RTL (Right-to-Left) environment.

*   **Display:** Reserved for impact statements and hero titles. Use `secondary` (#266291) to convey trust.
*   **Headlines:** Used for campaign titles. Increased line height (1.4) is essential for Arabic script legibility.
*   **Labels:** Use small letter-spacing (for English) or slightly increased weight (for Arabic) to create an "organized" editorial look.

---

## 4. Elevation & Depth: The Layering Principle
We convey hierarchy through **Tonal Layering** rather than structural lines.

*   **Ambient Shadows:** Traditional drop shadows are too "dirty" for this system. If a floating effect is required, use a shadow tinted with the `secondary` color (#1D5C8A) instead of pure black.
*   **The Ghost Border:** If a boundary is required for accessibility, use a "Ghost Border" at **20% opacity**.

---

## 5. Layout & RTL Standards (CRITICAL)

### Spacing and Margins (ms/me vs ml/mr)
*   **Logical Properties Only:** Because the platform must flawlessly support RTL (Right-to-Left) for Arabic and LTR for English, **physical margin utilities like `ml-` (margin-left) and `mr-` (margin-right) are strictly forbidden.**
*   **Use `ms-` (margin-start) and `me-` (margin-end)**: 
    *   For spacing *after* an icon that sits before text (e.g., an icon on the right of text in RTL), use `me-2`.
    *   For spacing *before* an element (e.g., separating buttons), use `ms-2`.
*   Similarly, use `ps-` and `pe-` instead of `pl-` and `pr-` for padding.

---

## 6. Components

### Buttons
*   **Primary:** Emerald Green (`primary`) with a slight `xl` (1.5rem) corner radius. Use the signature gradient.
*   **Secondary:** `secondary_container` (#96cbff) with `on_secondary_container` (#145684) text. This provides a soft, trustworthy alternative to the high-energy emerald.

### Testimonial / Success Story Cards
*   **Visual Style:** Soft cards with no heavy borders. 
*   **Content Layout:** Include small star ratings, an italicized Arabic quote, and a distinct layout for the user name and their role (e.g., "متبرع" or "مستفيد"). 

### Impact Cards
*   **Structure:** No dividers. The card itself should be `surface_container_lowest` (#ffffff) with an `lg` (1rem) corner radius.

---

## 7. Do's and Don'ts

### Do:
*   **Embrace White Space:** If a section feels crowded, double the padding. "The Digital Sanctuary" thrives on air.
*   **RTL Integrity:** Use logical margin/padding (`ms`, `me`, `ps`, `pe`).
*   **Tonal Consistency:** Use `on_surface_variant` (#3c4a42) for secondary text to maintain a soft, sophisticated contrast rather than using harsh grays.

### Don't:
*   **No "Boxy" Grids:** Avoid putting everything in a container.
*   **No Pure Black:** Never use #000000 for text. Use `on_background` (#191c1d) to keep the reading experience soft.
*   **No Hard Margins:** Do not use `ml-` or `mr-`.
