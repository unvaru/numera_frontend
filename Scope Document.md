# Scope Document

**📌 Numera – Scope Document**

**Project Name:** Numera – O-Level Accounting Learning Platform  
**Prepared by:** \[Your Name\]  
**Version:** 1.0  
**Date:** \[Insert Date\]

**Objective:**

Build an interactive web application to teach Accounting to O-Level students in Maldives (and globally), aligned with the Cambridge syllabus and Maldivian curriculum.

**Key Features:**

✅ Student User Area

- Lessons (text, images, video)
- Interactive quizzes with instant feedback
- Worked examples with step-by-step guidance
- Simulated ledger/journal practice
- Scenario-based problem solving
- Past paper practice (interactive)
- Progress tracking with badges/certificates
- Profile management

✅ Admin Panel

- Manage topics and syllabus
- CRUD for lessons, quizzes, questions
- Upload/manage videos and worked examples
- Manage scenarios and past papers
- Student management and progress reports
- Award badges and certificates

✅ Adaptive Learning

- Personalized recommended lessons
- Highlight weak areas based on quiz performance

✅ Language Support

- English
- Dhivehi

**Platform Requirements:**

- Responsive (mobile, tablet, desktop)
- Role-based access control (student/admin)
- Secure authentication (JWT)
- Accessible design (WCAG-compliant)

**Technology Stack (suggested):**

- Frontend: Vue.js
- Backend: Node.js (Koa)
- Database: PostgreSQL
- Hosting: AWS
- Figma for design

# Navigation Flow

**📌 Student Flow**

- Login/Register
- Dashboard
  - View progress
  - Recommended next steps
  - Quick access to Lessons, Quizzes, Past Papers
- Lessons
  - List by topic
  - View lesson detail
- Quizzes
  - List by topic
  - Take quiz
  - View results
- Worked Examples
  - List by topic
  - Step-by-step player
- Ledger/Journal Practice
- Scenario-Based Problems
- Past Papers
  - Select and practice
- Badges & Certificates
- Profile
  - Manage info
  - Change password
  - Language toggle
  - Logout

**📌 Admin Flow**

- Login
- Dashboard
  - Quick stats
  - Recent activity
- Manage Topics
- Manage Lessons
- Manage Quizzes
- Manage Questions
- Manage Worked Examples
- Manage Scenarios
- Manage Past Papers
- Manage Students
  - View progress
  - Award badges/certificates
- Badges Management
- Certificates Management
- Reports/Analytics
- Settings
  - Profile
  - Notifications
  - Language

# Database Schema

**📌 Core Tables**

**✅ USERS**

- id (UUID, PK)
- email (String, unique)
- password_hash (String)
- name (String)
- role (Enum: student, admin)
- created_at (Timestamp)

**✅ TOPICS**

- id (UUID, PK)
- title (String)
- description (Text)
- order (Integer)

**✅ LESSONS**

- id (UUID, PK)
- topic_id (FK → TOPICS.id)
- title (String)
- content (Text/HTML)
- video_url (String)
- order (Integer)

**✅ QUIZZES**

- id (UUID, PK)
- topic_id (FK → TOPICS.id)
- title (String)
- instructions (Text)

**✅ QUESTIONS**

- id (UUID, PK)
- quiz_id (FK → QUIZZES.id)
- question_text (Text)
- option_a/b/c/d (String)
- correct_answer (Char)
- explanation (Text)
- question_type (Enum)

**✅ STUDENT_QUIZ_ATTEMPTS**

- id (UUID, PK)
- user_id (FK → USERS.id)
- quiz_id (FK → QUIZZES.id)
- score (Float)
- started_at (Timestamp)
- completed_at (Timestamp)

**✅ STUDENT_ANSWERS**

- id (UUID, PK)
- attempt_id (FK → STUDENT_QUIZ_ATTEMPTS.id)
- question_id (FK → QUESTIONS.id)
- selected_answer (Char)
- is_correct (Boolean)

**✅ WORKED_EXAMPLES**

- id (UUID, PK)
- topic_id (FK → TOPICS.id)
- title (String)
- description (Text)

**✅ WORKED_STEPS**

- id (UUID, PK)
- example_id (FK → WORKED_EXAMPLES.id)
- step_number (Integer)
- prompt (Text)
- expected_answer (Text)
- hint (Text)

**✅ LEDGER_PRACTICE_SESSIONS**

- id (UUID, PK)
- user_id (FK → USERS.id)
- topic_id (FK → TOPICS.id)
- started_at (Timestamp)
- completed_at (Timestamp)

**✅ SCENARIOS**

- id (UUID, PK)
- topic_id (FK → TOPICS.id)
- title (String)
- description (Text)

**✅ PAST_PAPERS**

- id (UUID, PK)
- year (Integer)
- title (String)
- file_url (String)
- duration (Integer)

**✅ PAST_PAPER_ATTEMPTS**

- id (UUID, PK)
- user_id (FK → USERS.id)
- paper_id (FK → PAST_PAPERS.id)
- score (Float)
- started_at (Timestamp)
- completed_at (Timestamp)

**✅ BADGES**

- id (UUID, PK)
- title (String)
- description (Text)
- icon_url (String)

**✅ USER_BADGES**

- id (UUID, PK)
- user_id (FK → USERS.id)
- badge_id (FK → BADGES.id)
- earned_at (Timestamp)

**✅ CERTIFICATES**

- id (UUID, PK)
- title (String)
- template_url (String)

**✅ USER_CERTIFICATES**

- id (UUID, PK)
- user_id (FK → USERS.id)
- certificate_id (FK → CERTIFICATES.id)
- earned_at (Timestamp)

# ER Diagram (Textual)

**📘 Numera – Entity-Relationship Diagram (ERD)**

