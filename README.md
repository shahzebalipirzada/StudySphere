# 🎓 StudySphere

<p align="center">
  <h1 align="center">StudySphere</h1>
  <p align="center">
    <strong>Your Personal AI-Powered Study Hub</strong>
    <br>
    Learn smarter. Stay organized. Everything you need to study in one place.
  </p>
</p>

---

## 📖 About the Project

StudySphere is a modern **AI-powered study hub** built with the **MERN Stack**.

Students constantly switch between AI chatbots, YouTube, note-taking apps, and calculators while studying. This breaks concentration and reduces productivity.

StudySphere brings these essential tools together into one personalized platform where students can ask questions, organize notes, search educational videos, solve calculations, and continue learning without constantly changing applications.

This project was developed as an individual full-stack MERN application with AI integration.

---

# 🎯 Problem Statement

Students often use multiple applications during a single study session:

- AI chatbots
- YouTube
- Notes applications
- Calculators

Switching between these tools interrupts focus and wastes valuable study time.

---

# 💡 Solution

StudySphere provides a single AI-powered workspace where students can:

- Learn with an intelligent AI tutor
- Organize study notes
- Search educational YouTube videos
- Use built-in study calculators
- Manage everything from one clean dashboard

---

# 🌐 Live Demo

visit: https://studysphere-web.vercel.app/

---

# ✨ Features (Version 1)

## 🔐 Secure Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Password Hashing
- Secure Logout

---

## 🤖 AI Tutor

An AI assistant that helps students understand concepts instead of simply providing answers.

Features include:

- Step-by-step explanations
- Homework assistance
- Programming help
- Mathematics explanations
- Context-aware conversations
- Markdown & code formatting

---

## 📝 Smart Notes

- Create notes
- Edit notes
- Delete notes
- Search notes
- Clean and distraction-free interface

---

## ▶️ YouTube Learning

Search educational topics without leaving the application.

- Topic search
- Embedded YouTube videos
- Learn directly inside the app

---

## 🧮 Calculator Hub

Built-in study tools including:

- Scientific Calculator
- GPA Calculator
- Unit Converter

---

## 📊 Personalized Dashboard

The dashboard provides quick access to everything the student needs.

- Welcome section
- Recent notes
- Quick actions
- AI Tutor shortcut
- Calculator Hub shortcut
- YouTube Learning shortcut

---

## 🎨 Modern User Interface

- Responsive Design
- Light & Dark Mode
- Smooth Animations
- Student-Friendly Layout
- Minimal Illustrations
- Modern Dashboard Design

---

# 🤖 AI Feature

StudySphere includes an AI Tutor that focuses on helping students learn concepts rather than simply generating answers.

### AI Responsibilities

- Explain concepts clearly
- Adapt explanations to different learning levels
- Break difficult topics into simple steps
- Format responses using Markdown
- Format programming code correctly
- Encourage understanding instead of memorization

### Example System Prompt

```text
You are StudySphere AI Tutor.

Your job is to help students understand concepts instead of simply giving answers.

Always:

- Explain concepts step by step.
- Adapt explanations to the student's level.
- Encourage learning rather than memorization.
- Format code professionally.
- Use Markdown for better readability.
- Recommend additional resources when helpful.
```

---

# 🛠 Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios
- Framer Motion

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

## Authentication

- JWT
- bcrypt

## AI

- Groq API *(or your chosen AI provider)*

## Deployment

- Vercel
- Render
- MongoDB Atlas

---

# 📂 Project Structure

```
StudySphere/

├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── store/
│   ├── hooks/
│   ├── assets/
│   └── utils/
│
├── backend/
│   ├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── config/
│   └── utils/
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/shahzebalipirzada/StudySphere.git
```

```bash
cd StudySphere
```

---

## Backend

```bash
cd backend
npm install
npm run dev
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🔑 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=

MONGO_URI=

JWT_SECRET=

GEMINI_API_KEY=

CLIENT_URL=
```

> Never commit API keys or secrets to GitHub.

---

# 📸 Screenshots

Screenshots will be added after the application is completed.

| Dashboard |
|-----------| 
| <img width="1916" height="1006" alt="image" src="https://github.com/user-attachments/assets/4ec21e0d-df8d-46c1-bad8-c9c8fdf8854b" /> | 

| AI Tutor |
|----------|
 | <img width="1916" height="1006" alt="image" src="https://github.com/user-attachments/assets/dd832bed-4e71-4c42-9469-0accdd91c366" />
 |

 

| Notes | 
|-------|
| <img width="1916" height="1006" alt="image" src="https://github.com/user-attachments/assets/70a483af-d1c9-4ba6-bb74-a20360114c3e" /> |

| Calculator Hub |
| ---------------- |
 | <img width="1916" height="1006" alt="image" src="https://github.com/user-attachments/assets/4c432216-d05e-4000-b7f2-a5244c0e1b4c" />
|



| Youtube Hub | 
|-------------|
| <img width="1916" height="1006" alt="image" src="https://github.com/user-attachments/assets/92b8b79f-5468-42f0-b374-ef57a9ecc213" /> |

| Smart Search |
|--------------|
 |<img width="1916" height="1006" alt="image" src="https://github.com/user-attachments/assets/f2d6fe14-e84e-4849-80d7-112389f52df9" />



 
---

# 🗺️ Roadmap

## Version 2

- 📄 AI PDF Assistant
- 🧠 AI Flashcards
- 📝 AI Quiz Generator
- 📈 Learning Analytics
- 🎮 Gamification
- 🧠 Personalized AI Memory
- 💬 Motivational AI Messages

## Version 3

- 🎤 Voice AI Tutor
- 🖋 OCR for Handwritten Notes
- 🧠 AI Mind Maps
- 📱 Mobile Application
- 🌐 Progressive Web App (PWA)
- 🔌 Browser Extension

---

# 🎓 Learning Outcomes

This project strengthened my knowledge of:

- MERN Stack Development
- REST API Design
- JWT Authentication
- MongoDB Data Modeling
- AI Integration
- State Management
- Modern UI/UX Design
- Full-Stack Deployment

---

# 👨‍💻 Author

**Shahzeb Ali**

Computer Science Student

- GitHub: https://github.com/shahzebalipirzada
- Portfolio: https://shahzebali.vercel.app
- LinkedIn: https://linkedin.com/in/shahzeb-ali-pirzada

---

# 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
⭐ If you like this project, consider giving it a star!
</p>
