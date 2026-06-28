# System Architecture Diagram (Phase 2)

This document visualizes the architectural layout of the full-stack **Community Resource Sharing Platform & Neighborhood Watch Alert System** (Phase 2).

```mermaid
graph TD
    %% Frontend Subsystem
    subgraph Frontend [React SPA Client - Port 3002]
        UI[Tailwind CSS Dashboard UI]
        Map[Leaflet Map View - Custom Pins]
        Chart[Recharts Analytics Dashboard]
        SocketClient[Socket.io-Client Listener]
        AxiosClient[Axios REST client]
    end

    %% Backend Subsystem
    subgraph Backend [NodeJS / Express Server - Port 5002]
        HTTP[HTTP Engine / Express App]
        SocketServer[Socket.io Server Engine]
        JWT[JWT Authentication Middleware]
        
        %% Routes
        AuthRoutes[Auth Routes /api/auth]
        ResRoutes[Resource Routes /api/resources]
        SkillRoutes[Skill Routes /api/skills]
        AlertRoutes[Alert Routes /api/alerts]
    end

    %% Database Subsystem
    subgraph Database [MongoDB Server - Port 27017]
        Mongoose[Mongoose ODM]
        DB[(community_phase2 DB)]
    end

    %% Connections / Flows
    UI --> AxiosClient
    UI --> Map
    UI --> Chart
    
    %% REST Requests
    AxiosClient -- HTTPS REST --> JWT
    JWT --> AuthRoutes
    JWT --> ResRoutes
    JWT --> SkillRoutes
    JWT --> AlertRoutes
    
    %% WebSockets
    SocketServer -- Real-time Broadcasts <--> SocketClient
    AlertRoutes -- Triggers Broadcasts --> SocketServer
    
    %% DB Access
    AuthRoutes --> Mongoose
    ResRoutes --> Mongoose
    SkillRoutes --> Mongoose
    AlertRoutes --> Mongoose
    
    Mongoose -- Reads/Writes --> DB
    
    %% Styling
    classDef frontend fill:#1e293b,stroke:#6366f1,stroke-width:2px,color:#fff;
    classDef backend fill:#0f172a,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef db fill:#020617,stroke:#10b981,stroke-width:2px,color:#fff;
    
    class UI,Map,Chart,SocketClient,AxiosClient frontend;
    class HTTP,SocketServer,JWT,AuthRoutes,ResRoutes,SkillRoutes,AlertRoutes backend;
    class Mongoose,DB db;
```

### Architectural Component Descriptions

1. **React SPA Client**: Runs a responsive dashboard built with Tailwind CSS. Incorporates **Leaflet (react-leaflet)** for displaying hazard locations on interactive dark maps, and **Recharts** to plot category distributions and resolution rates.
2. **Socket.io Connection**: Maintained concurrently between the client's `Socket.io-Client` and the server's `Socket.io Engine` over WebSocket protocol. When a new incident is submitted, the server instantly pushes the details to all connected active user sessions.
3. **JWT Authentication Layer**: Inspects incoming API requests for a valid bearer token before allowing access to mutation or query endpoints for resources, skills, and safety alerts.
4. **Mongoose & MongoDB**: Interfaces with the local MongoDB database instance to carry out operations across User, Resource, Skill, and Alert collections.