**Version:** 1.0  
**Date:** \[Insert Date\]  
**Prepared by:** \[Your Name\]

**✅ 📌 Overview**

This is a **text-based representation** of the Entity-Relationship Diagram (ERD) for the Numera app database.

It shows **parent–child relationships** between tables.

**✅ 📌 ER Diagram Structure**

nginx

CopyEdit

USERS

├── STUDENT_QUIZ_ATTEMPTS

│ └── STUDENT_ANSWERS

├── LEDGER_PRACTICE_SESSIONS

├── PAST_PAPER_ATTEMPTS

├── USER_BADGES

└── USER_CERTIFICATES

TOPICS

├── LESSONS

├── QUIZZES

│ └── QUESTIONS

├── WORKED_EXAMPLES

│ └── WORKED_STEPS

└── SCENARIOS

PAST_PAPERS

└── PAST_PAPER_ATTEMPTS

BADGES

└── USER_BADGES

CERTIFICATES

└── USER_CERTIFICATES

**✅ 📌 Relationships Explained**

✅ **USERS**

- Each User can have many:
  - Quiz Attempts
  - Ledger Practice Sessions
  - Past Paper Attempts
  - Awarded Badges
  - Awarded Certificates

✅ **TOPICS**

- Each Topic can have many:
  - Lessons
  - Quizzes
  - Worked Examples
  - Scenarios

✅ **QUIZZES**

- Each Quiz has many Questions

✅ **STUDENT_QUIZ_ATTEMPTS**

- Each Attempt has many Student Answers

✅ **WORKED_EXAMPLES**

- Each Example has multiple Worked Steps

✅ **PAST_PAPERS**

- Each Past Paper can have many Past Paper Attempts

✅ **BADGES**

- Each Badge can be awarded multiple times to Users

✅ **CERTIFICATES**

- Each Certificate can be awarded multiple times to Users

**✅ 📌 Recommended ERD Design Notes**

✅ Use UUIDs as Primary Keys for consistency  
✅ Foreign Keys to enforce relationships  
✅ Indexes on foreign keys for performance  
✅ Timestamp fields for created_at / updated_at tracking  
✅ Enum types for roles (student/admin) and question types (MCQ/Fill-in)

**✅ 📌 Example Key Table Connections**

| **Parent Table** | **Child Table** | **Key Relationship** |
| --- | --- | --- |
| USERS | STUDENT_QUIZ_ATTEMPTS | user_id FK |
| STUDENT_QUIZ_ATTEMPTS | STUDENT_ANSWERS | attempt_id FK |
| USERS | LEDGER_PRACTICE_SESSIONS | user_id FK |
| USERS | PAST_PAPER_ATTEMPTS | user_id FK |
| USERS | USER_BADGES | user_id FK |
| USERS | USER_CERTIFICATES | user_id FK |
| TOPICS | LESSONS | topic_id FK |
| TOPICS | QUIZZES | topic_id FK |
| QUIZZES | QUESTIONS | quiz_id FK |
| TOPICS | WORKED_EXAMPLES | topic_id FK |
| WORKED_EXAMPLES | WORKED_STEPS | example_id FK |
| TOPICS | SCENARIOS | topic_id FK |
| PAST_PAPERS | PAST_PAPER_ATTEMPTS | paper_id FK |
| BADGES | USER_BADGES | badge_id FK |
| CERTIFICATES | USER_CERTIFICATES | certificate_id FK |

**✅ 📌 Visual ERD Guidance (for design tool)**

When creating a diagram in a visual tool (e.g., dbdiagram.io, Lucidchart, Figma):  
✅ Boxes = Tables  
✅ Arrows = Foreign Key relationships  
✅ Label FK columns  
✅ Group logically:

- Users and Student Progress
- Topics and Learning Content
- Assessments and Attempts
- Badges and Certificates

**✅ 📌 Notes for Database Developers**

✅ Enforce ON DELETE CASCADE where appropriate  
✅ Plan for ENUM types for roles and question types  
✅ Include created_at, updated_at for auditing  
✅ Use composite indexes for FK-heavy tables

**✅ 📌 Contact**

**Product Owner:**  
Name: \[Your Name\]  
Email: \[Your Email\]  
Phone/Chat: \[Your Number\]

✅ **Instructions for Team:**

- Use this textual ERD as a base for creating formal diagrams.
- Implement foreign key constraints in schema.
- Validate relationships in database migrations.

# API Specs

**📘 Numera – API Specifications**

**Version:** 1.0  
**Date:** \[Insert Date\]  
**Prepared by:** \[Your Name\]

**✅ Base URL**

bash

CopyEdit

/api/v1/

**✅ Authentication**

All user-protected endpoints require **JWT bearer token** in headers:

makefile

CopyEdit

Authorization: Bearer &lt;token&gt;

**✅ Auth Endpoints**

**🔹 Register**

arduino

CopyEdit

POST /auth/register

**Body:**

json

CopyEdit

{

"email": "<student@example.com>",

"password": "Password123!",

"name": "Student Name"

}

**Response:**

json

CopyEdit

{

"token": "JWT_TOKEN",

"user": { "id": "uuid", "email": "...", "role": "student" }

}

**🔹 Login**

bash

CopyEdit

POST /auth/login

**Body:**

json

CopyEdit

{

"email": "<student@example.com>",

"password": "Password123!"

}

**Response:**

json

CopyEdit

{

"token": "JWT_TOKEN",

"user": { "id": "uuid", "email": "...", "role": "student" }

}

**🔹 Get Current User**

vbnet

CopyEdit

GET /auth/me

**Response:**

json

CopyEdit

{

"id": "uuid",

"email": "...",

"role": "student"

}

**✅ Users**

**🔹 List Users (Admin)**

bash

