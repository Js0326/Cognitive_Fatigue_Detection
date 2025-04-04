# Cognitive Fatigue Detection

## Overview
Cognitive Fatigue Detection is a web-based application designed to assess and monitor cognitive fatigue using various tests and machine learning models. The project consists of a backend for handling machine learning predictions and a frontend for user interaction and visualization.

## Features
- **Backend**:
  - Machine learning model for fatigue detection (`fatigue_rf_model1.pkl`).
  - Scaler for preprocessing data (`scaler_rf1.pkl`).
  - API endpoints for updating models and making predictions.
- **Frontend**:
  - User-friendly interface built with Next.js and Tailwind CSS.
  - Multiple test modules, including eye-tracking, math, memory, multitasking, reaction, and typing tests.
  - Dashboard for visualizing fatigue trends and test results.
  - Profile and settings management.
  - Fatigue alerts and performance charts.

## Project Structure
```
CFD_ML/
├── backend/
│   ├── app.py
│   ├── fatigue_rf_model1.pkl
│   ├── scaler_rf1.pkl
│   └── update_model.py
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── signup/
│   │   ├── tests/
│   │   │   ├── eye-tracking/
│   │   │   ├── math/
│   │   │   ├── memory/
│   │   │   ├── multitasking/
│   │   │   ├── reaction/
│   │   │   └── typing/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── styles/
```

## Installation

### Prerequisites
- Node.js and npm/pnpm
- Python 3.x
- Git

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Js0326/Cognitive_Fatigue_Detection.git
   cd Cognitive_Fatigue_Detection
   ```

2. Install dependencies for the frontend:
   ```bash
   cd frontend
   pnpm install
   ```

3. Install dependencies for the backend:
   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

## Usage

### Running the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Start the backend server:
   ```bash
   python app.py
   ```

### Running the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the frontend development server:
   ```bash
   pnpm dev
   ```

### Accessing the Application
- Open your browser and navigate to `http://localhost:3000` to access the frontend.
- The backend API will be available at `http://localhost:5000`.

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments
- Machine learning model development.
- UI/UX design inspiration from modern web applications.
- Libraries and frameworks used: Next.js, Tailwind CSS, Python, and more.