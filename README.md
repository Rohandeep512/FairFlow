# FairFlow 🚀

## OS-Inspired Scheduling Platform for Real-World Operations

FairFlow is a smart queue management system that applies classic Operating System (OS) CPU scheduling algorithms to optimize real-world service workflows. Instead of relying on rigid, inefficient **First-Come, First-Serve** queues, FairFlow intelligently manages demand to minimize wait times and maximize throughput.

---

## The Problem

In environments like **Campus Print Shops, Hospital OPDs, and Lab Equipment Booking**, simple queueing often leads to bottlenecks where small, urgent tasks get stuck behind massive projects. This results in frustration and wasted time.

FairFlow solves this by applying proven scheduling techniques from Operating Systems to real-world workflows.

---

## Key Features

### 🧠 Intelligent Scheduling
Switch between algorithms like:
- Shortest Job First (SJF)
- Round Robin
- Priority Scheduling
- Aging-Based Scheduling

to suit your operational needs.

### 🤖 AI-Powered Advisor
Uses advanced AI to analyze queue traffic and recommend the optimal scheduling algorithm for maximum efficiency.

### 📊 Real-Time Tracking
Dynamic job allocation and live queue updates ensure customers always know their status.

### 📱 Responsive UI
Built for mobile-first usage, allowing users to join queues through a simple link or QR code.

---

## Motivation

FairFlow was built to bridge the gap between academic Operating System theory and real-world operational bottlenecks.

The goal was to demonstrate that intelligent resource management isn't limited to CPUs—it can be applied to people, services, and workflows. By reimagining how we wait, FairFlow transforms everyday queues into efficient, organized, and fair experiences.

---

## Future Enhancements

- 📈 **Advanced Queue Analytics**
  - Admin dashboard for visualizing peak hours and resource bottlenecks.

- 🔮 **Predictive Wait-Time Models**
  - Use historical queue data to provide accurate waiting-time estimates.

- 💬 **SMS / WhatsApp Integration**
  - Automatic notifications when a user's turn is approaching.

- 🏢 **Multi-Tenant Support**
  - Multiple organizations or departments managing independent queues under one platform.

- ⚡ **Dynamic Priority Tuning**
  - AI-driven priority adjustments based on real-time urgency and queue conditions.

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend
- Node.js
- Express.js
- PostgreSQL
- pg (node-postgres)

### Intelligence Layer
- OpenRouter API
- Gemini / LLM Integration

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/FairFlow.git
cd FairFlow
```

#### 2. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

#### 3. Environment Setup

Create a `.env` file inside the `backend/` directory:

```env
DATABASE_URL=your_postgres_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000
```

#### 4. Run the Project

```bash
# Start backend server
cd backend
npm run dev

# Start frontend
cd ../frontend
npm run dev
```

---

## Scheduling Algorithms Explained

### First-Come, First-Serve (FCFS)
The classic queue system. Jobs are processed in the exact order they arrive.

### Shortest Job First (SJF)
The express lane. Smaller tasks are completed first, reducing overall waiting time.

### Round Robin
The fair-share approach. Every task gets a time slice before the next one is processed.

### Priority + Aging
Urgent tasks receive higher priority, while aging ensures that low-priority tasks eventually move forward and never starve.

---

## Deployment

### Backend
- Render

### Frontend
- Vercel

---

## Author

**Rohandeep Singh**  
NSUT | Software Engineering Enthusiast | Full-Stack Developer

---

⭐ If you found this project interesting, consider giving it a star!