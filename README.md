# LivePulse

Real-time analytics platform with interactive sandbox environment. 

## Quick Start

### 1. Start Backend 
```bash
cd apps/server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API Docs: http://localhost:8000/docs

### 2. Start Frontend
```bash
cd apps/web
npm install
npm run dev
```

Dashboard: http://localhost:3000

## Features

- **Real-time metrics** - Revenue, orders, conversion rates
- **Live charts** - Streaming data visualization
- **Event feed** - Watch events as they happen
- **Sandbox controls** - Speed, chaos mode, event injection
- **Top products** - Best sellers tracking

## Tech Stack

**Backend**: FastAPI, WebSockets, Python  
**Frontend**: Next.js 14, React, TypeScript, Tailwind, Recharts, Zustand

## Deployment

- **Backend**: Railway (auto-detects FastAPI)
- **Frontend**: Vercel (set `NEXT_PUBLIC_WS_URL`)

---

**Author**: Michael Palmer  
**GitHub**: [github.com/mpalmer79](https://github.com/mpalmer79)
```

---

## **Folder Structure Summary (Phase 2)**
```
apps/web/
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .env.example
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── lib/
    │   ├── store.ts
    │   └── utils.ts
    └── components/
        └── dashboard/
            ├── Header.tsx
            ├── ControlPanel.tsx
            ├── MetricsCards.tsx
            ├── RevenueChart.tsx
            ├── EventFeed.tsx
            ├── TopProducts.tsx
            └── AlertsPanel.tsx