CopyEdit

GET /users

**🔹 Get User by ID**

bash

CopyEdit

GET /users/:id

**🔹 Update User**

bash

CopyEdit

PUT /users/:id

**Body:** Partial update

**✅ Topics**

**🔹 List Topics**

bash

CopyEdit

GET /topics

**🔹 Get Single Topic**

bash

CopyEdit

GET /topics/:id

**🔹 Create Topic (Admin)**

bash

CopyEdit

POST /topics

**🔹 Update Topic**

bash

CopyEdit

PUT /topics/:id

**🔹 Delete Topic**

bash

CopyEdit

DELETE /topics/:id

**✅ Lessons**

**🔹 List Lessons for Topic**

ruby

CopyEdit

GET /topics/:topicId/lessons

**🔹 Get Lesson Detail**

bash

CopyEdit

GET /lessons/:id

**🔹 Create Lesson (Admin)**

bash

CopyEdit

POST /lessons

**🔹 Update Lesson**

bash

CopyEdit

PUT /lessons/:id

**🔹 Delete Lesson**

bash

CopyEdit

DELETE /lessons/:id

**✅ Quizzes**

**🔹 List Quizzes for Topic**

ruby

CopyEdit

GET /topics/:topicId/quizzes

**🔹 Get Quiz Details**

bash

CopyEdit

GET /quizzes/:id

**🔹 Create Quiz (Admin)**

bash

CopyEdit

POST /quizzes

**🔹 Update Quiz**

bash

CopyEdit

PUT /quizzes/:id

**🔹 Delete Quiz**

bash

CopyEdit

DELETE /quizzes/:id

**✅ Questions**

**🔹 List Questions for Quiz**

ruby

CopyEdit

GET /quizzes/:quizId/questions

**🔹 Get Single Question**

bash

CopyEdit

GET /questions/:id

**🔹 Create Question (Admin)**

bash

CopyEdit

POST /questions

**🔹 Update Question**

bash

CopyEdit

PUT /questions/:id

**🔹 Delete Question**

bash

CopyEdit

DELETE /questions/:id

**✅ Student Quiz Attempts**

**🔹 Create Attempt**

bash

CopyEdit

POST /quiz-attempts

**Body:**

json

CopyEdit

{

"quiz_id": "uuid"

}

**Response:**

json

CopyEdit

{

"attempt_id": "uuid",

"start_time": "timestamp"

}

**🔹 Submit Answer**

ruby

CopyEdit

POST /quiz-attempts/:attemptId/answers

**Body:**

json

CopyEdit

{

"question_id": "uuid",

"selected_answer": "A"

}

**🔹 Get Attempt Results**

bash

CopyEdit

GET /quiz-attempts/:id

**🔹 List Student's Attempts**

ruby

CopyEdit

GET /users/:userId/quiz-attempts

**✅ Worked Examples**

**🔹 List for Topic**

ruby

CopyEdit

GET /topics/:topicId/worked-examples

**🔹 Get Example Detail**

bash

CopyEdit

GET /worked-examples/:id

**🔹 Get Steps for Example**

bash

CopyEdit

GET /worked-examples/:id/steps

**🔹 Create / Update / Delete (Admin)**

bash

CopyEdit

POST /worked-examples

PUT /worked-examples/:id

DELETE /worked-examples/:id

**✅ Ledger Practice**

**🔹 Start Session**

bash

CopyEdit

POST /ledger-sessions

**🔹 Submit Entry**

bash

CopyEdit

POST /ledger-sessions/:id/entries

**🔹 Get Session Details**

bash

CopyEdit

GET /ledger-sessions/:id

**🔹 List Student Sessions**

ruby

CopyEdit

GET /users/:userId/ledger-sessions

**✅ Scenarios**

**🔹 List for Topic**

ruby

CopyEdit

GET /topics/:topicId/scenarios

**🔹 Get Scenario**

bash

CopyEdit

GET /scenarios/:id

**✅ Past Papers**

**🔹 List Past Papers**

bash

CopyEdit

GET /past-papers

**🔹 Get Past Paper**

bash

CopyEdit

GET /past-papers/:id

**🔹 Start Attempt**

bash

CopyEdit

POST /past-paper-attempts

**🔹 Submit Answer**

bash

CopyEdit

POST /past-paper-attempts/:id/answers

**🔹 Get Attempt Result**

bash

CopyEdit

GET /past-paper-attempts/:id

**✅ Badges**

**🔹 List All Badges**

bash

CopyEdit

GET /badges

**🔹 List User Badges**

ruby

CopyEdit

GET /users/:userId/badges

**🔹 Award Badge (Admin)**

bash

CopyEdit

POST /user-badges

**Body:**

json

CopyEdit

{

"user_id": "uuid",

"badge_id": "uuid"

}

**✅ Certificates**

**🔹 List Available Certificates**

bash

CopyEdit

GET /certificates

**🔹 List User Certificates**

ruby

CopyEdit

GET /users/:userId/certificates

**🔹 Award Certificate (Admin)**

bash

CopyEdit

POST /user-certificates

**Body:**

json

CopyEdit

{

"user_id": "uuid",

"certificate_id": "uuid"

}

**✅ Profile**

**🔹 Get Profile**

bash

CopyEdit

GET /profile

**🔹 Update Profile**

bash

CopyEdit

PUT /profile

✅ **Notes for Developers:**

- Use JWT auth middleware.
- Enforce role-based permissions.
- Validate inputs.
- Return consistent JSON errors.
- Paginate large lists.

**✅ Admin Controls**

✅ Admin-only routes:

- Create/Update/Delete Topics
- Manage Lessons, Quizzes, Questions
- Manage Worked Examples
- Award Badges and Certificates
- View Student Progress Reports

# User Stories

