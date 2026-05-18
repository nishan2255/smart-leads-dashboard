# 📊 Smart Leads Dashboard

A full-stack **Lead Management Dashboard** built with the MERN stack and TypeScript. Manage, track, and convert leads efficiently with a modern, responsive UI, role-based access control, real-time search & filters, and CSV export.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register/login with bcrypt password hashing
- 👥 **Role-Based Access Control (RBAC)** — Admin vs. Sales roles with middleware enforcement
- 📋 **Full CRUD** — Create, read, update, delete leads (admin only for CRU/D)
- 🔍 **Advanced Filtering** — Filter by status, source, search name/email simultaneously
- 📄 **Pagination** — Server-side pagination with metadata
- 📁 **CSV Export** — Export all leads as a downloadable CSV file
- 🌙 **Dark Mode** — System-aware toggle with localStorage persistence
- ⚡ **Debounced Search** — 500ms debounce prevents excessive API calls
- 🐳 **Docker Ready** — Full Docker Compose setup for one-command deployment

---

## 🛠 Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Frontend    | React 18, TypeScript, TailwindCSS, Vite |
| Backend     | Node.js, Express.js, TypeScript         |
| Database    | MongoDB + Mongoose                      |
| Auth        | JWT + bcryptjs                          |
| Container   | Docker + Docker Compose                 |
| HTTP Client | Axios                                   |

---

## 📋 Prerequisites

- **Node.js** v18+
- **npm** v9+
- **MongoDB** v6+ (local) or a MongoDB Atlas URI
- **Docker** + **Docker Compose** (for containerized setup)

---

## 🚀 Local Development Setup

### 1. Clone & Navigate

```bash
git clone <repository-url>
cd smart-leads-dashboard
```

### 2. Setup Backend

```bash
cd server
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

npm run dev   # starts on http://localhost:5000
```

### 3. Setup Frontend

```bash
cd ../client
npm install
npm run dev   # starts on http://localhost:3000
```

The Vite dev server proxies all `/api` requests to `http://localhost:5000`.

---

## 🔧 Environment Variables

Create `server/.env` based on `server/.env.example`:

| Variable       | Description                         | Example                              |
|----------------|-------------------------------------|--------------------------------------|
| `PORT`         | Backend server port                 | `5000`                               |
| `MONGODB_URI`  | MongoDB connection string           | `mongodb://localhost:27017/smart-leads` |
| `JWT_SECRET`   | Secret key for signing JWTs         | `your_long_random_secret_key`        |
| `JWT_EXPIRES_IN` | JWT expiry duration               | `7d`                                 |
| `NODE_ENV`     | Environment mode                    | `development` / `production`         |
| `CLIENT_URL`   | Frontend URL for CORS               | `http://localhost:3000`              |

**Frontend** — optionally create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🐳 Docker Setup

### Run with Docker Compose (One Command)

```bash
# From the project root
docker-compose up --build
```

This starts:
| Service   | URL                        |
|-----------|----------------------------|
| Client    | http://localhost:3000      |
| Server    | http://localhost:5000      |
| MongoDB   | mongodb://localhost:27017  |

### Stop Containers

```bash
docker-compose down
# To also remove volumes (delete all data):
docker-compose down -v
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Response Format

**Success:**
```json
{
  "success": true,
  "message": "Leads fetched successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description here"
}
```

---

### 🔑 Auth Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "_id": "664abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    }
  }
}
```

---

#### POST `/api/auth/login`
Authenticate a user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com", "role": "admin" }
  }
}
```

---

### 📋 Lead Endpoints

> All lead endpoints require `Authorization: Bearer <token>` header.

#### GET `/api/leads`
Fetch paginated leads with optional filters.

**Query Parameters:**

| Param    | Type     | Description                              | Example              |
|----------|----------|------------------------------------------|----------------------|
| `page`   | number   | Page number (default: 1)                 | `?page=2`            |
| `limit`  | number   | Records per page (default: 10, max: 100) | `?limit=20`          |
| `status` | string   | Filter by status                         | `?status=Qualified`  |
| `source` | string   | Filter by source                         | `?source=Instagram`  |
| `search` | string   | Search name OR email (case-insensitive)  | `?search=rahul`      |
| `sort`   | string   | `latest` (default) or `oldest`           | `?sort=oldest`       |

**Combined Example:**
```
GET /api/leads?status=Qualified&source=Instagram&search=rahul&sort=latest&page=1&limit=10
```

---

#### POST `/api/leads` *(Admin only)*
Create a new lead.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "status": "New",
  "source": "Instagram"
}
```

