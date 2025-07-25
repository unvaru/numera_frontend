# Numera Backend Development Scope

## 1. Overview

The backend will power a multi-subject, freemium learning platform for Accounting, Economics, and Business Studies. It will provide secure APIs, robust data management, and business logic for both student and admin experiences, supporting free and premium access tiers.

---

## 2. Core Functional Areas

### 2.1 User Management & Authentication
- **JWT-based authentication** (register, login, logout, password reset)
- **Role-based access control** (student, admin)
- **Profile management** (view/update profile, change password, language preference)
- **Subscription management** (free, premium, trial, expiry tracking)

### 2.2 Subject & Content Management
- **Subjects**: CRUD for subjects (admin only)
- **Topics**: CRUD for topics, each linked to a subject
- **Lessons**: CRUD for lessons, each linked to a topic; support for rich content (text, video, images)
- **Quizzes**: CRUD for quizzes, each linked to a topic
- **Questions**: CRUD for questions, each linked to a quiz; support for MCQ, fill-in-the-blank, numerical, scenario, etc.
- **Worked Examples**: CRUD for step-by-step examples, each linked to a topic
- **Practice Tools**: Support for journal, ledger, and trial balance simulators (accounting); extensible for other subjects
- **Past Papers**: CRUD for past papers, file uploads, and attempts

### 2.3 Student Experience
- **Dashboard**: Aggregate and serve progress, recommended next steps, recent activity
- **Progress Tracking**: Track progress at lesson, topic, and subject level; daily streaks
- **Quiz Attempts**: Record, score, and return quiz attempts and answers
- **Practice Sessions**: Record and validate ledger/journal practice sessions
- **Scenario Problems**: Serve and validate scenario-based questions
- **Badges & Certificates**: Award, track, and serve badges/certificates per subject

### 2.4 Admin Experience
- **Admin Dashboard**: Stats, recent activity, quick links
- **Content Management**: CRUD for all content types (subjects, topics, lessons, quizzes, questions, worked examples, scenarios, past papers)
- **Student Management**: View student progress, award badges/certificates, reset passwords, deactivate accounts
- **Reports & Analytics**: User registrations, activity, quiz performance, popular content

### 2.5 Freemium & Subscription Logic
- **Subscription Plans**: CRUD for plans (admin), assign plans to users
- **Access Control**: Enforce content/tool access based on plan (free vs premium)
- **Usage Limits**: Track and enforce usage limits for free users (e.g., daily quizzes, practice tools)
- **Upgrade/Downgrade/Trial**: Support for plan changes and trials

---

## 3. API Endpoints (RESTful)

### 3.1 Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/password-reset` (optional/phase 2)

### 3.2 Users
- `GET /api/v1/users` (admin)
- `GET /api/v1/users/:id`
- `PUT /api/v1/users/:id`
- `DELETE /api/v1/users/:id` (admin)

### 3.3 Subjects, Topics, Lessons
- `GET /api/v1/subjects`
- `POST /api/v1/subjects` (admin)
- `PUT /api/v1/subjects/:id` (admin)
- `DELETE /api/v1/subjects/:id` (admin)
- `GET /api/v1/subjects/:subjectId/topics`
- `POST /api/v1/topics` (admin)
- `PUT /api/v1/topics/:id` (admin)
- `DELETE /api/v1/topics/:id` (admin)
- `GET /api/v1/topics/:topicId/lessons`
- `POST /api/v1/lessons` (admin)
- `PUT /api/v1/lessons/:id` (admin)
- `DELETE /api/v1/lessons/:id` (admin)

### 3.4 Quizzes & Questions
- `GET /api/v1/topics/:topicId/quizzes`
- `POST /api/v1/quizzes` (admin)
- `PUT /api/v1/quizzes/:id` (admin)
- `DELETE /api/v1/quizzes/:id` (admin)
- `GET /api/v1/quizzes/:quizId/questions`
- `POST /api/v1/questions` (admin)
- `PUT /api/v1/questions/:id` (admin)
- `DELETE /api/v1/questions/:id` (admin)

### 3.5 Attempts & Progress
- `POST /api/v1/quiz-attempts`
- `POST /api/v1/quiz-attempts/:attemptId/answers`
- `GET /api/v1/quiz-attempts/:id`
- `GET /api/v1/users/:userId/quiz-attempts`
- `GET /api/v1/users/:userId/progress`