**📘 Numera – User Stories Document**

**Version:** 1.0  
**Date:** \[Insert Date\]  
**Prepared by:** \[Your Name\]

**✅ Format**

**As a \[role\], I want \[feature\] so that \[benefit\].**

✅ Each story includes:

- **Acceptance Criteria**
- **Priority (suggested)**

**✅ 1️ User Authentication**

⭐ **Story 1.1 – Register Account**

As a student, I want to register for an account so that I can access learning materials.

✅ Acceptance Criteria:

- Email, password, name fields with validation.
- Success redirects to dashboard.

✅ Priority: Must-have

⭐ **Story 1.2 – Login**

As a student, I want to log in so I can securely access my dashboard.

✅ Acceptance Criteria:

- Email/password validation.
- Error for wrong credentials.
- Success returns token.

✅ Priority: Must-have

⭐ **Story 1.3 – Password Reset**

As a student, I want to reset my password if I forget it.

✅ Acceptance Criteria:

- Request email link.
- Set new password securely.

✅ Priority: Nice-to-have (Phase 2)

**✅ 2️ Dashboard**

⭐ **Story 2.1 – View Personalized Dashboard**

As a student, I want to see my learning progress so I know how I'm doing.

✅ Acceptance Criteria:

- Progress bar.
- Recommended next steps.
- Quick links to Lessons, Quizzes, Past Papers.

✅ Priority: Must-have

**✅ 3️ Lessons**

⭐ **Story 3.1 – Browse Lessons**

As a student, I want to see all lessons so I can choose what to study.

✅ Acceptance Criteria:

- Topic-aligned list.
- Mark completed.

✅ Priority: Must-have

⭐ **Story 3.2 – View Lesson Detail**

As a student, I want to read/view lesson content to learn.

✅ Acceptance Criteria:

- Rich text, images, video support.
- Next/Previous navigation.

✅ Priority: Must-have

**✅ 4️ Quizzes**

⭐ **Story 4.1 – Start a Quiz**

As a student, I want to take a quiz to test my knowledge.

✅ Acceptance Criteria:

- Topic-based list.
- Start button.
- Timer (optional).

✅ Priority: Must-have

⭐ **Story 4.2 – Answer Questions with Feedback**

As a student, I want feedback on answers so I learn.

✅ Acceptance Criteria:

- MCQ format.
- Correct/incorrect feedback with explanation.

✅ Priority: Must-have

⭐ **Story 4.3 – View Quiz Results**

As a student, I want to see my score and answers.

✅ Acceptance Criteria:

- % score.
- Review answers.

✅ Priority: Must-have

**✅ 5️ Student Progress Tracking**

⭐ **Story 5.1 – Track Progress**

As a student, I want to see my overall progress so I stay motivated.

✅ Acceptance Criteria:

- Progress bar.
- Quiz history.
- Daily streak counter.

✅ Priority: Must-have

⭐ **Story 5.2 – Earn Badges**

As a student, I want badges for milestones.

✅ Acceptance Criteria:

- Badge gallery.
- Unlock notification.

✅ Priority: Nice-to-have

⭐ **Story 5.3 – Earn Certificates**

As a student, I want certificates for completing topics.

✅ Acceptance Criteria:

- Downloadable PDF.
- Share button.

✅ Priority: Nice-to-have

**✅ 6️ Interactive Worked Examples**

⭐ **Story 6.1 – View Worked Examples**

As a student, I want step-by-step worked examples to practice.

✅ Acceptance Criteria:

- Step prompts.
- Input validation.
- Hints.

✅ Priority: Must-have

**✅ 7️ Simulated Ledger/Journal Practice**

⭐ **Story 7.1 – Practice Ledger Entries**

As a student, I want to practice journal/ledger entries to master double-entry.

✅ Acceptance Criteria:

- Debit/credit form.
- Validation.
- History of sessions.

✅ Priority: Must-have

**✅ 8️ Scenario-Based Problems**

⭐ **Story 8.1 – Solve Real-World Problems**

As a student, I want scenario-based tasks to apply knowledge.

✅ Acceptance Criteria:

- Scenario description.
- Interactive tasks.
- Feedback.

✅ Priority: Must-have

**✅ 9️ Video (Animated) Lessons**

⭐ **Story 9.1 – Watch Videos**

As a student, I want short videos for easy learning.

✅ Acceptance Criteria:

- Embedded player.
- Transcript or key points.

✅ Priority: Must-have

**✅ 10️ Interactive Past Papers**

⭐ **Story 10.1 – Practice Past Papers**

As a student, I want to attempt past papers in a timed setting.

✅ Acceptance Criteria:

- Select paper.
- Timer.
- Auto-marking for MCQ.
- Results summary.

✅ Priority: Must-have

**✅ 11️ Adaptive Learning Paths**

⭐ **Story 11.1 – Get Personalized Suggestions**

As a student, I want the app to suggest next steps.

✅ Acceptance Criteria:

- Highlights weak areas.
- Links to recommended lessons.

✅ Priority: Nice-to-have

**✅ 12️ Profile Management**

⭐ **Story 12.1 – View/Edit Profile**

As a student, I want to manage my profile info.

✅ Acceptance Criteria:

- View/edit email, name.
- Change password.
- Language toggle.

✅ Priority: Must-have

**✅ 13️⃣ Admin / Teacher Features**

⭐ **Story 13.1 – Admin Login**

As an admin, I want secure login.

✅ Priority: Must-have

⭐ **Story 13.2 – Manage Topics**

As an admin, I want to CRUD topics.

✅ Priority: Must-have

⭐ **Story 13.3 – Manage Lessons**

As an admin, I want to CRUD lessons.

✅ Priority: Must-have

⭐ **Story 13.4 – Manage Quizzes & Questions**

