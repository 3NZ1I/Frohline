# Order Management System

A full-stack Order Management System for factory orders, built with React, Node.js, Express, and SQLite, containerized with Docker.

## Features

- **Orders Management**
  - View all orders with filtering (All, Pending, In Progress, Completed)
  - Create new orders with multiple products
  - Edit existing orders
  - Update order status
  - Delete orders

- **Customer Directory**
  - Add, edit, and delete customers
  - Store customer details (name, company, email, phone, address)

- **Product Directory**
  - Add, edit, and delete products
  - Product details (name, SKU, description, price, stock)
  - Stock level indicators

## Tech Stack

- **Frontend**: React 18, Bootstrap 5, React Router
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Running with Docker

1. Navigate to the project directory:
   ```bash
   cd /home/bashar/order-management-system
   ```

2. Start the application:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000/api

### Stopping the Application

```bash
docker-compose down
```

To also remove the database volume:
```bash
docker-compose down -v
```

## API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders (optional `?status=` filter)
- `GET /api/orders/:id` - Get order by ID with items
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

## Sample Data

The application comes pre-loaded with sample data:
- 3 sample customers
- 5 sample products
- 3 sample orders (pending, in_progress, completed)

## Project Structure

```
order-management-system/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── data/ (created at runtime)
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.js
        ├── api.js
        └── components/
            ├── OrdersList.js
            ├── OrderForm.js
            ├── Customers.js
            └── Products.js
```
