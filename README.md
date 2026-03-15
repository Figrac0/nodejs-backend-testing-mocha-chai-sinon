# Deno Todo API (Oak + MongoDB)

This project demonstrates a minimal full-stack Todo application built with **Deno**, **Oak**, **MongoDB**, and a **React frontend**.  
The goal of the project is to showcase modern backend development with Deno using a typed, modular architecture and a RESTful API.

---

# Overview

The backend is implemented using the **Deno runtime** and the **Oak framework**, which provides a middleware-based HTTP server similar to Express.js.  
The application exposes a small REST API for managing todos and persists data in **MongoDB Atlas**.

The frontend is a lightweight **React client** that communicates with the API via HTTP requests.

The project demonstrates:

- Modern **TypeScript-first backend development**
- RESTful API design
- MongoDB integration
- Deno module system and dependency management
- Separation of application layers
- Client-server interaction using a React UI

---

# Technology Stack

Backend:

- **Deno** – secure JavaScript/TypeScript runtime
- **Oak** – middleware framework for HTTP servers
- **MongoDB** – document database
- **TypeScript** – strongly typed backend code
- **JSR modules** – modern dependency management

Frontend:

- **React**
- **Fetch API**

---

# What is Deno

Deno is a modern runtime for JavaScript and TypeScript created by **Ryan Dahl**, the original creator of Node.js.

Key features:

- Native **TypeScript support**
- Built-in **security model** (permissions for file, network, environment access)
- ES module support without bundlers
- Integrated tooling (formatter, linter, test runner)
- Secure execution environment by default

Unlike Node.js, Deno does not allow unrestricted access to the system. Permissions must be explicitly granted when running the application.

Reference:  
https://deno.land

---

# Project Architecture
```text
project-root
│
├── deno
│ ├── app.ts # application entry point
│ ├── deno.json # dependency configuration
│ │
│ ├── helpers
│ │ └── db_client.ts # MongoDB connection layer
│ │
│ └── routes
│ └── todos.ts # REST API routes
│
└── frontend-app
└── React application
```


---

# Backend Design

The backend follows a simple layered architecture.

Application Layer
- `app.ts`
- Creates the Oak application
- Registers middleware
- Registers routes
- Starts the HTTP server

Routing Layer
- `routes/todos.ts`
- Defines REST endpoints
- Handles request parsing and responses

Database Layer
- `helpers/db_client.ts`
- Manages MongoDB connection
- Provides a singleton database instance

---

# Running the Backend

Start the API server:
```text
deno task dev
```
deno task dev

```text
deno run --allow-net --allow-env --env-file=.env app.ts
```


Permissions used:

| Permission | Purpose |
|------------|--------|
| allow-net  | network access for API and MongoDB |
| allow-env  | access to environment variables |

The server starts on:

```text
http://localhost:8000
```


---

# Frontend

The React frontend communicates with the backend API using the Fetch API.

Features:

- View todos
- Create new todos
- Edit existing todos
- Delete todos


---

# Educational Purpose

This repository serves as a practical example of:

- Deno backend development
- REST API design
- TypeScript backend architecture
- MongoDB integration
- Client-server interaction

The project is intentionally minimal but structured in a way that can be easily extended with authentication, validation, and additional services.

---