As an admin, I want to CRUD quizzes and questions.

✅ Priority: Must-have

⭐ **Story 13.5 – Manage Worked Examples**

As an admin, I want to add worked examples.

✅ Priority: Must-have

⭐ **Story 13.6 – View Student Progress**

As an admin/teacher, I want to monitor students.

✅ Priority: Nice-to-have

⭐ **Story 13.7 – Award Badges & Certificates**

As an admin, I want to award achievements.

✅ Priority: Nice-to-have

**✅ 14️⃣ Technical Stories**

⭐ **Story 14.1 – Secure Authentication**

As a developer, I want JWT auth for security.

✅ Priority: Must-have

⭐ **Story 14.2 – Role-Based Access Control**

As a developer, I want to enforce roles.

✅ Priority: Must-have

⭐ **Story 14.3 – Responsive Design**

As a user, I want mobile-friendly screens.

✅ Priority: Must-have

**✅ Suggested MVP User Stories (Priority 1)**

✅ Register / Login / Logout  
✅ Dashboard with progress  
✅ Lessons (list & detail)  
✅ Quizzes with feedback  
✅ Student quiz attempts tracking  
✅ Worked Examples  
✅ Ledger Practice  
✅ Scenario Problems  
✅ Past Papers (basic)  
✅ Profile management  
✅ Admin CRUD for Topics, Lessons, Quizzes

# Admin Panel UI Specification

**📘 Numera – Admin Panel UI Specification**

**Version:** 1.0  
**Date:** \[Insert Date\]  
**Prepared by:** \[Your Name\]

**✅ 1️ Overview**

The **Admin Panel** is a secure role-based area for Admins/Teachers to:

- Manage syllabus content (Topics, Lessons, Quizzes, Questions)
- Upload videos and worked examples
- Manage scenarios and past papers
- View and manage student accounts
- Monitor student progress
- Award badges and certificates

**✅ 2️ Navigation Structure**

✅ Sidebar Layout (Desktop):

lua

CopyEdit

Dashboard

|

|-- Topics

|-- Lessons

|-- Quizzes

|-- Questions

|-- Worked Examples

|-- Scenarios

|-- Past Papers

|-- Students

|-- Badges

|-- Certificates

|-- Reports / Analytics

|-- Settings

✅ Mobile View:

- Hamburger menu with same sections

✅ Header Bar:

- App logo/name
- Admin profile dropdown (name, role, logout)

**✅ 3️ Screens & Features**

**⭐ A. Dashboard**

**Purpose:** Quick overview

✅ UI Elements:

- Welcome message (Admin name)
- Stats cards:
  - Total Topics
  - Lessons count
  - Active Quizzes
  - Registered Students
- Quick Links
- Recent Activity Log

✅ Notes:

- Use cards/tiles
- Clean layout

**⭐ B. Topics Management**

**Purpose:** Manage syllabus topics

✅ UI Elements:

- Table:
  - ID
  - Title
  - Description preview
  - Order
  - Edit/Delete
- Add New Topic button
- Search bar

✅ Add/Edit Modal:

- Title
- Description (rich text)
- Order

**⭐ C. Lessons Management**

**Purpose:** Attach lessons to topics

✅ UI Elements:

- Filter by Topic
- Table:
  - Title
  - Topic
  - Video URL preview
  - Order
  - Edit/Delete
- Add Lesson button

✅ Add/Edit Form:

- Topic (select)
- Title
- Content (HTML editor)
- Video URL
- Order

**⭐ D. Quizzes Management**

**Purpose:** Create/manage quizzes

✅ UI Elements:

- Filter by Topic
- Table:
  - Title
  - Topic
  - Instructions preview
  - Edit/Delete
- Add Quiz button

✅ Add/Edit Form:

- Topic
- Title
- Instructions (rich text)

**⭐ E. Questions Management**

**Purpose:** Manage quiz questions

✅ UI Elements:

- Filter by Quiz
- Table:
  - ID
  - Text preview
  - Type (MCQ/Fill-in)
  - Edit/Delete
- Add Question button

✅ Add/Edit Form:

- Quiz (select)
- Question text
- Options A/B/C/D
- Correct answer
- Explanation
- Question Type

**⭐ F. Worked Examples**

**Purpose:** Add step-by-step examples

✅ UI Elements:

- Filter by Topic
- Table:
  - Title
  - Topic
  - Steps count
  - Edit/Delete
- Add Example button

✅ Add/Edit Form:

- Topic
- Title
- Description
- Steps list:
  - Step number
  - Prompt
  - Expected answer
  - Hint

**⭐ G. Scenarios**

**Purpose:** Manage scenario-based problems

✅ UI Elements:

- Filter by Topic
- Table:
  - Title
  - Topic
  - Description preview
  - Edit/Delete
- Add Scenario button

✅ Add/Edit Form:

- Topic
- Title
- Description (rich text)

**⭐ H. Past Papers**

**Purpose:** Manage exam papers

✅ UI Elements:

- Table:
  - Year
  - Title
  - Duration
  - File/Link
  - Edit/Delete
- Add Past Paper button

✅ Add/Edit Form:

- Year
- Title
- File URL or Upload
- Duration (minutes)

**⭐ I. Students Management**

**Purpose:** View/manage students

✅ UI Elements:

- Search bar
- Table:
  - ID
  - Name
  - Email
  - Role
  - Status
  - View Progress
  - Reset Password
  - Deactivate/Delete

✅ Student Profile View:

- Basic info
- Lesson progress
- Quiz scores
- Badges/Certificates earned

**⭐ J. Badges Management**

**Purpose:** Define rewards

✅ UI Elements:

- Table:
  - Title
  - Description
  - Icon preview
  - Edit/Delete
