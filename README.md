# La Casa Del Folder API

Backend API for the La Casa Del Folder photo-product system MVP.

## Tech Stack

- Node.js
- TypeScript
- Express
- pnpm
- Prisma
- PostgreSQL (Docker only)
- Vitest

## Prerequisites

- Node.js 18+
- pnpm
- Docker and Docker Compose

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start PostgreSQL via Docker:
```bash
docker-compose up -d
```

This will start a PostgreSQL container on port 5432 with:
- Database: `la_casa_del_folder`
- User: `postgres`
- Password: `postgres`

3. Copy environment file:
```bash
cp env.example .env
```

4. Generate Prisma client:
```bash
pnpm prisma:generate
```

5. Run database migrations:
```bash
pnpm prisma:migrate
```

## Development

Run the development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

## Database

PostgreSQL runs in Docker. The API itself is not containerized.

To stop the database:
```bash
docker-compose down
```

To stop and remove volumes:
```bash
docker-compose down -v
```

## Testing

Run tests:
```bash
pnpm test
```

Run tests in watch mode:
```bash
pnpm test:watch
```

## Project Structure

```
/src
  /core
    /application
      /use-cases     # Business logic use cases
    /domain
      /entities      # Domain entities (Draft, Order, Asset)
      /repositories  # Repository interfaces
    /infrastructure
      /prisma        # Prisma client
      /repositories  # Prisma repository implementations
    /interface
      /http
        /controllers # HTTP controllers
        /routes      # Express routes
        /app.ts      # Express app setup
  /config            # Configuration
  /tests             # Test files
  /index.ts          # Application entry point
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/drafts` - Create draft (not implemented)
- `POST /api/drafts/:id/lock` - Lock draft (not implemented)
- `POST /api/assets` - Upload asset (not implemented)
- `POST /api/orders` - Create order (not implemented)

## Architecture

This project follows Clean Architecture principles:
- Controllers are thin
- Use cases contain business rules
- Prisma is only used in repository implementations
- Use cases do not import Prisma
