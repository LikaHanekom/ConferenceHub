# Week 1 Day 2 — Tutor Guide
## ConferenceHub: Component Architecture & Styling

**How to use this guide:** Work through each phase in order. Every phase starts with *what problem we are solving*, shows *exactly what changed* with before/after snippets, and explains *why* the change was made that way. Open the project in VS Code alongside this guide.

---

## Starting point

By the end of Day 1 the project had:
- `RoomCard` — renders one room card using a template literal for conditional classes
- `RoomList` — maps over rooms, renders the grid, handles empty state
- `page.tsx` — owns `selectedId` state, passes it down

The code works but has four weaknesses:
1. The availability badge is anonymous markup buried inside `RoomCard` — it has no name, no extracted responsibility
2. Template literals for conditional classes become unreadable as the number of conditions grows
3. Refreshing the page loses the selected room
4. There is no dark mode

Each phase in this session fixes one of these.

---

## Setup — Install shadcn/ui

Run from inside the `client/` directory:

```bash
npx shadcn@latest init
npx shadcn@latest add badge
```

**What these commands do to your project:**

| File | Created/Updated | Why |
|---|---|---|
| `components.json` | Created | Tells shadcn where to put new components and which style/colour scheme you chose |
| `src/lib/utils.ts` | Created | The `cn` helper used throughout the project |
| `src/app/globals.css` | Rewritten | Adds CSS custom property tokens and the dark mode variant directive |
| `src/components/ui/badge.tsx` | Created | The Badge component source — owned by your project, not a package |

**The key line in `globals.css`:**

```css
@custom-variant dark (&:is(.dark *));
```

This is the activation mechanism for every `dark:` class across the entire project. It tells Tailwind v4 to generate dark-mode utilities using the *class strategy*: a `dark:` class on any element activates when that element has an ancestor with the `.dark` CSS class.

Without this line, `dark:` would use the operating system media query — which means there is no way to override it from within the app. With it, adding or removing the `dark` class on `<html>` switches the entire app. This is how `ThemeToggle` works later.

**Open `src/lib/utils.ts` and read it:**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

`cn` is two libraries composed into one function:
- `clsx` — accepts strings, objects, arrays, and booleans and returns only the truthy values joined as a single string. `clsx("a", false, "b")` → `"a b"`.
- `twMerge` — resolves Tailwind class conflicts. If you pass `p-2 p-4`, string concatenation would include both and the wrong one might win depending on Tailwind's generated stylesheet order. `twMerge` keeps only the last one.

---

## Phase 1 — Extract AvailabilityBadge

**Problem:** The availability badge is a `<span>` inside `RoomCard` that contains its own colour logic. When the design changes — say "Available" should become blue — you have to find it inside `RoomCard`. In a larger app it might appear in multiple components. There is no single place where "what does an availability badge look like" lives.

**What changed in `RoomCard.tsx`:**

Before:
```tsx
{/* This span knows what colours "available" and "booked" are */}
<span
  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
    room.isAvailable
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700"
  }`}
>
  {room.isAvailable ? "Available" : "Booked"}
</span>
```

After:
```tsx
<AvailabilityBadge isAvailable={room.isAvailable} />
```

`RoomCard` no longer knows what colours "available" and "booked" are. That decision belongs entirely to `AvailabilityBadge`. Changing the colour scheme now means editing one file.

**The new `AvailabilityBadge.tsx`:**

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AvailabilityBadgeProps {
  isAvailable: boolean;
}

export function AvailabilityBadge({ isAvailable }: AvailabilityBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0",
        isAvailable
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
      )}
    >
      {isAvailable ? "Available" : "Booked"}
    </Badge>
  );
}
```

**Key decisions to point out:**

- It uses `variant="outline"` on the shadcn `Badge`, then *overrides* the colour via `className`. The `cn` function is what makes this safe — `twMerge` resolves any conflicts between shadcn's default outline colours and the ones being applied.
- Dark mode variants are colocated with light mode variants in the same `cn` call: `bg-green-50 dark:bg-green-950`. The light and dark styles for the same element live on the same line. This is one of Tailwind's practical advantages over a separate dark mode stylesheet — light and dark styles travel together.
- The `AvailabilityBadge` component has no knowledge of `RoomCard`. It only knows about `isAvailable: boolean`. It can be used anywhere in the app.

**Check in the browser:** The badge looks identical to before. That is the point. The visual result did not change — the architecture did.

---

## Phase 2 — cn Utility and Dark Mode Styling

**Problem:** `RoomCard` still uses a template literal for its conditional card classes. Template literals work, but they produce a single unreadable expression when conditions grow. Dark mode variants would require a third nested ternary inside an already nested ternary.

**What changed in `RoomCard.tsx`:**

