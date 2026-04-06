# Finance Data Processing & Access Control Backend
### MongoDB Edition — Zorvyn FinTech Assessment

> Built with **Node.js · Express · MongoDB (Mongoose) · JWT**
> Zero native compilation — works on any machine with Node.js installed.

---

## Table of Contents

1. [What You Need to Install](#1-what-you-need-to-install)
2. [MongoDB Atlas Setup (Free Cloud DB)](#2-mongodb-atlas-setup-free-cloud-db)
3. [Project Setup](#3-project-setup)
4. [Running the Server](#4-running-the-server)
5. [Testing the API](#5-testing-the-api)
6. [Default Accounts](#6-default-accounts)
7. [Project Structure](#7-project-structure)
8. [Role & Permission Matrix](#8-role--permission-matrix)
9. [API Reference](#9-api-reference)
10. [Features & Design Decisions](#10-features--design-decisions)

---

## 1. What You Need to Install

### Node.js (required)

1. Go to **https://nodejs.org**
2. Download the **LTS** version (left button — "Recommended For Most Users")
3. Run the installer — click **Next** through everything, keep all defaults
4. Restart your computer after install

**Verify** — open Command Prompt and type:
```cmd
node --version
npm --version
```
Both should print version numbers (e.g. `v22.x.x` and `10.x.x`).

### VS Code (recommended editor)

1. Go to **https://code.visualstudio.com**
2. Download and install (all defaults are fine)

### REST Client extension for VS Code (for testing)

1. Open VS Code
2. Press `Ctrl + Shift + X`
3. Search **REST Client** (by Huachao Mao)
4. Click **Install**

---

## 2. MongoDB Atlas Setup (Free Cloud Database)

MongoDB Atlas is a **free cloud-hosted MongoDB** — no installation on your machine required. The `mongoose` driver is pure JavaScript with zero compilation.

### Step-by-step:

**A. Create a free account**
1. Go to **https://cloud.mongodb.com**
2. Click **Try Free** → sign up with Google or email
3. Choose **"I'm learning MongoDB"** when asked

**B. Create a free cluster**
1. Click **"Build a Database"**
2. Choose **M0 Free** tier
3. Pick any cloud provider and region (closest to you)
4. Click **"Create"** and wait ~2 minutes

**C. Create a database user**
1. In the left menu → **Security → Database Access**
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Set a username (e.g. `financeuser`) and a strong password
5. Under **"Database User Privileges"** → select **"Atlas admin"**
6. Click **"Add User"**

**D. Allow network access**
1. In the left menu → **Security → Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
4. Click **"Confirm"**

**E. Get your connection string**
1. In the left menu → **Deployment → Database**
2. Click **"Connect"** on your cluster
3. Choose **"Drivers"**
4. Select **Node.js** / **6.x or later**
5. Copy the connection string — it looks like:
   ```
   mongodb+srv://financeuser:<password>@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database user password

---

## 3. Project Setup

### Step 1 — Extract the zip

Right-click `finance-backend-pro.zip` → **Extract All** → choose a location (e.g. `C:\Projects\finance-backend-pro`)

### Step 2 — Open Command Prompt in the project folder

In File Explorer, navigate into the folder → click the address bar at the top → type `cmd` → press **Enter**

### Step 3 — Install dependencies

```cmd
npm install
```

You will see packages downloading. It should complete in under 60 seconds with **no errors** (no compilation needed — mongoose is pure JavaScript).

Expected end of output:
```
added 112 packages in 45s
found 0 vulnerabilities
```

### Step 4 — Create your environment file

```cmd
copy .env.example .env
```

Open `.env` in Notepad:
```cmd
notepad .env
```

Fill in your values:
```env
PORT=3000
NODE_ENV=development

# Paste your MongoDB Atlas connection string here
MONGO_URI=mongodb+srv://financeuser:YourPassword@cluster0.abc12.mongodb.net/finance_db?retryWrites=true&w=majority

# Change this to any long random string
JWT_SECRET=MyFinanceApp_SuperSecretKey_2025_AbcXyz123!
JWT_EXPIRES_IN=7d
```

**Important:** Replace the MONGO_URI with your actual Atlas connection string from Step 2E above. Add `finance_db` before the `?` — this is the database name that will be created automatically.

Save the file (`Ctrl + S`) and close Notepad.

### Step 5 — Seed the database

```cmd
npm run seed
```

This connects to MongoDB, creates all collections, and inserts:
- 3 default user accounts
- ~45 realistic financial records for the current year

Expected output:
```
  🍃  MongoDB connected → cluster0.abc12.mongodb.net

🌱  Seeding MongoDB...

  ✓ [admin  ]  admin@finance.dev   /   Admin@1234
  ✓ [analyst]  analyst@finance.dev /   Analyst@1234
  ✓ [viewer ]  viewer@finance.dev  /   Viewer@1234

  ✓ Inserted 45 sample financial records (year 2026)

✅  Seeding complete!
```

---

## 4. Running the Server

### Start normally:
```cmd
npm start
```

### Start in development mode (auto-restarts when you save files):
```cmd
npm run dev
```

Expected output:
```
  🍃  MongoDB connected → cluster0.abc12.mongodb.net

══════════════════════════════════════════════════════
  🚀  Finance Backend  (MongoDB Edition)
══════════════════════════════════════════════════════
  API URL    →  http://localhost:3000/api
  Health     →  http://localhost:3000/health
  Env        →  development
══════════════════════════════════════════════════════
```

**Verify it works** — open a browser and go to:
```
http://localhost:3000/health
```

You should see:
```json
{ "status": "ok", "uptime": 3, "timestamp": "2026-04-06T10:00:00.000Z" }
```

**To stop the server:** press `Ctrl + C` in Command Prompt.

---

## 5. Testing the API

### Option A — VS Code REST Client (easiest, recommended)

1. Open VS Code → File → Open Folder → select your `finance-backend-pro` folder
2. In the file tree on the left, open `tests/api.http`
3. You will see **"Send Request"** appear above each `###` block
4. Click **Send Request** on the **"① Login as Admin"** block
5. The response appears in a panel on the right — copy the `token` value
6. Paste it next to `@token =` at the top of the file
7. Now click **Send Request** on any other block to test it

### Option B — Command Prompt (curl)

Windows 10/11 include curl by default.

```cmd
:: Login and get a token
curl -s -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@finance.dev\",\"password\":\"Admin@1234\"}"
```

Copy the token from the response, then:

```cmd
:: Dashboard summary
curl -s http://localhost:3000/api/dashboard/summary ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

:: List records
curl -s "http://localhost:3000/api/records?page=1&limit=5" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

:: Monthly trends
curl -s "http://localhost:3000/api/dashboard/trends/monthly" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 6. Default Accounts

Created automatically by `npm run seed`:

| Role    | Email                   | Password       |
|---------|-------------------------|----------------|
| Admin   | admin@finance.dev       | Admin@1234     |
| Analyst | analyst@finance.dev     | Analyst@1234   |
| Viewer  | viewer@finance.dev      | Viewer@1234    |

---

## 7. Project Structure

```
finance-backend-pro/
│
├── server.js                         # Entry point — connects DB, starts server
│
├── src/
│   ├── app.js                        # Express setup, middleware, routes, error handler
│   │
│   ├── config/
│   │   ├── database.js               # Mongoose connection
│   │   └── seed.js                   # Default users + sample records
│   │
│   ├── models/                       # ← Mongoose schemas (MongoDB documents)
│   │   ├── User.js                   # Users with role + status
│   │   ├── FinancialRecord.js        # Income/expense records (soft-deletable)
│   │   └── AuditLog.js               # Append-only action trail
│   │
│   ├── controllers/
│   │   ├── authController.js         # register, login, me
│   │   ├── userController.js         # User CRUD
│   │   ├── recordController.js       # Record CRUD with search & filter
│   │   └── dashboardController.js    # Analytics (aggregation pipelines)
│   │
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification → req.user
│   │   ├── rbac.js                   # authorize(minRole) role check
│   │   ├── validate.js               # express-validator error collector
│   │   ├── rateLimiter.js            # 20 auth/15min · 120 api/min
│   │   └── requestId.js              # UUID per request → X-Request-Id header
│   │
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── records.js
│   │   └── dashboard.js
│   │
│   ├── validators/
│   │   ├── authValidators.js
│   │   ├── userValidators.js
│   │   └── recordValidators.js
│   │
│   └── utils/
│       ├── AppError.js               # Typed error classes
│       ├── audit.js                  # Writes to AuditLog collection
│       └── paginate.js               # parsePagination + buildPaginationMeta
│
├── tests/
│   └── api.http                      # Full test suite for VS Code REST Client
│
├── .env.example                      # Environment variable template
├── .env                              # Your local config (NOT committed to git)
├── .gitignore
├── package.json
└── README.md
```

---

## 8. Role & Permission Matrix

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| Login / Register | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| View financial records | ✅ | ✅ | ✅ |
| Search & filter records | ✅ | ✅ | ✅ |
| View dashboard summary | ✅ | ✅ | ✅ |
| View recent activity | ✅ | ✅ | ✅ |
| Create records | ❌ | ✅ | ✅ |
| Update own records | ❌ | ✅ | ✅ |
| Update any record | ❌ | ❌ | ✅ |
| Delete own records (soft) | ❌ | ✅ | ✅ |
| Delete any record (soft) | ❌ | ❌ | ✅ |
| Category breakdown | ❌ | ✅ | ✅ |
| Monthly trends | ❌ | ✅ | ✅ |
| Weekly trends | ❌ | ✅ | ✅ |
| Top categories | ❌ | ✅ | ✅ |
| List / manage all users | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |

---

## 9. API Reference

All endpoints are prefixed with `/api`.
Protected endpoints require: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new viewer account |
| POST | `/api/auth/login` | None | Login and receive a JWT token |
| GET | `/api/auth/me` | Required | Get current user's profile |

### Users *(admin only)*

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (paginated) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Update user details |
| PATCH | `/api/users/:id/status` | Set status active/inactive |
| DELETE | `/api/users/:id` | Delete user permanently |

**Query params:** `?page=1&limit=20`

### Financial Records

| Method | Endpoint | Min Role | Description |
|---|---|---|---|
| GET | `/api/records` | viewer | List records (filtered + paginated) |
| GET | `/api/records/:id` | viewer | Get one record |
| POST | `/api/records` | analyst | Create a record |
| PUT | `/api/records/:id` | analyst | Update (own only for analyst) |
| DELETE | `/api/records/:id` | analyst | Soft delete |

**Filter query params for `GET /api/records`:**

| Param | Description |
|---|---|
| `type` | `income` or `expense` |
| `category` | Partial text match |
| `start_date` | ISO date — on or after |
| `end_date` | ISO date — on or before |
| `search` | Full-text search in category + notes |
| `page` | Page number (default: 1) |
| `limit` | Per page (default: 20, max: 100) |

### Dashboard

| Method | Endpoint | Min Role | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | viewer | Total income, expenses, net balance |
| GET | `/api/dashboard/recent` | viewer | Latest N records |
| GET | `/api/dashboard/categories` | analyst | Income + expense by category |
| GET | `/api/dashboard/trends/monthly` | analyst | 12-month trend data |
| GET | `/api/dashboard/trends/weekly` | analyst | Last 12 weeks trend |
| GET | `/api/dashboard/top-categories` | analyst | Top N categories |
| GET | `/api/dashboard/audit-logs` | admin | Full audit trail |

---

## 10. Features & Design Decisions

| Feature | Detail |
|---|---|
| **Database** | MongoDB Atlas — free cloud DB, pure JS driver, zero compilation |
| **ODM** | Mongoose — schemas, validation, indexes, populate (joins) |
| **Auth** | JWT tokens — stateless, 7-day expiry, re-fetched from DB each request |
| **Passwords** | bcryptjs with cost factor 12 — secure, no native dependencies |
| **RBAC** | Numeric role hierarchy — `authorize("analyst")` allows analyst + admin |
| **Soft deletes** | `deletedAt` field — records are never erased, always auditable |
| **Aggregation** | MongoDB pipelines for GROUP BY / SUM — native, fast, no raw SQL |
| **Audit log** | Append-only `AuditLog` collection — tracks who did what + IP |
| **Search** | MongoDB `$regex` on category + notes — no extra search engine |
| **Rate limiting** | Auth: 20/15min · API: 120/min — both per IP |
| **Security headers** | `helmet` — XSS, clickjacking, MIME sniffing protection |
| **Request tracing** | `X-Request-Id` UUID on every response |
| **Error handling** | Typed `AppError` classes — consistent JSON error format always |
| **Last admin guard** | Cannot demote or deactivate the only active admin |
| **Validation** | `express-validator` on all write endpoints |
| **Pagination** | `page`, `limit`, `total`, `pages`, `hasNext`, `hasPrev` on all lists |
