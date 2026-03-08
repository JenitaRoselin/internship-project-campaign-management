# Teammate Handoff: Campaign Management System (PostgreSQL Integration)

## 1) Current Objective State

This branch contains the migration from CSV-driven workflow to PostgreSQL-backed workflow with FastAPI + Next.js integration.

### Implemented
- PostgreSQL-backed customer/campaign data flow
- AWS RDS-compatible DB config (`backend/database.py`)
- Data seeding from `campaign_dataset_refined.csv` (`backend/load_database.py`)
- Dummy campaign + ROI seed data ("Diwali Offer 2025")
- Dashboard overview from DB campaigns
- Targeting → Dynamic segmentation → Campaign architect → ROI flow
- Campaign run endpoint with development whitelist restrictions

## 2) Key Files to Continue Development

- `backend/main.py`
  - FastAPI routes for campaigns/customers/segmentation/ROI/run
  - Dynamic segmentation endpoint currently transforms DB customer aggregates into AI-compatible rows
- `backend/database.py`
  - Core DB helper layer used by API routes
- `backend/load_database.py`
  - CSV-to-DB seeding + Diwali dummy campaign + engagement seed
- `frontend/campaign-manager/app/dashboard/page.tsx`
  - Landing overview + tabs + ROI screen + run-again navigation flow
- `frontend/campaign-manager/components/CampaignArchitect.tsx`
  - Campaign detail inputs (objective/tone/language/budget/context) + generation flow
- `frontend/campaign-manager/components/AudienceSelector.tsx`
  - Customer filtering and confirmation before segmentation

## 3) Runtime Prerequisites

### Backend
- Python virtual environment in `.venv`
- Required packages installed (FastAPI, psycopg2, pandas, google-auth stack, etc.)
- `backend/.env` configured for DB access

### Frontend
- `npm install` completed in `frontend/campaign-manager`
- Next.js dev server (`npm run dev`)

## 4) Startup Commands

### Terminal A (Backend)
```powershell
cd C:\internship-project-campaign-management\backend
..\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### Terminal B (Frontend)
```powershell
cd C:\internship-project-campaign-management\frontend\campaign-manager
npm run dev
```

### Open App
- Home/Login: `http://localhost:3000`
- Dashboard direct: `http://localhost:3000/dashboard?id=1`

## 5) API Surface (Active)

- `GET /api/customers`
- `POST /api/segment-customers-dynamic`
- `GET /api/campaigns`
- `GET /api/campaigns/{campaign_id}`
- `POST /api/campaigns`
- `POST /api/campaigns/{campaign_id}/run`
- `GET /api/campaigns/{campaign_id}/roi`

### Notes
- `POST /api/campaigns/{campaign_id}/run` requires `backend/token.json` from Google OAuth.
- Development email whitelist is enforced in backend run route:
  - `jeniroselin20@gmail.com`
  - `yuvasrieswara77@gmail.com`

## 6) Verified Behavior Snapshot

- Campaign list and customer list return data from DB
- Dynamic segmentation works on filtered customer IDs
- Campaign creation persists records and generated segment messages
- ROI endpoint returns seeded + runtime metrics
- Next.js production build succeeds (`npm run build`)

## 7) Known Caveats / Recovery Steps

1. **`/api/campaigns/{id}/run` returns 401**
   - Cause: Missing `backend/token.json`
   - Fix: Complete OAuth via `GET /api/auth/google` and callback flow

2. **Segmentation still fails after code updates**
   - Cause: Old backend process still running stale code
   - Fix: stop all backend processes and restart uvicorn

3. **Next dev lock file error (`.next/dev/lock`)**
   - Cause: Another Next process is already active
   - Fix: close prior process or reuse existing running server/port

4. **Frontend starts on 3001 instead of 3000**
   - Cause: 3000 occupied
   - Fix: either open shown port or stop process on 3000

## 8) Suggested Next Work for Teammate

- Add robust type models for API payloads in frontend (reduce `any` usage)
- Move frontend API base URL to env var (`NEXT_PUBLIC_API_BASE_URL`)
- Add authenticated tenant context instead of `id=1` fallback routing
- Add test coverage for segmentation + campaign create/run endpoints
- Add error-state UI patterns for API failures/timeouts

## 9) Security Notes

Ignored (not committed):
- `backend/.env`
- `backend/token.json`
- `backend/client_secret.json`

Do not commit real credentials or OAuth tokens.