Before:
```tsx
<div
  onClick={() => onSelect(room.id)}
  className={`cursor-pointer rounded-xl border bg-white p-5 transition-all duration-150 ${
    isSelected
      ? "border-blue-500 shadow-md ring-2 ring-blue-100"
      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
  }`}
>
```

After:
```tsx
<div
  onClick={() => onSelect(room.id)}
  className={cn(
    "cursor-pointer rounded-xl border p-5 transition-all duration-150",
    "bg-white dark:bg-gray-800",
    isSelected
      ? "border-blue-500 shadow-md ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-900"
      : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600"
  )}
>
```

With `cn`, each argument is a logical group:
- First string: classes that apply to every card regardless of state
- Second string: background — the same conditional logic but cleanly separated
- Third: the selected/unselected conditional

Each line can be read independently. A new developer can understand what each group is responsible for without parsing one long string.

**Dark variants on the rest of `RoomCard`:**

```tsx
<h2 className="text-lg font-semibold leading-tight text-gray-900 dark:text-gray-100">
  {room.name}
</h2>

<p className="text-sm text-gray-500 dark:text-gray-400">
  {room.floor} · {room.capacity} people
</p>

{!room.isAvailable && (
  <p className="mt-2 text-xs text-red-500 dark:text-red-400">
    Next slot: 2:00 PM
  </p>
)}
```

The pattern is consistent: light colours use standard scale values (`gray-900`, `gray-500`), dark colours use lighter values (`gray-100`, `gray-400`) — because a dark background needs lighter text to maintain contrast.

**Check in the browser:** Dark mode is still not *active* at this point — there is no toggle yet. To verify the styles are correct before building the toggle, temporarily open DevTools → Elements, select the `<html>` element, and add `dark` to its class list manually. All card colours should switch. Remove it to restore light mode.

---

## Phase 3 — useEffect: sessionStorage Persistence

**Problem:** Selecting a room and refreshing the page loses the selection. The selection is stored only in React state, which is reset on every page load.

**Why useEffect and not an event handler:**

Storing to `sessionStorage` is a side effect — it reaches outside React's rendering model into the browser's storage API. The correct place for this is `useEffect`, not an event handler or the render body.

An event handler approach would work for the *write* side, but it cannot handle the *read* side. On page load, there is no click event — there is only a mount. A handler approach has no mechanism to restore the selection when the page loads. `useEffect` with an empty dependency array runs after the first render, which is exactly the right moment to read from storage and rehydrate state.

**What changed in `page.tsx`:**

Two additions: the `STORAGE_KEY` constant, and two separate effects.

```tsx
const STORAGE_KEY = "conferencehub:selectedRoomId";
```

A named constant prevents the key string from being duplicated in two places. If the key ever needs to change, there is one place to update it.

```tsx
// Restore from sessionStorage on mount.
// Empty dependency array: runs once after the first render.
useEffect(() => {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored !== null && rooms.some((r) => r.id === stored)) {
    setSelectedId(stored);
  }
}, []);
```

The guard — `rooms.some((r) => r.id === stored)` — checks that the stored ID still corresponds to a real room before setting it. If the room data changes and the stored ID no longer matches anything, it is silently ignored. Without the guard, a stale ID would silently set `selectedId` to a value that resolves to `undefined` when looked up, producing a blank selection panel.

```tsx
// Persist to sessionStorage whenever selectedId changes.
// Dependency array with selectedId: runs after any render where selectedId changed.
useEffect(() => {
  if (selectedId !== null) {
    sessionStorage.setItem(STORAGE_KEY, selectedId);
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}, [selectedId]);
```

When `selectedId` is null — the user deselected a room — the key is removed entirely. Leaving a stale value in storage would cause the selection to re-appear on the next page load even though the user explicitly deselected it.

**Why two separate effects and not one:**

If these were one effect, the dependency array would need to contain `selectedId`. That means the effect would run every time `selectedId` changes — including on mount with `selectedId = null`, which would immediately clear any stored value before the restore effect had a chance to read it. The restore and persist concerns have different triggers. Keep them separate.

**Check in the browser:**
1. Select a room → open DevTools → Application → Session Storage → confirm the key appears
2. Refresh the page → the same room is still selected and the summary panel is visible
3. Click the same room to deselect → confirm the key disappears from Session Storage
4. Refresh → no selection, no summary panel

---

## Phase 4 — ThemeToggle and Dark Mode

**Problem:** Dark mode classes exist everywhere but they can never activate — nothing adds the `dark` class to `<html>`. The toggle needs to manage that class and remember the user's preference.

**The new `ThemeToggle.tsx`:**

```tsx
"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  // On mount: read the stored preference, fall back to OS preference.
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = stored === "dark" || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
```

**Key decisions to point out:**

