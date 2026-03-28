# 🚀 Nexus Careers — Job Portal Microservices Platform

A full-stack job portal built with Spring Boot microservices and a React frontend.

---

## 🏗 Architecture

```
                        ┌──────────────────┐
                        │    Frontend       │  React + Vite + Tailwind
                        │  (Nginx :3000)    │
                        └────────┬─────────┘
                                 │ /api/*
                        ┌────────▼─────────┐
                        │   API Gateway     │  Spring Cloud Gateway :8085
                        │  JWT validation   │
                        └──┬──┬──┬──┬──────┘
               ┌───────────┘  │  │  └──────────────┐
       ┌───────▼───┐  ┌───────▼──┐  ┌──────────▼──┐  ┌──▼──────────┐
       │   Auth    │  │   Job    │  │ Application  │  │    Admin    │
       │  :8081    │  │  :8082   │  │   :8083      │  │   :8084     │
       └───────────┘  └──────────┘  └─────────────┘  └─────────────┘
               │           │               │                │
       ┌───────▼───────────▼───────────────▼────────────────▼───────┐
       │                    MySQL :3306                               │
       │    nexus_auth_db  |  nexus_job_db  |  nexus_application_db  │
       └───────────────────────────────────────────────────────────┘
              │                     │
       ┌──────▼──────┐     ┌────────▼────────┐
       │  RabbitMQ   │     │     Redis        │
       │   :5672     │     │    :6379         │
       └─────────────┘     └─────────────────┘
```

### Services
| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React SPA (Nginx in Docker) |
| API Gateway | 8085 | Routes all /api/* requests, JWT validation |
| Auth Service | 8081 | Register, login, JWT, OAuth2, password reset |
| Job Service | 8082 | Job CRUD, Redis caching |
| Application Service | 8083 | Job applications lifecycle, file upload |
| Admin Service | 8084 | User & job management dashboard |
| Eureka Server | 8761 | Service discovery |
| Config Server | 8888 | Centralised configuration |
| RabbitMQ UI | 15672 | Async messaging management |
| Grafana | 3001 | Observability dashboards |
| Zipkin | 9411 | Distributed tracing |
| SonarQube | 9000 | Static code analysis |

---

## ⚡ Quick Start (Docker)

**Prerequisites:** Docker + Docker Compose installed.

```bash
# Clone / unzip project, then:
./start.sh
```

Or manually:
```bash
docker compose up --build -d
```

Open **http://localhost:3000** once all containers are healthy (≈ 2–3 min first run).

---

## 👤 User Roles

| Role | Capabilities |
|------|-------------|
| `JOB_SEEKER` | Browse jobs, apply, track applications, upload resume |
| `RECRUITER` | Post / edit / delete jobs, review & update application statuses |
| `ADMIN` | Full access — manage users, view all jobs & applications |

Register at `/register` and choose a role.

---

## 🔑 OAuth2 (Optional)

Set environment variables before starting:
```bash
cp .env.example .env
# Edit .env with your Google / LinkedIn OAuth2 credentials
docker compose up --build -d
```

---

## 🛠 Local Development (without Docker)

Requirements: Java 17, Maven 3.9, Node 20, MySQL 8, Redis, RabbitMQ.

```bash
# Start infrastructure
docker compose up mysql redis rabbitmq -d

# Start each service (in separate terminals)
cd eureka-server  && mvn spring-boot:run
cd config-server  && mvn spring-boot:run
cd auth-service   && mvn spring-boot:run
cd job-service    && mvn spring-boot:run
cd application-service && mvn spring-boot:run
cd admin-service  && mvn spring-boot:run
cd api-gateway    && mvn spring-boot:run

# Start frontend
cd frontend && npm install && npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
nexus-careers/
├── frontend/               # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── pages/          # LoginPage, HomePage, Dashboards…
│   │   ├── components/     # Navbar, JobCard, ProtectedRoute…
│   │   ├── context/        # AuthContext
│   │   └── services/api.js # Centralised Axios instance
│   ├── nginx/nginx.conf    # Production Nginx config
│   └── Dockerfile
├── api-gateway/            # Spring Cloud Gateway
├── auth-service/           # JWT + OAuth2 auth
├── job-service/            # Job CRUD + Redis cache
├── application-service/    # Applications + RabbitMQ
├── admin-service/          # Admin REST proxy
├── eureka-server/          # Service registry
├── config-server/          # Centralised config
│   └── src/main/resources/
│       └── config-repo/    # Per-service YAML configs
├── database-setup.sql      # DB initialisation
├── docker-compose.yml      # Full stack orchestration
├── .env.example            # OAuth2 secrets template
└── start.sh                # One-command startup
```

---

## 🗒 API Quick Reference

All requests go through the API Gateway at `http://localhost:8085`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, receive JWT |
| POST | `/api/auth/forgot-password` | ❌ | Request password reset |
| POST | `/api/auth/reset-password` | ❌ | Reset with token |
| GET | `/api/jobs` | ❌ | List all active jobs |
| GET | `/api/jobs/search` | ❌ | Search jobs |
| POST | `/api/jobs` | RECRUITER | Create job |
| PUT | `/api/jobs/{id}` | RECRUITER | Update job |
| DELETE | `/api/jobs/{id}` | RECRUITER/ADMIN | Delete job |
| POST | `/api/applications` | JOB_SEEKER | Apply for job |
| GET | `/api/applications/user` | JOB_SEEKER | My applications |
| PUT | `/api/applications/{id}/status` | RECRUITER/ADMIN | Update status |
| GET | `/api/admin/users` | ADMIN | All users |
| GET | `/api/admin/reports` | ADMIN | Dashboard report |