- Add Badge button

✅ Add/Edit Form:

- Title
- Description
- Upload icon

**⭐ K. Certificates Management**

**Purpose:** Manage certificates

✅ UI Elements:

- Table:
  - Title
  - Template preview
  - Edit/Delete
- Add Certificate button

✅ Add/Edit Form:

- Title
- Upload template URL

✅ Award Certificate:

- Select User
- Select Certificate
- Award button

**⭐ L. Reports / Analytics**

**Purpose:** Admin insights

✅ UI Elements:

- Graphs/charts:
  - User registrations over time
  - Active users
  - Popular lessons
  - Quiz performance averages
- Export CSV button

✅ Notes:

- Dashboard-style layout

**⭐ M. Settings**

**Purpose:** Admin settings

✅ UI Elements:

- Change email/password
- Notification preferences
- Language toggle (English/Dhivehi)

**✅ 4️ Design Notes**

✅ Sidebar with clear section labels  
✅ Mobile-friendly responsive layout  
✅ Consistent Add/Edit/Delete patterns  
✅ Table-based views  
✅ Rich text editing for lessons  
✅ Modal dialogs recommended

**✅ 5️ Suggested UI Components**

✅ Sidebar Menu  
✅ Header Bar  
✅ Tables with pagination/search  
✅ Modal dialogs  
✅ Forms with validation  
✅ Rich text editor  
✅ File/image upload  
✅ Charts for reports

**✅ 6️ Example Wireframe Sketches**

✅ **Dashboard**

pgsql

CopyEdit

+------------------------+

| Header Bar |

+------------------------+

| Sidebar | Dashboard |

| Menu | Stats Cards |

| | Quick Links |

| | Activity Log |

+------------------------+

✅ **Lessons Page**

sql

CopyEdit

+------------------------+

| Sidebar | Lessons |

| | \[Add New\] |

| | Table/List |

+------------------------+

✅ **Add/Edit Modal**

markdown

CopyEdit

Title: \_**\_**\___\__

Topic: \[Dropdown\]

Content: \[Editor\]

Video URL: \_**\_**\___\__

Order: \___

\[Save\] \[Cancel\]

✅ **Student Profile View**

diff

CopyEdit

Name / Email

Progress Bar

Tabs:

\- Lessons

\- Quizzes

\- Badges

\- Certificates

**✅ 7️ Next Steps for Designers**

✅ Build wireframes:

- Sidebar layout
- Dashboard
- Tables
- Modal forms
- Reports page

✅ Build high-fidelity mockups:

- Branding colors
- Typography
- Icons

✅ Validate with Product Owner before development.

**✅ 8️ Contact**

**Product Owner:**  
Name: \[Your Name\]  
Email: \[Your Email\]  
Phone/Chat: \[Your Number\]

✅ **Instructions for Team:**

- Copy this spec into Word or Google Docs.
- Customize branding notes.
- Use as design brief for wireframes and development.

# Student/User UI Specification

**📘 Numera – Student/User UI Specification**

**Version:** 1.0  
**Date:** \[Insert Date\]  
**Prepared by:** \[Your Name\]

**✅ 1️ General Design Principles**

✅ Mobile-first, responsive layout  
✅ Clean, minimal design  
✅ Large, readable fonts  
✅ High color contrast for accessibility  
✅ Language toggle for English/Dhivehi  
✅ Gamification elements (badges, progress bars)  
✅ Focus on essential tasks for students

**✅ 2️ Navigation Structure**

✅ **Bottom Navigation (Mobile):**

- Home / Dashboard
- Lessons
- Quizzes
- Past Papers
- Profile

✅ **Sidebar / Hamburger Menu (Desktop):**

- Dashboard
- Lessons
- Quizzes
- Past Papers
- Badges / Certificates
- Profile
- Logout

✅ **Header Bar:**

- App logo/name
- Language toggle
- Profile shortcut

**✅ 3️ Main Screens & UI Elements**

**⭐ A. Login/Register Screen**

✅ Elements:

- App logo
- Email and password fields
- Login/Register toggle
- Password reset link
- Language toggle

✅ Notes:

- Clear validation errors
- Brand colors on buttons

**⭐ B. Dashboard**

✅ Purpose:  
Central learning hub

✅ UI Elements:

- Welcome message
- Overall progress bar
- Recommended next steps widget
- Quick access buttons:
  - Lessons
  - Quizzes
  - Past Papers
  - Badges / Certificates
- Daily streak counter
- Recent activity log

✅ Notes:

- Card-based layout
- Motivational message

**⭐ C. Lessons List**

✅ Elements:

- Filter by Topic
- Search bar
- Lesson cards:
  - Title
  - Completion checkmark
  - Estimated reading time
  - Start/Resume button

✅ Notes:

- Highlight completed lessons

**⭐ D. Lesson Detail**

✅ Elements:

- Title
- Progress bar
- Rich text content
- Embedded video player
- Mark as Completed button
- Next/Previous navigation

✅ Notes:

- Collapsible sections for long content

**⭐ E. Quizzes List**

✅ Elements:

- Filter by Topic
- Search bar
- Quiz cards:
  - Title
  - Best score
  - Status (Not Attempted/In Progress/Completed)
  - Start/Retry button

✅ Notes:

- Visual indicator for perfect scores

**⭐ F. Quiz Player**

✅ Elements:

- Header with title and progress
- Timer (optional)
- Question area
- MCQ options (A/B/C/D)
- Submit/Next button
- Instant feedback with explanation
- Result summary at end

✅ Notes:

- Color-coded feedback

**⭐ G. Worked Examples**

✅ Elements:

- Problem description
- Step-by-step panel:
  - Prompt
  - Input field
  - Hint button
  - Validate/Check button
  - Immediate feedback
