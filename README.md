# 📱 Ecommerce Backend API

Welcome to the **Ecommerce Backend API**, a robust and scalable backend service for online e-commerce platforms. Built with NestJS, this API provides comprehensive functionality for managing products, users, orders, payments, and more.

---

## 🚀 Features

- 🛒 **Product Management** – Create, update, and manage product catalogs
- 👤 **User Authentication** – Secure JWT-based auth for users and admins
- 📦 **Order Processing** – Handle orders, payments, and shipping
- 🔐 **Admin Dashboard** – Manage inventory, orders, and users
- 💳 **Payment Integration** – Stripe integration for secure payments
- 📧 **Email Notifications** – Automated emails via Mailgun
- 🌐 **Internationalization** – Multi-language support
- 📊 **Logging & Monitoring** – Winston logging with Redis caching

---

## 🧰 Tech Stack

- **Backend:** Node.js | NestJS
- **Database:** PostgreSQL with TypeORM
- **Cache:** Redis
- **API:** RESTful API with Swagger Documentation
- **Authentication:** JWT with Passport
- **Payments:** Stripe
- **Email:** Mailgun & Nodemailer
- **Deployment:** Docker & Docker Compose

## 🚀 Getting Started with the Development Environment

This project uses **Docker Compose** to create a consistent, containerized development environment. Follow the steps below to get your services up and running.

---

### 🔧 Prerequisites

- Docker & Docker Compose
- Node.js (for local development)
- PostgreSQL (handled by Docker)

### 🔧 Step 1: Set Environment Variables

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration values (database credentials, API keys, etc.).

### 🔧 Step 2: Start the Services

To run in the background:

```bash
docker compose -f docker-compose.dev.yaml up --build -d
```

To run with logs visible:

```bash
docker compose -f docker-compose.dev.yaml up --build
```

### 🔧 Step 3: Access the Application

- **API:** http://localhost:4040 (or your configured port)
- **Swagger Docs:** http://localhost:4040/api
- **PgAdmin:** http://localhost:8080

### 🔧 Step 4: Stop the Services

To stop without removing volumes:

```bash
docker compose -f docker-compose.dev.yaml down
```

To stop and remove all data:

```bash
docker compose -f docker-compose.dev.yaml down -v
```

---

## 📚 API Documentation

Once running, visit the Swagger UI at `http://localhost:4040/api` for interactive API documentation.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.
