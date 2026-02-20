# 📚 Gamified Trash Platform — Full Project Documentation

> A web-based gamified platform where users upload images of properly disposed trash, earn points for verified submissions, and redeem those points for rewards. An AI model verifies the image before awarding points.

---

## 📁 Project Structure

```
project/
├── backend/                  # Python FastAPI Server
│   ├── app/
│   │   ├── main.py           # Application entry point
│   │   ├── database.py       # Database connection & session
│   │   ├── models/           # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── upload.py
│   │   │   └── reward.py
│   │   ├── routers/          # API route handlers
│   │   │   ├── auth.py       # Register & Login
│   │   │   ├── users.py      # User profile
│   │   │   ├── uploads.py    # Image upload & analysis
│   │   │   └── rewards.py    # Rewards & redemption
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── services/
│   │   │   └── ai_service.py # TensorFlow image classification
│   │   └── utils/
│   │       └── security.py   # JWT & password hashing
│   ├── ai/
│   │   └── train.py          # CNN model training script
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment configuration
│
└── frontend/                 # React + Vite Application
    ├── src/
    │   ├── App.jsx            # Root component & routing
    │   ├── main.jsx           # React DOM entry point
    │   ├── context/
    │   │   └── AuthContext.jsx # Global auth state
    │   ├── services/
    │   │   └── api.js         # Axios HTTP client
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Upload.jsx
    │   │   └── Rewards.jsx
    │   └── components/
    │       └── Navbar.jsx
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🖥️ FRONTEND

### Technology Stack

| Technology | Version | Role |
|---|---|---|
| **React** | 18.2.0 | UI Component Library |
| **Vite** | 5.2.0 | Build Tool & Dev Server |
| **React Router DOM** | 6.22.3 | Client-Side Routing |
| **Axios** | 1.6.8 | HTTP API Client |
| **Tailwind CSS** | 3.4.3 | Utility-First Styling |
| **Lucide React** | 0.370.0 | Icon Library |

---

### 1. React 18

**What it is:** React is a JavaScript library for building component-based user interfaces.

**Why it was chosen:**
- **Component Reusability:** Every page (Login, Dashboard, Upload, Rewards) is a self-contained React component that can be independently developed, tested, and reused.
- **Virtual DOM:** React only re-renders components that actually changed, giving a fast and smooth experience without full page reloads.
- **Hooks-based State Management:** Using `useState`, `useEffect`, and `useContext` across the app keeps logic cleanly contained within components.
- **Massive Ecosystem:** React has a huge ecosystem, making it easy to find libraries like React Router, Axios, and Lucide that integrate seamlessly.
- **React 18 Concurrent Features:** Better handling of async operations and rendering, which improves perceived performance when loading dashboard data and uploading images.

---

### 2. Vite (Build Tool)

**What it is:** Vite is a next-generation frontend build tool that uses ES Modules natively in the browser during development for near-instant startup.

**Why it was chosen:**
- **Blazing-Fast Dev Server:** Unlike Webpack-based tools (e.g., Create React App), Vite starts the dev server almost instantly regardless of project size, because it doesn't bundle during development.
- **Hot Module Replacement (HMR):** Changes to components are reflected in the browser in milliseconds without full page reloads.
- **Optimized Production Builds:** Vite uses Rollup under the hood for production builds, generating highly optimized, tree-shaken output.
- **Built-in Environment Variables:** The `VITE_API_URL` environment variable used in `api.js` is plug-and-play with Vite.
- **ES Modules:** The `"type": "module"` in `package.json` confirms this, enabling modern JavaScript syntax natively.

---

### 3. React Router DOM v6

**What it is:** A declarative client-side routing library for React applications.

**How it's used in this project:**

```jsx
// App.jsx - Route definitions
<Routes>
  <Route path="/"          element={<Navigate to="/dashboard" />} />
  <Route path="/login"     element={<Login />} />
  <Route path="/register"  element={<Register />} />
  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
  <Route path="/upload"    element={<PrivateRoute><Upload /></PrivateRoute>} />
  <Route path="/rewards"   element={<PrivateRoute><Rewards /></PrivateRoute>} />
</Routes>
```

**Why it was chosen:**
- **Single-Page Application (SPA):** Navigation between pages happens without a full browser reload, giving an app-like feel.
- **Protected Routes:** The custom `<PrivateRoute>` component wraps protected pages. If the user has no JWT token, they are automatically redirected to `/login`.
- **Declarative Syntax:** Routes are defined clearly in JSX making it easy to audit what pages exist and which are protected.
- **v6 Improvements:** The `<Routes>` / `<Route>` API is simpler and more intuitive than v5's `<Switch>`.

---

### 4. Axios (HTTP Client)

**What it is:** A promise-based HTTP client for making API calls from the browser.

**How it's used:**

```js
// services/api.js
const api = axios.create({ baseURL: 'http://localhost:8000' });