---

#### GET `/api/leads/:id`
Get a single lead by ID.

---

#### PUT `/api/leads/:id` *(Admin only)*
Update a lead.

**Request Body:** (all fields optional)
```json
{
  "status": "Qualified"
}
```

---

#### DELETE `/api/leads/:id` *(Admin only)*
Delete a lead.

---

#### GET `/api/leads/export/csv` *(Admin only)*
Export all leads as a CSV file download.

**Response:** `Content-Type: text/csv` with headers:
```
Name,Email,Status,Source,Created At
```

---

## 👤 Role-Based Access Control

| Feature            | Admin | Sales |
|--------------------|:-----:|:-----:|
| View all leads     | ✅    | ✅    |
| Search & filter    | ✅    | ✅    |
| Create leads       | ✅    | ❌    |
| Edit leads         | ✅    | ❌    |
| Delete leads       | ✅    | ❌    |
| Export CSV         | ✅    | ❌    |

- Role is embedded in the JWT payload
- Backend enforces RBAC via `requireRole` middleware (returns 403 if insufficient role)
- Frontend hides admin-only buttons for sales users

---

## 📁 Folder Structure

```
smart-leads-dashboard/
├── client/                        # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts           # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── LeadTable.tsx      # Data table with status badges
│   │   │   ├── LeadForm.tsx       # Create/edit modal
│   │   │   ├── FilterBar.tsx      # Status/source/sort dropdowns
│   │   │   ├── SearchBar.tsx      # Debounced search input
│   │   │   ├── Pagination.tsx     # Page controls
│   │   │   ├── Navbar.tsx         # Top navigation
│   │   │   ├── ProtectedRoute.tsx # Auth guard
│   │   │   ├── LoadingSpinner.tsx # Spinner component
│   │   │   └── EmptyState.tsx     # Empty list state
│   │   ├── context/
│   │   │   └── AuthContext.tsx    # Auth state + localStorage
│   │   ├── hooks/
│   │   │   └── useDebounce.ts     # 500ms debounce hook
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      # Login form
│   │   │   ├── RegisterPage.tsx   # Registration form
│   │   │   └── DashboardPage.tsx  # Main dashboard
│   │   ├── types/
│   │   │   └── index.ts           # All TypeScript interfaces
│   │   └── utils/
│   │       └── exportCSV.ts       # Client-side CSV utility
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.ts  # Register + Login
│   │   │   └── leadController.ts  # CRUD + CSV export
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT verification
│   │   │   ├── role.ts            # RBAC middleware
│   │   │   └── errorHandler.ts    # Global error handler
│   │   ├── models/
│   │   │   ├── User.ts            # User Mongoose model
│   │   │   └── Lead.ts            # Lead Mongoose model
│   │   ├── routes/
│   │   │   ├── auth.ts            # Auth routes
│   │   │   └── leads.ts           # Lead routes
│   │   ├── types/
│   │   │   └── index.ts           # Server-side TypeScript types
│   │   └── index.ts               # Express app entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## 📝 HTTP Status Codes

| Code | Meaning                           |
|------|-----------------------------------|
| 200  | OK — Request successful           |
| 201  | Created — Resource created        |
| 400  | Bad Request — Validation error    |
| 401  | Unauthorized — No/invalid token   |
| 403  | Forbidden — Insufficient role     |
| 404  | Not Found — Resource not found    |
| 500  | Internal Server Error             |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this project for learning or production purposes.
