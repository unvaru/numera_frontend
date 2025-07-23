# Scope Document – Updated for Multi-Subject & Freemium Support

---

### 1️⃣ Overview
The platform is now designed to support multiple subjects (e.g., Accounting, Economics, Business Studies) and include a freemium access model, offering both free and premium features to users.

### 2️⃣ Subject Management
- Admins can create, update, and delete subjects.
- Each subject has its own syllabus, topics, lessons, quizzes, and past papers.

### 3️⃣ Topics
- Each topic is linked to one subject.
- Topics organize the learning content within a subject.

### 4️⃣ Lessons
- Lessons belong to topics and can include videos, notes, and interactive materials.
- Access can be restricted based on the user’s subscription plan.

### 5️⃣ Quizzes
- Each quiz belongs to a topic and is used for student self-assessment.
- Certain quizzes may be available only to premium users.

### 6️⃣ Worked Examples / Practice Tools
- Accounting: journal, ledger, and trial balance simulators.
- Subject-specific tools may be introduced in the future for other subjects.

### 7️⃣ Progress Tracking
- Progress is tracked at both the topic and subject level.
- New table `USER_SUBJECT_PROGRESS` aggregates subject-level completion.

### 8️⃣ Student Dashboard
- Users select a subject to view its dashboard.
- Each dashboard shows learning progress, next steps, and available materials.

### 9️⃣ Admin Dashboard
- Admins manage subjects, topics, content, and user access.
- Admin views are subject-aware and include filters for subscription levels.

### 🔟 Certificates and Badges
- Issued per subject upon completion.
- Award conditions may vary based on free vs. premium access.

### 🔁 Navigation Flow
- Step 1: Subject selection
- Step 2: Subject dashboard with modules
- Step 3: Drill down to Topic → Lessons → Quizzes

### 🧩 API & Database Updates
- Add: `SUBJECTS`, `SUBSCRIPTION_PLANS`, `USER_SUBSCRIPTIONS`
- Update: `USERS` (add `subscription_plan`, `subscription_expiry`)
- Update all relevant content and tracking tables with subject context

### 💳 Freemium Model Support
- Users start with a free plan (trial access to limited content).
- Premium plans unlock full content, tools, and certification.
- Subscriptions are tracked via `USER_SUBSCRIPTIONS` and linked to `SUBSCRIPTION_PLANS`.

### ✅ Scalability & Future-Proofing
- The platform can host multiple subjects, plans, and access tiers.
- Subscription logic allows flexible upgrades, downgrades, and trials.