// Automatic JWT injection on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auto-logout on 401 Unauthorized
api.interceptors.response.use(response => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
});
```

**Why it was chosen:**
- **Interceptors:** The request interceptor automatically attaches the JWT Bearer token to every API call, removing the need to manually set headers in each component.
- **Auto Logout:** The response interceptor detects `401 Unauthorized` globally and redirects to the login page. This prevents broken states where an expired token causes silent failures.
- **Cleaner API than Fetch:** Axios automatically parses JSON responses and throws errors for non-2xx status codes (Fetch does not), making error handling more intuitive.
- **Base URL Config:** A single `baseURL` config makes it easy to switch from localhost to a production API by changing one environment variable (`VITE_API_URL`).

---

### 5. Tailwind CSS

**What it is:** A utility-first CSS framework that allows styling directly in JSX markup with pre-defined classes.

**Why it was chosen:**
- **Rapid UI Development:** Instead of writing separate CSS files, styling is applied using classes like `flex`, `px-4`, `rounded-lg`, `bg-green-500` directly in components.
- **No Style Conflicts:** Because styles are scoped to classes in markup, there are no CSS specificity battles or accidental global overrides.
- **Responsive Design:** Responsive breakpoints (`sm:`, `md:`, `lg:`) are built in, making the UI work across screen sizes with minimal effort.
- **Consistent Design System:** Tailwind enforces a spacing, color, and typography scale out of the box, ensuring visual consistency across all pages.

---

### 6. Context API — Authentication State (`AuthContext.jsx`)

**What it is:** React's built-in global state management for sharing data across the entire component tree without prop-drilling.

**How it works:**
- On app load, checks `localStorage` for a saved JWT token.
- If a token exists, it fetches the user's profile from `/users/profile` to populate the `user` object.
- Exposes `login()`, `register()`, `logout()`, and `fetchProfile()` to the entire app.
- After registering, automatically calls `login()` so the user is seamlessly redirected without needing to re-enter credentials.

**Why Context API instead of Redux:**
- The authentication state (`token`, `user`) is simple and does not require Redux's complex action/reducer pattern.
- Context API is built into React — no additional dependency needed.
- The app's state needs (auth only) do not justify the overhead of a full state management library.

---

### Frontend Pages Summary

| Page | Path | Auth Required | Purpose |
|---|---|---|---|
| Login | `/login` | ❌ | Email/password login, receives JWT |
| Register | `/register` | ❌ | Creates new account, auto-logs in |
| Dashboard | `/dashboard` | ✅ | Shows points, upload history stats |
| Upload | `/upload` | ✅ | Image upload, shows AI result |
| Rewards | `/rewards` | ✅ | Lists rewards, allows redemption |

---

---

## ⚙️ BACKEND

### Technology Stack

| Technology | Version | Role |
|---|---|---|
| **Python** | 3.14 | Programming Language |
| **FastAPI** | ≥0.111.0 | Web Framework & API |
| **Uvicorn** | ≥0.30.1 | ASGI Web Server |
| **SQLAlchemy** | ≥2.0.30 | ORM (Database Layer) |
| **Pydantic v2** | ≥2.7.4 | Data Validation & Serialization |
| **Passlib + bcrypt** | 1.7.4 / 4.0.1 | Password Hashing |
| **python-jose** | ≥3.3.0 | JWT Token Creation/Verification |
| **Pillow** | ≥10.3.0 | Image Processing |
| **NumPy** | ≥2.0.0 | Numerical Array Operations |
| **TensorFlow** | (optional) | AI Image Classification |
| **Alembic** | ≥1.13.1 | Database Migrations |
| **SQLite / PostgreSQL** | — | Database |

---

### 1. FastAPI

**What it is:** A modern, high-performance Python web framework for building APIs, based on standard Python type hints.

**Why it was chosen:**
- **Automatic API Documentation:** FastAPI auto-generates interactive Swagger UI at `http://localhost:8000/docs` and ReDoc at `/redoc`. Every endpoint, request body, and response schema is documented without any extra effort.
- **Type-Safety with Pydantic:** By declaring request and response types using Pydantic models, FastAPI automatically validates incoming data and returns clear errors if something is wrong — before any business logic runs.
- **Async Support:** FastAPI is built on ASGI and fully supports `async/await`. The `upload_image` endpoint reads files asynchronously (`await file.read()`), and calls the AI prediction asynchronously (`await predict_image(content)`), meaning the server doesn't block while waiting for I/O.
- **Dependency Injection:** FastAPI's `Depends()` system cleanly wires database sessions and the authenticated user into route handlers. For example, any protected route simply declares `current_user: User = Depends(get_current_user)` and FastAPI handles token validation automatically.
- **Performance:** FastAPI is one of the fastest Python frameworks, on par with NodeJS and Go in benchmark tests, because it is built on Starlette (ASGI) and Pydantic v2 (Rust-compiled).

