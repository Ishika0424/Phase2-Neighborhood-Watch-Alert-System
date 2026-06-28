# Project Final Report: Community Resource Sharing & Neighborhood Watch Alert Platform

This document summarizes the full implementation details, architectural choices, and verification guidelines for both **Phase 1** (Community Resource Sharing Platform) and **Phase 2** (Neighborhood Watch Alert System).

---

## 1. Project Overview & Objectives
The system serves to strengthen community ties and enhance local safety by organizing community collaboration into two key areas:
1. **Resource & Skill Sharing (Phase 1)**: Enabling residents to register, publish lists of physical tools or personal services, browse listings, and coordinate exchange requests.
2. **Neighborhood Watch (Phase 2)**: Enabling residents to report safety hazards (theft, suspicious behavior, utilities leakage, traffic accidents) on a shared map, broadcast live incidents instantly via WebSockets, and analyze safety reports via visual metric charts.

---

## 2. Technical Stack Configuration

### Backend Core
- **NodeJS & ExpressJS**: Handles routing, auth interceptors, and request parsing.
- **MongoDB & Mongoose**: Used as a local document store for accounts, resources, skills, and alerts.
- **JSON Web Tokens (JWT)**: Used for stateless session management and security.
- **BcryptJS**: Hashing algorithm for password encryption.
- **Socket.io (Phase 2)**: Provides real-time event broadcasting over persistent WebSockets.

### Frontend Core
- **ReactJS (Vite)**: SPA engine.
- **Tailwind CSS**: Custom styling library with frosted glassmorphism elements.
- **Axios**: Promised-based client for REST API communication.
- **Lucide React**: Premium icon set.
- **React Leaflet (Phase 2)**: Integration for rendering interactive OpenStreetMap/CARTO dark maps.
- **Recharts (Phase 2)**: SVG chart engine displaying incident statistics.
- **Socket.io-Client (Phase 2)**: Listens for safety updates and displays active notifications.

---

## 3. Core Features & Workflows

### Authentication
- Users register with email/password and manage details (address, neighborhood name, tags) in their Profile.
- Passwords are encrypted with 10 salt rounds before database persistence.

### Resource Board (Phase 1)
- **Lend/Offer**: Members post items like lawnmowers or drill kits.
- **Borrow**: Other users request items, altering status to `Requested`.
- **Approve/Return**: Owners approve requests (marking status as `Borrowed`) and click return once the tool is back.

### Skills Board (Phase 1)
- Providers offer services (tutoring, plumbing assist) with custom scheduling guidelines.
- Requester sends a detailed assistance message, allowing the owner to accept or decline the service.

### Neighborhood Watch & Map (Phase 2)
- **Interactive Pinning**: Users click on the map to automatically populate coordinate points (latitude, longitude) for an incident.
- **Socket Alerts**: Submission of a report broadcasts details to all active users, triggering a floating notification toast.
- **Status Workflows**: Reports move through `Active` -> `Investigating` -> `Resolved` status.
- **Analytics Charts**: Displays category distribution graphs and incident resolution percentages using Recharts.

---

## 4. Run & Deployment Guidelines

### Prerequisites
- **NodeJS** (v18+)
- **MongoDB** running locally on default port `27017`

### Phase 1 Execution
- **Backend Port**: `5001`
- **Frontend Port**: `3001`
```bash
# Run MongoDB
mongod

# Start Phase 1 Backend
cd phase1-resource-sharing/backend
npm install
npm run dev

# Start Phase 1 Frontend
cd ../frontend
npm install
npm run dev
```

### Phase 2 Execution
- **Backend Port**: `5002`
- **Frontend Port**: `3002`
```bash
# Start Phase 2 Backend
cd phase2-neighborhood-watch/backend
npm install
npm run dev

# Start Phase 2 Frontend
cd ../frontend
npm install
npm run dev
```
---
*Developed with ❤️ for community safety and sharing.*
