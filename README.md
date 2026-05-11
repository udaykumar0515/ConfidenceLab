# 🎯 ConfidenceLab - AI-Powered Interview Analysis Platform

<div align="center">

**🎯 ConfidenceLab - AI-Powered Interview Analysis Platform**

**Transform your interview performance with AI-powered confidence analysis**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10-blue.svg)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🛠️ Installation](#️-installation)
- [🚀 Quick Start](#-quick-start)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🌟 Overview

**ConfidenceLab** is an AI-powered interview preparation platform that provides real-time confidence analysis through computer vision, speech recognition, and machine learning. Practice HR, Technical, and Behavioral interviews with comprehensive feedback on facial expressions, speech patterns, and body language.

## ✨ Features

- **🎭 Multi-Modal Analysis**: Facial emotion detection, speech analysis, and body language recognition
- **📊 Real-Time Feedback**: Instant confidence scores and detailed breakdowns
- **🎓 Interview Types**: HR, Technical, and Behavioral interview practice
- **📈 Progress Tracking**: Monitor improvement with session history
- **🔒 Privacy-First**: Local analysis keeps your data secure

---

## 🛠️ Installation

### 📋 **Prerequisites**

- **Node.js** 18.0+ and npm
- **Python** 3.10+
- **Git** for version control

### ⚡ **Windows Quick Start**

We provides automated scripts to get you up and running instantly:

1. **First-time Setup:**
   Double-click `setup_app.bat` to install dependencies and set up the environment.

2. **Launch Application:**
   Double-click `start_app.bat`. This will automatically start both the backend (Port 8000) and frontend (Port 5173) in separate windows.

### 🐧 **Manual Setup (Mac/Linux)**

1. **Clone the repository**

   ```bash
   git clone https://github.com/udaykumar0515/ConfidenceLab.git
   cd ConfidenceLab
   ```

2. **Install Frontend Dependencies**

   ```bash
   npm install
   ```

3. **Setup Backend Environment**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Start the Application**

   ```bash
   # Terminal 1: Start Backend
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000

   # Terminal 2: Start Frontend
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

---

## 🚀 Quick Start

### 👤 **First Time Setup**

1. **Create Account**: Sign up with email and password
2. **Choose Interview Type**: Select HR, Technical, or Behavioral
3. **Select Question**: Pick from curated question banks
4. **Start Recording**: Click record and begin your interview
5. **Get Analysis**: Receive instant confidence feedback
6. **Review Results**: Check detailed breakdowns and tips

### 🎯 **Best Practices**

- **Lighting**: Ensure good lighting for facial analysis
- **Audio**: Use a quiet environment for speech analysis
- **Positioning**: Sit centered in frame for body language detection
- **Practice**: Regular sessions improve accuracy and confidence

---

##  Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### 🛠️ **Development Setup**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### 🐛 **Bug Reports & Feature Requests**

Found a bug or have a feature idea? Please open an issue on our [GitHub Issues](https://github.com/udaykumar0515/ConfidenceLab/issues) page with a clear description.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