- Navigation for Previous/Next Step

✅ Notes:

- Highlight correct inputs

**⭐ H. Ledger/Journal Practice**

✅ Elements:

- Scenario text
- Journal entry form:
  - Date
  - Account Name
  - Debit/Credit Amount
- Add Line button
- Post/Validate button
- Result feedback (Balanced/Unbalanced)
- Optional T-account grid

✅ Notes:

- Workbook-style UI

**⭐ I. Scenario-Based Problem**

✅ Elements:

- Scenario description
- Task list:
  - Journal entries
  - Trial balance
  - Financial statement preparation
- Input fields
- Validate button
- Feedback area

✅ Notes:

- Use tabs or accordion

**⭐ J. Past Papers List**

✅ Elements:

- Header with back button
- Search/filter bar
- List of past papers:
  - Year
  - Exam name
  - Duration
  - Start button
- Recommended badge

✅ Notes:

- Clean list view

**⭐ K. Past Paper Player**

✅ Elements:

- Header with name and timer
- Question navigation
- Question area with images
- MCQ or input field
- Submit button
- Result summary with:
  - Score
  - Correct answers
  - Suggested review topics

✅ Notes:

- Timed mode disables pause

**⭐ L. Progress Tracking**

✅ Elements:

- Overall progress bar
- Lesson completion chart
- Quiz history list
- Badge gallery
- Certificates section
- Daily streak counter

✅ Notes:

- Gamification for motivation

**⭐ M. Badges / Certificates**

✅ Elements:

- Badge grid (locked/unlocked)
- Certificate thumbnails
- Download/Print buttons
- Share button

✅ Notes:

- Reward-based design

**⭐ N. Profile Screen**

✅ Elements:

- Profile picture
- Name and email
- Password change form
- Language toggle
- Logout button

✅ Notes:

- Clean and user-friendly

**✅ 4️ Global UI Elements**

✅ Header Bar:

- App logo/name
- Language toggle
- Profile shortcut

✅ Bottom Navigation:

- Icons with labels
- Active section highlighted

✅ Sidebar (Desktop):

- Icons and labels
- Collapsible

✅ Notifications:

- Toasts or modals
- Clear success/error messages

✅ Loaders:

- Spinners
- Skeleton screens

**✅ 5️ Style Recommendations**

✅ Fonts:

- Sans-serif (Montserrat, Poppins)
- Clear headings
- Highly readable body

✅ Colors:

