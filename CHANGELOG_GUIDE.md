# Learnify — Plateforme E-Learning Full Stack



## Table des matières

1. [Stack technique](#stack-technique)
2. [Architecture du projet](#architecture-du-projet)
3. [Installation et lancement](#installation-et-lancement)
4. [Variables d'environnement](#variables-denvironnement)
5. [Système d'authentification](#système-dauthentification)
6. [Rôles et permissions](#rôles-et-permissions)
7. [API Reference](#api-reference)
8. [Intégration Front ↔ Back](#intégration-front--back)
9. [Fonctionnalités par rôle](#fonctionnalités-par-rôle)

---

## Stack technique

| Couche          | Technologie                                    |
|-----------------|------------------------------------------------|
| Frontend        | React 18, Vite, Tailwind CSS, React Router v6  |
| Backend         | Node.js, Express.js                            |
| Base de données | MongoDB, Mongoose                              |
| Auth            | JWT (7 jours), bcryptjs                        |
| Upload fichiers | Multer — PDF et vidéo stockés en base64 en DB  |

---

## Architecture du projet

```
learnify/
├── client/                        # Frontend React + Vite
│   └── src/
│       ├── pages/
│       │   ├── LoginPage.jsx          # Login + Signup (même page, onglets)
│       │   ├── HomePage.jsx
│       │   ├── CoursesPage.jsx        # Liste des cours
│       │   ├── CoursePage.jsx         # Détail cours + leçons + enroll
│       │   ├── QuizPage.jsx           # Quiz interactif
│       │   ├── TeacherDashboardPage.jsx # Dashboard prof complet
│       │   ├── DashboardPage.jsx      # Dashboard étudiant
│       │   ├── ProfilePage.jsx
│       │   └── CertificatePage.jsx
│       ├── components/
│       │   ├── layout/            # Navbar, Footer, Sidebar
│       │   ├── courses/           # CourseCard, QuizWidget
│       │   └── common/            # Button, Input, Loader
│       ├── contexts/
│       │   ├── AuthContext.jsx    # Auth globale (login, signup, logout, autoLogin)
│       │   └── ThemeContext.jsx   # Dark mode
│       ├── services/
│       │   ├── authService.js     # fetch login / register
│       │   └── courseService.js   # fetch courses
│       └── hooks/
│           ├── useAuth.js         # Raccourci vers AuthContext
│           └── useFetch.js
│
└── server/                        # Backend Express
    ├── controllers/               # auth, course, lesson, quiz, user, teacher
    ├── models/                    # User, Course, Lesson, Quiz
    ├── routes/                    # authRoutes, courseRoutes, quizRoutes, ...
    ├── middleware/                # auth (verifyToken), error, upload (Multer)
    └── server.js                  # Point d'entrée — port 3000
```

---

## Installation et lancement

### Prérequis

- Node.js v16+
- Compte MongoDB Atlas ou instance locale

### 1. Backend

```bash
cd server
npm install
```

Créer `server/.env` (voir section suivante), puis :

```bash
npm start
# → http://localhost:3000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
# → http://localhost:5173
```

---

## Variables d'environnement

### `server/.env`

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
TEACHER_SECRET=your_teacher_registration_code
```

> **`TEACHER_SECRET`** : code requis à l'inscription pour obtenir le rôle `teacher`. Sans ce code, la requête retourne 403.

### `client/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

> Toutes les pages utilisent `import.meta.env.VITE_API_URL` avec fallback sur `http://localhost:3000/api`.

---

## Système d'authentification

### Flux général

1. L'utilisateur se connecte via `LoginPage` → appel `POST /api/auth/login`
2. Le backend retourne `{ token, user: { id, role, email, firstName, lastName } }`
3. Le token est stocké dans `localStorage` sous la clé `"token"`
4. `AuthContext` stocke l'objet `user` en state React (role inclus)
5. Au rechargement de la page, `AuthContext` relit le token et appelle `GET /api/users/me` pour restaurer la session
6. `ProtectedRoute` dans `App.jsx` redirige vers `/login` si pas de user, et vers `/` si le rôle ne correspond pas à la route

### Redirection après login

- Rôle `teacher` → `/teacher-dashboard`
- Rôle `student` → `/` (home)

### Headers envoyés par le frontend

Toutes les pages utilisent une fonction locale `apiFetch` qui injecte automatiquement le token :

```js
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
}
```

Pour les uploads (leçons avec fichier), `apiUpload` envoie `FormData` sans `Content-Type` (laissé au navigateur) mais avec le token.

Pour les iframes PDF et les balises `<video>`, le token est passé en query param :

```
GET /api/courses/lesson/:lessonId/file?token=<jwt>
```

### Refresh Token

```
POST /api/auth/refresh-token
Body: { token }
→ { token } (nouveau JWT 7j)
```

---

## Rôles et permissions

| Action                               | Student | Teacher                   |
|--------------------------------------|---------|---------------------------|
| Voir les cours                       | ✅      | ✅                         |
| S'inscrire à un cours                | ✅      | ❌                         |
| Voir les leçons (après enroll)       | ✅      | ✅ (sans enroll requis)    |
| Marquer une leçon comme terminée     | ✅      | ❌                         |
| Passer un quiz                       | ✅      | ❌                         |
| Créer un cours                       | ❌      | ✅                         |
| Modifier / supprimer un cours        | ❌      | ✅ (ses cours uniquement)  |
| Ajouter / modifier / supprimer leçon | ❌      | ✅ (ses cours uniquement)  |
| Uploader PDF ou vidéo dans une leçon | ❌      | ✅                         |
| Créer un quiz                        | ❌      | ✅ (ses cours uniquement)  |
| Voir ses stats                       | ❌      | ✅                         |

---

## API Reference

**Base URL :** `http://localhost:3000/api`

**Headers communs :**
- `Content-Type: application/json`
- `Authorization: Bearer <token>` *(routes protégées)*

---

### Auth — `/api/auth`

| Méthode | Endpoint         | Body                                                            | Réponse               |
|---------|------------------|-----------------------------------------------------------------|-----------------------|
| POST    | `/register`      | `{ firstName, lastName, email, password, role, teacherCode? }` | `{ message }`         |
| POST    | `/login`         | `{ email, password }`                                           | `{ token, user }`     |
| POST    | `/logout`        | — *(token requis)*                                              | `{ message }`         |
| POST    | `/refresh-token` | `{ token }`                                                     | `{ token }` (nouveau) |

**Validations côté back :**
- Email format regex
- Mot de passe min. 6 caractères
- Rôle uniquement `student` ou `teacher`
- `teacherCode` obligatoire et correct pour le rôle `teacher`

**Validations côté front (`LoginPage`) :**
- Domaines email acceptés : `gmail.com`, `learnify.com`, `hotmail.com`, `email.com`
- Champ `teacherCode` affiché uniquement si rôle `teacher` sélectionné en Sign Up

---

### Utilisateur — `/api/users`

| Méthode | Endpoint       | Auth | Description                                              |
|---------|----------------|------|----------------------------------------------------------|
| GET     | `/me`          | ✅   | Profil complet — appelé par `AuthContext` au rechargement |
| PUT     | `/me`          | ✅   | Modifier `firstName`, `lastName`, `email`                |
| PUT     | `/profile`     | ✅   | Modifier `firstName`, `lastName`, `bio`, `avatar`, `socialLinks` |
| DELETE  | `/me`          | ✅   | Supprimer son compte                                     |
| GET     | `/me/courses`  | ✅   | Cours auxquels l'étudiant est inscrit (populés)          |
| GET     | `/:id/public`  | ❌   | Profil public d'un user (+ ses cours si teacher)         |

---

### Cours — `/api/courses`

| Méthode | Endpoint                      | Auth | Rôle    | Description                             |
|---------|-------------------------------|------|---------|-----------------------------------------|
| GET     | `/`                           | ❌   | —       | Tous les cours (instructor populé)      |
| GET     | `/:id`                        | ❌   | —       | Cours + leçons                          |
| GET     | `/categories`                 | ❌   | —       | Catégories distinctes                   |
| GET     | `/teacher/me`                 | ✅   | Teacher | Cours du professeur connecté            |
| POST    | `/createCourse`               | ✅   | Teacher | Créer un cours                          |
| PATCH   | `/updateCourse/:courseId`     | ✅   | Teacher | Modifier (ses cours uniquement)         |
| DELETE  | `/deleteCourse/:courseId`     | ✅   | Teacher | Supprimer (ses cours uniquement)        |
| POST    | `/:courseId/enroll`           | ✅   | Student | S'inscrire à un cours                   |
| GET     | `/:courseId/lessons`          | ❌   | —       | Leçons d'un cours                       |

**Body `createCourse` / `updateCourse` :**
```json
{
  "title": "Nom du cours",
  "description": "Description",
  "level": "Beginner | Intermediate | Advanced",
  "category": "Web Development"
}
```

Catégories disponibles dans le frontend : `Web Development`, `Mobile Apps`, `Data Science`, `Cloud Computing`, `Artificial Intelligence`, `Cybersecurity`

---

### Leçons — intégrées dans `/api/courses`

| Méthode | Endpoint                      | Auth | Body                  | Description                             |
|---------|-------------------------------|------|-----------------------|-----------------------------------------|
| POST    | `/addLesson`                  | ✅   | `multipart/form-data` | Créer une leçon avec fichier optionnel  |
| PATCH   | `/updateLesson/:lessonId`     | ✅   | `multipart/form-data` | Modifier + remplacer le fichier         |
| DELETE  | `/deleteLesson/:lessonId`     | ✅   | —                     | Supprimer                               |
| GET     | `/lesson/:lessonId`           | ❌   | —                     | Détails d'une leçon                     |
| GET     | `/lesson/:lessonId/file`      | ✅   | —                     | Fichier binaire (PDF ou vidéo)          |
| POST    | `/lesson/:lessonId/complete`  | ✅   | —                     | Marquer comme terminée                  |

**Body `addLesson` / `updateLesson` (`multipart/form-data`) :**
```
title      (requis)
courseId   (requis pour addLesson)
content    (optionnel — description)
file       (optionnel — PDF ou vidéo, max 200 MB)
```

Le fichier est stocké en base64 dans MongoDB (`fileData`, `fileType`, `fileName`, `fileMime`). La réponse omet `fileData` et retourne à la place `hasFile: true/false`.

---

### Quizzes — `/api/quizzes`

| Méthode | Endpoint               | Auth | Rôle    | Description                                       |
|---------|------------------------|------|---------|---------------------------------------------------|
| POST    | `/`                    | ✅   | Teacher | Créer un quiz (remplace l'ancien si existant)     |
| GET     | `/course/:courseId`    | ✅   | —       | Quiz d'un cours (sans `correctAnswer` exposé)     |
| POST    | `/:id/submit`          | ✅   | Student | Soumettre les réponses et obtenir le résultat     |

**Body `POST /` (createQuiz) :**
```json
{
  "courseId": "...",
  "title": "Quiz React Bases",
  "passingScore": 80,
  "questions": [
    {
      "question": "Que fait useState ?",
      "options": ["Crée un état local", "Fait une requête", "Gère le routing", "Autre"],
      "correctAnswer": 0,
      "courseSection": "Hooks"
    }
  ]
}
```

**Body `POST /:id/submit` :**
```json
{
  "courseId": "...",
  "answers": [0, 2, 1]
}
```

**Réponse submit :**
```json
{
  "score": 2,
  "total": 3,
  "percentage": 66.67,
  "passed": false,
  "wrongAnswers": [
    {
      "questionText": "...",
      "selectedAnswer": "Option choisie",
      "correctAnswer": "Bonne réponse",
      "courseSection": "..."
    }
  ],
  "courseId": "..."
}
```

> Si `passed: true`, l'étudiant est automatiquement ajouté dans `studentsPassed` du cours.

---

### Teacher — `/api/teacher`

| Méthode | Endpoint | Auth | Description                               |
|---------|----------|------|-------------------------------------------|
| GET     | `/stats` | ✅   | Stats du prof (étudiants, cours, leçons)  |

---

## Intégration Front ↔ Back

### LoginPage (`/login`)

- Formulaire Login / Sign Up via onglets dans la même page
- Sélection du rôle `Student` / `Teacher` avec boutons visuels
- Champ `teacherCode` affiché dynamiquement si rôle `teacher` sélectionné
- Après login réussi : rôle lu depuis `data.user.role` → redirection conditionnelle vers `/teacher-dashboard` ou `/`

### AuthContext

| Méthode                              | Ce qu'elle fait                                                                       |
|--------------------------------------|---------------------------------------------------------------------------------------|
| `login(email, password)`             | Appelle `authService.login` → stocke `token` dans localStorage + `user` dans le state |
| `signup(email, password, fullName, role, teacherCode)` | Split `fullName` → `firstName`/`lastName` avant envoi au back |
| Auto-login (useEffect au montage)    | Lit `localStorage.token` → `GET /api/users/me` → restaure la session                 |
| `logout()`                           | Supprime le token du localStorage, reset `user` à `null`                              |

### Dashboard Professeur (`/teacher-dashboard`)

Tous les appels API réels effectués dans cette page :

| Action                | Endpoint                                     | Méthode |
|-----------------------|----------------------------------------------|---------|
| Charger ses cours     | `/courses/teacher/me`                        | GET     |
| Créer un cours        | `/courses/createCourse`                      | POST    |
| Modifier un cours     | `/courses/updateCourse/:courseId`            | PATCH   |
| Supprimer un cours    | `/courses/deleteCourse/:courseId`            | DELETE  |
| Charger les leçons    | `/courses/:courseId/lessons`                 | GET     |
| Ajouter une leçon     | `/courses/addLesson` (FormData)              | POST    |
| Modifier une leçon    | `/courses/updateLesson/:lessonId` (FormData) | PATCH   |
| Supprimer une leçon   | `/courses/deleteLesson/:lessonId`            | DELETE  |
| Créer un quiz         | `/quizzes`                                   | POST    |
| Prévisualiser fichier | `/courses/lesson/:lessonId/file?token=...`   | GET     |

Le dashboard affiche les stats agrégées (total cours, étudiants, leçons) calculées côté frontend depuis les données retournées par `/courses/teacher/me`.

### Page Cours (`/course/:id`)

- Charge cours + leçons en parallèle via `Promise.all`
- Vérifie si un quiz existe (`GET /quizzes/course/:id`) — bouton "Take Quiz" affiché seulement si quiz trouvé **et** étudiant enrolled
- Enroll : `POST /courses/:courseId/enroll`
- Marquer leçon terminée : `POST /courses/lesson/:lessonId/complete`
- Fichiers affichés via `<iframe>` (PDF) ou `<video>` (vidéo) avec token en query param
- Les profs voient les leçons sans enroll

### Page Quiz (`/course/:id/quiz`)

- Charge le quiz : `GET /quizzes/course/:courseId`
- Navigation question par question, une réponse par question (verrouillée une fois choisie)
- Soumission : `POST /quizzes/:courseId/submit` avec `{ courseId, answers: [int[]] }`
- Affiche le résultat : score, pourcentage, passed/failed, révision des mauvaises réponses
- Option de recommencer

### Dashboard Étudiant (`/dashboard`)

- Charge tous les cours via `GET /courses`, filtre côté client ceux où `studentsEnrolled` contient l'userId
- Pour chaque cours enrolled, charge ses leçons via `GET /courses/:courseId/lessons` en parallèle (`Promise.all`)
- Calcule la progression localement : `(leçons où studentsCompleted contient userId) / total leçons * 100`
- Affiche 3 stats globales : cours inscrits, leçons complétées/total, cours à 100%
- Section "Next Lessons" : la première leçon non complétée de chaque cours inscrit (max 5)

### Page Certificats (`/certificates`)

- Charge tous les cours via `GET /courses`, filtre ceux où `studentsPassed` contient l'userId
- Génère les certificats **entièrement côté client** via Canvas API (aucun appel backend dédié)
- Chaque certificat affiche : nom étudiant, titre cours, nom instructeur, date de complétion
- Téléchargement en `.png` via `canvas.toDataURL()` + lien dynamique

### Page Profil (`/profile`)

Appels en parallèle au chargement :

| Appel | Endpoint | Ce qu'il retourne |
|-------|----------|-------------------|
| Profil | `GET /users/me` | Tous les champs user sans password |
| Cours inscrits | `GET /users/me/courses` | `{ enrolledCourses: [...] }` (populés) |

Modification du profil : `PUT /users/profile` avec `{ firstName, lastName, bio }`.

Champs modifiables depuis l'UI : prénom, nom, bio (max 250 caractères). L'avatar et les liens sociaux (`github`, `linkedin`, `website`) sont supportés par le back mais pas encore exposés dans le formulaire.

---

## Fonctionnalités par rôle

### Student

- Parcourir et rechercher des cours par titre ou catégorie
- S'inscrire à un cours
- Suivre les leçons avec contenu PDF ou vidéo inline
- Marquer les leçons comme terminées
- Passer le quiz d'un cours (MCQ interactif)
- Voir son score, pourcentage, et les réponses incorrectes
- Obtenir un certificat si le quiz est réussi
- Modifier son profil (nom, bio)

### Teacher

- S'inscrire avec le code secret `TEACHER_SECRET`
- Créer, modifier et supprimer ses cours
- Ajouter des leçons (texte + PDF ou vidéo jusqu'à 200 MB) via drag & drop ou sélection
- Modifier ou supprimer des leçons existantes
- Prévisualiser les fichiers des leçons directement depuis le dashboard
- Créer un quiz par cours (MCQ, score de passage configurable de 0 à 100 %)
- Voir les stats globales : total cours, étudiants inscrits, leçons créées, étudiants ayant réussi le quiz