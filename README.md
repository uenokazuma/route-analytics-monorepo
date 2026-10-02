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
    ├── RouteAnalytics.Api/          # Presentation Layer (Minimal APIs / Endpoints)
    ├── RouteAnalytics.Domain/       # Core Domain Layer (Entities & Interfaces)
    ├── RouteAnalytics.Infrastructure/ # Data Layer (PostgreSQL, PostGIS, pgRouting)
    └── RouteAnalytics.Api.slnx      # .NET Solution File (New XML Format)
```

## ⚙️ Features

- **Point-to-Point Calculation:** Computes optimal paths between geospatial coordinates.
- **Geospatial Processing:** Leverages PostGIS and pgRouting for high-performance network analysis directly inside PostgreSQL.
- **Clean Architecture:** Strict separation of concerns on the backend for maintainability.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