- Primary Green (#2D6A4F)
- Teal accents
- Soft Yellow highlights
- Neutral Gray text

✅ Buttons:

- Rounded corners
- Hover/tap states

✅ Icons:

- Minimal, consistent

**✅ 6️ Accessibility Notes**

✅ High contrast ratios  
✅ Large tap targets on mobile  
✅ Keyboard navigation support  
✅ Alt text for images/icons  
✅ Prominent language toggle

**✅ 7️ Suggested Wireframes**

✅ Wireframe screens to design:

- Login/Register
- Dashboard
- Lesson List / Detail
- Quizzes List / Player
- Worked Examples
- Ledger Practice
- Scenario Problems
- Past Papers List / Player
- Progress Tracking
- Badges/Certificates
- Profile

**✅ 8️ Next Steps for Designers**

✅ Low-fidelity wireframes:

- Focus on layout and content blocks
- Both mobile and desktop

✅ High-fidelity mockups:

- Brand colors
- Fonts
- Icons

✅ Validate with Product Owner before development.

**✅ 9️ Contact**

**Product Owner:**  
Name: \[Your Name\]  
Email: \[Your Email\]  
Phone/Chat: \[Your Number\]

✅ **Instructions for Team:**

- Copy this spec into Word/Google Docs.
- Customize branding notes.
- Use as design brief for wireframes and development.

# Component Library Specification

**📘 Numera – Component Library Specification**

**Version:** 1.0  
**Date:** \[Insert Date\]  
**Prepared by:** \[Your Name\]

**✅ 1️ Design Goals**

✅ Clean, modern, student-friendly design  
✅ Mobile-first, responsive components  
✅ Accessible (WCAG-compliant)  
✅ Modular, reusable across app  
✅ Easy theming for brand colors and fonts

**✅ 2️ Primary Brand Elements**

✅ **Colors:**

- Primary Green: #2D6A4F
- Secondary Teal: #74C69D
- Accent Yellow: #FFE066
- Neutral Gray: #555555
- Background: #FFFFFF / #F9F9F9

✅ **Typography:**

- Font: Sans-serif (Montserrat, Poppins)
- Headings: Bold, clear
- Body: Highly readable

✅ **Icons:**

- Flat, minimal style
- Consistent stroke weight
- Accessible alt labels

**✅ 3️ Atomic Components**

**🔹 Buttons**

✅ Variants:

- Primary (solid green)
- Secondary (outline teal)
- Disabled state
- Icon button

✅ Props:

- Size (small, medium, large)
- Variant
- Icon
- Loading state

✅ Behavior:

- Hover / Focus / Active
- Ripple or subtle animation

**🔹 Inputs**

✅ Variants:

- Text
- Password
- Email
- Number
- Search

✅ Props:

- Label
- Placeholder
- Helper text
- Error state
- Disabled

✅ Behavior:

- Focus style
- Validation feedback

**🔹 Text Area**

✅ For long text entry (Admin lessons, feedback)  
✅ Props:

- Label
- Placeholder
- Rows
- Error state

**🔹 Dropdown / Select**

✅ Variants:

- Single select
- Multi-select (optional)

✅ Props:

- Label
- Options
- Default value
- Disabled

✅ Behavior:

- Keyboard navigation
- Searchable

**🔹 Radio Buttons**

✅ Use:

- MCQ quizzes  
    ✅ Props:
- Group label
- Options
- Default selected

✅ Behavior:

- Keyboard nav
- Focus style

**🔹 Checkboxes**

✅ Use:

- Terms & Conditions
- Multi-select forms  
    ✅ Props:
- Label
- Checked state
- Disabled

**🔹 Toggle Switch**

✅ Use:

- Language preference
- Notifications on/off

✅ Props:

- Label
- Active state

**✅ 4️ Typography Components**

✅ Headings (h1, h2, h3)

- Responsive scaling
- Consistent line height

✅ Paragraph text

- Standard body
- Secondary/muted

✅ Label

- For form inputs
- Required indicator

✅ Helper text

- Validation hints

**✅ 5️⃣ Layout Components**

**🔹 Card**

✅ Use:

- Lesson preview
- Quiz overview
- Badge/Certificate display

✅ Props:

- Title
- Subtitle
- Image/icon
- Action button

✅ Style:

- Rounded corners
- Shadow/elevation
- Hover state

**🔹 Modal**

✅ Use:

- Add/Edit forms
- Confirm dialogs

✅ Props:

- Title
- Content
- Action buttons

✅ Behavior:

- Overlay backdrop
- Close on ESC / outside click
- Focus trap

**🔹 Accordion**

✅ Use:

- Scenario steps
- FAQs

✅ Props:

- Section title
- Collapsible content

✅ Behavior:

- Smooth expand/collapse
- Keyboard accessible

**🔹 Tabs**

✅ Use:

- Student Profile sections
- Admin content forms

✅ Props:

- Tab labels
- Active tab indicator

✅ Behavior:

- Swipe on mobile
- Keyboard navigation

**🔹 Sidebar Navigation**

✅ Use:

- Admin panel
- Desktop student app

✅ Props:

- Icons
- Labels
- Collapsible

✅ Behavior:

- Active highlighting
- Responsive collapse

**🔹 Top Bar / Header**

✅ Elements:

- App logo/name
- Section title
- Language toggle
- Profile/logout

✅ Behavior:

- Sticky on scroll
- Hamburger for mobile

**🔹 Bottom Navigation**

✅ Use:

- Mobile student app

✅ Tabs:

- Home
- Lessons
- Quizzes
- Past Papers
- Profile

✅ Behavior:

- Icon + label
- Active tab highlighting

**✅ 6️ Data Display Components**

**🔹 Table**

✅ Use:

- Admin lists (Topics, Lessons, Students)

✅ Features:

- Column headers
- Sorting (optional)
- Pagination
- Bulk actions

**🔹 List**

✅ Use:

- Past papers
- Student progress

✅ Props:

- Item title
- Secondary text
- Icon/image

**🔹 Progress Bar**

✅ Use:

- Dashboard
- Lesson progress

✅ Props:

- % complete
- Color variant

**🔹 Badge**

✅ Use:

- Achievement icons

✅ Props:

- Image
- Label
- Locked/unlocked states

**🔹 Certificate Card**

✅ Use:

- Rewards section

✅ Props:

- Title
- Thumbnail
- Download button

**🔹 Timeline / Activity Log**

✅ Use:

- Recent student activity

✅ Features:

- Date/time stamps
- Icons for event types

**✅ 7️ Feedback Components**

✅ Toast / Snackbar

- Success / Error / Info
- Auto-dismiss or manual close

✅ Alerts

- Inline error boxes
- Banners

✅ Loaders

- Spinners
- Skeleton screens

✅ Validation

- Input error states
- Form-level summary errors

**✅ 8️ Media Components**

✅ Video Player

- Responsive
- Play/pause/seek
- Transcript toggle

✅ Image

- Responsive scaling
- Alt text
- Lightbox optional

✅ Icon

- Consistent system
- SVG or icon font

**✅ 9️ Form Components (Admin)**

✅ Rich Text Editor

- For lesson content
- Headings, lists, links, images

✅ File Upload

- Videos, images, PDFs
- Progress bar
- Drag-and-drop

✅ Date Picker

- For exam durations

✅ Multi-step Form

- For worked examples

**✅ 10️ Accessibility & Internationalization**

✅ Language Toggle

- English/Dhivehi

✅ Color Contrast

- WCAG AA

✅ Focus States

- For all interactive elements

✅ Keyboard Navigation

- All forms and menus

✅ Screen Reader Labels

- aria-label for icons/buttons

**✅ 11️ Suggested Framework / Libraries**

✅ Frontend:

- Vue.js / React

✅ UI Framework:

- Vuetify / Tailwind / Chakra / MUI

✅ Rich Text:

- Quill / TinyMCE / TipTap

✅ Icons:

- Material Icons / FontAwesome

✅ Forms:

- Formik (React) / Vuelidate (Vue)

✅ State Management:

- Pinia / Redux / Context

**✅ 12️⃣ Suggested Component Directory**

markdown

CopyEdit

/components

/atoms

\- Button.vue

\- Input.vue

/molecules

\- FormField.vue

\- Card.vue

/organisms

\- LessonList.vue

\- QuizPlayer.vue

\- DashboardStats.vue

/layouts

\- AdminSidebar.vue

\- StudentBottomNav.vue

/pages

\- StudentDashboard.vue

\- LessonDetail.vue

**✅ 13️ Next Steps for Designers/Devs**

✅ Define color tokens and typography scale  
✅ Build Figma design system with these components  
✅ Build Storybook / Component Library in code  
✅ Validate accessibility for all components

**✅ 14️ Contact**

**Product Owner:**  
Name: \[Your Name\]  
Email: \[Your Email\]  
Phone/Chat: \[Your Number\]

✅ **Instructions for Team:**

- Copy this spec into Word/Google Docs.
- Customize with project branding.
- Use as master plan for component design and implementation.