### 3.6 Worked Examples, Practice, Scenarios
- `GET /api/v1/topics/:topicId/worked-examples`
- `POST /api/v1/worked-examples` (admin)
- `GET /api/v1/worked-examples/:id/steps`
- `POST /api/v1/ledger-sessions`
- `POST /api/v1/ledger-sessions/:id/entries`
- `GET /api/v1/ledger-sessions/:id`
- `GET /api/v1/topics/:topicId/scenarios`
- `POST /api/v1/scenarios` (admin)

### 3.7 Past Papers
- `GET /api/v1/past-papers`
- `POST /api/v1/past-papers` (admin)
- `POST /api/v1/past-paper-attempts`
- `POST /api/v1/past-paper-attempts/:id/answers`
- `GET /api/v1/past-paper-attempts/:id`

### 3.8 Badges & Certificates
- `GET /api/v1/badges`
- `GET /api/v1/users/:userId/badges`
- `POST /api/v1/user-badges` (admin)
- `GET /api/v1/certificates`
- `GET /api/v1/users/:userId/certificates`
- `POST /api/v1/user-certificates` (admin)

### 3.9 Subscriptions
- `GET /api/v1/subscription-plans`
- `POST /api/v1/subscription-plans` (admin)
- `PUT /api/v1/subscription-plans/:id` (admin)
- `DELETE /api/v1/subscription-plans/:id` (admin)
- `GET /api/v1/users/:userId/subscription`
- `POST /api/v1/users/:userId/subscription`
- `PUT /api/v1/users/:userId/subscription`

---

## 4. Database Schema (Key Tables)

- USERS (id, email, password_hash, name, role, subscription_plan, subscription_expiry, created_at)
- SUBJECTS (id, title, description, order)
- TOPICS (id, subject_id, title, description, order)
- LESSONS (id, topic_id, title, content, video_url, order)
- QUIZZES (id, topic_id, title, instructions)
- QUESTIONS (id, quiz_id, question_text, options, correct_answer, explanation, type)
- STUDENT_QUIZ_ATTEMPTS (id, user_id, quiz_id, score, started_at, completed_at)
- STUDENT_ANSWERS (id, attempt_id, question_id, selected_answer, is_correct)
- WORKED_EXAMPLES (id, topic_id, title, description)
- WORKED_STEPS (id, example_id, step_number, prompt, expected_answer, hint)
- LEDGER_PRACTICE_SESSIONS (id, user_id, topic_id, started_at, completed_at)
- SCENARIOS (id, topic_id, title, description)
- PAST_PAPERS (id, year, title, file_url, duration)
- PAST_PAPER_ATTEMPTS (id, user_id, paper_id, score, started_at, completed_at)
- BADGES (id, title, description, icon_url)
- USER_BADGES (id, user_id, badge_id, earned_at)
- CERTIFICATES (id, title, template_url)
- USER_CERTIFICATES (id, user_id, certificate_id, earned_at)
- SUBSCRIPTION_PLANS (id, name, features, price, duration)
- USER_SUBSCRIPTIONS (id, user_id, plan_id, status, started_at, expires_at)
- USER_SUBJECT_PROGRESS (id, user_id, subject_id, progress, updated_at)

---

## 5. Technical & Security Requirements

- **Node.js (Koa/Express) backend**
- **PostgreSQL** (or compatible RDBMS)
- **JWT authentication**
- **Role-based authorization middleware**
- **Input validation and error handling**
- **File upload support (for videos, PDFs, images)**
- **Rate limiting and usage tracking for freemium**
- **Audit logging for admin actions**
- **API documentation (OpenAPI/Swagger)**
- **Automated tests for endpoints and business logic**
- **Internationalization support (English/Dhivehi)**
- **WCAG-compliant error messages**

---

## 6. Scalability & Extensibility

- Multi-subject and multi-plan support
- Extensible for new content types and tools
- Modular service structure for future features (e.g., new subjects, analytics, notifications)
- Cloud-ready deployment (AWS, Docker, etc.)

---

## 7. Next Steps

- Finalize API contract with frontend team
- Design and migrate initial database schema
- Implement authentication and user management
- Develop content and progress APIs
- Integrate subscription and access control logic
- Set up admin and reporting endpoints
- Write automated tests and documentation

---

**This scope ensures the backend will fully support the frontend’s features, navigation, and business logic, with a focus on scalability, security, and maintainability.** 