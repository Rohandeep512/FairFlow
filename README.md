# FairFlow


<table>
  <tr>
    <td colspan="2"><img width="100%" alt="FairFlow Screenshot 1" src="https://github.com/user-attachments/assets/ab536c9c-6a88-4b2e-abdd-de7acdcd4f93" /></td>
  </tr>
  <tr>
    <td width="50%"><img width="100%" alt="FairFlow Screenshot 2" src="https://github.com/user-attachments/assets/9cf2e835-08a1-4d9e-a6a7-3d9150de16bc" /></td>
    <td width="50%"><img width="100%" alt="FairFlow Screenshot 3" src="https://github.com/user-attachments/assets/d23051ee-404e-40b2-8b91-ab51f051e025" /></td>
  </tr>
</table>


A full-stack queue management system that applies classic Operating System CPU scheduling algorithms — FCFS, Shortest Job First, Round Robin, and Priority with Aging — to real-world service workflows like print shops, lab equipment booking, clinics, and support desks. Built to bridge academic OS theory with a working, production-style product.

## Demo

Live app: [FairFlow on Vercel](https://fair-flow.vercel.app/)

🔒 **Note:** Admin passwords are hashed using `bcrypt` before storage and JWT is used for session authentication. Credentials are never visible to the developer.

## The Problem

In environments like campus print shops, hospital OPDs, and lab equipment booking, a simple first-come-first-serve line often creates bottlenecks — a 2-minute task gets stuck behind a 45-minute one, and urgent requests have no way to jump ahead fairly. FairFlow solves this by letting admins pick a scheduling strategy suited to their queue, the same way an OS scheduler picks which process runs next.

## Features

**Admin Authentication**
- JWT-based login/register for queue admins
- Passwords hashed with bcrypt before storage
- Protected admin routes on both frontend and backend

**Multiple Scheduling Algorithms**
- First-Come, First-Serve (FCFS) — the classic line
- Shortest Job First (SJF) — express lane for quick tasks
- Round Robin — guaranteed fair time-slice rotation
- Priority + Aging — urgent requests get priority, but waiting requests gain priority over time so nobody starves

**AI-Powered Recommendations**
- Queue traffic is analyzed via the OpenRouter API to suggest the best-fit scheduling algorithm
- AI completion-time predictions, cached per session to avoid redundant calls

**Live Queue Tracking**
- Customers join via a simple code — no app, no sign-up
- Real-time queue status and position updates
- Emergency request flow with admin approval

**Distinctive UI**
- Editorial-style design system (Fraunces serif headlines, Space Grotesk labels, Inter body text)
- Built deliberately to avoid generic SaaS/AI-template aesthetics

## Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS v4
- Lucide Icons
- React Router

**Backend:**
- Node.js + Express (ES Modules)
- PostgreSQL
- JWT authentication
- bcrypt for password hashing

**Intelligence Layer:**
- OpenRouter API (AI recommendations & completion prediction)

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: PostgreSQL

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/Rohandeep512/FairFlow.git
cd FairFlow
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```
PORT=5000
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_api_key
```

Run the schema and start the backend:

```bash
psql -d your_database -f schema.sql
npm run dev
```

### 3. Setup the frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Now open `http://localhost:5173` in your browser.

## Deployment

### Backend (Render)
1. Create a new **Web Service** on Render
2. Connect your GitHub repo → set **Root Directory** to `backend`
3. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `OPENROUTER_API_KEY`, `PORT`
4. Build Command: `npm install`
5. Start Command: `npm start`

### Frontend (Vercel)
1. Import your GitHub repo into Vercel
2. Set **Root Directory** to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
4. Build Command: `npm run build` (auto-detected)
5. Output Directory: `dist` (auto-detected for Vite)

## Project Structure

```
FairFlow/
│
├── backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Auth, queue, scheduling, and AI controllers
│   ├── middleware/         # JWT verification middleware
│   ├── routes/             # Express route definitions
│   ├── utils/              # Scheduling algorithm logic
│   ├── migrate_demo.js     # Demo data migration script
│   ├── migrate_priority.js # Priority/aging migration script
│   ├── schema.sql          # PostgreSQL schema
│   └── server.js           # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── pages/          # Landing, AdminLogin, Dashboard, LiveQueue, etc.
│   │   ├── utils/          # Frontend helper functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## Scheduling Algorithms Explained

**First-Come, First-Serve (FCFS)**
The classic queue. Jobs are processed in the exact order they arrive. Best for queues where every task takes roughly the same time.

**Shortest Job First (SJF)**
The express lane. Smaller tasks are completed first, reducing average wait time across the whole queue. Best for clearing crowded rooms fast.

**Round Robin**
The fair-share approach. Every task gets a guaranteed time slice before rotating to the next. Best for shared resources like sports courts or gaming setups.

**Priority + Aging**
Urgent requests get priority access, but normal requests slowly gain priority the longer they wait — so nobody is left behind. Best for triage-style scenarios like clinics or emergency desks.

## Key Learnings

- Translating abstract OS scheduling theory (FCFS, SJF, Round Robin, Priority + Aging) into a working, testable backend
- Spec-first development — defining logic guards and database constraints before writing code, after learning the cost of unplanned logic in an earlier project
- Designing a distinctive, non-templated UI system instead of defaulting to generic dashboard aesthetics
- Integrating an AI API (OpenRouter) for queue analysis and completion-time prediction, with response caching to control cost
- Structuring an ES-module Node.js backend with clean separation of concerns

## Future Improvements

- Admin analytics dashboard for peak hours and bottleneck visualization
- SMS/WhatsApp notifications when a customer's turn is approaching
- Multi-tenant support for multiple organizations/departments
- Predictive wait-time models trained on historical queue data

## Author/Developer

Rohandeep Singh

NSUT | Full-Stack Developer

LinkedIn: [Rohandeep Singh](https://www.linkedin.com/in/rohandeep-singh-283465323/)

GitHub: [@Rohandeep512](https://github.com/Rohandeep512)

⭐ If you found this project interesting, consider giving it a star!
