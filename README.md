# 🪔 Vinayaka Chavithi Festival Management Portal

A full-stack web application designed for organizing, managing, and streamlining community Vinayaka Chavithi festival celebrations. The portal simplifies registrations, event schedules, pooja slot bookings, donation tracking, document storage, photo/video galleries, and public announcements.

---

## ✨ Features

- **🛡️ Role-Based Access Control**:
  - **Public / Devotee**: View schedules, book pooja slots, register as volunteers, view gallery & announcements.
  - **Committee Members**: Manage collections, update event schedules, verify registrations.
  - **Admin**: Full control over users, financial reporting, document vault, and configuration.
- **📅 Events & Schedule**: Interactive festival timeline with dates, locations, and rituals.
- **🙏 Pooja Slot Booking**: Seamless reservation system for pooja and archana time slots.
- **💰 Donations & Collections Management**: Track festival contributions, generate receipts, and monitor expenses.
- **📁 Document Vault**: Securely upload and access government permissions, receipts, bills, and NOCs.
- **📸 Media Gallery**: High-resolution image and video showcase of festival events.
- **📢 Real-Time Announcements**: Instant broadcast of key updates, changes, and alerts to devotees.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Lucide Icons, Modern CSS / Tailwind
- **Backend**: Node.js, Express.js, JWT Authentication, Multer (file uploads)
- **Database**: MongoDB with Mongoose ODM
- **Concurrency**: Concurrently for running full-stack dev servers simultaneously

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```

### 2. Install Dependencies
Install dependencies for both frontend and backend in one command:
```bash
npm run install-all
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` directory based on `.env.example`:

```bash
# In backend/.env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_jwt_key
NODE_ENV=development
```

> ⚠️ **Important**: Never commit your `.env` file containing actual database credentials or secret keys to GitHub.

### 4. Seed Sample Data (Optional)
Populate the database with default festival data and admin accounts:
```bash
npm run seed
```

### 5. Start the Application
Run both backend and frontend concurrently:
```bash
npm start
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 📂 Project Structure

```text
├── backend/
│   ├── config/          # Database & configuration settings
│   ├── middleware/      # Auth & file upload middlewares
│   ├── models/          # Mongoose data schemas (User, Event, Collection, etc.)
│   ├── routes/          # Express REST API routes
│   ├── uploads/         # Uploaded documents & media (excluded from Git)
│   ├── seed.js          # Database seeding script
│   ├── server.js        # Express server entry point
│   └── .env.example     # Environment variables template
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # Reusable UI components & navigation
│   │   ├── pages/       # Application views & dashboards
│   │   ├── App.jsx      # Main router & app layout
│   │   └── main.jsx     # Frontend entry point
│   └── vite.config.js   # Vite configuration
├── .gitignore           # Global git ignore configuration
├── package.json         # Workspace root scripts
└── README.md            # Documentation
```

---

## 📜 License
This project is open source and available under the [MIT License](LICENSE).
