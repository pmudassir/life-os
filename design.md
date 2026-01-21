# Design Principles

A comprehensive guide to UX laws and design principles for creating intuitive, user-friendly interfaces.

---

## 1. Aesthetic-Usability Effect

> **Principle:** Users perceive aesthetically pleasing designs as more usable.

### Application
- Use clean, consistent spacing (e.g., `gap-2`, `px-4`)
- Establish typography hierarchy (e.g., headings with `text-lg font-semibold`)
- Add visual cues like subtle shadows or border separators to improve perceived usability
- Make forms feel easier through thoughtful spacing and typography

---

## 2. Hick's Law

> **Principle:** The time to make a decision increases with the number and complexity of choices.

### Application
- Reduce visible options per screen
- Avoid clutter in the interface
- Collapse complex filters/conditions into toggles or expandable sections
- Collapse complex settings by default

---

## 3. Jakob's Law

> **Principle:** Users spend most of their time on other sites, so they prefer your site to work the same way.

### Application
- Match WordPress admin conventions (e.g., table lists, modals, top bar)
- Stick to familiar WP Admin patterns (cards, sidebars, modals)
- Use familiar placement of "Add New", status toggles, and trash icons

---

## 4. Fitts's Law

> **Principle:** The time to acquire a target is a function of the distance to and size of the target.

### Application
- Place important buttons close, large, and clear
- Important actions (edit, delete) should be large, clickable buttons
- Avoid tiny icon-only targets unless they are grouped and spaced (`space-x-2`)

---

## 5. Law of Proximity

> **Principle:** Objects that are near each other tend to be grouped together.

### Application
- Group logic and inputs with spacing + `PanelBody` + layout components
- Group related controls using spacing + containers (e.g., `PanelBody`, `Card`)
- Visually bundle inputs related to conditions or filters

---

## 6. Zeigarnik Effect

> **Principle:** People remember uncompleted tasks better than completed ones.

### Application
- Use progress indicators and save states
- Show progress in multi-step rule creation (stepper, breadcrumb, or "Step X of Y")
- Provide save state feedback (e.g., "Saving..." or "Unsaved changes" banners)

---

## 7. Goal-Gradient Effect

> **Principle:** The tendency to approach a goal increases with proximity to the goal.

### Application
- Emphasize progress in wizards (e.g., New Rule flow)
- Highlight the active step and use primary button styling for next actions
- Use progress bars or steppers to encourage completion

---

## 8. Law of Similarity

> **Principle:** Elements that share similar visual characteristics are perceived as more related.

### Application
- Ensure toggles, selectors, and filters share styling and layout conventions
- Use consistent styles for toggle switches, buttons, badges, and filters
- Align icon sizing and spacing across all rows for visual rhythm

---

## 9. Miller's Law

> **Principle:** The average person can only keep 7 (±2) items in their working memory.

### Application
- Don't overload the user with options
- Chunk rule configuration into steps/panels
- Default to collapsed sections (e.g., advanced options)

---

## 10. Doherty Threshold

> **Principle:** Productivity soars when a computer and its users interact at a pace (<400ms) that ensures neither has to wait on the other.

### Application
- Aim for sub-400ms interactions
- Use loading skeletons and optimistic UI patterns
- Implement loading states with spinners or shimmer placeholders

---

## Quick Reference Table

| Law | Key Takeaway |
|-----|--------------|
| Aesthetic-Usability | Use spacing/typography to make forms feel easier |
| Hick's Law | Avoid clutter; collapse complex settings |
| Jakob's Law | Stick to familiar WP Admin patterns |
| Fitts's Law | Place important buttons close, large, clear |
| Law of Proximity | Group logic and inputs with spacing + components |
| Zeigarnik Effect | Use progress indicators, save states |
| Goal-Gradient | Emphasize progress in wizards |
| Law of Similarity | Ensure consistent styling conventions |
| Miller's Law | Chunk content; collapse advanced options |
| Doherty Threshold | Aim for <400ms interactions |