**`"use client"` is required here.** `ThemeToggle` uses `useState`, `useEffect`, and `document` — all browser-only APIs. Without `"use client"`, Next.js would try to render it on the server where none of these exist. Note that `layout.tsx` does *not* need `"use client"` — Server Components are allowed to import and render Client Components. The `"use client"` boundary lives in `ThemeToggle.tsx` only.

**`isDark` React state is not the source of truth for dark mode.** It only drives the button label. The actual source of truth is the `dark` class on `document.documentElement` (the `<html>` element). The reason this works is that `@custom-variant dark (&:is(.dark *))` in `globals.css` makes CSS respond directly to that class — React has nothing to do with it. If `ThemeToggle` were unmounted and remounted, the `<html>` class would remain on the DOM, so dark mode would stay on. `isDark` would reset to `false` on remount, causing a label mismatch — which is why the mount effect reads and re-syncs state from the DOM class.

**The fallback order in the mount effect:**
1. If `localStorage` has a stored preference → use it
2. If no preference is stored → read `window.matchMedia("(prefers-color-scheme: dark)")` for the OS preference
3. Apply the result to both the DOM and React state

**Why `localStorage` and not `sessionStorage`:** The session storage used for room selection is intentionally ephemeral — it clears when the tab closes. A colour scheme preference is a personal setting that should persist indefinitely across sessions. `localStorage` does not expire unless explicitly cleared.

**`document.documentElement.classList.toggle("dark", next)`:** The second argument is a boolean that forces the class on or off, rather than toggling based on current presence. This is safer than `.toggle("dark")` — it avoids issues where React state and the DOM class fall out of sync.

**What changed in `layout.tsx`:**

```tsx
import { ThemeToggle } from "@/components/ThemeToggle";

// ...

<body className="flex min-h-full flex-col bg-gray-50 dark:bg-gray-900">
  <header className="border-b border-gray-200 bg-white px-8 py-3 dark:border-gray-700 dark:bg-gray-900">
    <div className="mx-auto flex max-w-5xl items-center justify-between">
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        ConferenceHub
      </span>
      <ThemeToggle />
    </div>
  </header>
  {children}
</body>
```

The header and body both have dark variants. `ThemeToggle` is imported once in the layout, so it appears on every page automatically. No other component in the tree needed to change to participate in dark mode — they already had their `dark:` variants, and the `@custom-variant` directive makes the CSS respond automatically when `<html>` gets the `dark` class.

**Check in the browser:**
1. Click "Dark" → every surface switches: header, page background, cards, badges, text, selection panel
2. Click "Light" → everything reverts
3. Refresh → the preference is remembered (check DevTools → Application → Local Storage for the `theme` key)
4. Open a new tab to the same URL → preference is remembered

---

## Final File Summary

| File | What changed | Why |
|---|---|---|
| `src/app/globals.css` | Rewritten by shadcn init | Adds `@custom-variant dark`, CSS variable tokens |
| `src/lib/utils.ts` | Created by shadcn init | The `cn` helper (`clsx` + `tailwind-merge`) |
| `src/components/ui/badge.tsx` | Created by shadcn | `Badge` + `badgeVariants` (CVA) — owned by the project |
| `src/components/AvailabilityBadge.tsx` | New | Wraps `Badge`, owns all colour logic for availability state |
| `src/components/RoomCard.tsx` | Updated | Template literal → `cn`, uses `AvailabilityBadge`, dark variants |
| `src/components/RoomList.tsx` | Updated | Dark variants on empty state text |
| `src/components/ThemeToggle.tsx` | New | Toggles `.dark` on `<html>`, persists preference to `localStorage` |
| `src/app/layout.tsx` | Updated | Imports `ThemeToggle`, adds header, dark variants on body |
| `src/app/page.tsx` | Updated | Two `useEffect` calls for sessionStorage, dark variants |

---

## Component Responsibility Map

```
RootLayout (Server Component)
  └── body
      ├── header
      │   └── ThemeToggle       owns isDark state, manipulates DOM class
      └── main (Home)           owns selectedId state, two sessionStorage effects
          └── RoomList          layout only: grid, empty state
              └── RoomCard      one card's visual structure and selection rendering
                  └── AvailabilityBadge  one piece of status communication
                      └── Badge (shadcn/ui)  accessible markup, CVA class logic
```

Each component has one job. `RoomCard` does not know what colour "available" is. `AvailabilityBadge` does not know about selection state. `ThemeToggle` does not know about rooms. This separation is what makes each component independently changeable.

---

## What comes next (Day 3)

The components are correct and styled. What they lack is real data — the `rooms` array in `page.tsx` is hardcoded static seed data. Day 3 connects this to the live Conference Booking API using TanStack Query.

Because `src/types/index.ts` already mirrors the API's response shapes exactly, **none of the component code changes when the data source is swapped**. The types were written against the real backend from Day 1. That is the practical value of type discipline: the components are already ready for real data.
