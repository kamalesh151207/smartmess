# SmartMess Deployment & Operations Guide

This guide covers local environment setup, microservice execution, model training commands, and production deployment options.

---

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.9 or higher (with `pip`)
- **Package Managers**: `npm`

---

## 2. Quick Start (Local Development)

### Step 1: Install Dependencies
```bash
# Install Server Dependencies
npm --prefix server install

# Install Client Dependencies
npm --prefix client install

# Install Python ML Dependencies
pip3 install -r ml/requirements.txt
```

### Step 2: Seed Realistic Database & Train Baseline Model
```bash
# Seed SQLite Database with 30-Day Attendance and Menu Schedules
npm --prefix server run seed

# Run Initial Model Training & Evaluation Pipeline
python3 ml/train.py
```

### Step 3: Launch Services

In three separate terminal windows:

```bash
# Terminal 1: Python FastAPI ML Inference Engine (:8000)
python3 ml/inference_service.py

# Terminal 2: Node.js Express API Gateway (:3001)
npm --prefix server run dev

# Terminal 3: React Frontend Client (:5173 or :8080)
npm --prefix client run dev
```

---

## 3. Environment Variables

### Server (`server/.env`)
```env
PORT=3001
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

### Client (`client/.env`)
```env
VITE_API_URL=/api
```

---

## 4. Testing & Verification

```bash
# Run ML Pipeline Unit Tests
python3 -m unittest ml/test_ml.py

# Run Backend Integration Tests
npm --prefix server test

# Verify Client TypeScript Build
npm --prefix client run build
```
