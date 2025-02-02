# StatusZen

StatusZen is a status page application built with the Next.js App Router. It provides multi-tenant organization support, component/group management, and incident/status tracking. The project demonstrates how to use Drizzle ORM for database interactions and a modular design for easily extending functionality.

## Features

- **Multi-Tenant Organizations**  
  Each user can belong to (or create) an organization with unique data segregation.
- **Component Grouping**  
  Organize services logically (e.g., "API Group", "Database Group").
- **Component Status Tracking**  
  Track individual service components with states like *Operational*, *Performance Issues*, etc.
- **Incident Reporting**  
  Create and update incident records tied to specific services/components.
- **API-Driven Architecture**  
  Provides REST-like endpoints for fetching, updating, and deleting resources.
- **Drizzle ORM**  
  Statically typed, lightweight migrations, and robust schema definitions for your database.

## Tech Stack

- **Next.js 13+** (App Router)  
- **TypeScript** for type safety  
- **Tailwind CSS** for front-end styling (optional or replace with your own)  
- **Drizzle ORM** for database interactions  
- **PostgreSQL** or **SQLite** for local development (configurable in `drizzle.config.ts`)  
- **BullMQ** (optional) for queueing component checks or background tasks  
- **lucide-react** (optional icons)

## Getting Started

Follow these instructions to get a local copy of **StatusZen** up and running.

### Prerequisites

- **Node.js** >= 16
- **npm** or **yarn** (pick one)
- **PostgreSQL** or **SQLite** for the database

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/statuszen.git
   cd statuszen

2. **Install dependencies**:
   ```bash
   npm install

3. **Configure environment variables**:
   - Copy .env.example to .env.
   - Fill in your database credentials, e.g., DATABASE_URL for Postgres or configure for SQLite.

4. **Set up the database**:
   - Run your migrations or use Drizzle’s db push to create tables.

5. **Start redis server**

### Scripts

Below are the available commands in this project:

- **dev**  
  Starts the local development server at [http://localhost:3000](http://localhost:3000).

- **build**  
  Builds the Next.js project for production.

- **start**  
  Runs the compiled production build.

- **lint**  
  Lints your code using ESLint.

- **db:push**  
  Executes Drizzle migrations (if configured).

---

### Example Usage

   ```bash
   npm run dev
   ```
   
---

### Usage

### Landing Page (`/`)
Displays public information on the services’ statuses.

### Organization Page (`/organization`)
- Users can view or create an organization.
- If already in an organization, this page shows its status and provides a button to navigate to the dashboard.

### Dashboard (`/dashboard`)
- **Overview**: A quick glance at groups or statuses.
- **Groups**: Create, edit, or delete groups; manage group details.
- **Components**: Manage individual components, their statuses, descriptions, and more.

---

### Deployment

1. **Build the application**:

```bash
npm run build
```

2. **Serve the production build**:
```bash
npm run start
```
3. **Configure your deployment environment with**:
- Correct environment variables in .env.
- A running PostgreSQL or SQLite instance
