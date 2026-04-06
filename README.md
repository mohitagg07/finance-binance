# 💰 Finance Data Processing & Access Control Backend

> A production-grade backend system for managing financial records with role-based access control, JWT authentication, and dashboard analytics.

---

## 🚀 Overview

This project is a backend system built for a **finance dashboard** that handles financial records, user management, and access control.

**What this demonstrates:**
- Clean, modular backend architecture
- Role-Based Access Control (RBAC) via middleware
- Secure JWT authentication
- Real-world data modeling & aggregation
- Production-level error handling and validation

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | JWT (JSON Web Tokens) |
| Testing | Postman / Thunder Client |
| Security | bcryptjs, rate-limiting |

---

## 📂 Project Structure

```
finance-binance/
│
├── server.js
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── database.js
│   │   └── seed.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── recordController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rbac.js
│   │   ├── rateLimiter.js
│   │   ├── requestId.js
│   │   └── validate.js
│   ├── models/
│   │   ├── User.js
│   │   ├── FinancialRecord.js
│   │   └── AuditLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── records.js
│   │   ├── dashboard.js
│   │   └── users.js
│   ├── utils/
│   │   ├── AppError.js
│   │   ├── audit.js
│   │   └── paginate.js
│   └── validators/
│       ├── authValidators.js
│       ├── recordValidators.js
│       └── userValidators.js
└── tests/
    └── api.http
```

---

## 👤 User Roles & Permissions

| Role | View Records | Create/Edit Records | Delete Records | Dashboard | User Management |
|---|---|---|---|---|---|
| **Viewer** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Analyst** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 Authentication

- JWT-based stateless authentication
- Token required for all protected routes
- User role embedded inside JWT payload
- Tokens expire in **7 days**

---

## 📌 API Endpoints

### 🔑 Auth

```
POST /api/auth/login
```
**Body:**
```json
{
  "email": "admin@finance.dev",
  "password": "Admin@1234"
}
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "name": "Super Admin",
    "role": "admin"
  }
}
```

---

### 💰 Financial Records

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/records` | All roles | Fetch all records (paginated) |
| POST | `/api/records` | Admin only | Create new record |
| PUT | `/api/records/:id` | Admin only | Update record |
| DELETE | `/api/records/:id` | Admin only | Delete record |

**Create Record Body:**
```json
{
  "amount": 1000,
  "type": "expense",
  "category": "Food",
  "notes": "Lunch"
}
```

**Filters supported:**
```
GET /api/records?category=Food&type=expense&page=1&limit=10
```

---

### 📊 Dashboard

```
GET /api/dashboard/summary
```

**Response:**
```json
{
  "totalIncome": 255000,
  "totalExpense": 87500,
  "netBalance": 167500,
  "categoryBreakdown": {
    "Salary": 255000,
    "Rent": 36000,
    "Groceries": 21000,
    "Utilities": 14500
  }
}
```

---

### 👥 Users (Admin Only)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| PATCH | `/api/users/:id` | Update role/status |

---

## 🔐 Role-Based Access Control (RBAC)

RBAC is implemented as a **reusable middleware** that checks the user's role from the JWT token on every protected route.

```js
// Example usage in routes
router.post("/records", auth, rbac("analyst", "admin"), createRecord);
```

If a **Viewer** tries to create a record, the API responds:

```json
{
  "error": "This action requires the 'analyst' role or higher. Your current role: 'viewer'"
}
```
**Status Code: `403 Forbidden`**

---

## 🧪 RBAC Proof (Live Testing)

### 🔑 1. Login — JWT Token Generated Successfully

![Login Success](Screenshots/Screenshot%202026-04-06%20151901.png)

Admin logs in and receives a JWT token, which is used for all subsequent authenticated requests.

---

### 📄 2. Fetch Records — Authorized Access (200 OK)

![Get Records](Screenshots/Screenshot%202026-04-06%20152502.png))

Admin uses the Bearer token in the `Authorization` header to successfully fetch all financial records.

---

### 🚫 3. Viewer Blocked — 403 Forbidden

![RBAC Forbidden](Screenshots/Screenshot%202026-04-06%20153859.png)

A Viewer tries to create a record — the system correctly **blocks the request** with `403 Forbidden` and explains the role requirement.

> ✅ This confirms the RBAC middleware is working as intended.

---

## 🌱 Sample Users (Seeded)

| Role | Email | Password |
|---|---|---|
| Admin | admin@finance.dev | Admin@1234 |
| Analyst | analyst@finance.dev | Analyst@1234 |
| Viewer | viewer@finance.dev | Viewer@1234 |

Run the seed script to populate these users + 44 sample financial records:

```bash
npm run seed
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/mohitagg07/finance-binance.git
cd finance-binance
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root:

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/finance_db?retryWrites=true&w=majority
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
```

### 4. Seed Database

```bash
npm run seed
```

### 5. Start Server

```bash
npm start
```

---

## 🌐 API Base URL

```
http://localhost:3001/api
```

**Health Check:**
```
http://localhost:3001/health
```

---

## ⚠️ Assumptions Made

- Roles are predefined at the system level: `admin`, `analyst`, `viewer`
- JWT is used for stateless authentication (no session storage)
- MongoDB Atlas is used for cloud persistence
- A **Viewer** can view all records but cannot create, update, or delete
- An **Analyst** has the same read access as a Viewer with access to dashboard insights
- Financial record `type` is restricted to `income` or `expense`
- All monetary amounts must be positive numbers

---

## ⭐ Additional Features (Beyond Requirements)

| Feature | Description |
|---|---|
| 🔄 Rate Limiting | Prevents API abuse / brute force |
| 🆔 Request ID Tracking | Each request gets a unique ID for debugging |
| 📋 Audit Logging | Tracks all admin actions in AuditLog collection |
| 📄 Pagination | All list endpoints support `?page=1&limit=10` |
| ✅ Input Validation | Centralized validators for all routes |
| 🛡️ Structured Error Handling | Custom `AppError` class with consistent error format |
| 🌱 Seed Script | Populates DB with 3 users + 44 realistic financial records |

---

## 🧠 Architecture Highlights

> "Designed using modular architecture with separation of concerns between routes, controllers, middleware, validators, and utilities. Role-based access control implemented via dedicated middleware for scalability and maintainability."

- **Routes** → only define paths and attach middleware
- **Controllers** → handle business logic
- **Middleware** → auth, RBAC, rate limiting, validation
- **Models** → Mongoose schemas with proper constraints
- **Utils** → reusable helpers (pagination, error class, audit)

---

## 📌 Conclusion

This project fully satisfies all assignment requirements and goes beyond by adding production-grade features like audit logging, rate limiting, and request tracking. The RBAC system is cleanly implemented and verifiable through live API testing.

---

## 👨‍💻 Author

**Mohit Aggarwal**  
GitHub: [@mohitagg07](https://github.com/mohitagg07)
