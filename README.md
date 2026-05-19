# Learnify - Full Stack E-Learning Platform

A robust MERN stack application for online learning, featuring dedicated dashboards for students and teachers, progress tracking, and interactive quizzes.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local instance
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/farizadam/learnify.git
   cd learnify
   ```

2. **Backend Setup:**
   ```bash
   cd server
   npm install
   ```
   
   Create a `.env` file:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   TEACHER_SECRET = your_teacher_secret_here
   ```
   
   Start the server:
   ```bash
   npm start
   ```

3. **Frontend Setup:**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

## 🛠 API Reference
**Base URL:** `http://localhost:3000`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <JWT>` (for protected routes)

### Authentication (`/api/auth`)
| Endpoint | Method | Expects | Returns |
| --- | --- | --- | --- |
| `/register` | POST | `{firstName, lastName, email, password, role}` | Success Message |
| `/login` | POST | `{email, password}` | `{token}` |
| `/refresh-token` | POST | `{token}` | `{token}` (new) |

### User & Teacher (`/api/users` & `/api/teacher`)
| Endpoint | Method | Expects | Returns |
| --- | --- | --- | --- |
| `/user` | GET | Bearer Token | User Profile object |
| `/users/profile` | PUT | `{bio, avatar, socials}` | Updated User object |
| `/teacher/stats` | GET | Bearer Token (Teacher) | Metrics (Students, Ratings) |

### Courses & Lessons (`/api/courses`)
| Endpoint | Method | Expects | Returns |
| --- | --- | --- | --- |
| `/courses` | GET | Optional `?title=...` | Array of Courses |
| `/courses/:id` | GET | Course ID | Course details + Lessons |
| `/:courseId/enroll` | POST | Bearer Token | Success + Enrollment status |
| `/courses/addLesson` | POST | `{title, content, courseId}` | New Lesson object |
| `/lessons/:id/complete`| PATCH | Bearer Token | Updated progress data |

### Quizzes (`/api/quizzes`)
| Endpoint | Method | Expects | Returns |
| --- | --- | --- | --- |
| `/course/:courseId` | GET | Course ID | List of quiz questions |
| `/:id/submit` | POST | `{answers}` | `{score, status}` |
