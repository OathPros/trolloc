# York UIT Computer Ordering (Lightweight Web App)

A small browser-native ordering app for York University UIT staff. It supports product browsing, setup package quick-add, setup comparison, cart management, CRP-aware checkout fields, and structured order email generation.

## Features

- Plain HTML/CSS/JavaScript (no framework/runtime bundle)
- Product-first homepage with compact setup cards
- Category filters: Windows, Mac, Peripherals
- Product detail modal with specs and add-to-order action
- Setup comparison modal (each item is clickable)
- Hidden cart until first item is added
- Cart line items, quantity updates, remove actions, running total
- Checkout form with CRP conditional required fields
- Submission flow:
  1. Open mail client with structured `mailto:` order
  2. Clipboard copy fallback
  3. Plain text export fallback

Recipient: `lukegag2@gmail.com`

## Project Structure

- `index.html`
- `styles/main.css`
- `scripts/app.js`
- `scripts/render.js`
- `scripts/state.js`
- `scripts/email.js`
- `data/catalog.json`
- `assets/images/`

## Run locally

Because browsers block `fetch()` from local `file://` pages in many environments, serve this directory over a tiny local static server.

### Option A: Python (recommended)

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000`

### Option B: Any static file server

Any static web server works, as long as files are served from the project root.

## Notes

- The **Travel-focused Windows setup includes a second monitor**, matching the default Windows setup requirement.
- Images are local SVG placeholders and lazy-loaded, with graceful hiding if an image fails.
- No backend is required for browse/cart/email generation behavior.
