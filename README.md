NeatStock - Inventory Management System
NeatStock is an inventory management solution designed specifically for small businesses with space constraints, particularly African grocery stores in the UK. The system focuses on efficient space utilization tracking alongside traditional inventory management.

Features
Inventory tracking with space utilization metrics
Staff management
Business profile management
Category management
Location tracking
Reporting tools
Subscription-based access
Tech Stack
Frontend: React with Vite, TailwindCSS
Backend: Node.js, Express
Database: PostgreSQL
Authentication: Express sessions
Payment Processing: Stripe

Environment Setup
Clone the repository:
git clone <repository-url>
cd neatStock

Create a .env file in the root directory with these variables:
# Database configuration
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_DATABASE=neatstock_db

# Session configuration
SESSION_SECRET=your_session_secret

# Stripe configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Server port
PORT=8080

Install dependencies:
npm install

Set up the PostgreSQL database:

Create a database named neatstock_db
Run the database schema setup using database.sql in db


Frontend Build : npm dev
Backend Build : npm server