---

### 2. Uvicorn (ASGI Server)

**What it is:** An ASGI (Asynchronous Server Gateway Interface) server that runs FastAPI applications.

**Why it was chosen:**
- **ASGI Compatibility:** FastAPI is an ASGI app; Uvicorn is the recommended production-grade server for ASGI applications.
- **`--reload` Mode:** During development, `uvicorn app.main:app --reload` watches for file changes and restarts automatically, without manual server restarts.
- **High Performance:** Uvicorn uses `uvloop` (an ultra-fast asyncio event loop) and `httptools` for HTTP parsing, making it significantly faster than WSGI servers like Gunicorn alone.

---

### 3. SQLAlchemy (ORM)

**What it is:** Python's most widely used Object Relational Mapper, which lets you interact with the database using Python classes instead of raw SQL.

**Database Models:**

```
users        → id (UUID), name, email, password_hash, points, created_at
uploads      → id (UUID), user_id (FK), image_url, image_hash (SHA256), 
               product_code, prediction, confidence, status, created_at
rewards      → id, reward_name, description, points_required, available_quantity
redemptions  → id, user_id (FK), reward_id (FK), redeemed_at
```

**Key Design Decisions:**
- **UUID Primary Keys:** User and Upload records use UUID primary keys instead of auto-increment integers to prevent enumeration attacks (an attacker can't guess `/users/1`, `/users/2`).
- **Image Hashing:** Every uploaded image is SHA-256 fingerprinted before saving. If the same image is uploaded again (by any user), it's detected as a duplicate instantly with a database index lookup — no AI inference needed.
- **Relationships:** SQLAlchemy `relationship()` links Users → Uploads → Redemptions, enabling easy ORM traversal.
- **SQLite / PostgreSQL Compatibility:** The database layer is abstracted behind SQLAlchemy, so the app can run on lightweight SQLite locally and switch to PostgreSQL in production by changing one `.env` line.

**Why SQLAlchemy:**
- Prevents SQL injection attacks entirely (parameterized queries by default).
- Allows Python-level model definitions — migrations, relationships, and queries are all in Python.
- `get_db()` session generator ensures each request gets its own database session and it's properly closed on request completion.

---

### 4. Pydantic v2 (Data Validation)

**What it is:** A data validation library that uses Python type annotations to validate and serialize data.

**Why it was chosen:**
- **Request Validation:** When the frontend sends a `POST /register` with `{ name, email, password }`, Pydantic automatically checks that the email is a valid email address, all required fields are present, and types are correct.
- **Response Serialization:** FastAPI uses Pydantic response models to control exactly which fields are sent back to the client. The `UserResponse` model never exposes `password_hash`, even if it exists in the User object.
- **v2 Performance:** Pydantic v2 is compiled in Rust, making validation 5-10x faster than Pydantic v1.
- **Clear Error Messages:** If validation fails, FastAPI returns a structured JSON error with the exact field and what was wrong.

---

### 5. Authentication — JWT + bcrypt

#### Password Hashing (`passlib` + `bcrypt`)

- Passwords are never stored in plain text.
- When registering, the password is hashed using **bcrypt** (a work-factor adaptive algorithm) via `passlib`.
- **bcrypt** is the industry standard for password hashing because it is intentionally slow (tunable work factor), making brute-force attacks computationally expensive.
- **Version pinned to `bcrypt<4.1`** to ensure compatibility with `passlib 1.7.4`.

#### JWT Tokens (`python-jose`)

- After successful login, the server generates a **JSON Web Token (JWT)** signed with a secret key using the **HS256 algorithm**.
- The token payload contains the user's email (`sub` claim) and an expiry time.
- The frontend stores this token in `localStorage` and sends it in every request as `Authorization: Bearer <token>`.
- The `get_current_user` dependency on the backend decodes and validates the token on every protected route.
- **Advantage:** Stateless authentication — the server doesn't need to look up sessions in a database; the token itself proves identity.

---

### 6. AI Service — TensorFlow Image Classification

**Architecture (CNN — Convolutional Neural Network):**

```
Input: (128, 128, 3)  ← RGB image resized to 128×128
  → Conv2D(32, 3×3, relu)
  → MaxPooling2D(2×2)
  → Conv2D(64, 3×3, relu)
  → MaxPooling2D(2×2)
  → Flatten()
  → Dense(64, relu)
  → Dense(1, sigmoid)   ← Binary output: 0.0 = Invalid, 1.0 = Proper Trash
```

**Upload Processing Pipeline:**

```
1. File Type Validation    → Only JPEG/PNG accepted
2. File Size Validation    → Max 5 MB
3. SHA-256 Fingerprint     → Detect duplicate images
4. Save to Disk            → UUID-named file in uploaded_images/
5. AI Inference            → predict_image(image_bytes)
6. Decision Logic          → prediction == "Proper Trash Disposal" AND confidence >= 0.80
7. Award Points            → +10 points if approved
8. Database Transaction    → Atomic commit of upload + points update
```

**Graceful Fallback:**
- If TensorFlow is not installed or the model file is missing, the service falls back to a mock random prediction. This ensures the backend can start and be tested even in environments without GPU or TensorFlow.

**Why TensorFlow:**
- Industry standard for deep learning with a mature Python API (Keras).
- The CNN architecture is well-suited for image classification tasks.
- The `.h5` model file is portable and easy to save/load.

---

### 7. Alembic (Database Migrations)

**What it is:** A database migration tool for SQLAlchemy, allowing schema changes (adding columns, renaming tables) to be tracked and applied incrementally.

**Why it was chosen:**
- As the project evolves, database schema will change. Alembic tracks every change in versioned migration files.
- Migrations can be applied to a production database safely without dropping and recreating tables.
- Works seamlessly with SQLAlchemy models.

---

### API Endpoints Summary

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | ❌ | Create new user account |
| `POST` | `/login` | ❌ | Authenticate, returns JWT |
| `GET` | `/users/profile` | ✅ | Get current user info |
| `POST` | `/uploads/` | ✅ | Upload image for AI analysis |
| `GET` | `/uploads/dashboard` | ✅ | Get user stats & upload history |
| `GET` | `/rewards/` | ❌ | List all available rewards |
| `POST` | `/rewards/redeem/{id}` | ✅ | Redeem a reward with points |

---

## 🔗 Frontend ↔ Backend Communication

```
Browser (React)
    │
    │  HTTP Request (JSON / multipart form)
    │  + Authorization: Bearer <JWT Token>
    ▼
Uvicorn ASGI Server (port 8000)
    │
    ▼
FastAPI Router
    │
    ├─► Pydantic: Validate request body
    ├─► Depends(get_current_user): Decode JWT → attach User object
    ├─► Depends(get_db): Open SQLAlchemy Session
    │
    ▼
Business Logic (routers/)
    │
    ├── SQLAlchemy ORM → SQLite / PostgreSQL
    └── AI Service → TensorFlow / Fallback Mock
    │
    ▼
Pydantic Response Model → JSON
    │
    ▼
Browser receives response, updates React state
```

---

## 🔐 Security Architecture

| Security Concern | Solution Used |
|---|---|
| Password storage | bcrypt hashing (never plain text) |
| Authentication | Stateless JWT with expiry |
| Route protection | `Depends(get_current_user)` on all private endpoints |
| SQL Injection | SQLAlchemy ORM (parameterized queries) |
| Duplicate image fraud | SHA-256 content fingerprinting per upload |
| File type abuse | Server-side MIME type validation (`image/jpeg`, `image/png` only) |
| File size abuse | 5 MB hard cap enforced before any processing |
| Sensitive data exposure | Pydantic response models exclude `password_hash` |
| Token leakage | Auto-logout on 401 via Axios response interceptor |
| UUID Resource IDs | Prevents sequential enumeration of user/upload IDs |

---

## 🚀 Running the Project

### Backend
```powershell
cd project/backend
# Activate virtual environment
.\venv\Scripts\Activate.ps1
# Start server
uvicorn app.main:app --port 8000 --reload
```
- API runs at: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

### Frontend
```powershell
cd project/frontend
npm run dev
```
- Frontend runs at: `http://localhost:5173`

---

## 📦 Key Dependencies Reference

### Backend (`requirements.txt`)
```
fastapi>=0.111.0          # Web framework
uvicorn[standard]>=0.30.1 # ASGI server
sqlalchemy>=2.0.30        # ORM
psycopg2-binary>=2.9.9    # PostgreSQL driver
passlib[bcrypt]>=1.7.4    # Password hashing
bcrypt<4.1                # Pinned for passlib compatibility
python-jose[cryptography] # JWT tokens
python-multipart>=0.0.9   # Form/file upload parsing
pydantic[email]>=2.7.4    # Data validation
python-dotenv>=1.0.1      # .env file loading
Pillow>=10.3.0            # Image processing
numpy>=2.0.0              # Numerical arrays
alembic>=1.13.1           # DB migrations
```

### Frontend (`package.json`)
```json
"react": "^18.2.0"             // UI library
"react-dom": "^18.2.0"         // DOM renderer
"react-router-dom": "^6.22.3"  // Client routing
"axios": "^1.6.8"              // HTTP client
"lucide-react": "^0.370.0"     // Icons
"tailwindcss": "^3.4.3"        // Styling
"vite": "^5.2.0"               // Build tool
```

---

*Documentation generated: February 2026*
