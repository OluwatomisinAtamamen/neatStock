# 📦 NeatStock - Inventory Management System for SMEs

A comprehensive web-based inventory management solution specifically designed for Small and Medium Enterprises (SMEs), with a focus on African grocery stores in the UK. Features an innovative **Relative Space Unit (RSU)** system for intuitive space management without complex measurements.

## 🌟 Key Features

- **📏 Relative Space Unit (RSU) System** - Novel space tracking using user-defined reference items
- **🏪 Multi-location Inventory** - Track stock across different store locations
- **📊 Real-time Reporting** - Low stock alerts and space utilization analytics  
- **👥 Staff Management** - Role-based access control for team members
- **💳 Stripe Integration** - Subscription-based SaaS model (£12/month)
- **📱 Responsive Design** - Works on desktop, tablet, and mobile devices
- **🔒 Multi-tenant Architecture** - Secure data isolation for each business

## 📋 Table of Contents

- [Setup Instructions](#️-setup-instructions)
- [Technology Stack](#-technology-stack)
- [Architecture & Design Decisions](#-architecture--design-decisions)
- [RSU System Explained](#-rsu-system-explained)
- [API Documentation](#-api-documentation)
- [Database Schema](#️-database-schema)
- [Project Structure](#️-project-structure)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Supabase for hosting PostgreSQL database
- Stripe account for payments
- Git

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/neatstock.git
   cd neatstock
   ```

2. **Install dependencies:**
   ```bash
   # Install frontend and backend dependencies
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the server directory:
   ```env
   # Database
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_DATABASE=neatstock_db
   
   # Session
   SESSION_SECRET=your_session_secret
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # App
   APP_URL=http://localhost:5173
   ```

4. **Database Setup:**
   - Go to your [Supabase dashboard](https://app.supabase.com/).
   - Create a new project (this provisions a PostgreSQL database for you).
   - In the SQL editor, run the contents of `server/db/database.sql` to set up tables and triggers.
   - Copy your database connection details (host, user, password, database, port) into your `.env` file as shown above.

5. **Run the application:**
   ```bash
   # Start backend server (Terminal 1)
   npm run server
   
   # Start frontend development server (Terminal 2)
   npm run dev
   ```

6. **Access the application:**
    http://localhost:5173

## 🏗 Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Chart.js** - Data visualization
- **React Icons** - Icon library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Express Session** - Session-based authentication
- **Stripe** - Payment processing
- **Multer** - File upload handling
- **Node Cron** - Scheduled tasks

### Infrastructure
- **Supabase** - PostgreSQL hosting

## 🎯 Architecture & Design Decisions

### Three-Tier Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Presentation   │    │   Application   │    │      Data       │
│     Layer       │◄──►│     Layer       │◄──►│     Layer       │
│   (React SPA)   │    │  (Express API)  │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Decisions

- **SPA Architecture**: Chosen for fluid user experience during inventory counts
- **Session Authentication**: Preferred over JWT for simplicity and security
- **Multi-tenant Database**: Single database with business_id isolation
- **Supabase**: Cloud PostgreSQL for scalability without infrastructure management
- **Iterative Development**: Agile methodology with 7 development iterations

### Trade-offs

✅ **Chose**: Simple, intuitive RSU system over complex volumetric calculations  
✅ **Chose**: Session-based auth over JWT for better security in web app context  
✅ **Chose**: PostgreSQL over SQLite for scalability and concurrent users  

## 📏 RSU System Explained

### What is RSU (Relative Space Unit)?

The **Relative Space Unit** is an innovative space measurement system designed for small businesses to track inventory space without complex calculations.

### How It Works

1. **Reference Item Selection**: Choose a familiar product (e.g., standard can) = 1 RSU
2. **Visual Comparison**: Assign RSU values based on how many "reference items" of space each product occupies
3. **Location Capacity**: Set location capacity in RSU (how many reference items fit)
4. **Automatic Tracking**: System calculates space utilization automatically

### Example RSU Values

| Product Type | Visual Size | RSU Value |
|--------------|-------------|-----------|
| Small packet | 📦 | 0.5 RSU |
| Standard can/box | 📦📦 | 1.0 RSU |
| Large bottle | 📦📦📦📦 | 2.0 RSU |
| Big box | 📦📦📦📦📦 | 5.0 RSU |
| Bulk item | 📦📦📦📦📦📦📦📦📦📦 | 10.0 RSU |

### Benefits
- ✅ No measuring tools required
- ✅ Intuitive visual comparison
- ✅ Consistent across all staff
- ✅ Flexible for different product types
- ✅ Real-time space utilization tracking

## 📚 API Documentation

### Base URL
```
http://localhost:8080/data
```

### Authentication Endpoints

#### POST /users/signup
Create new business account with Stripe integration
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "Acme Grocery",
  "businessEmail": "john@acme.com",
  "username": "johndoe"
}
```

#### POST /users/login
Authenticate user
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

### Inventory Endpoints

#### GET /search/items
Search and filter inventory items
```
GET /search/items?query=rice&category=grains&location=main-store&stockStatus=in-stock
```

#### POST /inventory/items
Add new inventory item
```json
{
  "name": "Basmati Rice 5kg",
  "sku": "RICE-001",
  "categoryId": "uuid",
  "locationId": "uuid", 
  "quantity": 50,
  "rsuValue": 2.0,
  "costPrice": 8.99,
  "unitPrice": 12.99
}
```

#### POST /inventory/stocktake
Update multiple item quantities
```json
{
  "locationId": "uuid",
  "items": {
    "item-uuid-1": { "count": 25 },
    "item-uuid-2": { "count": 40 }
  }
}
```

### Location Endpoints

#### GET /locations
Get all business locations

#### POST /locations
Create new location
```json
{
  "location_name": "Main Store",
  "location_code": "MAIN-01",
  "capacity_rsu": 500,
  "description": "Primary retail space"
}
```

### Reports Endpoints

#### GET /reports/low-stock
Get low stock report with analytics

#### GET /reports/space-utilisation
Get space utilization analytics

## 🗄️ Database Schema

### Core Tables

```sql
-- Multi-tenant business separation
business (business_id, business_name, business_email, rsu_reference)

-- User management with roles
app_user (user_id, business_id, username, password_hash, is_admin, is_owner)

-- Universal product catalog (shared)
product_catalog (catalog_id, name, barcode, pack_size)

-- Business-specific inventory
business_item (item_id, business_id, catalog_id, item_name, rsu_value, cost_price)

-- Location management
location (location_id, business_id, location_name, capacity_rsu, current_rsu_usage)

-- Item-location tracking
item_location (location_id, item_id, quantity)

-- Historical snapshots
inventory_snapshot (snapshot_id, business_id, snapshot_date, snapshot_type)
inventory_snapshot_item (snapshot_id, item_id, quantity_in_stock)
```

### Database Triggers

**RSU Calculation Trigger**: Automatically updates location space usage when items are added/moved
```sql
CREATE TRIGGER update_rsu_after_item_location_change
AFTER INSERT OR UPDATE OR DELETE ON item_location
FOR EACH ROW EXECUTE FUNCTION update_location_rsu_usage();
```

## 🗂️ Project Structure

```
neatstock/
├── client/                          # Frontend React application
│   ├── components/                  # Reusable UI components
│   │   ├── AddItem.jsx             # Add inventory items
│   │   ├── QuickCount.jsx          # Stocktake interface
│   │   ├── EditItem.jsx            # Edit item details
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   └── Toast.jsx               # Notification component
│   ├── pages/                      # Main application pages
│   │   ├── Home.jsx                # Dashboard
│   │   ├── Search.jsx              # Search & filter items
│   │   ├── Stocktake.jsx           # Inventory counting
│   │   ├── Locations.jsx           # Location management
│   │   ├── Reports.jsx             # Analytics & reports
│   │   ├── Settings.jsx            # Business settings
│   │   ├── Login.jsx               # Authentication
│   │   └── Signup.jsx              # Registration
│   ├── context/                    # React context providers
│   │   ├── AuthContext.jsx         # Authentication state
│   │   └── auth.js                 # Auth context definition
│   ├── layout/                     # Layout components
│   │   ├── DashboardLayout.jsx     # Authenticated layout
│   │   └── PublicLayout.jsx        # Public pages layout
│   └── style/
│       └── index.css               # Tailwind CSS imports
├── server/                         # Backend Node.js application
│   ├── controllers/                # Business logic controllers
│   │   ├── authController.js       # Authentication & payments
│   │   ├── inventoryController.js  # Inventory CRUD operations
│   │   ├── locationController.js   # Location management
│   │   ├── searchController.js     # Search & filtering
│   │   ├── reportsController.js    # Analytics & reporting
│   │   ├── settingsController.js   # Business settings
│   │   └── dashboardController.js  # Dashboard metrics
│   ├── routes/                     # API route definitions
│   │   ├── auth.js                 # Authentication routes
│   │   ├── inventory.js            # Inventory routes
│   │   ├── locations.js            # Location routes
│   │   ├── search.js               # Search routes
│   │   └── reports.js              # Reporting routes
│   ├── middleware/                 # Express middleware
│   │   └── fileUpload.js           # File upload handling
│   ├── db/                         # Database configuration
│   │   └── database.sql            # Database schema & seed data
│   ├── uploads/                    # File storage directory
│   ├── dbConnection.js             # Database connection setup
│   ├── validateInput.js            # Input validation utilities
│   ├── snapshotJob.js              # Automated inventory snapshots
│   └── server.js                   # Express server configuration
├── tests/                          # Test suites
│   ├── server/
│   │   └── controllers/
│   │       ├── authController.test.js
│   │       └── settingsController.test.js
│   └── setup.js                    # Test configuration
├── .env.sample                     # Environment variables template
├── package.json                    # Project dependencies & scripts
├── tailwind.config.js              # Tailwind CSS configuration  
├── vite.config.js                  # Vite build configuration
└── README.md                       # Project documentation
```

### Code Standards
- **ESLint**: Follow configured linting rules
- **Prettier**: Use for code formatting
- **Conventional Commits**: Follow commit message standards


## 🙏 Acknowledgments

- **Literature Review**: Built on research of SME inventory challenges
- **User Research**: Informed by interviews with African grocery store owners
- **Innovation**: RSU system addresses real gap in space management tools
- **Academic Project**: Developed as final year Software Engineering project

## 🎯 Business Impact

### Problem Solved
- **Space Constraints**: 90% of surveyed SMEs struggle with limited storage space
- **Cost Barriers**: Existing solutions cost £49-149/month vs. our £12/month

### Key Innovations
- **RSU System**: First inventory system with relative space measurement
- **SME-Focused**: Designed specifically for space-constrained retailers
- **Cultural Sensitivity**: Built for African grocery store workflows
- **Affordability**: 75% cheaper than competing solutions

### Future Roadmap
- 📱 Mobile-first stocktaking app
- 🤖 AI-powered demand forecasting  
- 🔗 POS system integrations
- 📊 Advanced analytics dashboard
- 🌍 Multi-language support

---
