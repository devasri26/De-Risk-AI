# De-Risk AI — AI-Powered Project Failure Predictor

De-Risk AI is a premium, full-stack conceptual diagnostics console designed to evaluate software architecture proposals, database designs, and project concepts before coding begins. By leveraging the **Google Gemini API**, it runs deep heuristics to identify failure triggers, estimate a feasibility score, outline mitigation matrices, and generate presentation-ready PDF reports.

---

## 🚀 Key Features

* **AI-Driven Diagnostics**: Connects with Gemini nodes to run structural risk analysis on tech stacks, database choices, third-party APIs, and scalability boundaries.
* **Confidence Heuristics**: Computes feasibility ratings mapped to standard startup survival and engineering health benchmarks.
* **JWT User Authentication**: Secure user registration, sign-in, and session management on the Express server.
* **Interactive Dashboard**: Track scan history, review metrics, and view real-time statistics counters.
* **PDF Audit Generation**: Export beautifully formatted, executive-ready PDF failure reports to share with tech leads, investors, and stakeholders.
* **Premium SaaS UI**: Features dark mode styling, ambient glowing background animations, responsive grids, and glassmorphic UI elements.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Client Console)
* **Framework**: React 19 + Vite 8
* **Styling**: Vanilla CSS with custom CSS variables, custom components, responsive layout systems
* **State & Networking**: Axios API client

### Backend (Diagnostics Engine)
* **Runtime**: Node.js (ES Modules)
* **Web Server**: Express
* **Database**: Local JSON storage (mock database for authentication and report history)
* **Authentication**: JSON Web Tokens (JWT) + bcryptjs password hashing
* **AI Integration**: `@google/generative-ai` (Gemini model API)

---

## 📁 Repository Structure

```text
├── client/                 # React frontend application
│   ├── src/                # React components, styles, services
│   ├── index.html          # Frontend main entry
│   └── vite.config.js      # Vite configuration & server options
├── server/                 # Express backend server
│   ├── controllers/        # Route controllers for authentication & analysis
│   ├── routes/             # Express API endpoints
│   ├── public/             # Serves static web console pages
│   ├── server.js           # Express main server entry
│   └── data/               # Local JSON database stores
├── package.json            # Root configuration for dev scripts
└── README.md               # Main documentation
```

---

## ⚙️ Setup & Installation

### 1. Clone & Install Dependencies

Clone this repository and install the npm dependencies at the root, client, and server folders:

```bash
# Clone the repository
git clone https://github.com/devasri26/De-Risk-AI.git
cd De-Risk-AI

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory and add your Google Gemini API key:

```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### 3. Run the Development Servers

You can start the backend and frontend dev environments concurrently from the root directory:

```bash
# Start backend server (Port 5001) & Vite frontend server (Port 5173/5174)
npm run dev
```

* Backend server runs at: `http://localhost:5001`
* Client application runs at: `http://localhost:5174/` (or port auto-assigned by Vite)

---

## 📄 License
This project is licensed under the ISC License.
