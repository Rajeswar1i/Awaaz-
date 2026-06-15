# Awaaz — The Voice of Communities

Awaaz is a community-driven problem prioritization platform that empowers citizens to raise, vote on, and track real local issues — from broken streetlights to drainage problems — so the most urgent ones rise to the top.

---

## What is Awaaz?

Awaaz (meaning "Voice" in Hindi/Urdu) gives every citizen a platform to:
- Report a local problem with photos and exact location
- Vote and comment to show community support
- Track the status of problems from Open → Being Solved → Solved
- See which problems are trending based on community engagement

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.12 + FastAPI | REST API framework |
| SQLAlchemy 2.0 (Async) | ORM with async database access |
| PostgreSQL 16 | Primary database |
| Alembic | Database migrations |
| Pydantic v2 | Data validation and schemas |
| python-jose + bcrypt | JWT authentication and password hashing |
| Redis 7 | Caching layer |
| Docker + Docker Compose | Local development infrastructure |

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js (Vite) | UI framework |
| Plain CSS | Styling (no Tailwind or UI libraries) |
| Leaflet.js + OpenStreetMap | Interactive map for location picking |
| Nominatim | Free reverse geocoding (address from coordinates) |

---

## Capacity

| Metric | Capacity |
|--------|----------|
| Problems | 5,000+ |
| Concurrent Users | 500+ |
| DB Connections | 10 base + 20 overflow (connection pooling) |
| Photo Storage | Server disk (local) / Cloudinary (production) |

**Performance optimizations in place:**
- Database indexes on `status`, `category_id`, `created_at`, `created_by`
- COUNT-based stats queries (no full table scans)
- Async SQLAlchemy engine with connection pooling
- Pagination on all list endpoints

---

## How Problem Prioritization Works

Awaaz automatically calculates a **trending score** for every problem using this formula:

```
Score = (vote_count × 10) + (comment_count × 2) + (100 - age_in_hours)
```

| Factor | Weight | Why |
|--------|--------|-----|
| Votes | ×10 | Strong signal — community actively supports this problem |
| Comments | ×2 | Shows discussion and engagement |
| Recency | 100 - age_hours | Fresh problems get a boost; old ones decay naturally |

Problems with the highest score are automatically marked as **TRENDING** and appear at the top of the dashboard.

---

## Problem Status Flow

```
📢 OPEN  →  🔥 TRENDING  →  🔧 BEING SOLVED  →  ✅ SOLVED
```

| Status | Meaning |
|--------|---------|
| 📢 Open | Problem just raised by a citizen |
| 🔥 Trending | High community votes and comments |
| 🔧 Being Solved | Problem owner marked it as in progress |
| ✅ Solved | Problem has been resolved and archived |

---

## Features

- User registration and login with JWT authentication
- Raise problems with title, description, category, and photos
- Interactive map to pin exact problem location (OpenStreetMap)
- Vote and comment on problems
- Dashboard with live stats and trending problems
- Filter problems by status on the dashboard
- Anonymous posting option
- Problem owner can update status and delete their problem

---

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- Docker Desktop

### Backend
```bash
cd awaaz-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
docker-compose up -d db redis
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd awaaz-frontend
npm install
npm run dev
```

API runs at `http://localhost:8000`  
Frontend runs at `http://localhost:5173`  
Swagger docs at `http://localhost:8000/docs`
