# 🛡️ De-Risk AI

An AI-powered conceptual diagnostics console that identifies software failure triggers before production.

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini" />
</p>

---

## ⚡ Key Modules

* **AI Diagnostics**: Real-time architectural and database audit via Gemini AI nodes.
* **Feasibility Rating**: Quantified project viability scores based on startup health metrics.
* **JWT Auth**: Secured user registrations and logins.
* **Diagnostic History**: Saved audits for easy retrieval.
* **PDF Export**: Presentation-ready audit summaries for stakeholders.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS, Axios, Lucide React | Modern SPA with custom layout and styles. |
| **Backend** | Node.js, Express, CORS | API framework with custom routing. |
| **AI Node** | Google Gemini API (`@google/generative-ai`) | Real-time project concept feasibility diagnostics. |
| **Security** | JSON Web Tokens (JWT), bcryptjs | Secure routes, session handling, and hashed passwords. |
| **Database** | File-based local JSON store | Persistent client and report history storage. |

---


## ⚙️ Quick Start

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/devasri26/De-Risk-AI.git
cd De-Risk-AI

# Install all dependencies
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Environment Setup
Create a `.env` file in the `server/` directory:
```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
```

### 3. Execution
```bash
# Run backend and frontend concurrently
npm run dev
```

* **Backend & Static Web Console**: [http://localhost:5001](http://localhost:5001)
* **Vite React UI**: [http://localhost:5174/](http://localhost:5174/)
