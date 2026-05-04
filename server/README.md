# Learnify Backend API

Backend API for Learnify.

Base URL:

`http://localhost:3000`

All JSON requests should send:

`Content-Type: application/json`

Protected routes require:

`Authorization: Bearer <JWT>`

The JWT is returned by `POST /api/auth/login` and can be reused until it expires.

## Route Groups

- `/api/auth`
- `/api/user`
- `/api/courses`
## Auth Endpoints

### POST `/api/auth/register`

Create a new user.

Request body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "student",
  "bio": "Learning web development"
}
```

Required fields:

- `firstName`
- `lastName`
- `email`
- `password`

Optional fields:

- `role` - defaults to `student`
- `bio` - defaults to an empty string, max 250 characters

Success response:

```json
{
  "message": "User created successfully"
}
```

Status codes:

- `201` - user created
- `400` - user already exists
- `500` - registration failure

### POST `/api/auth/login`

Log in with email and password.

Request body:

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Success response:

```json
{
  "token": "<jwt-token>"
}
```

The token payload includes:

- `id`
- `role`
- `email`
- `firstName`
- `lastName`

Status codes:

- `200` - login successful
- `401` - invalid credentials
- `404` - user not found
- `500` - login failure

### POST `/api/auth/logout`

Logout is stateless on the server. This endpoint only confirms the action; the frontend should delete the token.

Headers:

`Authorization: Bearer <JWT>`

Success response:

```json
{
  "message": "Logged out successfully (frontend should delete the token)"
}
```

Status codes:

- `200` - logout acknowledged
- `401` - missing or invalid token

### POST `/api/auth/refresh-token`

Refresh an expired or active JWT and return a new one.

Request body:

```json
{
  "token": "<expired-or-valid-jwt>"
}
```

Success response:

```json
{
  "token": "<new-jwt-token>"
}
```

Status codes:

- `200` - token refreshed
- `400` - token missing
- `401` - invalid or undecodable token
- `500` - refresh failure

## User Endpoints

### GET `/api/user`

Return the authenticated user profile without the password.

Headers:

`Authorization: Bearer <JWT>`

Success response:

```json
{
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "student",
    "enrolledCourses": [],
    "taughtCourses": [],
    "isVerified": false,
    "bio": "Learning web development",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Status codes:

- `200` - user returned
- `401` - missing or invalid token
- `404` - user not found
- `500` - fetch failure

## Course Endpoints

### POST `/api/courses`

Create a new course. This route is protected and only available to teachers.

Headers:

`Authorization: Bearer <JWT>`

Request body:

```json
{
  "title": "JavaScript Basics",
  "description": "Learn the fundamentals of JavaScript",
  "level": "Beginner",
  "category": "Programming"
}
```

Required fields:

- `title`
- `description`
- `category`

Optional field:

- `level` - `Beginner`, `Intermediate`, or `Advanced` (defaults to `Beginner`)

Success response:

```json
{
  "message": "Course created successfully",
  "course": {
    "_id": "...",
    "title": "JavaScript Basics",
    "description": "Learn the fundamentals of JavaScript",
    "instructor": "<teacher-user-id>",
    "level": "Beginner",
    "category": "Programming",
    "lessons": [],
    "studentsEnrolled": [],
    "studentsPassed": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Status codes:

- `201` - course created
- `403` - user is not a teacher
- `500` - creation failure

### GET `/api/courses`

Return all courses.

Success response:

```json
[
  {
    "_id": "...",
    "title": "JavaScript Basics",
    "description": "Learn the fundamentals of JavaScript",
    "instructor": {
      "_id": "...",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "level": "Beginner",
    "category": "Programming",
    "lessons": [],
    "studentsEnrolled": [],
    "studentsPassed": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

Status codes:

- `200` - courses returned
- `404` - no courses found
- `500` - fetch failure

### GET `/api/courses/:id`

Return one course by ID.

Path params:

- `id` - MongoDB course ID

Success response:

```json
{
  "_id": "...",
  "title": "JavaScript Basics",
  "description": "Learn the fundamentals of JavaScript",
  "instructor": {
    "_id": "...",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "level": "Beginner",
  "category": "Programming",
  "lessons": [
    {
      "_id": "...",
      "title": "Introduction",
      "content": "...",
      "course": "...",
      "studentsCompleted": [],
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "studentsEnrolled": [],
  "studentsPassed": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

Status codes:

- `200` - course returned
- `400` - invalid course ID format
- `404` - course not found
- `500` - fetch failure

### POST `/api/courses/addLesson`

Create a lesson inside a course. This route is protected and only available to the teacher who owns the course.

Headers:

`Authorization: Bearer <JWT>`

Request body:

```json
{
  "title": "Introduction",
  "content": "Lesson content or HTML",
  "courseId": "<course-id>"
}
```

Required fields:

- `title`
- `courseId`

Optional field:

- `content`

Success response:

```json
{
  "message": "Lesson created successfully",
  "lesson": {
    "_id": "...",
    "title": "Introduction",
    "content": "Lesson content or HTML",
    "course": "<course-id>",
    "studentsCompleted": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Status codes:

- `201` - lesson created
- `403` - user is not a teacher or does not own the course
- `404` - course not found
- `500` - creation failure

### PATCH `/api/courses/updateLesson/:lessonId`

Update a lesson owned by the authenticated teacher.

Headers:

`Authorization: Bearer <JWT>`

Path params:

- `lessonId` - MongoDB lesson ID

Request body:

```json
{
  "title": "Updated title",
  "content": "Updated content"
}
```

Both fields are optional. If omitted, the existing value stays unchanged.

Success response:

```json
{
  "message": "Lesson updated successfully",
  "lesson": {
    "_id": "...",
    "title": "Updated title",
    "content": "Updated content",
    "course": "<course-id>",
    "studentsCompleted": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

Status codes:

- `200` - lesson updated
- `403` - user is not allowed to update the lesson
- `404` - lesson or associated course not found
- `500` - update failure

## Implemented But Not Routed Yet

These controller functions exist in the codebase but are not currently exposed through Express routes:

- `deleteCourse`
- `enrollInCourse`
- `getAllLessonsofCourse`
- `deleteLesson`
- `getLessonById`

If you want, these can be added to the routing layer later and documented here as real endpoints.
