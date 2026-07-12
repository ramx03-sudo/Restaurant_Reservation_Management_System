# Restaurant Reservation Management System

A production-quality full-stack Restaurant Reservation Management System built using the MERN stack with Clean Architecture, Zod, React Hook Form, Tailwind CSS, and TanStack Query. 

It handles role-based access control, automated table capacity matching, and real-time conflict-free reservation scheduling with MongoDB transaction support.

---

## 1. Project Architecture

The codebase is split into backend and frontend directories, following clean design patterns to isolate business logic, data persistence, and UI Presentation.

### Backend Structure
Following the **Controller-Service-Repository** pattern:
- **`config/`**: External configurations (e.g., MongoDB connection).
- **`controllers/`**: HTTP request/response handling. Parses query params and forwards to services.
- **`services/`**: Pure business logic (e.g., Table Allocation Engine, Metrics computations).
- **`repositories/`**: Database isolation layer. Handles direct Mongoose queries and MongoDB session transactions.
- **`models/`**: Mongoose schemas and indices (`User`, `Table`, `Reservation`).
- **`validations/`**: Zod validation schemas for incoming request payloads.
- **`middleware/`**: Auth checks, role authorization (RBAC), error handling, and security wrappers.
- **`utils/`**: Standardized response format builders and Error classes.
- **`seed/`**: Database seeder script.

### Frontend Structure
Using modular component layouts:
- **`api/`**: Axios client with interceptors for token injection and error intercepting.
- **`components/`**: Reusable component units (Confirmation Dialogs, Tables, Inputs).
- **`layouts/`**: Shared view wrappers (Sidebar, Topbar).
- **`pages/`**: View panels for Public (Home, Login, Register), Customer (Dashboard, Booking Form, My Reservations), and Admin (Dashboard, Seating configuration, Reservation logs).
- **`context/`**: Global `AuthContext` managing session tokens and user profiles.
- **`index.css`**: Tailwind CSS v3 directives and custom component styles.

---

## 2. Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (v6.0+) running locally or a MongoDB Atlas URI

