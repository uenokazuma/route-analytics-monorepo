# Route Analytics Monorepo

Route analytics platform architecture built with Next.js and .NET 10 in a monorepo structure.

This repository serves as a technical showcase demonstrating a full-stack monorepo integrating a modern frontend with a robust, clean-architecture backend to calculate point-to-point routing using geospatial technologies.

## 🚀 Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, `pnpm`
- **Backend:** .NET 10 (Web API), Clean Architecture, C#
- **Database & Geospatial:** PostgreSQL, PostGIS, pgRouting

## 📂 Project Structure

This monorepo separates the frontend application and the backend solution into logical boundaries:

```text
route-analytics/
├── route-analytics-frontend/       # Next.js Frontend Application
│   └── src/
│       ├── app/                    # Next.js App Router (Pages & Layouts)
│       ├── components/             # Reusable UI components
│       ├── services/               # API integration & data fetching
│       └── types/                  # TypeScript type definitions
│
└── RouteAnalytics/                  # .NET 10 Backend Solution
    ├── RouteAnalytics.Api/             # Presentation Layer (Minimal APIs)
    │   ├── Endpoints/                  # Minimal API route definitions
    │   ├── Extensions/                 # DependencyInjection.cs & middleware setups
    │   └── Handlers/                   # Route request logic handlers
    │
    ├── RouteAnalytics.Domain/          # Core Domain Layer
    │   ├── Common/                     # Shared objects and structural abstractions
    │   ├── DTOs/                       # Data Transfer Objects for API contracts
    │   ├── Entities/                   # Database models & PostGIS map entities
    │   └── Interfaces/                 # Repository & Service contracts
    │
    ├── RouteAnalytics.Infrastructure/  # Data & Infrastructure Layer
    │   ├── Data/                       # Entity Framework Core DbContext & Migrations
    │   ├── Extensions/                 # Calculations and general utility functions
    │   ├── Repositories/               # SpatialQueryRepository.cs (SQL & PostGIS queries)
    │   └── Services/                   # SpatialRoutingService.cs (Workflow processing)
    │
    └── RouteAnalytics.Api.slnx          # .NET Solution File (New XML Format)
```

## 📐 Technical Architecture & Design Decisions

This application separates frontend and backend responsibilities to manage multi-modal routing (Road, Sea, Air) efficiently. The backend follows a Clean Architecture approach to keep database interactions separated from the main business logic.

### 1. Services vs. Repositories Separation
To keep the code organized, database queries and business logic are split into two distinct parts:
* **`Services/` (Application Logic):** Files like `SpatialRoutingService.cs` manage the overall workflow, coordinate inputs, and format the output data into clean objects before sending them to the frontend. This layer does not write raw database query strings.
* **`Repositories/` (Database Access):** Located inside `RouteAnalytics.Infrastructure/Repositories/`, files like `SpatialQueryRepository.cs` handle all direct interactions with the database, including raw SQL strings and complex PostGIS operations (such as `ST_AsText`, `ST_Union`, `pgr_dijkstra`, etc.).

### 2. Dependency Injection & Connection Management
Every class that connects to the database or handles queries is registered in the built-in .NET Dependency Injection container using `AddScoped`.
* **Managing the Lifecycle:** Instead of cluttering the main `Program.cs`, these service lifetimes are managed inside `RouteAnalytics.Api/Extensions/DependencyInjection.cs`.
* **Connection Efficiency:** Using `AddScoped` ensures that a repository or service instance is created only when a frontend request comes in and is immediately disposed of once the request ends. This returns connections back to the database pool quickly, preventing the application from running out of database connections when multiple users are requesting routes at the same time.
* **Automatic Scanning:** To avoid adding each new file manually, the application uses assembly scanning to automatically find and register all repository classes on startup.

## ⚙️ Features

- **Point-to-Point Calculation:** Computes optimal paths between geospatial coordinates.
- **Geospatial Processing:** Leverages PostGIS and pgRouting for high-performance network analysis directly inside PostgreSQL.
- **Clean Architecture:** Strict separation of concerns on the backend for maintainability.

## 🛠️ Configuration

Before running the application, ensure you set up the environment configuration files:

- **Backend (`RouteAnalytics.Api/appsettings.json`)**: Configure your PostgreSQL connection string under `"ConnectionStrings": { "DefaultConnection": "..." }`.
- **Frontend (`route-analytics-frontend/.env.local`)**: Create an environment file to specify your Backend API URL (e.g., `NEXT_PUBLIC_API_URL=http://localhost:5013`).


## 📄 License

This project is licensed under the [MIT License](LICENSE).
