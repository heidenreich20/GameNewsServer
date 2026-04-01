# 🎮 Game News API

A high-performance, modular RESTful API built with **Node.js 24 (Krypton)** and **MongoDB**. Designed for scalability using the MVC (Model-View-Controller) pattern.

## 🚀 Technical Stack
- **Runtime:** Node.js 24+ (LTS)
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Validation:** Joi
- **Security:** Helmet, CORS
- **Testing:** Jest + Supertest + MongoDB Memory Server

## 📂 Architecture
The project follows a clean separation of concerns:
- `Controllers/`: Business logic and request handling.
- `Models/`: Mongoose schemas and data indexing.
- `Routes/`: API endpoint definitions.
- `Middleware/`: Request validation and filtering.
- `tests/`: Automated integration tests.

## 🛠️ Getting Started

### Prerequisites
- Node.js >= 24.0.0
- A MongoDB Atlas connection string

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/GameNewsServer.git](https://github.com/your-username/GameNewsServer.git)
   cd GameNewsServer
   npm install