### 1. Backend Setup
1. Open a terminal and navigate to `backend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Update the values in `.env` (e.g. `MONGODB_URI` and `JWT_SECRET`).
5. Seed the database with the admin account and tables layout:
   ```bash
   npm run seed
   ```
6. Run the server in development mode:
   ```bash
   npm run dev
   ```
   *The backend will run on port 5001.*

### 2. Frontend Setup
1. Open a new terminal and navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Run the React application locally:
   ```bash
   npm run dev
   ```
   *The React app will be accessible at [http://localhost:5173](http://localhost:5173).*

---

## 3. Database Schema & Indexes

### User Schema
Stores credential details and role flags.
- `name` (String, Required)
- `email` (String, Required, Unique Index, Lowercase)
- `passwordHash` (String, Required)
- `role` (String, Enum: `customer`, `admin`, Default: `customer`)

### Table Schema
Represents distinct tables and capacities.
- `tableNumber` (String, Required, Unique Index)
- `capacity` (Number, Required)
- `isActive` (Boolean, Default: `true`)

### Reservation Schema
Maintains dining slots and links users with tables.
- `customerId` (ObjectId ref User, Required, Index)
- `tableId` (ObjectId ref Table, Required, Index)
- `reservationDate` (String YYYY-MM-DD, Required, Index)
- `startTime` (String HH:MM, Required)
- `endTime` (String HH:MM, Required)
- `guestCount` (Number, Required)
- `status` (String, Enum: `confirmed`, `cancelled`, Default: `confirmed`)
- `notes` (String)

*Note: A compound index `{ tableId: 1, reservationDate: 1, status: 1 }` is applied on the Reservation collection to optimize overlap lookup queries.*

---

## 4. Reservation & Allocation Engine

### Allocation Rules
1. **Double Booking Prevention**: A table cannot have overlapping active reservations on the same date and time.
2. **Standard Duration**: Reservations are set to a default of **2 hours**.
3. **Table Suitability**: Guest count must fit the table capacity. The engine automatically assigns the **smallest available table** that can accommodate the guests.
4. **Race-Condition Safety**: Bookings are performed inside a **MongoDB Transaction** session. If two users concurrently book the last table for the exact same slot, MongoDB's write-lock aborts the concurrent commit, throwing a `409 Conflict` instead of double-booking.
5. **Stand-alone Fallback**: If the local MongoDB server does not support transactions (e.g. running on a local standalone deployment instead of a replica set), the system gracefully logs a warning and performs allocation using standard model queries.

### Step-by-Step Conflict & Selection Walkthrough
Imagine the restaurant has the following tables configured:
* `Table 1` (2 seats)
* `Table 2` (2 seats)
* `Table 3` (4 seats)
* `Table 4` (4 seats)
* `Table 5` (6 seats)
* `Table 6` (8 seats)

**Scenario 1: Customer requests a booking for 5 guests at 2:00 PM**
1. The engine queries for active tables that can accommodate the party size ($capacity \ge 5$).
   - Eligible candidates: `Table 5` (6 seats) and `Table 6` (8 seats).
2. The candidates are sorted ascending by capacity to prioritize the smallest suitable layout first: `[Table 5, Table 6]`.
3. The engine checks `Table 5` for any overlapping confirmed bookings on the selected date between 2:00 PM and 4:00 PM.
   - If **no overlap** is found, `Table 5` is allocated.
   - If an **overlap** exists (e.g. Table 5 is already booked), the engine moves to `Table 6`.
4. If `Table 6` has no overlap, it is allocated.
5. If **both** `Table 5` and `Table 6` are already occupied during that window, the engine aborts the transaction and returns a `409 Conflict` status code.

### Overlap Condition
Two bookings overlap if:
$$(StartTime_{Requested} < EndTime_{Existing}) \land (EndTime_{Requested} > StartTime_{Existing})$$

### Occupancy Percentage Formula
The Admin Dashboard calculates real-time occupancy percentage based on active capacity:
$$\text{Occupancy \%} = \left( \frac{\text{Occupied Active Seats Today}}{\text{Total Seating Capacity of Active Tables}} \right) \times 100$$
* **Occupied Active Seats Today**: The sum of `guestCount` for all `'confirmed'` reservations scheduled for today's date.
* **Total Seating Capacity**: The sum of `capacity` for all tables marked as `isActive: true`.
* *Example*: If total active capacity is 26 seats, and there is one active booking today for 5 guests, the occupancy rate is $\frac{5}{26} \times 100 = 19.2\%$ (rounded to $19\%$).

---

## 5. API Documentation

### Authentication
- `POST /api/auth/register` - Registers a new user. Returns JWT and user object.
- `POST /api/auth/login` - Authenticates credentials. Returns JWT.
- `GET /api/auth/profile` - Fetches authenticated user info.

### Customer Reservations
- `POST /api/reservations` - Books a table (Zod checked). Auto-allocates suitable table.
- `GET /api/reservations/my` - Lists active/past reservations of logged-in user.
- `DELETE /api/reservations/:id` - Cancels user's reservation (updates status to `'cancelled'`).

### Admin Management
- `GET /api/admin/reservations` - Lists all bookings in system.
- `GET /api/admin/reservations/date/:date` - Lists all bookings for a specific date (YYYY-MM-DD).
- `PUT /api/admin/reservations/:id` - Updates booking details or status.
- `DELETE /api/admin/reservations/:id` - Permanently deletes booking from DB.
- `GET /api/admin/metrics` - Fetches dashboard stats (reservations count, occupancy rate).

### Tables Configuration
- `GET /api/tables` - Fetches table layout.
- `POST /api/tables` - Creates a new table (Admin only).
- `PUT /api/tables/:id` - Updates capacity or active state (Admin only).
- `DELETE /api/tables/:id` - Deletes a table from system (Admin only).

---

## 6. Role-Based Access Control (RBAC)

### Customer
- **Scope**: Access to Customer UI dashboard.
- **APIs Allowed**: Create and read own reservations, profile.
- **Blocked**: Intercepted by middleware `admin.js` if trying to access `/api/admin/*` or write to tables `/api/tables`.

### Administrator
- **Scope**: Access to Admin Dashboard metrics, seating layouts, reservation logs, and the customer registry.
- **APIs Allowed**: Full access across all routes.
- **Defaults**: A seeded admin account is available at `admin@email.com` / `admin123` for grading.

---

## 7. Deployment Instructions

### Backend (Render)
1. Link your GitHub repository.
2. Select Web Service. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `node src/server.js`
5. Configure Environment Variables in the Render settings:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `PORT=10000`
   - `NODE_ENV=production`

### Frontend (Vercel)
1. Link your GitHub repository.
2. Select Vite as Framework. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variables:
   - `VITE_API_URL` (Deploved Render Backend API URL, e.g. `https://your-backend.onrender.com/api`)

---

## 8. Assumptions & Limitations

### Assumptions
- Operating hours: The system supports booking at any standard hour list, but does not enforce hard restaurant closing hours on the backend.
- Seating limit: One reservation per table at any point in time. Combining tables for large groups is out of scope.
- Cancel vs Delete: A customer cancelling a reservation keeps the record in the database with status `cancelled` to allow records audit, whereas admins can permanently delete a record.

### Limitations
- No SMS/Email notification integration.
- Standard 2-hour duration is fixed on table allocation.
- No dynamic table joining/splitting.

### UX & Security Enhancements Implemented
- **Availability Preview Engine**: Customers can preview table availability in real-time on the booking page before completing their reservation.
- **Customers Registry**: Admins have access to a dedicated Customers tab displaying guest profile details and their historic booking statistics (Total, Active, Cancelled).
- **Secure Signup Restricting**: User signups are locked to the `'customer'` role by default on both frontend forms and backend validation middleware. Admin profiles can only be configured via secure database seeds.
- **Clean Luxury UI**: Re-branded as **Ram Dining**, implementing clean layouts, high contrast terracotta active sidebar navigation highlights, and card layouts with redundant placeholders removed.

### Future Improvements
- **Waitlist Engine**: Queueing bookings when restaurant is full.
- **Table Joining Logic**: Dynamically merging two adjacent 2-seater tables if a 4-seater is unavailable.
