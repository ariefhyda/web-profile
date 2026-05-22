# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static, vanilla HTML/CSS/JS site that serves two purposes from one codebase:

1. **Landing page** (`/index.html`) — Arif Hidayah's professional profile.
2. **LMS-style course modules** — one folder per course (`datamining/`, `flutter/`, `flutter-intermediate/`, `flutter-advanced/`, `laravel/`, `computer-vision/`), each containing the lesson HTML files for that subject.

No build step, no framework, no package.json. Everything is plain files served as-is.

## Running locally

The site uses **absolute paths** (e.g. `/style.css`, `/datamining/course.css`, `/datamining/index.html`) in `<link>` tags and sidebar links. You **must** serve from the repo root — opening `index.html` via `file://` will break stylesheets and navigation between modules.

```cmd
npx -y serve . -p 3000
```

Then visit `http://localhost:3000`. Any static server rooted at the repo top works (Python `http.server`, Live Server, etc.).

There is no lint, test, or build command — none are configured and none should be added unless requested.

## Architecture

### Two layers of styling

- **`/style.css`** — global design system: CSS variables (colors, spacing, radii, transitions), reset, landing-page components (hero, particles, timeline, feature cards, navbar). Loaded by every page.
- **`<course>/course.css`** — per-course overrides and the course-page-specific components (sidebar, breadcrumb, content typography, code block, info box, video placeholder). Each course folder has its own copy.

Course pages link both:
```html
<link rel="stylesheet" href="/style.css">
<link rel="stylesheet" href="/datamining/course.css">
```

### Course module structure

Every course folder follows the same convention:

```
<course>/
├── index.html              # course landing / first module
├── course.css              # course-scoped styles
├── course-layout.js        # injects navbar + sidebar at runtime
├── layout-master.html      # (datamining only) boilerplate to copy when adding a module
└── <topic>.html            # one file per lesson topic
```

### Dynamic navigation via `course-layout.js`

Lesson HTML files contain **empty** `<nav id="navbar">`, `<div id="mobileMenu">`, and `<aside id="courseSidebar">` shells. `course-layout.js` populates them on `DOMContentLoaded` from a `courseConfig` object declared at the top of the file:

```js
const courseConfig = {
    courseName: "Data Mining",
    profileUrl: "../index.html",
    courseIcon: `<svg>…</svg>`,
    modules: [
        { group: "Pengantar", items: [{ title, url, icon }, …] },
        …
    ]
};
```

- **To add a new lesson to an existing course:** copy `layout-master.html` (or another lesson file) to `<topic>.html`, then add an entry to `courseConfig.modules[].items` in that course's `course-layout.js`. The `url` field must be an **absolute path** (e.g. `/datamining/knn.html`) — the sidebar's active-link matching compares against `window.location.pathname`.
- **To add a new course:** create a new folder mirroring `datamining/`, copy its `course.css` and `course-layout.js`, edit `courseConfig` for the new course, then add a card to the "Materi Belajar" section in `/index.html`.

### Landing page (`/script.js`)

`script.js` is only used by `/index.html`. It handles particles, navbar scroll state, mobile menu toggle, smooth anchor scroll, intersection-observer animations (`.appear`, `.feature-card`, `.timeline-item`), counter animation, and a tilt effect on `[data-tilt]` elements. Course pages do **not** load `script.js` — they only load `course-layout.js`.

### Inline page scripts

Each lesson page defines two small functions inline in a `<script>` block at the bottom: `copyCode(btn)` (clipboard for `.code-block`) and `playVideo()` (placeholder alert; replace with an iframe when adding real video). Don't extract these into a shared file unless asked — keeping them inline is the existing convention.

## Conventions when editing lessons

- Reuse the existing typography components from the layout master: `<p class="content-text">`, `<h2 class="content-heading">`, `<ol class="content-list">`, `<div class="info-box">`, `<figure class="content-figure">`, `<div class="code-block">` with `.code-block-header` / `.code-block-body`. Don't introduce new ad-hoc classes for these.
- Content language is **Indonesian** (`lang="id"`). Match the existing tone for new material.
- Code blocks use manual span-based highlighting (`.hl-comment`, `.hl-keyword`, `.hl-func`, `.hl-string`, etc.) — no JS syntax highlighter is loaded.
- Update both the previous lesson's "Next" button and the next lesson's "Prev" button when inserting a topic into the middle of a sequence; sidebar order is governed by `course-layout.js` but the in-page prev/next links are hand-written.
