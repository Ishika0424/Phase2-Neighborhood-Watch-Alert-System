# 🚨 Neighborhood Watch Alert System (Phase 2)

Welcome to the **Neighborhood Watch Alert System (Phase 2)**! This system is a real-time, location-based safety reporting and dashboard application designed to keep communities safe, informed, and connected. 

Building on top of the neighborhood community concepts, Phase 2 implements:
- **📍 Interactive Safety Mapping:** Residents can view and pin safety issues (e.g., suspicious activity, theft, fire, utilities hazards) directly on an interactive map.
- **⚡ Real-Time Notifications:** Live incident reports are broadcasted instantly to all connected neighbors via WebSockets.
- **📊 Analytics & Metrics:** Interactive charts display resolution rates and incident categories.

---

## 🚀 Tech Stack

### Frontend
- **Framework:** React 18 (via Vite)
- **Interactive Maps:** React Leaflet & Leaflet.js (utilizing OpenStreetMap tiles)
- **Data Visualization:** Recharts (for analytical graphs)
- **Real-Time Communication:** Socket.io-client
- **Styling:** TailwindCSS (v3), PostCSS
- **Routing:** React Router DOM (v6)
- **Icons:** Lucide React
- **API Client:** Axios

### Backend
- **Runtime:** Node.js (Express framework)
- **Real-Time WebSocket Server:** Socket.io
- **Database ODM:** Mongoose (MongoDB)
- **Security:** bcryptjs, JSON Web Tokens (JWT) for authentication
- **Development Tool:** Nodemon

---

## ✨ Features

- **🔒 JWT Authentication:** Secure login/register flow integrated with neighborhood profiles.
- **🗺️ Interactive Map (Leaflet):**
  - View pinned neighborhood incident markers on a dark-themed street map.
  - Pin new incidents directly by clicking on the map to auto-fill latitude and longitude coordinates.
  - Interactive popups on markers showing category, status, details, reporter, and time.
- **⚡ Live Broadcasts (Socket.io):**
  - Submitting an incident triggers an instantaneous real-time notification toast for all logged-in users.
  - No page refresh required.
- **📊 Analytics Dashboard (Recharts):**
  - **Category Breakdown:** Bar/Pie charts showing incident distribution (Theft, Suspicious Activity, Utility Hazard, Traffic, Medical, Other).
  - **Status Overview:** Visual representation of incident resolution progress.
- **⚙️ Incident Workflows:** Track alerts as they transition from `Active` ➡️ `Investigating` ➡️ `Resolved`.

---

## 📁 Directory Structure

```text
phase2-neighborhood-watch/
├── backend/
│   ├── config/             # Database connection setup
│   ├── middleware/         # JWT verification middleware
│   ├── models/             # Mongoose schemas (User, Alert/Incident)
│   ├── routes/             # REST endpoints (auth, alerts)
│   ├── .env                # Backend secrets (Ignored by git)
│   ├── server.js           # Server entrypoint with Socket.io configuration
│   └── package.json
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # Map components, Analytics, Notification Toast
│   │   ├── context/        # React Context (Auth State, Socket connection)
│   │   ├── pages/          # Dashboard, Login, Register, Profile, Alerts page
│   │   ├── App.css
│   │   ├── App.jsx         # Routes definition
│   │   ├── index.css       # Tailwind directives
│   │   └── main.jsx        # React entrypoint
│   ├── tailwind.config.js
│   ├── vite.config.js      # Runs on custom port 3002
│   └── package.json
└── documentation/          # Architecture diagrams, schemas, Postman collection
```

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`

---

### Step-by-Step Installation

#### 1. Clone the Repository & Navigate to Phase 2
```bash
git clone https://github.com/Ishika0424/Phase2-Neighborhood-Watch-Alert-System.git
cd Phase2-Neighborhood-Watch-Alert-System
```

#### 2. Backend Setup
Navigate to the `backend` folder:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `backend` folder and populate it:
```env
PORT=5002
MONGO_URI=mongodb://127.0.0.1:27017/community_phase2
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server in development mode:
```bash
npm run dev
```
*The backend API and WebSocket server will run on `http://localhost:5002`.*

---

#### 3. Frontend Setup
Open a new terminal window and navigate to the `frontend` folder:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend application will start running on `http://localhost:3002`.*

---

## 🔌 API Endpoints & WebSockets

### REST API

#### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create resident account.
- `POST /api/auth/login` - Authenticate resident.

#### Alerts/Incidents (`/api/alerts`)
- `GET /api/alerts` - Fetch all community alerts.
- `POST /api/alerts` - Create a new safety alert (Auth required).
- `PUT /api/alerts/:id/status` - Update incident status (Auth required).

### WebSocket Events (Socket.io)

- **`connection`** - Establishes real-time connection from the client.
- **`new_alert` (Server Emit)** - Broadcasts newly reported safety incident data to all connected clients.
- **`status_update` (Server Emit)** - Broadcasts updated incident workflow status.
