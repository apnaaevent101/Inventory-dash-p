# EventStock — Inventory & Dispatch Manager

A lightweight inventory management and event dispatch tool built for event management companies.

## Features

- **Dashboard** — Live view of total warehouse value, event stats, and inventory snapshot
- **Events** — Add events (venue, date, type, items, labor), view dispatch details, download PDF
- **Inventory** — Track items with quantity, unit price, and purchase date; inline quantity editing
- **PDF Export** — Professional dispatch sheet per event with items + labor table
- **Persistent storage** — All data saved to `localStorage`

## Event Types Supported
Wedding · Haldi · Mehandi · Birthday · School Event · Other

---

## Getting Started

```bash
npm install
npm run dev
```

## Deploy to Vercel (via GitHub)

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Click **Deploy** ✓

The `vercel.json` handles SPA routing automatically.

## Tech Stack

- React 18 + Vite (fast builds, zero config)
- React Router v6 (client-side routing)
- jsPDF + jspdf-autotable (PDF generation)
- localStorage (no backend needed)
- Custom CSS (no UI library dependency)
